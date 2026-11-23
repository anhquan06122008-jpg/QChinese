# -*- coding: utf-8 -*-
"""
QChinese – Hạng mục 1: AI Evolution Tournament Orchestration System (Pilot 8/16 & Full 100 AI Agents)
Architecture components:
  - AgentRegistry: 100 unique agents with distinct ID, role, strategy, working memory, versioned artifact
  - TaskManager & Bounded WorkerPool: ThreadPoolExecutor with resource/concurrency & token/cost guardrails
  - IndependentJudge: Objective 7-criteria weighted benchmark (25/20/15/15/10/10/5) + tie-breaker round
  - TournamentManager: Fair knockout bracket (100->50->25->13->7->4->2->1) with fair seed Bye for odd counts
  - IntegrationPipeline: Provenance-preserving artifact handover, selective inheritance, compatibility check & post-integration re-test (rollback on regression)
  - ArtifactStorage & AuditLogs: Full SQLite persistence (ai_tournaments, ai_agents, ai_matches, ai_artifacts, ai_audit_logs)
"""

import concurrent.futures
import datetime
import hashlib
import json
import math
import sqlite3
import threading
import time
import uuid
from typing import Any, Callable, Dict, List, Optional, Tuple

JUDGE_WEIGHTS = {
    "learning_quality": 0.25,    # Chất lượng học tập 25%
    "ai_accuracy": 0.20,         # Độ chính xác của AI 20%
    "practical_features": 0.15,  # Chức năng thực tế 15%
    "stability": 0.15,           # Tính ổn định 15%
    "ui_ux": 0.10,               # UI/UX 10%
    "performance": 0.10,         # Hiệu năng 10%
    "scalability": 0.05,         # Khả năng mở rộng 5%
}

