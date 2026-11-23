# -*- coding: utf-8 -*-
"""
QChinese – AI 汉语私人教师 (Chinese Personal Tutor)
Full-Stack Server (Python 3 stdlib + SQLite + Secure Multi-User Auth + Cached Putonghua TTS & Verified Stroke Data + Secure AI Gateway)
"""

import base64
import datetime
import hashlib
import hmac
import html as html_mod
import http.cookies
import io
import ipaddress
import json
import mimetypes
import os
import queue
import re
import secrets
import socket
import sqlite3
import sys
import threading
import time
import xml.etree.ElementTree as ET
import zipfile

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
    handle_explain_grammar,
    handle_explain_word,
    handle_fix_sentence,
    handle_generate_lesson_exercise,
    handle_personalized_drills,
    handle_pronunciation_analysis,
    handle_speaking_turn,
    handle_writing_evaluation,
)
from backend.ai_tournament import (
    create_tournament,
    get_tournament_detail,
    init_tournament_tables,
    list_tournaments,
    run_all_rounds_async,
    run_next_round,
)

from backend.ops_backup import (
    collect_system_metrics,
    list_backups,
    record_server_error,
    run_hot_backup,
    setup_logger,
    start_backup_scheduler,
)
from backend.pdf_engine import (
    LOCAL_HSK1_MP3_DIR,
    ensure_hsk3_level1_seeded,
    get_course_detail,
    get_pdf_overview,
    init_pdf_tables,
    publish_course,
    upload_and_process_pdf,
)

IS_VERCEL = bool(os.environ.get("VERCEL") or os.environ.get("VERCEL_ENV"))
ROOT_DIR = Path(__file__).resolve().parent
PUBLIC_DIR = ROOT_DIR / "public"
DATA_DIR = Path("/tmp/qchinese_data") if IS_VERCEL else (ROOT_DIR / "data")
TTS_CACHE_DIR = DATA_DIR / "tts_cache"
STROKES_CACHE_DIR = DATA_DIR / "strokes_cache"
BACKUP_DIR = DATA_DIR / "backups"
LOG_DIR = DATA_DIR / "logs"
DB_PATH = DATA_DIR / "qchinese.db"

_mkdir_targets = (DATA_DIR, TTS_CACHE_DIR, STROKES_CACHE_DIR, BACKUP_DIR, LOG_DIR) if IS_VERCEL else (PUBLIC_DIR, DATA_DIR, TTS_CACHE_DIR, STROKES_CACHE_DIR, BACKUP_DIR, LOG_DIR)
for d in _mkdir_targets:
    d.mkdir(parents=True, exist_ok=True)

SERVER_LOGGER = setup_logger(LOG_DIR)


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
SYNC_LOCK = threading.Lock()
SYNC_SUBSCRIBERS: Dict[int, list] = {}
SEEN_MUTATIONS: Dict[int, list] = {}


def _merge_list_by_id(base_list: list, inc_list: list, id_field: str = "id") -> list:
    merged = {}
    order = []
    for item in (inc_list or []):
        if isinstance(item, dict) and item.get(id_field):
            k = str(item[id_field])
            if k not in merged:
                order.append(k)
            merged[k] = item
    for item in (base_list or []):
        if isinstance(item, dict) and item.get(id_field):
            k = str(item[id_field])
            if k not in merged:
                order.append(k)
                merged[k] = item
    return [merged[k] for k in order]


def _merge_user_states(server_state: Dict[str, Any], client_state: Dict[str, Any]) -> Dict[str, Any]:
    """Deterministic conflict-free merge when two devices edit concurrently (newer data never overwritten by stale)."""
    out = dict(server_state)
    out.update(client_state)
    # Profile: preserve higher counters
    sp = server_state.get("profile") or {}
    cp = client_state.get("profile") or {}
    mp = dict(sp)
    mp.update(cp)
    mp["totalStudyMinutes"] = max(int(sp.get("totalStudyMinutes", 0) or 0), int(cp.get("totalStudyMinutes", 0) or 0))
    mp["streakDays"] = max(int(sp.get("streakDays", 1) or 1), int(cp.get("streakDays", 1) or 1))
    mp["unlockedHsk"] = max(int(sp.get("unlockedHsk", 1) or 1), int(cp.get("unlockedHsk", 1) or 1))
    out["profile"] = mp

    # Set-union arrays (lesson completions, favorites, customHanzi, markedWords)
    for arr_key in ("grammarCompleted", "listeningCompleted", "readingCompleted", "markedWords", "customHanzi", "favoriteVocab"):
        s_arr = server_state.get(arr_key) or []
        c_arr = client_state.get(arr_key) or []
        seen = set()
        combined = []
        for x in list(c_arr) + list(s_arr):
            if x not in seen:
                seen.add(x)
                combined.append(x)
        out[arr_key] = combined

    # SRS cards: keep whichever card has higher reps or later nextReview
    s_srs = dict(server_state.get("srs") or {})
    for k, v in (client_state.get("srs") or {}).items():
        if k not in s_srs or (v.get("nextReview", 0) >= s_srs[k].get("nextReview", 0)):
            s_srs[k] = v
    out["srs"] = s_srs

    # Hanzi progress: keep higher attempts / bestScore
    s_hz = dict(server_state.get("hanziProgress") or {})
    for k, v in (client_state.get("hanziProgress") or {}).items():
        if k not in s_hz or (v.get("attempts", 0) >= s_hz[k].get("attempts", 0)):
            s_hz[k] = v
    out["hanziProgress"] = s_hz

    # Entity lists by ID (notebook, materials, customVocab) - never duplicate
    for list_key in ("notebook", "materials", "customVocab"):
        out[list_key] = _merge_list_by_id(server_state.get(list_key) or [], client_state.get(list_key) or [])

    # Lesson progress map (Hạng mục 5/6)
    s_lp = dict(server_state.get("lessonProgress") or {})
    for k, v in (client_state.get("lessonProgress") or {}).items():
        if k not in s_lp or (v.get("updatedAt", "") >= s_lp[k].get("updatedAt", "")):
            s_lp[k] = v
    out["lessonProgress"] = s_lp
    return out


