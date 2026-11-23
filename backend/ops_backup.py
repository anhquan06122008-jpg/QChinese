# -*- coding: utf-8 -*-
"""
QChinese – Hạng mục 3: 24/7 Server Operations, Hot SQLite Backup/Restore, Health Metrics & Structured Logging
"""

import datetime
import logging
import os
import sqlite3
import threading
import time
from collections import deque
from pathlib import Path
from typing import Any, Callable, Dict, List

START_TIME = time.time()
RECENT_ERRORS: deque = deque(maxlen=50)
BACKUP_LOCK = threading.Lock()
LAST_BACKUP_INFO: Dict[str, Any] = {"file": None, "at": None, "sizeBytes": 0}


def setup_logger(log_dir: Path) -> logging.Logger:
    log_dir.mkdir(parents=True, exist_ok=True)
    logger = logging.getLogger("qchinese")
    if logger.handlers:
        return logger
    logger.setLevel(logging.INFO)
    fh = logging.FileHandler(log_dir / "server.log", encoding="utf-8")
    fh.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(message)s"))
    logger.addHandler(fh)
    return logger


def record_server_error(route: str, err: Exception, logger: logging.Logger) -> None:
    msg = f"{route}: {type(err).__name__}: {err}"
    RECENT_ERRORS.append({"at": datetime.datetime.now(datetime.timezone.utc).isoformat(), "route": route, "error": msg})
    logger.error(msg)


def run_hot_backup(db_path: Path, backup_dir: Path, keep_last: int = 10) -> Dict[str, Any]:
    """Perform an online consistent SQLite hot backup without locking out live readers."""
    backup_dir.mkdir(parents=True, exist_ok=True)
    ts = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%d_%H%M%S")
    dest = backup_dir / f"qchinese_{ts}.db"
    with BACKUP_LOCK:
        src = sqlite3.connect(str(db_path))
        dst = sqlite3.connect(str(dest))
        try:
            src.backup(dst)
        finally:
            dst.close()
            src.close()
        # Prune old snapshots beyond keep_last
        snaps = sorted(backup_dir.glob("qchinese_*.db"), key=lambda p: p.stat().st_mtime, reverse=True)
        for old in snaps[keep_last:]:
            try:
                old.unlink()
            except Exception:
                pass
        info = {
            "ok": True,
            "file": dest.name,
            "at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "sizeBytes": dest.stat().st_size,
            "retainedCount": min(len(snaps), keep_last),
        }
        LAST_BACKUP_INFO.update(info)
        return info


def list_backups(backup_dir: Path) -> List[Dict[str, Any]]:
    if not backup_dir.exists():
        return []
    snaps = sorted(backup_dir.glob("qchinese_*.db"), key=lambda p: p.stat().st_mtime, reverse=True)
    return [
        {
            "file": p.name,
            "sizeBytes": p.stat().st_size,
            "modifiedAt": datetime.datetime.fromtimestamp(p.stat().st_mtime, tz=datetime.timezone.utc).isoformat(),
        }
        for p in snaps[:20]
    ]


def start_backup_scheduler(db_path: Path, backup_dir: Path, interval_sec: int = 6 * 3600) -> threading.Thread:
    def _loop():
        # Take an initial safety snapshot shortly after startup if none exists today
        time.sleep(5)
        try:
            if not list_backups(backup_dir):
                run_hot_backup(db_path, backup_dir)
        except Exception:
            pass
        while True:
            time.sleep(interval_sec)
            try:
                run_hot_backup(db_path, backup_dir)
            except Exception:
                pass

    th = threading.Thread(target=_loop, daemon=True, name="qchinese-backup-scheduler")
    th.start()
    return th


def collect_system_metrics(get_db_fn: Callable[[], sqlite3.Connection], db_lock: threading.Lock, db_path: Path, backup_dir: Path) -> Dict[str, Any]:
    now_ts = int(time.time())
    with db_lock:
        conn = get_db_fn()
        try:
            users_cnt = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
            active_sess = conn.execute("SELECT COUNT(*) FROM sessions WHERE expires_at > ?", (now_ts,)).fetchone()[0]
        finally:
            conn.close()
    return {
        "ok": True,
        "uptimeSeconds": int(time.time() - START_TIME),
        "dbSizeBytes": db_path.stat().st_size if db_path.exists() else 0,
        "usersCount": users_cnt,
        "activeSessionsCount": active_sess,
        "lastBackup": LAST_BACKUP_INFO,
        "backupsAvailable": len(list_backups(backup_dir)),
        "recentErrorCount": len(RECENT_ERRORS),
        "recentErrors": list(RECENT_ERRORS)[-10:],
        "threadsActive": threading.active_count(),
        "env": {
            "port": os.environ.get("PORT", "8000"),
            "corsOrigins": os.environ.get("CORS_ORIGINS", "*"),
        },
    }