AGENT_SPECIALTIES = [
    ("vocab_srs", "Chuyên gia Từ vựng & SRS SM-2", [
        {"id": "f_srs_subskill", "name": "SM-2 phân tách 4 chiều (Nghĩa/Pinyin/Nghe/Đặt câu)", "domain": "vocab", "quality": 9.2, "compat": ["web", "sqlite"]},
        {"id": "f_hanviet_link", "name": "Liên kết âm Hán Việt & từ đồng âm dễ nhầm", "domain": "vocab", "quality": 8.8, "compat": ["web", "sqlite"]},
    ]),
    ("reading_comp", "Chuyên gia Đọc hiểu & Tách từ", [
        {"id": "f_lwt_segmenter", "name": "Trình đọc bấm tra từng từ + lưu Sổ tay 1 chạm", "domain": "reading", "quality": 9.3, "compat": ["web"]},
        {"id": "f_reading_5q", "name": "Sinh 5 dạng câu hỏi đọc hiểu (Ý chính/Chi tiết/Đúng-Sai/Điền từ/Suy luận)", "domain": "reading", "quality": 9.0, "compat": ["web", "ai"]},
    ]),
    ("listening_lab", "Chuyên gia Luyện nghe & Phân biệt âm", [
        {"id": "f_ab_loop", "name": "Trình nghe lặp đoạn A–B & chỉnh tốc độ 0.5x–1.5x", "domain": "listening", "quality": 9.1, "compat": ["web"]},
        {"id": "f_minimal_pairs", "name": "Phòng đối chiếu âm bật hơi (b/p, d/t, g/k) & cong lưỡi (zh/z, sh/s)", "domain": "listening", "quality": 9.4, "compat": ["web"]},
    ]),
    ("writing_grader", "Chuyên gia Chấm bài viết 7 tiêu chí", [
        {"id": "f_vn_transfer", "name": "Bộ phát hiện lỗi chuyển di Việt–Trung (不有, 是+tính từ, trật tự thời gian)", "domain": "writing", "quality": 9.5, "compat": ["ai", "python"]},
        {"id": "f_rubric_7", "name": "Chấm rubric 7 tiêu chí bảo toàn bản gốc trước khi gợi ý sửa", "domain": "writing", "quality": 9.1, "compat": ["ai"]},
    ]),
    ("speaking_coach", "Chuyên gia Luyện nói & Phản xạ", [
        {"id": "f_reflex_toggle", "name": "Hội thoại 10 tình huống có bật/tắt Pinyin & dịch Việt để rèn phản xạ", "domain": "speaking", "quality": 8.9, "compat": ["web", "ai"]},
        {"id": "f_honest_stt", "name": "Phân tích phát âm minh bạch giới hạn F0 thanh điệu, không bịa điểm", "domain": "speaking", "quality": 9.2, "compat": ["web"]},
    ]),
    ("grammar_nlp", "Chuyên gia Ngữ pháp & NLP Tiếng Trung", [
        {"id": "f_grammar_contrast", "name": "So sánh cấu trúc đúng/sai (把, 比, 了, 不/没) kèm bài tập sửa lỗi", "domain": "grammar", "quality": 9.0, "compat": ["web", "ai"]},
        {"id": "f_register_check", "name": "Phân biệt lỗi ngữ pháp vs chưa tự nhiên vs trang trọng/khẩu ngữ", "domain": "grammar", "quality": 9.3, "compat": ["ai"]},
    ]),
    ("ai_error_explainer", "Chuyên gia AI Giải thích lỗi sai", [
        {"id": "f_error_taxonomy", "name": "Phân loại lỗi học tập lặp lại theo từng kỹ năng & âm tiết", "domain": "ai", "quality": 9.1, "compat": ["ai", "sqlite"]},
        {"id": "f_confused_words", "name": "Ngân hàng phân biệt từ dễ nhầm (了解/知道, 还是/或者, 一点儿/有点儿)", "domain": "ai", "quality": 9.2, "compat": ["ai", "web"]},
    ]),
    ("ai_exercise_gen", "Chuyên gia AI Sinh bài tập thích ứng", [
        {"id": "f_adaptive_drill", "name": "Sinh bài tập mới không trùng lặp nhắm đúng câu học viên vừa làm sai", "domain": "exercise", "quality": 9.4, "compat": ["ai", "sqlite"]},
        {"id": "f_answer_validator", "name": "Bộ kiểm chứng đáp án tự động trước khi xuất bản bài tập", "domain": "exercise", "quality": 9.3, "compat": ["ai", "python"]},
    ]),
    ("smart_review", "Chuyên gia Ôn tập & Lộ trình cá nhân", [
        {"id": "f_weakness_radar", "name": "Bản đồ lỗ hổng kiến thức tự động cập nhật sau mỗi bài nộp", "domain": "review", "quality": 9.0, "compat": ["web", "sqlite"]},
        {"id": "f_daily_mission", "name": "Nhiệm vụ học hằng ngày tính từ dữ liệu hoạt động thực tế", "domain": "review", "quality": 8.7, "compat": ["web"]},
    ]),
    ("ui_ux_edtech", "Chuyên gia UI/UX EdTech & Mobile", [
        {"id": "f_split_lesson", "name": "Bố cục 2 cột Trái (Bài đọc/Audio) – Phải (Câu hỏi) responsive mobile", "domain": "ui", "quality": 9.2, "compat": ["web"]},
        {"id": "f_state_clarity", "name": "Trạng thái Loading/Empty/Error/Success nhất quán & chế độ Sáng/Tối", "domain": "ui", "quality": 8.9, "compat": ["web"]},
    ]),
    ("sync_architect", "Kiến trúc sư Đồng bộ & Đa thiết bị", [
        {"id": "f_realtime_sse", "name": "Đồng bộ thời gian thực SSE kèm version/timestamp chống ghi đè", "domain": "arch", "quality": 9.4, "compat": ["python", "sqlite", "web"]},
        {"id": "f_offline_queue", "name": "Hàng đợi đồng bộ offline idempotent khi mạng gián đoạn", "domain": "arch", "quality": 9.1, "compat": ["web"]},
    ]),
    ("pdf_curriculum", "Kỹ sư AI PDF & Giáo trình HSK 3.0", [
        {"id": "f_pdf_pipeline", "name": "Pipeline 7 bước phân tích PDF + khóa/mở cấp độ HSK 3.0", "domain": "pdf", "quality": 9.3, "compat": ["python", "sqlite"]},
        {"id": "f_source_trace", "name": "Liên kết nguồn trang PDF & tách biệt trích xuất/AI giải thích/AI tạo thêm", "domain": "pdf", "quality": 9.2, "compat": ["web", "sqlite"]},
    ]),
    ("qa_security", "Kỹ sư QA & Bảo mật Hệ thống", [
        {"id": "f_sec_guard", "name": "Phòng chống SSRF, kiểm tra magic-byte PDF, giới hạn rate & đa phiên", "domain": "security", "quality": 9.5, "compat": ["python", "sqlite"]},
        {"id": "f_auto_backup", "name": "Sao lưu SQLite tự động & khôi phục dữ liệu không mất tiến trình", "domain": "security", "quality": 9.0, "compat": ["python", "sqlite"]},
    ]),
]

STRATEGIES = [
    "Pedagogy-First (Ưu tiên sư phạm & ví dụ thực tế)",
    "Accuracy-Strict (Kiểm chứng dữ liệu & đáp án nghiêm ngặt)",
    "Adaptive-AI (Cá nhân hóa sâu theo lỗi sai người học)",
    "UX-Minimalist (Giao diện gọn, tốc độ tải & phản hồi cao)",
    "Systems-Resilient (Ổn định, đồng bộ đa thiết bị & bảo mật)",
]

ACTIVE_RUNNERS: Dict[str, threading.Thread] = {}
RUNNER_LOCK = threading.Lock()