def broadcast_user_sync(user_id: int, event_payload: Dict[str, Any]) -> None:
    msg = json.dumps(event_payload, ensure_ascii=False)
    with SYNC_LOCK:
        queues = list(SYNC_SUBSCRIBERS.get(user_id, []))
    for q in queues:
        try:
            q.put_nowait(msg)
        except Exception:
            pass


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


def _ensure_column(conn: sqlite3.Connection, table: str, col: str, ddl: str) -> None:
    cols = {r[1] for r in conn.execute(f"PRAGMA table_info({table})").fetchall()}
    if col not in cols:
        conn.execute(f"ALTER TABLE {table} ADD COLUMN {col} {ddl}")


def parse_device_name(ua: str) -> str:
    ua_l = (ua or "").lower()
    os_name = "Thiết bị khác"
    if "iphone" in ua_l:
        os_name = "iPhone"
    elif "ipad" in ua_l:
        os_name = "iPad"
    elif "android" in ua_l:
        os_name = "Android"
    elif "windows" in ua_l:
        os_name = "Windows PC"
    elif "macintosh" in ua_l or "mac os" in ua_l:
        os_name = "MacBook / macOS"
    elif "linux" in ua_l:
        os_name = "Linux"

    browser = "Trình duyệt"
    if "edg/" in ua_l:
        browser = "Edge"
    elif "chrome/" in ua_l and "edg/" not in ua_l:
        browser = "Chrome"
    elif "firefox/" in ua_l:
        browser = "Firefox"
    elif "safari/" in ua_l and "chrome/" not in ua_l:
        browser = "Safari"
    return f"{os_name} · {browser}"


def generate_recovery_key() -> str:
    raw = secrets.token_hex(6).upper()
    return f"QCN-{raw[:4]}-{raw[4:8]}-{raw[8:12]}"


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
            # Safe non-destructive migrations for multi-device auth, recovery & realtime sync version
            _ensure_column(conn, "users", "recovery_hash", "TEXT DEFAULT ''")
            _ensure_column(conn, "users", "recovery_salt", "TEXT DEFAULT ''")
            _ensure_column(conn, "sessions", "session_id", "TEXT DEFAULT ''")
            _ensure_column(conn, "sessions", "device_name", "TEXT DEFAULT 'Thiết bị web'")
            _ensure_column(conn, "sessions", "user_agent", "TEXT DEFAULT ''")
            _ensure_column(conn, "sessions", "ip_address", "TEXT DEFAULT ''")
            _ensure_column(conn, "sessions", "last_active_at", "TEXT DEFAULT ''")
            _ensure_column(conn, "user_state", "version", "INTEGER NOT NULL DEFAULT 1")
            # Backfill opaque session_id for any legacy sessions
            legacy_sess = conn.execute("SELECT token_hash FROM sessions WHERE session_id IS NULL OR session_id = ''").fetchall()
            for row in legacy_sess:
                conn.execute("UPDATE sessions SET session_id = ?, last_active_at = created_at WHERE token_hash = ?", ("ses_" + secrets.token_hex(8), row["token_hash"]))
            init_tournament_tables(conn)
            init_pdf_tables(conn)
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


def _is_safe_public_url(url: str) -> Tuple[bool, str]:
    """Validate URL scheme and block private/loopback/link-local IPs to prevent SSRF."""
    try:
        parsed = urllib.parse.urlparse(url.strip())
        if parsed.scheme not in ("http", "https"):
            return False, "Chỉ hỗ trợ đường dẫn công khai http:// hoặc https://."
        host = (parsed.hostname or "").strip().lower()
        if not host or host in ("localhost", "0.0.0.0") or host.endswith(".local"):
            return False, "Không được phép truy cập địa chỉ nội bộ (localhost/mạng cục bộ)."
        infos = socket.getaddrinfo(host, parsed.port or (443 if parsed.scheme == "https" else 80), proto=socket.IPPROTO_TCP)
        for info in infos:
            ip_obj = ipaddress.ip_address(info[4][0])
            if ip_obj.is_private or ip_obj.is_loopback or ip_obj.is_link_local or ip_obj.is_reserved or ip_obj.is_multicast:
                return False, "Địa chỉ IP đích thuộc mạng nội bộ/riêng tư, bị chặn để bảo mật."
        return True, ""
    except Exception:
        return False, "URL không hợp lệ hoặc không thể phân giải tên miền."


