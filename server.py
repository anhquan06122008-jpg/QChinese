# -*- coding: utf-8 -*-
"""
QChinese – AI 汉语私人教师 (Chinese Personal Tutor)
Full-Stack Server (Python 3 stdlib + SQLite + Secure Multi-User Auth + Cached Putonghua TTS & Verified Stroke Data + Secure AI Gateway)
"""

import datetime
import hashlib
import hmac
import http.cookies
import json
import mimetypes
import os
import re
import secrets
import sqlite3
import sys
import threading
import time

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

from backend.ai_pedagogy import (
    get_ai_config,
    handle_analytics_advice,
    handle_speaking_turn,
    handle_writing_evaluation,
)

ROOT_DIR = Path(__file__).resolve().parent
PUBLIC_DIR = ROOT_DIR / "public"
DATA_DIR = ROOT_DIR / "data"
TTS_CACHE_DIR = DATA_DIR / "tts_cache"
STROKES_CACHE_DIR = DATA_DIR / "strokes_cache"
DB_PATH = DATA_DIR / "qchinese.db"

for d in (PUBLIC_DIR, DATA_DIR, TTS_CACHE_DIR, STROKES_CACHE_DIR):
    d.mkdir(parents=True, exist_ok=True)


def load_dotenv(dotenv_path: Path) -> None:
    """Minimal safe .env parser without external dependencies."""
    if not dotenv_path.exists():
        return
    try:
        for raw_line in dotenv_path.read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, val = line.split("=", 1)
            key = key.strip()
            val = val.strip().strip('"').strip("'")
            if key and key not in os.environ:
                os.environ[key] = val
    except Exception:
        pass


load_dotenv(ROOT_DIR / ".env")

DB_LOCK = threading.Lock()
RATE_LOCK = threading.Lock()
RATE_BUCKETS: Dict[str, list] = {}


def check_rate_limit(bucket_key: str, limit: int = 45, window_sec: int = 60) -> bool:
    """Sliding-window rate limiter for API security."""
    now = time.time()
    with RATE_LOCK:
        timestamps = [t for t in RATE_BUCKETS.get(bucket_key, []) if now - t < window_sec]
        if len(timestamps) >= limit:
            RATE_BUCKETS[bucket_key] = timestamps
            return False
        timestamps.append(now)
        RATE_BUCKETS[bucket_key] = timestamps
        return True


def get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA foreign_keys=ON;")
    return conn


def init_db() -> None:
    with DB_LOCK:
        conn = get_db()
        try:
            conn.executescript(
                """
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT NOT NULL UNIQUE COLLATE NOCASE,
                    display_name TEXT NOT NULL,
                    password_hash TEXT NOT NULL,
                    password_salt TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    last_login_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS sessions (
                    token_hash TEXT PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    expires_at INTEGER NOT NULL,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                );

                CREATE TABLE IF NOT EXISTS user_state (
                    user_id INTEGER PRIMARY KEY,
                    state_json TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                );
                """
            )
            conn.commit()
        finally:
            conn.close()


def create_default_user_state(display_name: str) -> Dict[str, Any]:
    today = datetime.date.today().isoformat()
    return {
        "version": 1,
        "profile": {
            "name": display_name,
            "levelLabel": "Người mới bắt đầu",
            "hskLevel": 1,
            "unlockedHsk": 1,
            "placementCompleted": False,
            "lastTestScore": None,
            "streakDays": 1,
            "lastActiveDate": today,
            "totalStudyMinutes": 0,
            "theme": "light",
            "showVietnameseHint": True,
            "showPinyinDefault": True,
            "enablePinyinIme": True,
            "audioSpeed": 1.0,
            "dailyGoalMinutes": 30,
            "dailyTargets": {
                "newWords": 10,
                "reviewWords": 15,
                "grammarCount": 2,
                "listeningCount": 1,
                "hanziWriteCount": 5,
                "speakingMinutes": 5,
            },
        },
        "srs": {},
        "hanziProgress": {},
        "grammarCompleted": [],
        "listeningCompleted": [],
        "readingCompleted": [],
        "writingSubmissions": [],
        "speakingSessions": 0,
        "skillScores": {
            "pinyin": 0,
            "vocab": 0,
            "hanzi": 0,
            "grammar": 0,
            "listening": 0,
            "speaking": 0,
            "reading": 0,
            "writing": 0,
        },
        "placementReport": None,
        "testHistory": [],
        "notebook": [],
        "dailyLogs": {
            today: {
                "minutes": 0,
                "newWords": 0,
                "reviewWords": 0,
                "grammarCount": 0,
                "listeningCount": 0,
                "hanziWriteCount": 0,
                "speakingMinutes": 0,
            }
        },
    }