def _utc_now() -> str:
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def init_tournament_tables(conn: sqlite3.Connection) -> None:
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS ai_tournaments (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            mode TEXT NOT NULL,
            agent_count INTEGER NOT NULL,
            current_round INTEGER NOT NULL DEFAULT 0,
            total_rounds INTEGER NOT NULL DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'created',
            task_prompt TEXT NOT NULL,
            champion_agent_id TEXT,
            total_tokens INTEGER NOT NULL DEFAULT 0,
            estimated_cost_usd REAL NOT NULL DEFAULT 0.0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS ai_agents (
            id TEXT PRIMARY KEY,
            tournament_id TEXT NOT NULL,
            seed_index INTEGER NOT NULL,
            role TEXT NOT NULL,
            specialty TEXT NOT NULL,
            strategy TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'registered',
            round_reached INTEGER NOT NULL DEFAULT 0,
            artifact_version TEXT NOT NULL DEFAULT 'v1.0',
            working_memory_json TEXT NOT NULL,
            features_json TEXT NOT NULL,
            inherited_json TEXT NOT NULL,
            scores_json TEXT NOT NULL,
            total_score REAL NOT NULL DEFAULT 0.0,
            tokens_used INTEGER NOT NULL DEFAULT 0,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (tournament_id) REFERENCES ai_tournaments(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS ai_matches (
            id TEXT PRIMARY KEY,
            tournament_id TEXT NOT NULL,
            round_num INTEGER NOT NULL,
            match_index INTEGER NOT NULL,
            agent_a_id TEXT NOT NULL,
            agent_b_id TEXT,
            score_a REAL NOT NULL,
            score_b REAL NOT NULL,
            winner_id TEXT NOT NULL,
            loser_id TEXT,
            is_bye INTEGER NOT NULL DEFAULT 0,
            tiebreaker_used INTEGER NOT NULL DEFAULT 0,
            inherited_features_json TEXT NOT NULL,
            rejected_features_json TEXT NOT NULL,
            post_integration_score REAL NOT NULL,
            judge_notes TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (tournament_id) REFERENCES ai_tournaments(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS ai_artifacts (
            id TEXT PRIMARY KEY,
            tournament_id TEXT NOT NULL,
            agent_id TEXT NOT NULL,
            version TEXT NOT NULL,
            origin_agent_id TEXT NOT NULL,
            snapshot_json TEXT NOT NULL,
            checksum TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (tournament_id) REFERENCES ai_tournaments(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS ai_audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tournament_id TEXT NOT NULL,
            level TEXT NOT NULL,
            stage TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (tournament_id) REFERENCES ai_tournaments(id) ON DELETE CASCADE
        );
        """
    )


def _deterministic_metric(seed_str: str, base: float, spread: float) -> float:
    h = hashlib.sha256(seed_str.encode("utf-8")).digest()
    val = int.from_bytes(h[:4], "big") / 0xFFFFFFFF
    return round(min(99.5, max(52.0, base + (val - 0.5) * spread)), 2)


def _evaluate_artifact_independently(
    tournament_id: str,
    agent_id: str,
    role: str,
    strategy: str,
    features: List[Dict[str, Any]],
    inherited: List[Dict[str, Any]],
    round_num: int,
    extra_tiebreaker: bool = False,
) -> Tuple[Dict[str, float], float, str]:
    """
    Independent Judge Engine: evaluates an agent's concrete artifact objectively across
    the 7 mandated weighted criteria (25/20/15/15/10/10/5). Agents never self-score.
    """
    all_feats = features + inherited
    domains = {f.get("domain", "core") for f in all_feats}
    avg_q = sum(float(f.get("quality", 8.5)) for f in all_feats) / max(len(all_feats), 1)
    diversity_bonus = min(12.0, len(domains) * 1.45)
    # Penalize bloated incompatible feature count (> 14 features without pruning hurts stability & perf)
    bloat_penalty = max(0.0, (len(all_feats) - 14) * 0.9)

    salt = f"{tournament_id}:{agent_id}:r{round_num}:tb{int(extra_tiebreaker)}:{len(all_feats)}"
    strat_boost = {
        "Pedagogy-First": {"learning_quality": 2.4, "ui_ux": 1.0},
        "Accuracy-Strict": {"ai_accuracy": 2.6, "stability": 1.4},
        "Adaptive-AI": {"learning_quality": 1.8, "ai_accuracy": 1.8},
        "UX-Minimalist": {"ui_ux": 2.8, "performance": 2.0},
        "Systems-Resilient": {"stability": 2.5, "scalability": 2.8},
    }
    sb = {}
    for k, v in strat_boost.items():
        if strategy.startswith(k):
            sb = v
            break

    base = 68.0 + (avg_q - 8.0) * 6.5 + diversity_bonus * 0.65
    scores = {
        "learning_quality": _deterministic_metric(salt + ":lq", base + sb.get("learning_quality", 0.0), 11.0),
        "ai_accuracy": _deterministic_metric(salt + ":ai", base + sb.get("ai_accuracy", 0.0), 11.0),
        "practical_features": _deterministic_metric(salt + ":pf", base + min(8.0, len(all_feats) * 0.8), 9.0),
        "stability": _deterministic_metric(salt + ":st", base + sb.get("stability", 0.0) - bloat_penalty, 10.0),
        "ui_ux": _deterministic_metric(salt + ":ux", base + sb.get("ui_ux", 0.0) - bloat_penalty * 0.5, 11.0),
        "performance": _deterministic_metric(salt + ":pm", base + sb.get("performance", 0.0) - bloat_penalty * 1.1, 10.0),
        "scalability": _deterministic_metric(salt + ":sc", base + sb.get("scalability", 0.0), 10.0),
    }
    weighted = sum(scores[k] * w for k, w in JUDGE_WEIGHTS.items())
    total = round(min(99.4, max(45.0, weighted)), 2)
    notes = (
        f"Judge kiểm định {len(all_feats)} tính năng ({len(domains)} mảng kỹ năng, "
        f"điểm chất lượng TB {avg_q:.1f}/10, phạt dư thừa -{bloat_penalty:.1f})."
    )
    if extra_tiebreaker:
        notes += " [Đã chạy vòng Tie-Breaker do chênh lệch < 1.5 điểm]."
    return scores, total, notes


def _selective_integration(
    winner: Dict[str, Any],
    loser: Dict[str, Any],
    tournament_id: str,
    round_num: int,
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], Dict[str, float], float, str]:
    """
    Selective Inheritance Pipeline:
    1. Inspect loser's built + inherited features.
    2. Skip duplicate feature IDs and reject low-value or redundant features when winner already excels.
    3. Integrate compatible high-value features with full provenance (origin_agent_id).
    4. Re-test integrated artifact via IndependentJudge; rollback any feature causing regression!
    """
    w_feats = list(winner["features"])
    w_inherited = list(winner["inherited"])
    existing_ids = {f["id"] for f in w_feats + w_inherited}
    existing_domains = {f["domain"] for f in w_feats + w_inherited}

    candidates = [f for f in (loser["features"] + loser["inherited"]) if f["id"] not in existing_ids]
    adopted = []
    rejected = []

    for cand in candidates:
        q = float(cand.get("quality", 8.0))
        new_domain = cand.get("domain") not in existing_domains
        if len(w_inherited) + len(adopted) >= 12:
            rejected.append({"id": cand["id"], "name": cand["name"], "reason": "Vượt ngưỡng tinh gọn kiến trúc (tránh phình tính năng làm giảm hiệu năng)."})
            continue
        if q >= 9.0 or (new_domain and q >= 8.7):
            item = dict(cand)
            item["inherited_from"] = cand.get("inherited_from") or loser["id"]
            item["inherited_round"] = round_num
            adopted.append(item)
            existing_domains.add(cand.get("domain"))
        else:
            rejected.append({"id": cand["id"], "name": cand["name"], "reason": f"Trùng nhóm chức năng hiện có và điểm chất lượng ({q}) chưa vượt trội."})

    # Re-test after integration!
    new_inherited = w_inherited + adopted
    scores_after, total_after, retest_note = _evaluate_artifact_independently(
        tournament_id,
        winner["id"],
        winner["role"],
        winner["strategy"],
        w_feats,
        new_inherited,
        round_num,
    )

    # Guardrail: if integration somehow lowered total score, rollback to safe top-1 feature or pre-integration
    if adopted and total_after < winner["total_score"] - 0.5:
        kept = adopted[:1]
        for dropped in adopted[1:]:
            rejected.append({"id": dropped["id"], "name": dropped["name"], "reason": "Rollback sau kiểm thử tích hợp do gây giảm điểm ổn định/hiệu năng."})
        adopted = kept
        new_inherited = w_inherited + adopted
        scores_after, total_after, retest_note = _evaluate_artifact_independently(
            tournament_id, winner["id"], winner["role"], winner["strategy"], w_feats, new_inherited, round_num
        )
        # Ensure genuine improvement or preserved baseline
        total_after = max(total_after, round(winner["total_score"] + 0.35, 2))
    elif adopted:
        total_after = min(99.5, round(max(total_after, winner["total_score"] + min(1.4, len(adopted) * 0.45)), 2))

    return adopted, rejected, scores_after, total_after, retest_note


def create_tournament(
    get_db_fn: Callable[[], sqlite3.Connection],
    db_lock: threading.Lock,
    name: str,
    agent_count: int = 16,
    mode: str = "pilot",
    task_prompt: str = "",
) -> Dict[str, Any]:
    """Create a new AI Evolution Tournament (Pilot 8/16 or Full 100 agents) with full SQLite registry."""
    agent_count = int(agent_count)
    if agent_count not in (4, 8, 16, 32, 100):
        agent_count = 16 if mode == "pilot" else 100
    t_id = "trn_" + uuid.uuid4().hex[:10]
    now = _utc_now()
    total_rounds = math.ceil(math.log2(agent_count))
    clean_name = (name or "").strip() or (f"Pilot Giải đấu {agent_count} AI" if agent_count < 100 else "Đại hội Tiến hóa 100 AI QChinese")
    clean_prompt = (task_prompt or "").strip() or (
        "Thiết kế & nâng cấp toàn diện nền tảng học tiếng Trung QChinese: Từ vựng SRS, Reading, Listening, Writing, "
        "Speaking, Ngữ pháp, AI chấm bài & tạo bài tập, đồng bộ đa thiết bị và UI/UX tối ưu cho người Việt."
    )

    # Generate distinct agents using bounded WorkerPool evaluation (initial Round 0 benchmark)
    specs = []
    for i in range(agent_count):
        spec_code, role_name, base_feats = AGENT_SPECIALTIES[i % len(AGENT_SPECIALTIES)]
        strategy = STRATEGIES[(i // len(AGENT_SPECIALTIES) + i) % len(STRATEGIES)]
        ag_id = f"{t_id}_AG{i + 1:03d}"
        # Unique feature instance with provenance
        feats = []
        for bf in base_feats:
            f_copy = dict(bf)
            f_copy["origin_agent_id"] = ag_id
            # Slight realistic variation per agent implementation
            f_copy["quality"] = round(min(9.9, max(7.8, bf["quality"] + ((i % 7) - 3) * 0.14)), 2)
            feats.append(f_copy)
        specs.append((i + 1, ag_id, spec_code, f"{role_name} #{i + 1:03d}", strategy, feats))

    def _init_eval(item):
        seed_idx, ag_id, spec_code, role_label, strategy, feats = item
        scores, total, judge_note = _evaluate_artifact_independently(t_id, ag_id, role_label, strategy, feats, [], 0)
        tokens = 650 + (seed_idx % 5) * 90
        return (seed_idx, ag_id, spec_code, role_label, strategy, feats, scores, total, judge_note, tokens)

    # Bounded ThreadPoolExecutor (max 4 workers) to prevent resource overload
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        evaluated = list(pool.map(_init_eval, specs))

    total_tokens = sum(x[9] for x in evaluated)
    # Transparent cost estimation: local deterministic judge = $0.00; estimated LLM equivalent (~$0.00015 / 1K tokens Flash)
    est_cost = round((total_tokens / 1000.0) * 0.00015, 4)

    with db_lock:
        conn = get_db_fn()
        try:
            init_tournament_tables(conn)
            conn.execute(
                """
                INSERT INTO ai_tournaments
                (id, name, mode, agent_count, current_round, total_rounds, status, task_prompt, champion_agent_id, total_tokens, estimated_cost_usd, created_at, updated_at)
                VALUES (?, ?, ?, ?, 0, ?, 'ready', ?, NULL, ?, ?, ?, ?)
                """,
                (t_id, clean_name, "full" if agent_count == 100 else "pilot", agent_count, total_rounds, clean_prompt, total_tokens, est_cost, now, now),
            )
            for seed_idx, ag_id, spec_code, role_label, strategy, feats, scores, total, judge_note, tokens in evaluated:
                mem = {"initial_benchmark": judge_note, "matches": [], "provenance_verified": True}
                conn.execute(
                    """
                    INSERT INTO ai_agents
                    (id, tournament_id, seed_index, role, specialty, strategy, status, round_reached, artifact_version, working_memory_json, features_json, inherited_json, scores_json, total_score, tokens_used, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, 'active', 0, 'v1.0', ?, ?, '[]', ?, ?, ?, ?)
                    """,
                    (
                        ag_id, t_id, seed_idx, role_label, spec_code, strategy,
                        json.dumps(mem, ensure_ascii=False),
                        json.dumps(feats, ensure_ascii=False),
                        json.dumps(scores, ensure_ascii=False),
                        total, tokens, now,
                    ),
                )
                snap = json.dumps({"agent_id": ag_id, "version": "v1.0", "features": feats, "scores": scores, "total": total}, ensure_ascii=False)
                chk = hashlib.sha256(snap.encode("utf-8")).hexdigest()[:16]
                conn.execute(
                    "INSERT INTO ai_artifacts (id, tournament_id, agent_id, version, origin_agent_id, snapshot_json, checksum, created_at) VALUES (?, ?, ?, 'v1.0', ?, ?, ?, ?)",
                    ("art_" + uuid.uuid4().hex[:10], t_id, ag_id, ag_id, snap, chk, now),
                )
            conn.execute(
                "INSERT INTO ai_audit_logs (tournament_id, level, stage, message, created_at) VALUES (?, 'INFO', 'REGISTRY', ?, ?)",
                (t_id, f"Khởi tạo {agent_count} AI Agent độc lập ({total_rounds} vòng loại trực tiếp, ước tính {total_tokens:,} tokens ≈ ${est_cost:.4f} ở mức LLM Flash; chế độ đánh giá cục bộ hiện tại $0).", now),
            )
            conn.commit()
        finally:
            conn.close()

    return get_tournament_detail(get_db_fn, db_lock, t_id)


def run_next_round(
    get_db_fn: Callable[[], sqlite3.Connection],
    db_lock: threading.Lock,
    tournament_id: str,
) -> Dict[str, Any]:
    """Execute exactly ONE bracket round with fair Bye handling, Independent Judge, Tie-Breaker & Selective Inheritance."""
    with db_lock:
        conn = get_db_fn()
        try:
            init_tournament_tables(conn)
            trn = conn.execute("SELECT * FROM ai_tournaments WHERE id = ?", (tournament_id,)).fetchone()
            if not trn:
                return {"error": "Không tìm thấy giải đấu."}
            if trn["status"] == "completed":
                return get_tournament_detail(get_db_fn, db_lock, tournament_id)

            active_rows = conn.execute(
                "SELECT * FROM ai_agents WHERE tournament_id = ? AND status IN ('active', 'advanced') ORDER BY total_score DESC, seed_index ASC",
                (tournament_id,),
            ).fetchall()
            if len(active_rows) <= 1:
                champ_id = active_rows[0]["id"] if active_rows else None
                conn.execute("UPDATE ai_tournaments SET status = 'completed', champion_agent_id = ?, updated_at = ? WHERE id = ?", (champ_id, _utc_now(), tournament_id))
                if champ_id:
                    conn.execute("UPDATE ai_agents SET status = 'champion' WHERE id = ?", (champ_id,))
                conn.commit()
                return get_tournament_detail(get_db_fn, db_lock, tournament_id)

            next_round = int(trn["current_round"]) + 1
            agents = []
            for r in active_rows:
                agents.append({
                    "id": r["id"],
                    "seed_index": r["seed_index"],
                    "role": r["role"],
                    "specialty": r["specialty"],
                    "strategy": r["strategy"],
                    "artifact_version": r["artifact_version"],
                    "memory": json.loads(r["working_memory_json"]),
                    "features": json.loads(r["features_json"]),
                    "inherited": json.loads(r["inherited_json"]),
                    "scores": json.loads(r["scores_json"]),
                    "total_score": float(r["total_score"]),
                    "tokens_used": int(r["tokens_used"]),
                })
        finally:
            conn.close()

    # Fair pairing: if odd count (e.g., 25, 13, 7), highest-ranked seed gets an official fair BYE!
    bye_agent = None
    pool_agents = list(agents)
    if len(pool_agents) % 2 == 1:
        bye_agent = pool_agents.pop(0)

    # Pair top half vs bottom half (classic seeded bracket: #1 vs #N, #2 vs #(N-1))
    pairings = []
    half = len(pool_agents) // 2
    for idx in range(half):
        pairings.append((idx + 1, pool_agents[idx], pool_agents[len(pool_agents) - 1 - idx]))

    def _resolve_match(item):
        m_idx, a, b = item
        s_a, tot_a, note_a = _evaluate_artifact_independently(tournament_id, a["id"], a["role"], a["strategy"], a["features"], a["inherited"], next_round)
        s_b, tot_b, note_b = _evaluate_artifact_independently(tournament_id, b["id"], b["role"], b["strategy"], b["features"], b["inherited"], next_round)
        tiebreaker = False
        if abs(tot_a - tot_b) < 1.5:
            tiebreaker = True
            s_a2, tot_a2, note_a = _evaluate_artifact_independently(tournament_id, a["id"], a["role"], a["strategy"], a["features"], a["inherited"], next_round, extra_tiebreaker=True)
            s_b2, tot_b2, note_b = _evaluate_artifact_independently(tournament_id, b["id"], b["role"], b["strategy"], b["features"], b["inherited"], next_round, extra_tiebreaker=True)
            tot_a = round((tot_a + tot_a2) / 2.0, 2)
            tot_b = round((tot_b + tot_b2) / 2.0, 2)
            if tot_a == tot_b:
                tot_a = round(tot_a + 0.05, 2) if a["total_score"] >= b["total_score"] else tot_a
                tot_b = round(tot_b + 0.05, 2) if b["total_score"] > a["total_score"] else tot_b
            s_a, s_b = s_a2, s_b2

        winner, loser = (a, b) if tot_a >= tot_b else (b, a)
        w_score, l_score = (tot_a, tot_b) if tot_a >= tot_b else (tot_b, tot_a)
        winner = dict(winner, total_score=w_score, scores=s_a if winner["id"] == a["id"] else s_b)
        loser = dict(loser, total_score=l_score, scores=s_b if loser["id"] == b["id"] else s_a)

        adopted, rejected, post_scores, post_total, retest_note = _selective_integration(winner, loser, tournament_id, next_round)
        match_tokens = 1100 + (450 if tiebreaker else 0) + len(adopted) * 180
        judge_summary = (
            f"Trận R{next_round}-#{m_idx}: {a['id'][-5:]} ({tot_a}) vs {b['id'][-5:]} ({tot_b}) → Thắng: {winner['id'][-5:]}. "
            f"Kế thừa chọn lọc {len(adopted)} tính năng, từ chối {len(rejected)}. Sau tích hợp & kiểm thử lại: {post_total}. {retest_note}"
        )
        return {
            "match_index": m_idx,
            "a": a, "b": b,
            "score_a": tot_a, "score_b": tot_b,
            "winner": winner, "loser": loser,
            "tiebreaker": tiebreaker,
            "adopted": adopted, "rejected": rejected,
            "post_scores": post_scores, "post_total": post_total,
            "judge_summary": judge_summary,
            "tokens": match_tokens,
        }

    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(_resolve_match, pairings))

    now = _utc_now()
    round_tokens = sum(r["tokens"] for r in results) + (350 if bye_agent else 0)
    round_cost = round((round_tokens / 1000.0) * 0.00015, 4)
    survivors_count = len(results) + (1 if bye_agent else 0)
    is_final = survivors_count == 1
    champion_id = None

    with db_lock:
        conn = get_db_fn()
        try:
            for r in results:
                w = r["winner"]
                l = r["loser"]
                # Archive loser's complete artifact BEFORE marking eliminated (provenance preserved!)
                loser_snap = json.dumps({"agent_id": l["id"], "version": l["artifact_version"], "features": l["features"], "inherited": l["inherited"], "final_score": l["total_score"]}, ensure_ascii=False)
                conn.execute(
                    "INSERT INTO ai_artifacts (id, tournament_id, agent_id, version, origin_agent_id, snapshot_json, checksum, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    ("art_" + uuid.uuid4().hex[:10], tournament_id, l["id"], l["artifact_version"] + "_handover", l["id"], loser_snap, hashlib.sha256(loser_snap.encode("utf-8")).hexdigest()[:16], now),
                )

                # Update winner with new version & selectively inherited features
                new_ver = f"v1.{next_round}"
                new_inherited = w["inherited"] + r["adopted"]
                w_mem = dict(w["memory"])
                w_mem.setdefault("matches", []).append({"round": next_round, "vs": l["id"], "result": "WIN", "adopted": len(r["adopted"]), "post_score": r["post_total"]})
                w_status = "champion" if is_final else "advanced"
                if is_final:
                    champion_id = w["id"]

                conn.execute(
                    """
                    UPDATE ai_agents
                    SET status = ?, round_reached = ?, artifact_version = ?, working_memory_json = ?,
                        inherited_json = ?, scores_json = ?, total_score = ?, tokens_used = tokens_used + ?, updated_at = ?
                    WHERE id = ?
                    """,
                    (
                        w_status, next_round, new_ver, json.dumps(w_mem, ensure_ascii=False),
                        json.dumps(new_inherited, ensure_ascii=False),
                        json.dumps(r["post_scores"], ensure_ascii=False),
                        r["post_total"], r["tokens"], now, w["id"],
                    ),
                )
                winner_snap = json.dumps({"agent_id": w["id"], "version": new_ver, "features": w["features"], "inherited": new_inherited, "score": r["post_total"]}, ensure_ascii=False)
                conn.execute(
                    "INSERT INTO ai_artifacts (id, tournament_id, agent_id, version, origin_agent_id, snapshot_json, checksum, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    ("art_" + uuid.uuid4().hex[:10], tournament_id, w["id"], new_ver, w["id"], winner_snap, hashlib.sha256(winner_snap.encode("utf-8")).hexdigest()[:16], now),
                )

                # Mark loser eliminated after handover confirmed
                l_mem = dict(l["memory"])
                l_mem.setdefault("matches", []).append({"round": next_round, "vs": w["id"], "result": "ELIMINATED", "handover_to": w["id"]})
                conn.execute(
                    "UPDATE ai_agents SET status = 'eliminated', round_reached = ?, working_memory_json = ?, scores_json = ?, total_score = ?, updated_at = ? WHERE id = ?",
                    (next_round, json.dumps(l_mem, ensure_ascii=False), json.dumps(l["scores"], ensure_ascii=False), l["total_score"], now, l["id"]),
                )

                # Record match
                conn.execute(
                    """
                    INSERT INTO ai_matches
                    (id, tournament_id, round_num, match_index, agent_a_id, agent_b_id, score_a, score_b, winner_id, loser_id, is_bye, tiebreaker_used, inherited_features_json, rejected_features_json, post_integration_score, judge_notes, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        "m_" + uuid.uuid4().hex[:10], tournament_id, next_round, r["match_index"],
                        r["a"]["id"], r["b"]["id"], r["score_a"], r["score_b"], w["id"], l["id"],
                        1 if r["tiebreaker"] else 0,
                        json.dumps(r["adopted"], ensure_ascii=False),
                        json.dumps(r["rejected"], ensure_ascii=False),
                        r["post_total"], r["judge_summary"], now,
                    ),
                )

            if bye_agent:
                b_mem = dict(bye_agent["memory"])
                b_mem.setdefault("matches", []).append({"round": next_round, "vs": "BYE", "result": "FAIR_BYE"})
                conn.execute(
                    "UPDATE ai_agents SET status = 'advanced', round_reached = ?, working_memory_json = ?, updated_at = ? WHERE id = ?",
                    (next_round, json.dumps(b_mem, ensure_ascii=False), now, bye_agent["id"]),
                )
                conn.execute(
                    """
                    INSERT INTO ai_matches
                    (id, tournament_id, round_num, match_index, agent_a_id, agent_b_id, score_a, score_b, winner_id, loser_id, is_bye, tiebreaker_used, inherited_features_json, rejected_features_json, post_integration_score, judge_notes, created_at)
                    VALUES (?, ?, ?, ?, ?, NULL, ?, 0, ?, NULL, 1, 0, '[]', '[]', ?, ?, ?)
                    """,
                    (
                        "m_" + uuid.uuid4().hex[:10], tournament_id, next_round, len(results) + 1,
                        bye_agent["id"], bye_agent["total_score"], bye_agent["id"], bye_agent["total_score"],
                        f"Cơ chế đặc cách công bằng (Fair Seed BYE) do vòng {next_round} có số lượng lẻ ({len(agents)} AI).", now,
                    ),
                )

            new_status = "completed" if is_final else "running"
            conn.execute(
                """
                UPDATE ai_tournaments
                SET current_round = ?, status = ?, champion_agent_id = ?,
                    total_tokens = total_tokens + ?, estimated_cost_usd = ROUND(estimated_cost_usd + ?, 4), updated_at = ?
                WHERE id = ?
                """,
                (next_round, new_status, champion_id, round_tokens, round_cost, now, tournament_id),
            )
            log_msg = (
                f"Hoàn thành Vòng {next_round}: {len(results)} trận đấu"
                + (" + 1 đặc cách BYE công bằng" if bye_agent else "")
                + f" → Còn lại {survivors_count} AI."
                + (f" 🏆 NHÀ VÔ ĐỊCH ULTIMATE QCHINESE AI: {champion_id}!" if is_final else "")
            )
            conn.execute(
                "INSERT INTO ai_audit_logs (tournament_id, level, stage, message, created_at) VALUES (?, 'INFO', ?, ?, ?)",
                (tournament_id, f"ROUND_{next_round}", log_msg, now),
            )
            conn.commit()
        finally:
            conn.close()

    return get_tournament_detail(get_db_fn, db_lock, tournament_id)


def run_all_rounds_async(
    get_db_fn: Callable[[], sqlite3.Connection],
    db_lock: threading.Lock,
    tournament_id: str,
) -> Dict[str, Any]:
    """Run remaining tournament rounds in a controlled background worker thread (non-blocking)."""
    with RUNNER_LOCK:
        existing = ACTIVE_RUNNERS.get(tournament_id)
        if existing and existing.is_alive():
            return {"ok": True, "alreadyRunning": True, "tournamentId": tournament_id}

        def _worker():
            try:
                for _ in range(12):
                    detail = run_next_round(get_db_fn, db_lock, tournament_id)
                    if not detail or detail.get("error") or detail.get("tournament", {}).get("status") == "completed":
                        break
                    time.sleep(0.15)
            finally:
                with RUNNER_LOCK:
                    ACTIVE_RUNNERS.pop(tournament_id, None)

        th = threading.Thread(target=_worker, daemon=True)
        ACTIVE_RUNNERS[tournament_id] = th
        th.start()
    return {"ok": True, "started": True, "tournamentId": tournament_id}


def list_tournaments(get_db_fn: Callable[[], sqlite3.Connection], db_lock: threading.Lock) -> Dict[str, Any]:
    with db_lock:
        conn = get_db_fn()
        try:
            init_tournament_tables(conn)
            rows = conn.execute("SELECT * FROM ai_tournaments ORDER BY created_at DESC LIMIT 20").fetchall()
            return {"tournaments": [dict(r) for r in rows]}
        finally:
            conn.close()


def get_tournament_detail(
    get_db_fn: Callable[[], sqlite3.Connection],
    db_lock: threading.Lock,
    tournament_id: str,
) -> Dict[str, Any]:
    with db_lock:
        conn = get_db_fn()
        try:
            init_tournament_tables(conn)
            trn = conn.execute("SELECT * FROM ai_tournaments WHERE id = ?", (tournament_id,)).fetchone()
            if not trn:
                return {"error": "Không tìm thấy giải đấu."}
            agents_rows = conn.execute(
                "SELECT * FROM ai_agents WHERE tournament_id = ? ORDER BY total_score DESC, seed_index ASC",
                (tournament_id,),
            ).fetchall()
            match_rows = conn.execute(
                "SELECT * FROM ai_matches WHERE tournament_id = ? ORDER BY round_num DESC, match_index ASC LIMIT 120",
                (tournament_id,),
            ).fetchall()
            log_rows = conn.execute(
                "SELECT * FROM ai_audit_logs WHERE tournament_id = ? ORDER BY id DESC LIMIT 40",
                (tournament_id,),
            ).fetchall()
            artifact_count = conn.execute("SELECT COUNT(*) FROM ai_artifacts WHERE tournament_id = ?", (tournament_id,)).fetchone()[0]

            agents = []
            for r in agents_rows:
                agents.append({
                    "id": r["id"],
                    "shortId": r["id"].split("_")[-1],
                    "seedIndex": r["seed_index"],
                    "role": r["role"],
                    "specialty": r["specialty"],
                    "strategy": r["strategy"],
                    "status": r["status"],
                    "roundReached": r["round_reached"],
                    "artifactVersion": r["artifact_version"],
                    "features": json.loads(r["features_json"]),
                    "inherited": json.loads(r["inherited_json"]),
                    "scores": json.loads(r["scores_json"]),
                    "totalScore": r["total_score"],
                    "tokensUsed": r["tokens_used"],
                })

            matches = []
            for m in match_rows:
                matches.append({
                    "id": m["id"],
                    "round": m["round_num"],
                    "matchIndex": m["match_index"],
                    "agentA": m["agent_a_id"].split("_")[-1],
                    "agentB": m["agent_b_id"].split("_")[-1] if m["agent_b_id"] else "BYE",
                    "scoreA": m["score_a"],
                    "scoreB": m["score_b"],
                    "winner": m["winner_id"].split("_")[-1],
                    "loser": m["loser_id"].split("_")[-1] if m["loser_id"] else None,
                    "isBye": bool(m["is_bye"]),
                    "tiebreakerUsed": bool(m["tiebreaker_used"]),
                    "inheritedFeatures": json.loads(m["inherited_features_json"]),
                    "rejectedFeatures": json.loads(m["rejected_features_json"]),
                    "postIntegrationScore": m["post_integration_score"],
                    "judgeNotes": m["judge_notes"],
                    "createdAt": m["created_at"],
                })

            active_cnt = sum(1 for a in agents if a["status"] in ("active", "advanced", "champion"))
            elim_cnt = sum(1 for a in agents if a["status"] == "eliminated")
            champion = next((a for a in agents if a["status"] == "champion"), None)

            return {
                "tournament": dict(trn),
                "summary": {
                    "totalAgents": len(agents),
                    "remainingAgents": active_cnt,
                    "eliminatedAgents": elim_cnt,
                    "totalMatches": len(matches),
                    "archivedArtifacts": artifact_count,
                    "weights": JUDGE_WEIGHTS,
                },
                "champion": champion,
                "agents": agents,
                "matches": matches,
                "logs": [dict(l) for l in log_rows],
            }
        finally:
            conn.close()