def _safe_fetch_public_url(url: str) -> Dict[str, Any]:
    """Respectfully extract public Chinese text from a user-provided URL (no login/paywall/CAPTCHA bypass)."""
    ok, err = _is_safe_public_url(url)
    if not ok:
        return {"ok": False, "error": err}
    try:
        req = urllib.request.Request(
            url.strip(),
            headers={
                "User-Agent": "QChinese-Educational-Importer/1.0 (+https://github.com/anhquan06122008-jpg/QChinese)",
                "Accept": "text/html,text/plain;q=0.9,*/*;q=0.1",
            },
        )
        with urllib.request.urlopen(req, timeout=12) as resp:
            ctype = (resp.headers.get("Content-Type") or "").lower()
            if "text/" not in ctype and "html" not in ctype and "xml" not in ctype:
                return {"ok": False, "error": f"URL trả về định dạng '{ctype}' không phải văn bản/HTML. Hãy tải file về rồi upload trực tiếp."}
            raw = resp.read(1_500_000)
            text = raw.decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        if e.code in (401, 403, 429):
            return {"ok": False, "error": f"Website yêu cầu đăng nhập hoặc chặn truy cập tự động (HTTP {e.code}). Vui lòng sao chép đoạn văn bản hợp pháp và dán thủ công vào QChinese."}
        return {"ok": False, "error": f"Không tải được trang web (HTTP {e.code})."}
    except Exception:
        return {"ok": False, "error": "Không thể kết nối tới URL này (hết thời gian chờ hoặc mạng bị chặn)."}

    low = text.lower()
    if any(k in low for k in ("cf-turnstile", "g-recaptcha", "h-captcha", "verify you are human")):
        return {"ok": False, "error": "Trang web có bước xác minh bảo mật (CAPTCHA). QChinese không vượt qua cơ chế bảo vệ website — vui lòng sao chép văn bản hợp pháp và dán thủ công."}

    title_m = re.search(r"<title[^>]*>(.*?)</title>", text, re.I | re.S)
    title = html_mod.unescape(re.sub(r"\s+", " ", title_m.group(1))).strip() if title_m else urllib.parse.urlparse(url).netloc

    cleaned = re.sub(r"<(script|style|noscript|svg|nav|footer|header)[^>]*>.*?</\1>", " ", text, flags=re.I | re.S)
    cleaned = re.sub(r"</(p|div|li|br|h[1-6]|tr)>", "\n", cleaned, flags=re.I)
    cleaned = re.sub(r"<[^>]+>", " ", cleaned)
    cleaned = html_mod.unescape(cleaned)
    lines = [re.sub(r"[ \t]+", " ", ln).strip() for ln in cleaned.splitlines()]
    lines = [ln for ln in lines if len(ln) >= 2]
    # Prioritize lines containing Chinese characters if abundant
    zh_lines = [ln for ln in lines if re.search(r"[\u4e00-\u9fff]", ln)]
    extracted = "\n".join(zh_lines[:120] if len(zh_lines) >= 2 else lines[:80])[:12000]
    zh_count = len(re.findall(r"[\u4e00-\u9fff]", extracted))

    if not extracted.strip():
        return {"ok": False, "error": "Không trích xuất được nội dung văn bản từ trang này (có thể trang tải nội dung bằng JavaScript). Vui lòng sao chép nội dung và dán thủ công."}

    # Rough HSK guess based on text length
    est_hsk = 1 if zh_count < 60 else (2 if zh_count < 160 else (3 if zh_count < 350 else 4))
    return {
        "ok": True,
        "title": title[:140],
        "sourceUrl": url.strip(),
        "content": extracted,
        "hanziCount": zh_count,
        "suggestedHsk": est_hsk,
    }