def hash_password(password: str, salt_hex: Optional[str] = None) -> Tuple[str, str]:
    salt = bytes.fromhex(salt_hex) if salt_hex else secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 200_000)
    return digest.hex(), salt.hex()


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


init_db()

# Ensure proper UTF-8 MIME types across platforms
mimetypes.add_type("text/html; charset=utf-8", ".html")
mimetypes.add_type("text/css; charset=utf-8", ".css")
mimetypes.add_type("application/javascript; charset=utf-8", ".js")
mimetypes.add_type("application/json; charset=utf-8", ".json")
mimetypes.add_type("image/svg+xml", ".svg")
mimetypes.add_type("audio/mpeg", ".mp3")


class QChineseRequestHandler(BaseHTTPRequestHandler):
    server_version = "QChineseServer/1.0"

    def log_message(self, fmt: str, *args: Any) -> None:
        # Concise server logging
        sys_time = self.log_date_time_string()
        print(f"[{sys_time}] {self.command} {self.path} -> {args[1] if len(args) > 1 else ''}")

    def _send_json(self, status: int, data: Dict[str, Any], extra_headers: Optional[Dict[str, str]] = None) -> None:
        raw = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.send_header("Cache-Control", "no-store")
        if extra_headers:
            for k, v in extra_headers.items():
                self.send_header(k, v)
        self.end_headers()
        self.wfile.write(raw)

    def _read_json(self, max_bytes: int = 2_000_000) -> Optional[Dict[str, Any]]:
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > max_bytes:
                return {}
            raw = self.rfile.read(length)
            return json.loads(raw.decode("utf-8"))
        except Exception:
            return None

    def _get_session_token(self) -> Optional[str]:
        auth_header = self.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            return auth_header[7:].strip()
        cookie_header = self.headers.get("Cookie", "")
        if cookie_header:
            c = http.cookies.SimpleCookie()
            try:
                c.load(cookie_header)
                if "qchinese_session" in c:
                    return c["qchinese_session"].value
            except Exception:
                pass
        return None

    def _get_authenticated_user(self) -> Optional[Dict[str, Any]]:
        token = self._get_session_token()
        if not token:
            return None
        thash = hash_token(token)
        now_ts = int(time.time())
        with DB_LOCK:
            conn = get_db()
            try:
                row = conn.execute(
                    """
                    SELECT u.id, u.username, u.display_name, u.created_at
                    FROM sessions s
                    JOIN users u ON u.id = s.user_id
                    WHERE s.token_hash = ? AND s.expires_at > ?
                    """,
                    (thash, now_ts),
                ).fetchone()
                if not row:
                    return None
                return {
                    "id": row["id"],
                    "username": row["username"],
                    "displayName": row["display_name"],
                    "createdAt": row["created_at"],
                }
            finally:
                conn.close()

    def _load_user_state(self, user_id: int, display_name: str) -> Dict[str, Any]:
        with DB_LOCK:
            conn = get_db()
            try:
                row = conn.execute(
                    "SELECT state_json FROM user_state WHERE user_id = ?", (user_id,)
                ).fetchone()
                if row:
                    return json.loads(row["state_json"])
                default_state = create_default_user_state(display_name)
                now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
                conn.execute(
                    "INSERT INTO user_state (user_id, state_json, updated_at) VALUES (?, ?, ?)",
                    (user_id, json.dumps(default_state, ensure_ascii=False), now_iso),
                )
                conn.commit()
                return default_state
            finally:
                conn.close()

    def _save_user_state(self, user_id: int, state: Dict[str, Any]) -> None:
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
        raw_state = json.dumps(state, ensure_ascii=False)
        with DB_LOCK:
            conn = get_db()
            try:
                conn.execute(
                    """
                    INSERT INTO user_state (user_id, state_json, updated_at)
                    VALUES (?, ?, ?)
                    ON CONFLICT(user_id) DO UPDATE SET
                        state_json = excluded.state_json,
                        updated_at = excluded.updated_at
                    """,
                    (user_id, raw_state, now_iso),
                )
                conn.commit()
            finally:
                conn.close()

    def do_GET(self) -> None:
        parsed = urllib.parse.urlparse(self.path)
        route = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        if route == "/api/health":
            cfg = get_ai_config()
            self._send_json(200, {
                "ok": True,
                "aiConfigured": cfg["configured"],
                "aiProvider": cfg["provider"],
                "aiModel": cfg["model"],
            })
            return

        if route == "/api/auth/me":
            user = self._get_authenticated_user()
            if not user:
                self._send_json(200, {"authenticated": False})
                return
            state = self._load_user_state(user["id"], user["displayName"])
            self._send_json(200, {"authenticated": True, "user": user, "state": state})
            return

        if route == "/api/user/state":
            user = self._get_authenticated_user()
            if not user:
                self._send_json(401, {"error": "Chưa đăng nhập."})
                return
            state = self._load_user_state(user["id"], user["displayName"])
            self._send_json(200, {"state": state})
            return

        if route == "/api/user/backup":
            user = self._get_authenticated_user()
            if not user:
                self._send_json(401, {"error": "Chưa đăng nhập."})
                return
            state = self._load_user_state(user["id"], user["displayName"])
            backup = {
                "app": "QChinese Personal Tutor",
                "exportedAt": datetime.datetime.now().isoformat(),
                "account": {"username": user["username"], "displayName": user["displayName"]},
                "state": state,
            }
            fname = f"qchinese_backup_{user['username']}_{datetime.date.today().isoformat()}.json"
            self._send_json(
                200,
                backup,
                extra_headers={"Content-Disposition": f'attachment; filename="{fname}"'},
            )
            return

        if route == "/api/tts":
            text = (query.get("text", [""])[0] or "").strip()
            slow = query.get("slow", ["0"])[0] == "1"
            if not text or len(text) > 220:
                self._send_json(400, {"error": "Text length must be between 1 and 220 chars."})
                return
            cache_key = hashlib.sha256(f"{text}|slow={int(slow)}".encode("utf-8")).hexdigest()
            cache_file = TTS_CACHE_DIR / f"{cache_key}.mp3"

            audio_bytes: Optional[bytes] = None
            if cache_file.exists() and cache_file.stat().st_size > 100:
                audio_bytes = cache_file.read_bytes()
            else:
                try:
                    speed_param = "0.24" if slow else "1"
                    tts_url = (
                        "https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl=zh-CN"
                        f"&ttsspeed={speed_param}&q={urllib.parse.quote(text)}"
                    )
                    req = urllib.request.Request(tts_url, headers={"User-Agent": "Mozilla/5.0"})
                    with urllib.request.urlopen(req, timeout=10) as resp:
                        if resp.status == 200:
                            audio_bytes = resp.read()
                            if len(audio_bytes) > 100:
                                cache_file.write_bytes(audio_bytes)
                except Exception as exc:
                    self._send_json(502, {"error": f"TTS upstream unavailable: {exc}"})
                    return

            if not audio_bytes:
                self._send_json(502, {"error": "Could not synthesize audio."})
                return

            self.send_response(200)
            self.send_header("Content-Type", "audio/mpeg")
            self.send_header("Content-Length", str(len(audio_bytes)))
            self.send_header("Accept-Ranges", "bytes")
            self.send_header("Cache-Control", "public, max-age=604800")
            self.end_headers()
            self.wfile.write(audio_bytes)
            return

        if route == "/api/strokes":
            char = (query.get("char", [""])[0] or "").strip()
            if len(char) != 1 or ord(char) < 0x3400:
                self._send_json(400, {"error": "Valid single Chinese character required."})
                return
            hex_code = f"{ord(char):x}"
            cache_file = STROKES_CACHE_DIR / f"{hex_code}.json"
            if cache_file.exists():
                raw = cache_file.read_bytes()
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(raw)))
                self.send_header("Cache-Control", "public, max-age=2592000")
                self.end_headers()
                self.wfile.write(raw)
                return
            try:
                stroke_url = f"https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/{urllib.parse.quote(char)}.json"
                req = urllib.request.Request(stroke_url, headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req, timeout=10) as resp:
                    raw = resp.read()
                    # Validate JSON structure before caching
                    parsed_json = json.loads(raw.decode("utf-8"))
                    if "strokes" in parsed_json and "medians" in parsed_json:
                        cache_file.write_bytes(raw)
                        self.send_response(200)
                        self.send_header("Content-Type", "application/json; charset=utf-8")
                        self.send_header("Content-Length", str(len(raw)))
                        self.send_header("Cache-Control", "public, max-age=2592000")
                        self.end_headers()
                        self.wfile.write(raw)
                        return
            except Exception as exc:
                self._send_json(404, {"error": f"Stroke data not found for {char}: {exc}"})
                return

        # Serve static files from PUBLIC_DIR
        rel = route.lstrip("/") or "index.html"
        if rel == "favicon.ico":
            rel = "favicon.svg"
        target = (PUBLIC_DIR / rel).resolve()
        if not str(target).startswith(str(PUBLIC_DIR)) or not target.is_file():
            # SPA fallback for clean paths if needed
            if "." not in Path(rel).name:
                target = PUBLIC_DIR / "index.html"
            else:
                self._send_json(404, {"error": "Not found"})
                return

        ctype, _ = mimetypes.guess_type(str(target))
        data = target.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", ctype or "application/octet-stream")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self) -> None:
        parsed = urllib.parse.urlparse(self.path)
        route = parsed.path
        client_ip = self.client_address[0] if self.client_address else "local"

        body = self._read_json()
        if body is None:
            self._send_json(400, {"error": "JSON không hợp lệ."})
            return

        if route == "/api/auth/register":
            if not check_rate_limit(f"auth:{client_ip}", limit=20, window_sec=60):
                self._send_json(429, {"error": "Thao tác quá nhanh, vui lòng thử lại sau ít giây."})
                return
            username = (body.get("username") or "").strip()
            display_name = (body.get("displayName") or username).strip()
            password = body.get("password") or ""

            if not re.match(r"^[a-zA-Z0-9_.\-]{3,32}$", username):
                self._send_json(400, {"error": "Tên đăng nhập cần từ 3–32 ký tự (chữ cái không dấu, số, dấu chấm hoặc gạch dưới)."})
                return
            if len(password) < 6:
                self._send_json(400, {"error": "Mật khẩu cần tối thiểu 6 ký tự để bảo vệ tài khoản học tập."})
                return
            if not display_name:
                display_name = username

            pw_hash, pw_salt = hash_password(password)
            now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
            raw_token = secrets.token_urlsafe(32)
            token_h = hash_token(raw_token)
            expires = int(time.time()) + 30 * 86400
            initial_state = create_default_user_state(display_name)

            with DB_LOCK:
                conn = get_db()
                try:
                    existing = conn.execute("SELECT id FROM users WHERE username = ?", (username,)).fetchone()
                    if existing:
                        self._send_json(409, {"error": "Tên tài khoản này đã được đăng ký. Vui lòng chọn tên khác hoặc đăng nhập."})
                        return
                    cur = conn.execute(
                        """
                        INSERT INTO users (username, display_name, password_hash, password_salt, created_at, last_login_at)
                        VALUES (?, ?, ?, ?, ?, ?)
                        """,
                        (username, display_name, pw_hash, pw_salt, now_iso, now_iso),
                    )
                    user_id = cur.lastrowid
                    conn.execute(
                        "INSERT INTO user_state (user_id, state_json, updated_at) VALUES (?, ?, ?)",
                        (user_id, json.dumps(initial_state, ensure_ascii=False), now_iso),
                    )
                    conn.execute(
                        "INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
                        (token_h, user_id, expires, now_iso),
                    )
                    conn.commit()
                finally:
                    conn.close()

            cookie = f"qchinese_session={raw_token}; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax"
            self._send_json(
                201,
                {
                    "ok": True,
                    "token": raw_token,
                    "user": {"id": user_id, "username": username, "displayName": display_name},
                    "state": initial_state,
                },
                extra_headers={"Set-Cookie": cookie},
            )
            return

        if route == "/api/auth/login":
            if not check_rate_limit(f"auth:{client_ip}", limit=25, window_sec=60):
                self._send_json(429, {"error": "Thao tác quá nhanh, vui lòng thử lại sau ít giây."})
                return
            username = (body.get("username") or "").strip()
            password = body.get("password") or ""

            with DB_LOCK:
                conn = get_db()
                try:
                    row = conn.execute(
                        "SELECT id, username, display_name, password_hash, password_salt FROM users WHERE username = ?",
                        (username,),
                    ).fetchone()
                    if not row:
                        self._send_json(401, {"error": "Tên tài khoản hoặc mật khẩu không chính xác."})
                        return
                    calc_hash, _ = hash_password(password, row["password_salt"])
                    if not hmac.compare_digest(calc_hash, row["password_hash"]):
                        self._send_json(401, {"error": "Tên tài khoản hoặc mật khẩu không chính xác."})
                        return

                    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
                    raw_token = secrets.token_urlsafe(32)
                    token_h = hash_token(raw_token)
                    expires = int(time.time()) + 30 * 86400
                    conn.execute("UPDATE users SET last_login_at = ? WHERE id = ?", (now_iso, row["id"]))
                    conn.execute(
                        "INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
                        (token_h, row["id"], expires, now_iso),
                    )
                    conn.commit()
                    user_info = {
                        "id": row["id"],
                        "username": row["username"],
                        "displayName": row["display_name"],
                    }
                finally:
                    conn.close()

            state = self._load_user_state(user_info["id"], user_info["displayName"])
            cookie = f"qchinese_session={raw_token}; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax"
            self._send_json(
                200,
                {"ok": True, "token": raw_token, "user": user_info, "state": state},
                extra_headers={"Set-Cookie": cookie},
            )
            return

        if route == "/api/auth/logout":
            token = self._get_session_token()
            if token:
                with DB_LOCK:
                    conn = get_db()
                    try:
                        conn.execute("DELETE FROM sessions WHERE token_hash = ?", (hash_token(token),))
                        conn.commit()
                    finally:
                        conn.close()
            cookie = "qchinese_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax"
            self._send_json(200, {"ok": True}, extra_headers={"Set-Cookie": cookie})
            return

        if route == "/api/auth/profile":
            user = self._get_authenticated_user()
            if not user:
                self._send_json(401, {"error": "Chưa đăng nhập."})
                return
            new_display = (body.get("displayName") or "").strip()
            curr_pw = body.get("currentPassword") or ""
            new_pw = body.get("newPassword") or ""

            with DB_LOCK:
                conn = get_db()
                try:
                    row = conn.execute("SELECT * FROM users WHERE id = ?", (user["id"],)).fetchone()
                    if new_pw:
                        if len(new_pw) < 6:
                            self._send_json(400, {"error": "Mật khẩu mới cần tối thiểu 6 ký tự."})
                            return
                        calc_hash, _ = hash_password(curr_pw, row["password_salt"])
                        if not hmac.compare_digest(calc_hash, row["password_hash"]):
                            self._send_json(400, {"error": "Mật khẩu hiện tại không đúng."})
                            return
                        nhash, nsalt = hash_password(new_pw)
                        conn.execute(
                            "UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?",
                            (nhash, nsalt, user["id"]),
                        )
                    if new_display:
                        conn.execute("UPDATE users SET display_name = ? WHERE id = ?", (new_display, user["id"]))
                    conn.commit()
                finally:
                    conn.close()

            self._send_json(200, {"ok": True, "displayName": new_display or user["displayName"]})
            return

        if route == "/api/user/state":
            user = self._get_authenticated_user()
            if not user:
                self._send_json(401, {"error": "Chưa đăng nhập."})
                return
            state = body.get("state")
            if not isinstance(state, dict):
                self._send_json(400, {"error": "Dữ liệu state không hợp lệ."})
                return
            self._save_user_state(user["id"], state)
            self._send_json(200, {"ok": True})
            return

        if route == "/api/user/restore":
            user = self._get_authenticated_user()
            if not user:
                self._send_json(401, {"error": "Chưa đăng nhập."})
                return
            state = body.get("state")
            if not isinstance(state, dict) or "profile" not in state:
                self._send_json(400, {"error": "File sao lưu không đúng cấu trúc QChinese."})
                return
            # Preserve display name of current account unless specified
            state["profile"]["name"] = state["profile"].get("name") or user["displayName"]
            self._save_user_state(user["id"], state)
            self._send_json(200, {"ok": True, "state": state})
            return

        if route in ("/api/ai/speaking", "/api/ai/writing", "/api/ai/analytics"):
            user = self._get_authenticated_user()
            rate_key = f"ai:{user['id'] if user else client_ip}"
            if not check_rate_limit(rate_key, limit=30, window_sec=60):
                self._send_json(429, {"error": "Bạn đã gửi quá nhiều yêu cầu AI trong 1 phút. Hãy nghỉ vài giây rồi tiếp tục nhé!"})
                return
            if route == "/api/ai/speaking":
                self._send_json(200, handle_speaking_turn(body))
            elif route == "/api/ai/writing":
                self._send_json(200, handle_writing_evaluation(body))
            else:
                self._send_json(200, handle_analytics_advice(body))
            return

        self._send_json(404, {"error": "API endpoint not found."})


def run_server() -> None:
    port = int(os.environ.get("PORT", "8000"))
    host = os.environ.get("HOST", "0.0.0.0")
    httpd = ThreadingHTTPServer((host, port), QChineseRequestHandler)
    cfg = get_ai_config()
    print("=" * 68)
    print(f"  QChinese – AI 汉语私人教师 running at http://localhost:{port}")
    print(f"  Database : {DB_PATH}")
    print(f"  AI Tutor : {cfg['provider']} ({cfg['model']})")
    print("=" * 68)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down QChinese server...")
        httpd.server_close()


if __name__ == "__main__":
    run_server()