def _extract_uploaded_document(filename: str, data_b64: str) -> Dict[str, Any]:
    """Safely extract text from .txt, .md, .docx (stdlib zipfile+XML) and uncompressed .pdf."""
    ext = Path(filename or "").suffix.lower()
    if ext not in (".txt", ".md", ".docx", ".pdf"):
        return {"ok": False, "error": f"Chưa hỗ trợ trích xuất văn bản tự động cho định dạng '{ext}'. Hỗ trợ: .txt, .md, .docx, .pdf."}
    try:
        raw = base64.b64decode(data_b64, validate=False)
    except Exception:
        return {"ok": False, "error": "Dữ liệu file không hợp lệ."}
    if len(raw) > 8_000_000:
        return {"ok": False, "error": "Dung lượng file vượt quá giới hạn an toàn 8 MB."}

    if ext in (".txt", ".md"):
        text = raw.decode("utf-8", errors="replace").strip()[:20000]
        return {"ok": True, "content": text, "hanziCount": len(re.findall(r"[\u4e00-\u9fff]", text))}

    if ext == ".docx":
        try:
            with zipfile.ZipFile(io.BytesIO(raw)) as zf:
                xml_bytes = zf.read("word/document.xml")
            root = ET.fromstring(xml_bytes)
            paras = []
            for p in root.iter():
                if p.tag.endswith("}p"):
                    runs = [t.text for t in p.iter() if t.tag.endswith("}t") and t.text]
                    if runs:
                        paras.append("".join(runs))
            text = "\n".join(paras).strip()[:20000]
            return {"ok": True, "content": text, "hanziCount": len(re.findall(r"[\u4e00-\u9fff]", text))}
        except Exception:
            return {"ok": False, "error": "Không đọc được cấu trúc file .docx này. Hãy kiểm tra file không bị mã hóa mật khẩu."}

    if ext == ".pdf":
        # Minimal stdlib PDF text extractor for uncompressed text operators; honest guidance for compressed/scanned PDFs
        decoded = raw.decode("latin-1", errors="ignore")
        chunks = re.findall(r"\(([^()]{2,200})\)\s*Tj", decoded)
        text = "\n".join(chunks).strip()[:12000]
        if not text:
            return {
                "ok": False,
                "error": "File PDF này được nén hoặc là ảnh scan nên server Python stdlib không tự tách chữ Hán được. Bạn vẫn có thể lưu file PDF làm tham chiếu hoặc copy văn bản từ PDF dán vào ô nội dung nhé!"
            }
        return {"ok": True, "content": text, "hanziCount": len(re.findall(r"[\u4e00-\u9fff]", text))}
    return {"ok": False, "error": "Định dạng không được hỗ trợ."}


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

    def _cors_headers(self) -> Dict[str, str]:
        origin = (self.headers.get("Origin") or "").strip()
        allowed_env = os.environ.get("CORS_ORIGINS", "*").strip()
        if not origin:
            return {}
        if allowed_env == "*" or origin in [o.strip() for o in allowed_env.split(",")]:
            return {
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Device-Name",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Vary": "Origin",
            }
        return {}

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        for k, v in self._cors_headers().items():
            self.send_header(k, v)
        self.end_headers()

    def _send_json(self, status: int, data: Dict[str, Any], extra_headers: Optional[Dict[str, str]] = None) -> None:
        raw = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "SAMEORIGIN")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        for k, v in self._cors_headers().items():
            self.send_header(k, v)
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
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
        with DB_LOCK:
            conn = get_db()
            try:
                row = conn.execute(
                    """
                    SELECT u.id, u.username, u.display_name, u.created_at, s.session_id
                    FROM sessions s
                    JOIN users u ON u.id = s.user_id
                    WHERE s.token_hash = ? AND s.expires_at > ?
                    """,
                    (thash, now_ts),
                ).fetchone()
                if not row:
                    return None
                conn.execute("UPDATE sessions SET last_active_at = ? WHERE token_hash = ?", (now_iso, thash))
                conn.commit()
                return {
                    "id": row["id"],
                    "username": row["username"],
                    "displayName": row["display_name"],
                    "createdAt": row["created_at"],
                    "sessionId": row["session_id"] or "",
                }
            finally:
                conn.close()

    def _load_user_state_meta(self, user_id: int, display_name: str) -> Tuple[Dict[str, Any], int, str]:
        with DB_LOCK:
            conn = get_db()
            try:
                row = conn.execute(
                    "SELECT state_json, updated_at, version FROM user_state WHERE user_id = ?", (user_id,)
                ).fetchone()
                if row:
                    return json.loads(row["state_json"]), int(row["version"] or 1), row["updated_at"]
                default_state = create_default_user_state(display_name)
                now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
                conn.execute(
                    "INSERT INTO user_state (user_id, state_json, updated_at, version) VALUES (?, ?, ?, 1)",
                    (user_id, json.dumps(default_state, ensure_ascii=False), now_iso),
                )
                conn.commit()
                return default_state, 1, now_iso
            finally:
                conn.close()

    def _load_user_state(self, user_id: int, display_name: str) -> Dict[str, Any]:
        st, _, _ = self._load_user_state_meta(user_id, display_name)
        return st

    def _save_user_state(
        self,
        user_id: int,
        state: Dict[str, Any],
        base_version: Optional[int] = None,
        mutation_id: Optional[str] = None,
        origin_session_id: str = "",
    ) -> Dict[str, Any]:
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
        with DB_LOCK:
            # Idempotency: ignore duplicate retried mutation IDs
            if mutation_id:
                seen = SEEN_MUTATIONS.setdefault(user_id, [])
                if mutation_id in seen:
                    conn = get_db()
                    try:
                        row = conn.execute("SELECT state_json, version, updated_at FROM user_state WHERE user_id = ?", (user_id,)).fetchone()
                        if row:
                            return {"state": json.loads(row["state_json"]), "version": int(row["version"] or 1), "updatedAt": row["updated_at"], "deduped": True}
                    finally:
                        conn.close()

            conn = get_db()
            try:
                row = conn.execute("SELECT state_json, version FROM user_state WHERE user_id = ?", (user_id,)).fetchone()
                server_ver = int(row["version"] or 1) if row else 0
                final_state = state
                merged = False
                if row and base_version is not None and int(base_version) < server_ver:
                    server_state = json.loads(row["state_json"])
                    final_state = _merge_user_states(server_state, state)
                    merged = True
                new_ver = server_ver + 1
                raw_state = json.dumps(final_state, ensure_ascii=False)
                conn.execute(
                    """
                    INSERT INTO user_state (user_id, state_json, updated_at, version)
                    VALUES (?, ?, ?, ?)
                    ON CONFLICT(user_id) DO UPDATE SET
                        state_json = excluded.state_json,
                        updated_at = excluded.updated_at,
                        version = excluded.version
                    """,
                    (user_id, raw_state, now_iso, new_ver),
                )
                conn.commit()
                if mutation_id:
                    seen = SEEN_MUTATIONS.setdefault(user_id, [])
                    seen.append(mutation_id)
                    if len(seen) > 100:
                        del seen[:-50]
            finally:
                conn.close()

        # Push real-time SSE update to all devices of this user!
        broadcast_user_sync(user_id, {
            "version": new_ver,
            "updatedAt": now_iso,
            "originSessionId": origin_session_id,
            "merged": merged,
            "state": final_state,
        })
        return {"state": final_state, "version": new_ver, "updatedAt": now_iso, "merged": merged}

    def do_GET(self) -> None:
        parsed = urllib.parse.urlparse(self.path)
        route = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        if route == "/api/health":
            cfg = get_ai_config()
            sb_url = os.environ.get("SUPABASE_URL", "").strip().rstrip("/")
            sb_anon = os.environ.get("SUPABASE_ANON_KEY", "").strip()
            self._send_json(200, {
                "ok": True,
                "aiConfigured": cfg["configured"],
                "aiProvider": cfg["provider"],
                "aiModel": cfg["model"],
                "cloudAuthConfigured": bool(sb_url and sb_anon),
            })
            return

        if route == "/api/config":
            cfg = get_ai_config()
            sb_url = os.environ.get("SUPABASE_URL", "").strip().rstrip("/")
            sb_anon = os.environ.get("SUPABASE_ANON_KEY", "").strip()
            auth_ok = bool(sb_url and sb_anon)
            self._send_json(200, {
                "ok": True,
                "aiConfigured": cfg["configured"],
                "aiProvider": cfg["provider"],
                "aiModel": cfg["model"],
                "authConfigured": auth_ok,
                "supabaseUrl": sb_url if auth_ok else "",
                "supabaseAnonKey": sb_anon if auth_ok else "",
                "ecosystem": "QChinese · QEnglish · TKB",
                "checkedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            })
            return

        if route == "/api/system/status":
            metrics = collect_system_metrics(get_db, DB_LOCK, DB_PATH, BACKUP_DIR)
            metrics["backups"] = list_backups(BACKUP_DIR)
            self._send_json(200, metrics)
            return

        if route == "/api/pdf/overview":
            self._send_json(200, get_pdf_overview(get_db, DB_LOCK, ROOT_DIR))
            return

        if route == "/api/pdf/course":
            lvl_str = (query.get("hskLevel") or [""])[0].strip()
            cid = (query.get("courseId") or [""])[0].strip() or None
            lvl = int(lvl_str) if lvl_str.isdigit() else None
            res = get_course_detail(get_db, DB_LOCK, ROOT_DIR, hsk_level=lvl, course_id=cid)
            self._send_json(200 if res.get("ok") else 404, res)
            return

        if route == "/api/pdf/audio":
            fname = (query.get("file") or [""])[0].strip()
            if not re.match(r"^[0-9]{1,2}-[0-9]{1,2}\.mp3$", fname):
                self._send_json(400, {"error": "Tên file audio không hợp lệ."})
                return
            audio_path = (LOCAL_HSK1_MP3_DIR / fname).resolve()
            if not audio_path.exists() or not str(audio_path).startswith(str(LOCAL_HSK1_MP3_DIR.resolve())):
                self._send_json(404, {"error": "Không tìm thấy file MP3 giáo trình trên server này."})
                return
            mp3_bytes = audio_path.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "audio/mpeg")
            self.send_header("Content-Length", str(len(mp3_bytes)))
            self.send_header("Cache-Control", "public, max-age=86400")
            for k, v in self._cors_headers().items():
                self.send_header(k, v)
            self.end_headers()
            self.wfile.write(mp3_bytes)
            return

        if route == "/api/tournament/list":
            self._send_json(200, list_tournaments(get_db, DB_LOCK))
            return

        if route == "/api/tournament/detail":
            t_id = (query.get("id") or [""])[0].strip()
            res = get_tournament_detail(get_db, DB_LOCK, t_id)
            self._send_json(200 if "error" not in res else 404, res)
            return

        if route == "/api/auth/sessions":
            user = self._get_authenticated_user()
            if not user:
                self._send_json(401, {"error": "Chưa đăng nhập."})
                return
            now_ts = int(time.time())
            with DB_LOCK:
                conn = get_db()
                try:
                    rows = conn.execute(
                        """
                        SELECT session_id, device_name, ip_address, created_at, last_active_at, expires_at
                        FROM sessions
                        WHERE user_id = ? AND expires_at > ?
                        ORDER BY last_active_at DESC, created_at DESC
                        """,
                        (user["id"], now_ts),
                    ).fetchall()
                finally:
                    conn.close()
            sessions = [
                {
                    "sessionId": r["session_id"],
                    "deviceName": r["device_name"] or "Thiết bị web",
                    "ipAddress": r["ip_address"] or "—",
                    "createdAt": r["created_at"],
                    "lastActiveAt": r["last_active_at"] or r["created_at"],
                    "isCurrent": r["session_id"] == user.get("sessionId"),
                }
                for r in rows
            ]
            self._send_json(200, {"sessions": sessions, "count": len(sessions)})
            return

        if route == "/api/sync/stream":
            tok = (query.get("token") or [""])[0].strip() or self._get_session_token()
            if not tok:
                self._send_json(401, {"error": "Thiếu token đồng bộ."})
                return
            thash = hash_token(tok)
            now_ts = int(time.time())
            with DB_LOCK:
                conn = get_db()
                try:
                    u_row = conn.execute("SELECT user_id FROM sessions WHERE token_hash = ? AND expires_at > ?", (thash, now_ts)).fetchone()
                finally:
                    conn.close()
            if not u_row:
                self._send_json(401, {"error": "Phiên đồng bộ hết hạn."})
                return
            if IS_VERCEL:
                self.send_response(200)
                self.send_header("Content-Type", "text/event-stream; charset=utf-8")
                self.send_header("Cache-Control", "no-cache")
                for k, v in self._cors_headers().items():
                    self.send_header(k, v)
                self.end_headers()
                self.wfile.write(b'event: connected\ndata: {"ok":true,"mode":"serverless"}\n\n')
                self.wfile.flush()
                return
            uid = int(u_row["user_id"])
            q: queue.Queue = queue.Queue(maxsize=32)
            with SYNC_LOCK:
                SYNC_SUBSCRIBERS.setdefault(uid, []).append(q)
            try:
                self.send_response(200)
                self.send_header("Content-Type", "text/event-stream; charset=utf-8")
                self.send_header("Cache-Control", "no-cache")
                self.send_header("Connection", "keep-alive")
                self.send_header("X-Accel-Buffering", "no")
                for k, v in self._cors_headers().items():
                    self.send_header(k, v)
                self.end_headers()
                self.wfile.write(b"event: connected\ndata: {\"ok\":true}\n\n")
                self.wfile.flush()
                while True:
                    try:
                        payload_str = q.get(timeout=20)
                        self.wfile.write(f"event: state_update\ndata: {payload_str}\n\n".encode("utf-8"))
                        self.wfile.flush()
                    except queue.Empty:
                        self.wfile.write(b": heartbeat\n\n")
                        self.wfile.flush()
            except Exception:
                pass
            finally:
                with SYNC_LOCK:
                    subs = SYNC_SUBSCRIBERS.get(uid, [])
                    if q in subs:
                        subs.remove(q)
            return

        if route == "/api/auth/me":
            user = self._get_authenticated_user()
            if not user:
                self._send_json(200, {"authenticated": False})
                return
            state, ver, upd = self._load_user_state_meta(user["id"], user["displayName"])
            self._send_json(200, {"authenticated": True, "user": user, "state": state, "version": ver, "updatedAt": upd})
            return

        if route == "/api/user/state":
            user = self._get_authenticated_user()
            if not user:
                self._send_json(401, {"error": "Chưa đăng nhập."})
                return
            state, ver, upd = self._load_user_state_meta(user["id"], user["displayName"])
            self._send_json(200, {"state": state, "version": ver, "updatedAt": upd})
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

        max_len = 35_000_000 if route in ("/api/materials/extract-file", "/api/pdf/upload") else 2_000_000
        body = self._read_json(max_bytes=max_len)
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

            if not re.match(r"^[a-zA-Z0-9_.@+\-]{3,64}$", username):
                self._send_json(400, {"error": "Tên đăng nhập/Email cần từ 3–64 ký tự hợp lệ (chữ không dấu, số, @, ., _, -)."})
                return
            if len(password) < 6:
                self._send_json(400, {"error": "Mật khẩu cần tối thiểu 6 ký tự để bảo vệ tài khoản học tập."})
                return
            if not display_name:
                display_name = username

            pw_hash, pw_salt = hash_password(password)
            rec_key = generate_recovery_key()
            rec_hash, rec_salt = hash_password(rec_key)
            now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
            raw_token = secrets.token_urlsafe(32)
            token_h = hash_token(raw_token)
            sess_id = "ses_" + secrets.token_hex(8)
            ua = (self.headers.get("User-Agent") or "")[:240]
            dev_name = (body.get("deviceName") or self.headers.get("X-Device-Name") or parse_device_name(ua))[:80]
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
                        INSERT INTO users (username, display_name, password_hash, password_salt, recovery_hash, recovery_salt, created_at, last_login_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                        (username, display_name, pw_hash, pw_salt, rec_hash, rec_salt, now_iso, now_iso),
                    )
                    user_id = cur.lastrowid
                    conn.execute(
                        "INSERT INTO user_state (user_id, state_json, updated_at, version) VALUES (?, ?, ?, 1)",
                        (user_id, json.dumps(initial_state, ensure_ascii=False), now_iso),
                    )
                    conn.execute(
                        """
                        INSERT INTO sessions (token_hash, user_id, expires_at, created_at, session_id, device_name, user_agent, ip_address, last_active_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                        (token_h, user_id, expires, now_iso, sess_id, dev_name, ua, client_ip, now_iso),
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
                    "sessionId": sess_id,
                    "recoveryKey": rec_key,
                    "user": {"id": user_id, "username": username, "displayName": display_name, "sessionId": sess_id},
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
                    sess_id = "ses_" + secrets.token_hex(8)
                    ua = (self.headers.get("User-Agent") or "")[:240]
                    dev_name = (body.get("deviceName") or self.headers.get("X-Device-Name") or parse_device_name(ua))[:80]
                    expires = int(time.time()) + 30 * 86400
                    conn.execute("UPDATE users SET last_login_at = ? WHERE id = ?", (now_iso, row["id"]))
                    # Concurrent multi-device login: NEVER delete existing sessions of other devices!
                    conn.execute(
                        """
                        INSERT INTO sessions (token_hash, user_id, expires_at, created_at, session_id, device_name, user_agent, ip_address, last_active_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                        (token_h, row["id"], expires, now_iso, sess_id, dev_name, ua, client_ip, now_iso),
                    )
                    conn.commit()
                    user_info = {
                        "id": row["id"],
                        "username": row["username"],
                        "displayName": row["display_name"],
                        "sessionId": sess_id,
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

        if route == "/api/auth/sessions/revoke":
            user = self._get_authenticated_user()
            if not user:
                self._send_json(401, {"error": "Chưa đăng nhập."})
                return
            target_sid = (body.get("sessionId") or "").strip()
            if not target_sid:
                self._send_json(400, {"error": "Thiếu mã phiên cần đăng xuất."})
                return
            with DB_LOCK:
                conn = get_db()
                try:
                    cur = conn.execute("DELETE FROM sessions WHERE session_id = ? AND user_id = ?", (target_sid, user["id"]))
                    conn.commit()
                    deleted = cur.rowcount
                finally:
                    conn.close()
            self._send_json(200, {"ok": True, "revoked": deleted > 0, "revokedCurrent": target_sid == user.get("sessionId")})
            return

        if route == "/api/auth/sessions/revoke-all":
            user = self._get_authenticated_user()
            if not user:
                self._send_json(401, {"error": "Chưa đăng nhập."})
                return
            keep_current = bool(body.get("keepCurrent", True))
            with DB_LOCK:
                conn = get_db()
                try:
                    if keep_current and user.get("sessionId"):
                        cur = conn.execute("DELETE FROM sessions WHERE user_id = ? AND session_id != ?", (user["id"], user["sessionId"]))
                    else:
                        cur = conn.execute("DELETE FROM sessions WHERE user_id = ?", (user["id"],))
                    conn.commit()
                    revoked_count = cur.rowcount
                finally:
                    conn.close()
            self._send_json(200, {"ok": True, "revokedCount": revoked_count, "loggedOutSelf": not keep_current})
            return

        if route == "/api/auth/recovery-key/regenerate":
            user = self._get_authenticated_user()
            if not user:
                self._send_json(401, {"error": "Chưa đăng nhập."})
                return
            rec_key = generate_recovery_key()
            rec_hash, rec_salt = hash_password(rec_key)
            with DB_LOCK:
                conn = get_db()
                try:
                    conn.execute("UPDATE users SET recovery_hash = ?, recovery_salt = ? WHERE id = ?", (rec_hash, rec_salt, user["id"]))
                    conn.commit()
                finally:
                    conn.close()
            self._send_json(200, {"ok": True, "recoveryKey": rec_key})
            return

        if route == "/api/auth/recover-password":
            if not check_rate_limit(f"recover:{client_ip}", limit=10, window_sec=60):
                self._send_json(429, {"error": "Thao tác quá nhanh, vui lòng thử lại sau."})
                return
            username = (body.get("username") or "").strip()
            rec_key = (body.get("recoveryKey") or "").strip().upper()
            new_pw = body.get("newPassword") or ""
            if len(new_pw) < 6:
                self._send_json(400, {"error": "Mật khẩu mới cần ít nhất 6 ký tự."})
                return
            with DB_LOCK:
                conn = get_db()
                try:
                    row = conn.execute("SELECT id, recovery_hash, recovery_salt FROM users WHERE username = ?", (username,)).fetchone()
                    if not row or not row["recovery_hash"] or not row["recovery_salt"]:
                        self._send_json(400, {"error": "Tài khoản không tồn tại hoặc chưa thiết lập Mã khôi phục."})
                        return
                    calc_h, _ = hash_password(rec_key, row["recovery_salt"])
                    if not hmac.compare_digest(calc_h, row["recovery_hash"]):
                        self._send_json(401, {"error": "Mã khôi phục không chính xác."})
                        return
                    new_h, new_s = hash_password(new_pw)
                    conn.execute("UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?", (new_h, new_s, row["id"]))
                    # Revoke all old sessions after password reset for security
                    conn.execute("DELETE FROM sessions WHERE user_id = ?", (row["id"],))
                    conn.commit()
                finally:
                    conn.close()
            self._send_json(200, {"ok": True, "message": "Đã đặt lại mật khẩu và đăng xuất tất cả thiết bị cũ. Hãy đăng nhập lại bằng mật khẩu mới!"})
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
            base_ver = body.get("baseVersion")
            mut_id = body.get("clientMutationId")
            res = self._save_user_state(
                user["id"],
                state,
                base_version=int(base_ver) if base_ver is not None else None,
                mutation_id=str(mut_id) if mut_id else None,
                origin_session_id=user.get("sessionId") or "",
            )
            self._send_json(200, {"ok": True, "version": res["version"], "updatedAt": res["updatedAt"], "merged": res.get("merged", False), "state": res["state"] if res.get("merged") else None})
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

        ai_routes = (
            "/api/ai/speaking",
            "/api/ai/writing",
            "/api/ai/analytics",
            "/api/ai/explain-word",
            "/api/ai/fix-sentence",
            "/api/ai/explain-grammar",
            "/api/ai/pronunciation",
            "/api/ai/personalized-drills",
            "/api/ai/generate-lesson-exercise",
        )
        if route in ai_routes:
            user = self._get_authenticated_user()
            rate_key = f"ai:{user['id'] if user else client_ip}"
            if not check_rate_limit(rate_key, limit=40, window_sec=60):
                self._send_json(429, {"error": "Bạn đã gửi quá nhiều yêu cầu AI trong 1 phút. Hãy nghỉ vài giây rồi tiếp tục nhé!"})
                return
            if route == "/api/ai/speaking":
                self._send_json(200, handle_speaking_turn(body))
            elif route == "/api/ai/writing":
                self._send_json(200, handle_writing_evaluation(body))
            elif route == "/api/ai/analytics":
                self._send_json(200, handle_analytics_advice(body))
            elif route == "/api/ai/explain-word":
                self._send_json(200, handle_explain_word(body))
            elif route == "/api/ai/fix-sentence":
                self._send_json(200, handle_fix_sentence(body))
            elif route == "/api/ai/explain-grammar":
                self._send_json(200, handle_explain_grammar(body))
            elif route == "/api/ai/pronunciation":
                self._send_json(200, handle_pronunciation_analysis(body))
            elif route == "/api/ai/generate-lesson-exercise":
                self._send_json(200, handle_generate_lesson_exercise(body))
            else:
                self._send_json(200, handle_personalized_drills(body))
            return

        if route == "/api/materials/fetch-url":
            if not check_rate_limit(f"maturl:{client_ip}", limit=15, window_sec=60):
                self._send_json(429, {"error": "Vui lòng chờ vài giây trước khi tải URL tiếp theo."})
                return
            url = (body.get("url") or "").strip()
            res = _safe_fetch_public_url(url)
            self._send_json(200 if res.get("ok") else 400, res)
            return

        if route == "/api/materials/extract-file":
            if not check_rate_limit(f"matfile:{client_ip}", limit=15, window_sec=60):
                self._send_json(429, {"error": "Vui lòng chờ vài giây trước khi tải thêm file."})
                return
            res = _extract_uploaded_document(body.get("filename") or "", body.get("dataBase64") or "")
            self._send_json(200 if res.get("ok") else 400, res)
            return

        if route == "/api/system/backup":
            user = self._get_authenticated_user()
            if not user:
                self._send_json(401, {"error": "Vui lòng đăng nhập để tạo bản sao lưu hệ thống."})
                return
            info = run_hot_backup(DB_PATH, BACKUP_DIR)
            SERVER_LOGGER.info("Hot SQLite backup created by @%s: %s (%d bytes)", user["username"], info["file"], info["sizeBytes"])
            self._send_json(200, info)
            return

        if route == "/api/pdf/upload":
            if not check_rate_limit(f"pdfup:{client_ip}", limit=12, window_sec=60):
                self._send_json(429, {"error": "Vui lòng chờ vài giây trước khi tải thêm PDF."})
                return
            user = self._get_authenticated_user()
            res = upload_and_process_pdf(
                get_db, DB_LOCK, ROOT_DIR,
                user_id=user["id"] if user else None,
                hsk_level=int(body.get("hskLevel") or 1),
                filename=body.get("filename") or "curriculum.pdf",
                data_b64=body.get("dataBase64") or "",
                companion_text=body.get("companionText") or "",
            )
            self._send_json(200 if res.get("ok") else 400, res)
            return

        if route == "/api/pdf/publish":
            cid = (body.get("courseId") or "").strip()
            res = publish_course(get_db, DB_LOCK, cid)
            self._send_json(200 if res.get("ok") else 404, res)
            return

        if route == "/api/pdf/delete":
            did = (body.get("documentId") or "").strip()
            with DB_LOCK:
                conn = get_db()
                try:
                    conn.execute("DELETE FROM pdf_documents WHERE id = ? AND is_system_seed = 0", (did,))
                    conn.commit()
                finally:
                    conn.close()
            self._send_json(200, {"ok": True})
            return

        if route == "/api/tournament/create":
            if not check_rate_limit(f"trn:{client_ip}", limit=12, window_sec=60):
                self._send_json(429, {"error": "Quá nhiều yêu cầu tạo giải đấu trong 1 phút."})
                return
            res = create_tournament(
                get_db,
                DB_LOCK,
                name=body.get("name") or "",
                agent_count=int(body.get("agentCount") or 16),
                mode=body.get("mode") or "pilot",
                task_prompt=body.get("taskPrompt") or "",
            )
            self._send_json(200 if "error" not in res else 400, res)
            return

        if route == "/api/tournament/step":
            t_id = (body.get("tournamentId") or "").strip()
            res = run_next_round(get_db, DB_LOCK, t_id)
            self._send_json(200 if "error" not in res else 404, res)
            return

        if route == "/api/tournament/run-all":
            t_id = (body.get("tournamentId") or "").strip()
            res = run_all_rounds_async(get_db, DB_LOCK, t_id)
            self._send_json(200, res)
            return

        self._send_json(404, {"error": "API endpoint not found."})


class handler(QChineseRequestHandler):
    """Vercel Python Serverless entrypoint (BaseHTTPRequestHandler subclass)."""
    pass


def run_server() -> None:
    start_backup_scheduler(DB_PATH, BACKUP_DIR)
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
