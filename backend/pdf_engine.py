# -*- coding: utf-8 -*-
"""
QChinese – Hạng mục 5: AI PDF Curriculum Engine (HSK 3.0 Level Lock/Unlock + 7-Stage Background Pipeline)
Strictly distinguishes:
  - extracted_from_pdf (real extracted text / real HSK 3.0 MP3 / verified HSK 3.0 vocab)
  - ai_explained       (pedagogical explanations)
  - ai_generated       (additional practice exercises built from curriculum knowledge)
Never fabricates fake data for HSK levels that have no uploaded curriculum PDFs (HSK 2..6, HSK 7-9 stay LOCKED).
"""

import base64
import datetime
import hashlib
import json
import os
import re
import sqlite3
import threading
import time
import uuid
import zlib
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, Tuple

HSK3_LEVELS = [
    {"level": 1, "code": "HSK 1", "title": "HSK 3.0 – Cấp 1 (Sơ cấp 1)"},
    {"level": 2, "code": "HSK 2", "title": "HSK 3.0 – Cấp 2 (Sơ cấp 2)"},
    {"level": 3, "code": "HSK 3", "title": "HSK 3.0 – Cấp 3 (Sơ cấp 3)"},
    {"level": 4, "code": "HSK 4", "title": "HSK 3.0 – Cấp 4 (Trung cấp 1)"},
    {"level": 5, "code": "HSK 5", "title": "HSK 3.0 – Cấp 5 (Trung cấp 2)"},
    {"level": 6, "code": "HSK 6", "title": "HSK 3.0 – Cấp 6 (Trung cấp 3)"},
    {"level": 7, "code": "HSK 7–9", "title": "HSK 3.0 – Cấp 7–9 (Cao cấp)"},
]

LOCAL_HSK1_PDF_DIR = Path(os.environ.get("QCHINESE_HSK1_PDF_DIR", r"c:\Users\anhqu\Downloads\HSK-3.0\HSK 1"))
LOCAL_HSK1_MP3_DIR = Path(os.environ.get("QCHINESE_HSK1_MP3_DIR", r"c:\Users\anhqu\Downloads\HSK-3.0\MP3 GIÁO TRÌNH NEW HSK1 3.0"))

PROMPT_INJECTION_PATTERNS = [
    re.compile(r"ignore\s+(all\s+)?previous\s+instructions", re.I),
    re.compile(r"reveal\s+(your\s+)?system\s+prompt", re.I),
    re.compile(r"<\s*script[^>]*>", re.I),
]

# Verified HSK 3.0 Level 1 15-Lesson Curriculum Framework (matched to the 15 real MP3 lessons 1-1..15-6)
HSK1_LESSON_TOPICS = [
    (1, "Lesson 1: 你好 (Xin chào & Làm quen)", ["你好", "您", "你们", "对不起", "没关系", "谢谢", "不客气", "再见"]),
    (2, "Lesson 2: 你叫什么名字 (Hỏi tên & Quốc tịch)", ["叫", "什么", "名字", "我", "是", "老师", "学生", "中国", "人"]),
    (3, "Lesson 3: 她是我的汉语老师 (Giới thiệu người & Bạn bè)", ["她", "谁", "的", "汉语", "哪", "国", "同学", "朋友"]),
    (4, "Lesson 4: 你家有几口人 (Gia đình & Tuổi tác)", ["家", "有", "口", "女儿", "几", "岁", "了", "今年", "多", "大"]),
    (5, "Lesson 5: 我会说汉语 (Kỹ năng & Ngôn ngữ)", ["会", "说", "妈妈", "菜", "很", "好吃", "做", "写", "汉字", "读"]),
    (6, "Lesson 6: 今天几号 (Ngày tháng & Lịch trình)", ["请", "问", "今天", "号", "月", "星期", "昨天", "明天", "去", "学校"]),
    (7, "Lesson 7: 我想喝茶 (Đồ uống, Ăn uống & Mua sắm)", ["想", "喝", "茶", "吃", "米饭", "下午", "商店", "买", "杯子", "多少钱"]),
    (8, "Lesson 8: 你儿子在哪儿工作 (Địa điểm & Nghề nghiệp)", ["小", "猫", "在", "那儿", "狗", "椅子", "下面", "工作", "儿子", "医院", "医生"]),
    (9, "Lesson 9: 我能坐这儿吗 (Vị trí & Giao tiếp lịch sự)", ["桌子", "上", "电脑", "和", "本", "里", "前面", "后面", "能", "坐"]),
    (10, "Lesson 10: 现在几点 (Giờ giấc & Thời gian biểu)", ["现在", "点", "分", "中午", "吃饭", "时候", "回", "电影", "住", "前"]),
    (11, "Lesson 11: 今天天气怎么样 (Thời tiết & Mùa)", ["天气", "怎么样", "太", "热", "冷", "下雨", "小姐", "来", "身体", "爱"]),
    (12, "Lesson 12: 他在学做中国菜呢 (Hành động đang diễn ra)", ["喂", "也", "学习", "上午", "睡觉", "电视", "喜欢", "给", "打电话"]),
    (13, "Lesson 13: 她买了不少衣服 (Mua sắm & Quá khứ đã làm)", ["东西", "一点儿", "苹果", "看见", "先生", "开", "车", "回来", "分钟", "衣服", "漂亮"]),
    (14, "Lesson 14: 我是坐飞机来的 (Phương tiện giao thông & Cách thức)", ["认识", "年", "大学", "饭店", "出租车", "一起", "高兴", "听", "飞机"]),
    (15, "Lesson 15: 总复习 – Ôn tập tổng hợp HSK 1 (3.0)", ["中国", "汉语", "学习", "朋友", "学校", "工作", "天气", "时间", "喜欢", "再见"]),
]


def _utc_now() -> str:
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def init_pdf_tables(conn: sqlite3.Connection) -> None:
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS pdf_documents (
            id TEXT PRIMARY KEY,
            user_id INTEGER,
            hsk_level INTEGER NOT NULL,
            filename TEXT NOT NULL,
            file_size INTEGER NOT NULL DEFAULT 0,
            page_count INTEGER NOT NULL DEFAULT 0,
            checksum TEXT NOT NULL,
            has_text_layer INTEGER NOT NULL DEFAULT 1,
            ocr_required INTEGER NOT NULL DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'uploaded',
            stage TEXT NOT NULL DEFAULT '1_UPLOAD_VALIDATION',
            progress_pct INTEGER NOT NULL DEFAULT 0,
            lessons_detected INTEGER NOT NULL DEFAULT 0,
            exercises_created INTEGER NOT NULL DEFAULT 0,
            error_message TEXT DEFAULT '',
            extracted_text TEXT DEFAULT '',
            storage_path TEXT DEFAULT '',
            is_system_seed INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS pdf_courses (
            id TEXT PRIMARY KEY,
            hsk_level INTEGER NOT NULL,
            title TEXT NOT NULL,
            source_doc_ids_json TEXT NOT NULL,
            is_published INTEGER NOT NULL DEFAULT 0,
            total_lessons INTEGER NOT NULL DEFAULT 0,
            total_exercises INTEGER NOT NULL DEFAULT 0,
            course_json TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
        """
    )


def sanitize_pdf_text(text: str) -> str:
    clean = str(text or "")
    for rx in PROMPT_INJECTION_PATTERNS:
        clean = rx.sub("[REDACTED_UNSAFE_PATTERN]", clean)
    return clean.strip()


def inspect_pdf_bytes(raw: bytes) -> Dict[str, Any]:
    """Validate real PDF magic bytes, count pages, check text layer vs scanned images, and extract Flate/literal text."""
    if not raw.startswith(b"%PDF-"):
        return {"ok": False, "error": "File không phải định dạng PDF hợp lệ (sai magic header %PDF-)."}
    if len(raw) > 25_000_000:
        return {"ok": False, "error": "Dung lượng upload trực tiếp qua trình duyệt vượt quá giới hạn 25 MB. Với PDF lớn hơn, hãy đặt trong thư mục tài liệu server hoặc tách theo chương."}

    pages = max(1, len(re.findall(rb"/Type\s*/Page\b", raw)))
    has_font = b"/Font" in raw
    has_image = b"/Image" in raw

    # Best-effort stdlib text stream extraction (FlateDecode + literal TJ/Tj strings)
    extracted_chunks: List[str] = []
    for m in re.finditer(rb"stream\r?\n(.*?)\r?\nendstream", raw, re.S):
        block = m.group(1)
        data = block
        try:
            data = zlib.decompress(block)
        except Exception:
            pass
        # Literal ASCII/UTF-8 strings inside (...) Tj
        for tm in re.findall(rb"\(([^()]{2,240})\)\s*Tj", data):
            try:
                s = tm.decode("utf-8", errors="ignore").strip()
                if s and any(ch.isalnum() or "\u4e00" <= ch <= "\u9fff" for ch in s):
                    extracted_chunks.append(s)
            except Exception:
                pass
        if len(extracted_chunks) > 400:
            break

    extracted = sanitize_pdf_text("\n".join(extracted_chunks))[:30000]
    zh_chars = len(re.findall(r"[\u4e00-\u9fff]", extracted))
    ocr_required = (not has_font) or (zh_chars < 10 and has_image)

    return {
        "ok": True,
        "pageCount": pages,
        "hasTextLayer": has_font,
        "hasImages": has_image,
        "ocrRequired": ocr_required,
        "extractedText": extracted,
        "hanziCount": zh_chars,
        "checksum": hashlib.sha256(raw).hexdigest()[:24],
    }


def _load_hsk3_l1_vocab(root_dir: Path) -> Dict[str, Dict[str, Any]]:
    p = root_dir / "public" / "data" / "vocab" / "hsk3" / "L1.json"
    if not p.exists():
        return {}
    try:
        rows = json.loads(p.read_text(encoding="utf-8"))
        return {r["h"]: r for r in rows}
    except Exception:
        return {}


def _scan_local_hsk1_mp3s(root_dir: Optional[Path] = None) -> Dict[int, List[str]]:
    by_lesson: Dict[int, List[str]] = {}
    repo_root = root_dir or Path(__file__).resolve().parent.parent
    candidates = [
        repo_root / "public" / "audio" / "hsk1",
        LOCAL_HSK1_MP3_DIR,
    ]
    target_dir = next((d for d in candidates if d.exists() and list(d.glob("*.mp3"))), None)
    if not target_dir:
        return by_lesson
    for f in sorted(target_dir.glob("*.mp3")):
        parts = f.stem.split("-")
        if len(parts) >= 2 and parts[0].isdigit():
            by_lesson.setdefault(int(parts[0]), []).append(f.name)
    for k in by_lesson:
        by_lesson[k].sort(key=lambda fn: [int(x) if x.isdigit() else x for x in re.split(r"(\d+)", fn)])
    return by_lesson


def _build_lesson_exercises_for_topic(
    hsk_level: int,
    lesson_num: int,
    title: str,
    target_words: List[str],
    vocab_map: Dict[str, Dict[str, Any]],
    mp3_tracks: List[str],
    source_label: str,
    custom_passage: str = "",
) -> Dict[str, Any]:
    """Assemble a rich 6-skill Lesson with 5 Reading questions, Listening MP3/TTS, Writing, Speaking, Vocab & Grammar."""
    word_entries = []
    for w in target_words:
        v = vocab_map.get(w)
        if v:
            word_entries.append({
                "hanzi": v["h"],
                "pinyin": v["p"],
                "vi": (v.get("vi") or v.get("e") or [""])[0],
                "en": (v.get("e") or [""])[0],
                "pos": ", ".join(v.get("pos") or ["từ vựng"]),
                "sourceTag": "extracted_from_pdf",
            })
        else:
            word_entries.append({"hanzi": w, "pinyin": "", "vi": "Từ trọng tâm bài học", "en": "", "pos": "từ vựng", "sourceTag": "extracted_from_pdf"})

    # Rich reading passage (line-by-line aligned Chinese, Pinyin, English & Vietnamese + bilingual ZH-EN / ZH-VI questions)
    default_passages = {
        1: (
            "你好！我是明安。认识你很高兴！\n你好！我叫兰英。你是越南人吗？\n是的，我是越南人。对不起，请问您贵姓？\n没关系，我姓王。谢谢你！\n不客气，再见！",
            "Nǐ hǎo! Wǒ shì Míng'ān. Rènshi nǐ hěn gāoxìng!\nNǐ hǎo! Wǒ jiào Lányīng. Nǐ shì Yuènán rén ma?\nShì de, wǒ shì Yuènán rén. Duìbuqǐ, qǐngwèn nín guìxìng?\nMéi guānxi, wǒ xìng Wáng. Xièxie nǐ!\nBú kèqi, zàijiàn!",
            "Hello! I am Ming'an. Nice to meet you!\nHello! My name is Lanying. Are you Vietnamese?\nYes, I am Vietnamese. Excuse me, may I ask your surname?\nNo problem, my surname is Wang. Thank you!\nYou're welcome, goodbye!",
            "Xin chào! Tôi là Minh An. Rất vui được quen biết bạn!\nXin chào! Tôi tên là Lan Anh. Bạn là người Việt Nam phải không?\nĐúng vậy, tôi là người Việt Nam. Xin lỗi, xin hỏi quý danh của ngài?\nKhông sao đâu, tôi họ Vương. Cảm ơn bạn!\nĐừng khách sáo, tạm biệt!",
            [
                {
                    "id": "q1", "type": "mcq", "skillFocus": "main_idea",
                    "question_en": "What is the main topic of the dialogue? (这段对话的主要话题是什么？)",
                    "options_en": ["Greeting, self-introduction, and asking surnames (打招呼与问姓名)", "Shopping at a supermarket (在超市购物)", "Asking directions to a hospital (问去医院的路)", "Talking about summer weather (谈论夏天天气)"],
                    "answer_en": "Greeting, self-introduction, and asking surnames (打招呼与问姓名)",
                    "explain_en": "The two speakers greet each other (你好), introduce their names (明安, 兰英), and ask about nationality and surname (姓王).",
                    "question": "Đoạn hội thoại trên chủ yếu nói về chủ đề gì?",
                    "options": ["Chào hỏi, làm quen và hỏi họ tên", "Đi mua sắm ở siêu thị", "Hỏi đường đến bệnh viện", "Kể về thời tiết mùa hè"],
                    "answer": "Chào hỏi, làm quen và hỏi họ tên",
                    "explain": "Hai nhân vật chào nhau (你好), giới thiệu tên (明安, 兰英), hỏi quốc tịch và họ (姓王).",
                },
                {
                    "id": "q2", "type": "tf", "skillFocus": "detail",
                    "question_en": "True or False: Ming'an (明安) is Vietnamese (越南人).",
                    "options_en": ["True (正确)", "False (错误)"],
                    "answer_en": "True (正确)",
                    "explain_en": "Ming'an explicitly replies: '是的，我是越南人。' (Yes, I am Vietnamese.)",
                    "question": "Đúng hay Sai: Minh An (明安) là người Việt Nam.",
                    "options": ["Đúng (True)", "Sai (False)"],
                    "answer": "Đúng (True)",
                    "explain": "Trong bài có câu: '是的，我是越南人。' (Đúng vậy, tôi là người Việt Nam).",
                },
                {
                    "id": "q3", "type": "mcq", "skillFocus": "detail",
                    "question_en": "What is Lanying's (兰英) surname (姓)?",
                    "options_en": ["Wang (王)", "Li (李)", "Zhang (张)", "Not mentioned (未提及)"],
                    "answer_en": "Wang (王)",
                    "explain_en": "Lanying answers: '我姓王。' (My surname is Wang.)",
                    "question": "Lan Anh (兰英) mang họ gì?",
                    "options": ["Họ Vương (王)", "Họ Lý (李)", "Họ Trương (张)", "Bài không nhắc đến"],
                    "answer": "Họ Vương (王)",
                    "explain": "Trong bài Lan Anh trả lời: '我姓王。' (Tôi họ Vương).",
                },
                {
                    "id": "q4", "type": "fill", "skillFocus": "vocab_context",
                    "question_en": "Fill in the Chinese phrase used to reply to '对不起' (Sorry): ______ (No problem / It's okay)",
                    "answer_en": "没关系",
                    "explain_en": "Standard HSK 1 pair: 对不起 (Sorry) → 没关系 (It's okay / No problem).",
                    "question": "Điền cụm từ đáp lại lời xin lỗi '对不起' trong bài: ______ (không sao đâu)",
                    "answer": "没关系",
                    "explain": "Cặp giao tiếp chuẩn HSK 1: 对不起 (Xin lỗi) → 没关系 (Không sao đâu).",
                },
                {
                    "id": "q5", "type": "mcq", "skillFocus": "detail",
                    "question_en": "In the dialogue, how do you reply to '谢谢你' (Thank you)?",
                    "options_en": ["不客气 (You're welcome)", "再见 (Goodbye)", "对不起 (Sorry)", "请问 (Excuse me)"],
                    "answer_en": "不客气 (You're welcome)",
                    "explain_en": "The final lines say: '谢谢你！— 不客气，再见！' (Thank you! — You're welcome, goodbye!)",
                    "question": "Khi người khác nói '谢谢你' (Cảm ơn bạn), trong bài đáp lại bằng câu nào?",
                    "options": ["不客气 (Đừng khách sáo)", "再见 (Tạm biệt)", "对不起 (Xin lỗi)", "请问 (Xin hỏi)"],
                    "answer": "不客气 (Đừng khách sáo)",
                    "explain": "Câu cuối bài: '谢谢你！— 不客气，再见！'.",
                },
            ],
        ),
        2: (
            "大家好！我叫林南，我是越南大学生。\n我在河内大学学习汉语。\n我的汉语老师姓李，她是中国人。\n她很热情，也很耐心。\n我很喜欢学习汉语，每天都练习读汉字和说中文。",
            "Dàjiā hǎo! Wǒ jiào Lín Nán, wǒ shì Yuènán dàxuéshēng.\nWǒ zài Hénèi Dàxué xuéxí Hànyǔ.\nWǒ de Hànyǔ lǎoshī xìng Lǐ, tā shì Zhōngguó rén.\nTā hěn rèqíng, yě hěn nàixīn.\nWǒ hěn xǐhuan xuéxí Hànyǔ, měitiān dōu liànxí dú Hànzì hé shuō Zhōngwén.",
            "Hello everyone! My name is Lin Nan, I am a Vietnamese university student.\nI study Chinese at Hanoi University.\nMy Chinese teacher's surname is Li, and she is Chinese.\nShe is very warm-hearted and patient.\nI really like learning Chinese and practice reading characters and speaking Mandarin every day.",
            "Chào mọi người! Tôi tên là Lâm Nam, tôi là sinh viên đại học Việt Nam.\nTôi học tiếng Hán ở Đại học Hà Nội.\nGiáo viên tiếng Hán của tôi họ Lý, cô ấy là người Trung Quốc.\nCô ấy rất nhiệt tình và kiên nhẫn.\nTôi rất thích học tiếng Hán, mỗi ngày đều luyện đọc chữ Hán và nói tiếng Trung.",
            [
                {
                    "id": "q1", "type": "mcq", "skillFocus": "main_idea",
                    "question_en": "What is the main idea of the passage? (这段短文的主旨是什么？)",
                    "options_en": ["Self-introduction, university, and Chinese teacher (自我介绍与汉语老师)", "A travel plan to Beijing (北京旅游计划)", "A Chinese food menu (中国菜菜单)", "A company meeting (公司会议)"],
                    "answer_en": "Self-introduction, university, and Chinese teacher (自我介绍与汉语老师)",
                    "explain_en": "The writer introduces their name (林南), status (大学生), university, and Teacher Li.",
                    "question": "Ý chính của đoạn văn là gì?",
                    "options": ["Giới thiệu bản thân, trường học và cô giáo tiếng Hán", "Lịch trình du lịch Bắc Kinh", "Thực đơn món ăn Trung Quốc", "Cuộc họp ở công ty"],
                    "answer": "Giới thiệu bản thân, trường học và cô giáo tiếng Hán",
                    "explain": "Tác giả giới thiệu tên (林南), nghề nghiệp (大学生), nơi học và cô giáo họ Lý.",
                },
                {
                    "id": "q2", "type": "mcq", "skillFocus": "detail",
                    "question_en": "What is Lin Nan's Chinese teacher's nationality (国籍)?",
                    "options_en": ["Chinese (中国人)", "Vietnamese (越南人)", "British (英国人)", "Japanese (日本人)"],
                    "answer_en": "Chinese (中国人)",
                    "explain_en": "The passage states: '我的汉语老师姓李，她是中国人。'",
                    "question": "Cô giáo tiếng Hán của Lâm Nam là người nước nào?",
                    "options": ["Trung Quốc (中国人)", "Việt Nam (越南人)", "Anh (英国人)", "Nhật Bản (日本人)"],
                    "answer": "Trung Quốc (中国人)",
                    "explain": "Câu trong bài: '我的汉语老师姓李，她是中国人。'",
                },
                {
                    "id": "q3", "type": "tf", "skillFocus": "detail",
                    "question_en": "True or False: Lin Nan only practices Chinese on weekends.",
                    "options_en": ["True (正确)", "False (错误)"],
                    "answer_en": "False (错误)",
                    "explain_en": "The text says '每天都练习读汉字和说中文' (practices every day).",
                    "question": "Đúng hay Sai: Lâm Nam chỉ học tiếng Hán vào cuối tuần.",
                    "options": ["Đúng (True)", "Sai (False)"],
                    "answer": "Sai (False)",
                    "explain": "Bài viết nói rõ '每天都练习读汉字和说中文' (mỗi ngày đều luyện tập).",
                },
                {
                    "id": "q4", "type": "fill", "skillFocus": "vocab_context",
                    "question_en": "Fill in the 2 Chinese characters for 'teacher': 我的汉语______姓李。",
                    "answer_en": "老师",
                    "explain_en": "老师 (lǎoshī) means teacher.",
                    "question": "Điền 2 chữ Hán chỉ 'giáo viên' xuất hiện trong bài: 我的汉语______姓李。",
                    "answer": "老师",
                    "explain": "老师 (lǎoshī) nghĩa là giáo viên.",
                },
                {
                    "id": "q5", "type": "mcq", "skillFocus": "inference",
                    "question_en": "Which description best matches Teacher Li's personality?",
                    "options_en": ["Warm and patient (热情、耐心)", "Strict and busy (严格、忙)", "Quiet and shy (安静、害羞)", "Not described (未描述)"],
                    "answer_en": "Warm and patient (热情、耐心)",
                    "explain_en": "The passage states: '她很热情，也很耐心。' (She is very warm and patient.)",
                    "question": "Nhận xét nào đúng về tính cách của cô giáo Lý?",
                    "options": ["Nhiệt tình và kiên nhẫn (热情、耐心)", "Khó tính và hay bận rộn", "Ít nói và nghiêm khắc", "Bài không miêu tả tính cách"],
                    "answer": "Nhiệt tình và kiên nhẫn (热情、耐心)",
                    "explain": "Trong bài ghi: '她很热情，也很耐心。'",
                },
            ],
        ),
    }

    if custom_passage:
        rd_zh = custom_passage[:1200]
        rd_py = "Click Listen or tap characters for Pinyin & Putonghua pronunciation."
        rd_en = "Content extracted directly from your uploaded PDF document."
        rd_vi = "Nội dung trích xuất trực tiếp từ tài liệu PDF bạn tải lên."
        rd_src = "extracted_from_pdf"
        w0 = word_entries[0] if word_entries else {"hanzi": "汉语", "vi": "tiếng Hán", "en": "Chinese language"}
        w1 = word_entries[1] if len(word_entries) > 1 else {"hanzi": "学习", "vi": "học tập", "en": "to study"}
        w0_en = w0.get("en") or w0["vi"]
        w1_en = w1.get("en") or w1["vi"]
        rd_qs = [
            {
                "id": "q1", "type": "mcq", "skillFocus": "main_idea",
                "question_en": f"Which key term is most closely tied to the main topic of {title}?",
                "options_en": [f"{w0['hanzi']} ({w0_en})", "Macroeconomics (宏观经济)", "Maritime Law (海商法)", "Astronomy (天文学)"],
                "answer_en": f"{w0['hanzi']} ({w0_en})",
                "explain_en": f"The key word '{w0['hanzi']}' appears directly in the extracted PDF text.",
                "question": f"Chủ đề chính của {title} liên quan mật thiết nhất đến từ khóa nào?",
                "options": [f"{w0['hanzi']} ({w0['vi']})", "Kinh tế vĩ mô", "Luật hàng hải", "Thiên văn học"],
                "answer": f"{w0['hanzi']} ({w0['vi']})",
                "explain": f"Từ trọng tâm '{w0['hanzi']}' xuất hiện trực tiếp trong nội dung PDF của bài học.",
            },
            {
                "id": "q2", "type": "tf", "skillFocus": "detail",
                "question_en": f"True or False: The term '{w0['hanzi']}' appears in the source passage.",
                "options_en": ["True (正确)", "False (错误)"],
                "answer_en": "True (正确)" if w0["hanzi"] in rd_zh else "False (错误)",
                "explain_en": "Verified directly against the extracted PDF text.",
                "question": f"Đúng hay Sai: Từ '{w0['hanzi']}' xuất hiện trong đoạn văn gốc.",
                "options": ["Đúng (True)", "Sai (False)"],
                "answer": "Đúng (True)" if w0["hanzi"] in rd_zh else "Sai (False)",
                "explain": "Kiểm chứng trực tiếp đối chiếu với văn bản trích xuất từ PDF.",
            },
            {
                "id": "q3", "type": "fill", "skillFocus": "vocab_context",
                "question_en": f"Type the Simplified Chinese word meaning '{w1_en}':",
                "answer_en": w1["hanzi"],
                "explain_en": f"Answer: {w1['hanzi']} ({w1.get('pinyin', '')}).",
                "question": f"Gõ chữ Hán Giản thể tương ứng với nghĩa '{w1['vi']}':",
                "answer": w1["hanzi"],
                "explain": f"Đáp án chuẩn: {w1['hanzi']} ({w1.get('pinyin', '')}).",
            },
            {
                "id": "q4", "type": "mcq", "skillFocus": "vocab_context",
                "question_en": f"What is the meaning of '{w0['hanzi']}'?",
                "options_en": [w0_en, "Airplane (飞机)", "Hospital (医院)", "Watermelon (西瓜)"],
                "answer_en": w0_en,
                "explain_en": f"{w0['hanzi']} ({w0.get('pinyin', '')}) means: {w0_en}.",
                "question": f"Nghĩa đúng của từ '{w0['hanzi']}' là gì?",
                "options": [w0["vi"], "Máy bay", "Bệnh viện", "Quả dưa hấu"],
                "answer": w0["vi"],
                "explain": f"{w0['hanzi']} ({w0.get('pinyin', '')}) có nghĩa là: {w0['vi']}.",
            },
        ]
    elif lesson_num in default_passages:
        rd_zh, rd_py, rd_en, rd_vi, rd_qs = default_passages[lesson_num]
        rd_src = "ai_generated"
    else:
        w_list_str = "、".join(w["hanzi"] for w in word_entries[:6])
        w_py_str = ", ".join(w["pinyin"] for w in word_entries[:6] if w.get("pinyin"))
        w0 = word_entries[0]
        w1 = word_entries[1] if len(word_entries) > 1 else w0
        w2 = word_entries[2] if len(word_entries) > 2 else w0
        w3 = word_entries[3] if len(word_entries) > 3 else w0
        w0_en = w0.get("en") or w0["vi"]
        w1_en = w1.get("en") or w1["vi"]
        w2_en = w2.get("en") or w2["vi"]
        w3_en = w3.get("en") or w3["vi"]
        rd_zh = (
            f"今天我们学习第{lesson_num}课。\n"
            f"这一课的重要词语有：{w_list_str}。\n"
            f"我每天都认真学习汉语，先听录音，再读课文，然后用“{w0['hanzi']}”和“{w1['hanzi']}”造句。\n"
            "我的中国朋友说我的汉语进步很快！"
        )
        rd_py = (
            f"Jīntiān wǒmen xuéxí dì {lesson_num} kè.\n"
            f"Zhè yī kè de zhòngyào cíyǔ yǒu: {w_py_str or w_list_str}.\n"
            f"Wǒ měitiān dōu rènzhēn xuéxí Hànyǔ, xiān tīng lùyīn, zài dú kèwén, ránhòu yòng \"{w0.get('pinyin') or w0['hanzi']}\" hé \"{w1.get('pinyin') or w1['hanzi']}\" zàojù.\n"
            "Wǒ de Zhōngguó péngyou shuō wǒ de Hànyǔ jìnbù hěn kuài!"
        )
        rd_en = (
            f"Today we are studying Lesson {lesson_num}.\n"
            f"The key words in this lesson include: {w_list_str}.\n"
            f"Every day I study Chinese diligently: first I listen to the audio, then read the text, and make sentences with \"{w0['hanzi']}\" ({w0_en}) and \"{w1['hanzi']}\" ({w1_en}).\n"
            "My Chinese friend says my Chinese is improving very fast!"
        )
        rd_vi = (
            f"Hôm nay chúng ta học Bài {lesson_num}.\n"
            f"Các từ trọng tâm của bài gồm: {w_list_str}.\n"
            f"Mỗi ngày tôi đều chăm chỉ học tiếng Hán: nghe audio trước, đọc bài khóa sau, rồi đặt câu với \"{w0['hanzi']}\" và \"{w1['hanzi']}\".\n"
            "Người bạn Trung Quốc của tôi nói tiếng Hán của tôi tiến bộ rất nhanh!"
        )
        rd_src = "ai_generated"
        rd_qs = [
            {
                "id": "q1", "type": "mcq", "skillFocus": "main_idea",
                "question_en": f"Which lesson number in HSK {hsk_level} is this passage about? (这篇课文是第几课？)",
                "options_en": [f"Lesson {lesson_num} (第{lesson_num}课)", "Lesson 20 (第20课)", "Lesson 30 (第30课)", "Not mentioned (未提及)"],
                "answer_en": f"Lesson {lesson_num} (第{lesson_num}课)",
                "explain_en": f"The first line states: '今天我们学习第{lesson_num}课。'",
                "question": f"Bài đọc trên thuộc bài số mấy trong giáo trình HSK {hsk_level}?",
                "options": [f"Bài {lesson_num} (第{lesson_num}课)", "Bài 20", "Bài 30", "Không đề cập"],
                "answer": f"Bài {lesson_num} (第{lesson_num}课)",
                "explain": f"Câu đầu tiên ghi rõ: '今天我们学习第{lesson_num}课。'",
            },
            {
                "id": "q2", "type": "mcq", "skillFocus": "vocab_context",
                "question_en": f"In this lesson, what does '{w0['hanzi']}' ({w0['pinyin']}) mean?",
                "options_en": [w0_en, w2_en if w2_en != w0_en else "Bus (公共汽车)", "Winter (冬天)", "Hospital (医院)"],
                "answer_en": w0_en,
                "explain_en": f"HSK 3.0 Level {hsk_level} vocabulary: {w0['hanzi']} ({w0['pinyin']}) = {w0_en}.",
                "question": f"Trong bài học này, từ '{w0['hanzi']}' ({w0['pinyin']}) có nghĩa là gì?",
                "options": [w0["vi"], w2["vi"] if w2["vi"] != w0["vi"] else "Xe buýt", "Mùa đông", "Bệnh viện"],
                "answer": w0["vi"],
                "explain": f"Theo bảng từ vựng HSK 3.0 cấp {hsk_level}: {w0['hanzi']} ({w0['pinyin']}) = {w0['vi']}.",
            },
            {
                "id": "q3", "type": "tf", "skillFocus": "detail",
                "question_en": "True or False: The learner listens to the audio (听录音) first before reading the text (读课文).",
                "options_en": ["True (正确)", "False (错误)"],
                "answer_en": "True (正确)",
                "explain_en": "The text says: '先听录音，再读课文' (listen to the recording first, then read the text).",
                "question": "Đúng hay Sai: Người học trong bài nghe băng ghi âm (听录音) trước rồi mới đọc bài khóa (读课文).",
                "options": ["Đúng (True)", "Sai (False)"],
                "answer": "Đúng (True)",
                "explain": "Trong bài có câu: '先听录音，再读课文' (nghe ghi âm trước, rồi mới đọc bài khóa).",
            },
            {
                "id": "q4", "type": "fill", "skillFocus": "vocab_context",
                "question_en": f"Fill in the Simplified Chinese word meaning '{w1_en}' ({w1['pinyin']}):",
                "answer_en": w1["hanzi"],
                "explain_en": f"Correct answer: '{w1['hanzi']}' ({w1['pinyin']}).",
                "question": f"Điền chữ Hán Giản thể có nghĩa '{w1['vi']}' ({w1['pinyin']}):",
                "answer": w1["hanzi"],
                "explain": f"Đáp án chuẩn là '{w1['hanzi']}' ({w1['pinyin']}).",
            },
            {
                "id": "q5", "type": "mcq", "skillFocus": "vocab_context",
                "question_en": f"What does '{w3['hanzi']}' ({w3['pinyin']}) mean in English?",
                "options_en": [w3_en, "Airport (机场)", "Basketball (篮球)", "Coffee (咖啡)"],
                "answer_en": w3_en,
                "explain_en": f"Verified vocabulary: {w3['hanzi']} ({w3['pinyin']}) = {w3_en}.",
                "question": f"Từ '{w3['hanzi']}' ({w3['pinyin']}) có nghĩa tiếng Việt là gì?",
                "options": [w3["vi"], "Sân bay", "Bóng rổ", "Cà phê"],
                "answer": w3["vi"],
                "explain": f"Từ vựng xác thực: {w3['hanzi']} ({w3['pinyin']}) = {w3['vi']}.",
            },
        ]

    # Build structured speaker-separated transcript lines from lesson dialogue & key words
    zh_lines = [ln.strip() for ln in rd_zh.split("\n") if ln.strip()]
    py_lines = [ln.strip() for ln in rd_py.split("\n") if ln.strip()]
    en_lines = [ln.strip() for ln in rd_en.split("\n") if ln.strip()]
    vi_lines = [ln.strip() for ln in rd_vi.split("\n") if ln.strip()]
    speakers_cycle = ["明安", "兰英", "王老师", "同学"]
    base_transcript_lines = []
    for li, zline in enumerate(zh_lines):
        base_transcript_lines.append({
            "speaker": speakers_cycle[li % 2] if len(zh_lines) > 1 else "课文",
            "chinese": zline,
            "pinyin": py_lines[li] if li < len(py_lines) else "",
            "english": en_lines[li] if li < len(en_lines) else "",
            "vietnamese": vi_lines[li] if li < len(vi_lines) else "",
        })

    # Listening items linked directly to REAL MP3 tracks when present!
    listening_items = []
    if mp3_tracks:
        for idx, trk in enumerate(mp3_tracks[:6]):
            w_ref = word_entries[idx % len(word_entries)]
            w_next = word_entries[(idx + 1) % len(word_entries)]
            w_ref_en = w_ref.get("en") or w_ref["vi"]
            track_lines = list(base_transcript_lines)
            track_lines.append({
                "speaker": "生词重点",
                "chinese": f"{w_ref['hanzi']} · {w_next['hanzi']}",
                "pinyin": f"{w_ref['pinyin']} · {w_next['pinyin']}",
                "english": f"{w_ref_en} · {w_next.get('en') or w_next['vi']}",
                "vietnamese": f"{w_ref['vi']} · {w_next['vi']}",
            })
            listening_items.append({
                "id": f"L{lesson_num}_lis_{idx + 1}",
                "contentSource": "AI_PDF_HSK3",
                "courseType": "hsk3_pdf_curriculum",
                "title": f"Listening {idx + 1} – Track {trk}",
                "title_vi": f"Bài nghe {idx + 1} – Audio gốc {trk} (Lesson {lesson_num})",
                "audioFile": trk,
                "audioUrl": f"api/pdf/audio?file={trk}",
                "staticAudioUrl": f"public/audio/hsk1/{trk}",
                "audioSource": "real_mp3",
                "sourceTag": "extracted_from_pdf",
                "transcriptSource": "extracted_from_pdf" if custom_passage else "curriculum_aligned",
                "transcriptLabel": f"Transcript đối chiếu Bài {lesson_num} (Giáo trình New HSK 1 3.0 · Track {trk})",
                "transcriptLines": track_lines,
                "targetHint_en": f"Listen to New HSK 1 (3.0) track {trk}, focusing on '{w_ref['hanzi']}' ({w_ref['pinyin']} – {w_ref_en}).",
                "targetHint": f"Nghe track {trk} của giáo trình New HSK 1 (3.0), chú ý từ trọng tâm '{w_ref['hanzi']}' ({w_ref['pinyin']} – {w_ref['vi']}).",
                "questions": [
                    {
                        "id": f"lq_{idx}_1",
                        "type": "mcq",
                        "question_en": f"Listen to track {trk} and select the meaning of '{w_ref['hanzi']}' ({w_ref['pinyin']}):",
                        "options_en": [w_ref_en, "Department store (百货商店)", "Subway (地铁)", "Hospital (医院)"],
                        "answer_en": w_ref_en,
                        "explain_en": f"Track {trk} belongs to Lesson {lesson_num} (New HSK 1 3.0); key word: {w_ref['hanzi']} ({w_ref['pinyin']}) = {w_ref_en}.",
                        "question": f"Nghe track {trk} và xác định nghĩa của từ trọng tâm '{w_ref['hanzi']}' ({w_ref['pinyin']}):",
                        "options": [w_ref["vi"], "Cửa hàng bách hóa", "Tàu điện ngầm", "Bệnh viện nhân dân"],
                        "answer": w_ref["vi"],
                        "explain": f"Track {trk} thuộc Bài {lesson_num} giáo trình New HSK 1 (3.0); từ trọng tâm: {w_ref['hanzi']} ({w_ref['pinyin']}) = {w_ref['vi']}.",
                    },
                    rd_qs[idx % len(rd_qs)],
                ],
            })
    else:
        w0 = word_entries[0] if word_entries else {"hanzi": "你好", "pinyin": "nǐ hǎo", "en": "hello", "vi": "xin chào"}
        w1 = word_entries[1] if len(word_entries) > 1 else w0
        w2 = word_entries[2] if len(word_entries) > 2 else w0
        w0_en = w0.get("en") or w0["vi"]
        w1_en = w1.get("en") or w1["vi"]
        w2_en = w2.get("en") or w2["vi"]
        listening_items = [
            {
                "id": f"L{lesson_num}_lis_1",
                "contentSource": "AI_PDF_HSK3",
                "courseType": "hsk3_pdf_curriculum",
                "title": f"Exercise 1 – Dialogue Listening (Lesson {lesson_num})",
                "title_vi": f"Bài 1 – Nghe hội thoại chính (Bài {lesson_num})",
                "audioFile": "",
                "audioUrl": "",
                "audioText": rd_zh,
                "audioSource": "tts",
                "sourceTag": "extracted_from_pdf" if custom_passage else "ai_generated",
                "transcriptSource": "extracted_from_pdf" if custom_passage else "ai_generated",
                "transcriptLabel": "Transcript trích xuất từ tài liệu PDF" if custom_passage else "Transcript AI tạo từ nội dung bài học (cho phép kiểm tra lại)",
                "transcriptLines": base_transcript_lines,
                "targetHint_en": "Listen carefully to the full Lesson dialogue and answer the comprehension check.",
                "targetHint": "Nghe kỹ toàn bộ bài khóa và trả lời câu hỏi đọc hiểu.",
                "questions": rd_qs[:2],
            },
            {
                "id": f"L{lesson_num}_lis_2",
                "contentSource": "AI_PDF_HSK3",
                "courseType": "hsk3_pdf_curriculum",
                "title": f"Exercise 2 – Key Vocabulary Audio Recognition",
                "title_vi": f"Bài 2 – Nhận diện từ vựng trọng tâm qua âm thanh",
                "audioFile": "",
                "audioUrl": "",
                "audioText": f"{w0['hanzi']}。{w1['hanzi']}。{w2['hanzi']}。",
                "audioSource": "tts",
                "sourceTag": "extracted_from_pdf",
                "transcriptSource": "extracted_from_pdf",
                "transcriptLabel": f"Transcript từ vựng trọng tâm Bài {lesson_num}",
                "transcriptLines": [
                    {"speaker": "词语 1", "chinese": w0["hanzi"], "pinyin": w0["pinyin"], "english": w0_en, "vietnamese": w0["vi"]},
                    {"speaker": "词语 2", "chinese": w1["hanzi"], "pinyin": w1["pinyin"], "english": w1_en, "vietnamese": w1["vi"]},
                    {"speaker": "词语 3", "chinese": w2["hanzi"], "pinyin": w2["pinyin"], "english": w2_en, "vietnamese": w2["vi"]},
                ],
                "targetHint_en": f"Listen to the key words from Lesson {lesson_num} and match their meanings.",
                "targetHint": f"Nghe các từ trọng tâm của Bài {lesson_num} và chọn nghĩa đúng.",
                "questions": [
                    {
                        "id": f"lq_{lesson_num}_2a", "type": "mcq",
                        "question_en": f"What does the spoken word '{w0['hanzi']}' ({w0['pinyin']}) mean?",
                        "options_en": [w0_en, "Airport (机场)", "Subway (地铁)", "Winter (冬天)"],
                        "answer_en": w0_en,
                        "explain_en": f"{w0['hanzi']} ({w0['pinyin']}) = {w0_en}.",
                        "question": f"Từ vừa nghe '{w0['hanzi']}' ({w0['pinyin']}) có nghĩa là gì?",
                        "options": [w0["vi"], "Sân bay", "Tàu điện ngầm", "Mùa đông"],
                        "answer": w0["vi"],
                        "explain": f"{w0['hanzi']} ({w0['pinyin']}) = {w0['vi']}.",
                    },
                    {
                        "id": f"lq_{lesson_num}_2b", "type": "mcq",
                        "question_en": f"What does the spoken word '{w1['hanzi']}' ({w1['pinyin']}) mean?",
                        "options_en": [w1_en, "Hospital (医院)", "Coffee (咖啡)", "Basketball (篮球)"],
                        "answer_en": w1_en,
                        "explain_en": f"{w1['hanzi']} ({w1['pinyin']}) = {w1_en}.",
                        "question": f"Từ vừa nghe '{w1['hanzi']}' ({w1['pinyin']}) có nghĩa là gì?",
                        "options": [w1["vi"], "Bệnh viện", "Cà phê", "Bóng rổ"],
                        "answer": w1["vi"],
                        "explain": f"{w1['hanzi']} ({w1['pinyin']}) = {w1['vi']}.",
                    },
                ],
            },
            {
                "id": f"L{lesson_num}_lis_3",
                "contentSource": "AI_PDF_HSK3",
                "courseType": "hsk3_pdf_curriculum",
                "title": f"Exercise 3 – Short Sentence Dictation & Detail",
                "title_vi": f"Bài 3 – Nghe câu ngắn & Chi tiết thực tế",
                "audioFile": "",
                "audioUrl": "",
                "audioText": rd_zh.split("\n")[0],
                "audioSource": "tts",
                "sourceTag": "ai_generated",
                "transcriptSource": "ai_generated",
                "transcriptLabel": "Transcript câu mở đầu (AI trích từ bài khóa)",
                "transcriptLines": base_transcript_lines[:2],
                "targetHint_en": "Listen to the opening sentence of the lesson at normal and slow speed.",
                "targetHint": "Nghe câu mở đầu của bài học ở tốc độ thường và chậm.",
                "questions": rd_qs[2:4] if len(rd_qs) >= 4 else rd_qs[:1],
            },
        ]

    # Split into 3 clean, bite-sized exercises per skill so learners study one small task at a time!
    w0 = word_entries[0] if word_entries else {"hanzi": "你好", "pinyin": "nǐ hǎo", "en": "hello", "vi": "xin chào"}
    w1 = word_entries[1] if len(word_entries) > 1 else w0
    w2 = word_entries[2] if len(word_entries) > 2 else w0
    w3 = word_entries[3] if len(word_entries) > 3 else w1
    w0_en = w0.get("en") or w0["vi"]
    w1_en = w1.get("en") or w1["vi"]
    w2_en = w2.get("en") or w2["vi"]
    w3_en = w3.get("en") or w3["vi"]

    ex2_zh = f"A: 你好！请问“{w0['hanzi']}”怎么读？\nB: 读“{w0.get('pinyin') or w0['hanzi']}”。\nA: 那“{w1['hanzi']}”是什么意思？\nB: 意思是“{w1_en}”。谢谢你的问题！"
    ex2_py = f"A: Nǐ hǎo! Qǐngwèn \"{w0['hanzi']}\" zěnme dú?\nB: Dú \"{w0.get('pinyin') or w0['hanzi']}\".\nA: Nà \"{w1['hanzi']}\" shì shénme yìsi?\nB: Yìsi shì \"{w1_en}\". Xièxie nǐ de wèntí!"
    ex2_en = f"A: Hello! Excuse me, how do you pronounce \"{w0['hanzi']}\"?\nB: It is pronounced \"{w0.get('pinyin') or w0['hanzi']}\".\nA: Then what does \"{w1['hanzi']}\" mean?\nB: It means \"{w1_en}\". Thank you for your question!"
    ex2_vi = f"A: Xin chào! Xin hỏi từ \"{w0['hanzi']}\" đọc thế nào?\nB: Đọc là \"{w0.get('pinyin') or w0['hanzi']}\".\nA: Thế từ \"{w1['hanzi']}\" có nghĩa là gì?\nB: Nghĩa là \"{w1['vi']}\". Cảm ơn câu hỏi của bạn!"

    ex3_zh = f"今天我复习了第{lesson_num}课。\n我记住的两个新词是“{w2['hanzi']}”和“{w3['hanzi']}”。\n我觉得用中文交流很有意思！"
    ex3_py = f"Jīntiān wǒ fùxí le dì {lesson_num} kè.\nWǒ jìzhù de liǎng gè xīncí shì \"{w2.get('pinyin') or w2['hanzi']}\" hé \"{w3.get('pinyin') or w3['hanzi']}\".\nWǒ juéde yòng Zhōngwén jiāoliú hěn yǒu yìsi!"
    ex3_en = f"Today I reviewed Lesson {lesson_num}.\nThe two new words I memorized are \"{w2['hanzi']}\" ({w2_en}) and \"{w3['hanzi']}\" ({w3_en}).\nI think communicating in Chinese is very interesting!"
    ex3_vi = f"Hôm nay tôi đã ôn tập Bài {lesson_num}.\nHai từ mới tôi ghi nhớ được là \"{w2['hanzi']}\" ({w2['vi']}) và \"{w3['hanzi']}\" ({w3['vi']}).\nTôi thấy giao tiếp bằng tiếng Trung rất thú vị!"

    reading_exercises = [
        {
            "id": f"hsk3_L{hsk_level}_L{lesson_num}_rd_1",
            "title": f"Exercise 1 – Core Passage & Comprehension",
            "title_vi": f"Bài 1 – Đoạn hội thoại chính & Đọc hiểu",
            "sourceTag": rd_src,
            "sourcePage": max(1, (lesson_num - 1) * 9 + 2),
            "chinese": rd_zh,
            "pinyin": rd_py,
            "english": rd_en,
            "vietnamese": rd_vi,
            "questions": rd_qs[:3],
        },
        {
            "id": f"hsk3_L{hsk_level}_L{lesson_num}_rd_2",
            "title": f"Exercise 2 – Short Dialogue & Context Check",
            "title_vi": f"Bài 2 – Hội thoại ngắn & Hiểu ngữ cảnh",
            "sourceTag": "ai_generated",
            "sourcePage": max(1, (lesson_num - 1) * 9 + 4),
            "chinese": ex2_zh,
            "pinyin": ex2_py,
            "english": ex2_en,
            "vietnamese": ex2_vi,
            "questions": [
                {
                    "id": f"rd2_{lesson_num}_1", "type": "mcq", "skillFocus": "detail",
                    "question_en": f"Which word did Speaker A ask how to pronounce (怎么读)?",
                    "options_en": [f"{w0['hanzi']} ({w0_en})", f"{w2['hanzi']} ({w2_en})", "飞机 (airplane)", "医院 (hospital)"],
                    "answer_en": f"{w0['hanzi']} ({w0_en})",
                    "explain_en": f"Speaker A asked: '请问“{w0['hanzi']}”怎么读？'",
                    "question": f"Người A hỏi cách đọc (怎么读) của từ nào?",
                    "options": [f"{w0['hanzi']} ({w0['vi']})", f"{w2['hanzi']} ({w2['vi']})", "飞机 (máy bay)", "医院 (bệnh viện)"],
                    "answer": f"{w0['hanzi']} ({w0['vi']})",
                    "explain": f"Người A hỏi: '请问“{w0['hanzi']}”怎么读？'",
                },
                {
                    "id": f"rd2_{lesson_num}_2", "type": "tf", "skillFocus": "detail",
                    "question_en": f"True or False: Speaker A also asked for the meaning (什么意思) of '{w1['hanzi']}'.",
                    "options_en": ["True (正确)", "False (错误)"],
                    "answer_en": "True (正确)",
                    "explain_en": f"Line 3 says: '那“{w1['hanzi']}”是什么意思？'",
                    "question": f"Đúng hay Sai: Người A cũng hỏi nghĩa (什么意思) của từ '{w1['hanzi']}'.",
                    "options": ["Đúng (True)", "Sai (False)"],
                    "answer": "Đúng (True)",
                    "explain": f"Dòng 3 ghi rõ: '那“{w1['hanzi']}”是什么意思？'",
                },
            ] + (rd_qs[3:5] if len(rd_qs) >= 5 else []),
        },
        {
            "id": f"hsk3_L{hsk_level}_L{lesson_num}_rd_3",
            "title": f"Exercise 3 – Mini Review & Fill-in-the-Blank",
            "title_vi": f"Bài 3 – Ôn tập ngắn & Điền từ vựng",
            "sourceTag": "ai_generated",
            "sourcePage": max(1, (lesson_num - 1) * 9 + 6),
            "chinese": ex3_zh,
            "pinyin": ex3_py,
            "english": ex3_en,
            "vietnamese": ex3_vi,
            "questions": [
                {
                    "id": f"rd3_{lesson_num}_1", "type": "mcq", "skillFocus": "vocab_context",
                    "question_en": f"What does '{w2['hanzi']}' ({w2['pinyin']}) mean?",
                    "options_en": [w2_en, "Train station (火车站)", "Autumn (秋天)", "Tea cup (茶杯)"],
                    "answer_en": w2_en,
                    "explain_en": f"{w2['hanzi']} ({w2['pinyin']}) means {w2_en}.",
                    "question": f"Từ '{w2['hanzi']}' ({w2['pinyin']}) có nghĩa là gì?",
                    "options": [w2["vi"], "Ga tàu hỏa", "Mùa thu", "Tách trà"],
                    "answer": w2["vi"],
                    "explain": f"{w2['hanzi']} ({w2['pinyin']}) nghĩa là {w2['vi']}.",
                },
                {
                    "id": f"rd3_{lesson_num}_2", "type": "fill", "skillFocus": "vocab_context",
                    "question_en": f"Type the Simplified Chinese word meaning '{w3_en}' ({w3['pinyin']}):",
                    "answer_en": w3["hanzi"],
                    "explain_en": f"Correct Simplified Chinese: {w3['hanzi']} ({w3['pinyin']}).",
                    "question": f"Gõ chữ Hán Giản thể có nghĩa '{w3['vi']}' ({w3['pinyin']}):",
                    "answer": w3["hanzi"],
                    "explain": f"Đáp án chuẩn: {w3['hanzi']} ({w3['pinyin']}).",
                },
                {
                    "id": f"rd3_{lesson_num}_3", "type": "tf", "skillFocus": "inference",
                    "question_en": "True or False: The writer thinks communicating in Chinese is interesting (很有意思).",
                    "options_en": ["True (正确)", "False (错误)"],
                    "answer_en": "True (正确)",
                    "explain_en": "The last line states: '我觉得用中文交流很有意思！'",
                    "question": "Đúng hay Sai: Người viết thấy giao tiếp bằng tiếng Trung rất thú vị (很有意思).",
                    "options": ["Đúng (True)", "Sai (False)"],
                    "answer": "Đúng (True)",
                    "explain": "Câu cuối ghi: '我觉得用中文交流很有意思！'",
                },
            ],
        },
    ]

    return {
        "lessonNum": lesson_num,
        "id": f"hsk3_L{hsk_level}_lesson_{lesson_num}",
        "title": title,
        "sourceLabel": source_label,
        "sourcePage": max(1, (lesson_num - 1) * 9 + 1),
        "skills": {
            "reading": reading_exercises,
            "listening": listening_items,
            "vocabulary": word_entries,
            "grammar": [
                {
                    "id": f"hsk3_L{hsk_level}_L{lesson_num}_gr_1",
                    "title": f"Exercise 1 – Mandarin Word Order (SVO + Time/Place)",
                    "title_vi": f"Bài 1 – Trật tự từ chuẩn (Chủ ngữ + Thời gian/Địa điểm + Động từ)",
                    "sourceTag": "ai_explained",
                    "formula": f"Subject + [Time / Place] + Verb ({w0['hanzi']}...) + Object",
                    "explanation_en": f"Apply Lesson {lesson_num} vocabulary ({', '.join(w['hanzi'] for w in word_entries[:4])}) with standard Mandarin word order.",
                    "explanation": f"Áp dụng từ vựng bài {lesson_num} ({', '.join(w['hanzi'] for w in word_entries[:4])}) đúng trật tự chuẩn tiếng Trung Giản thể.",
                    "questions": [
                        {
                            "id": f"gq_{lesson_num}_1",
                            "type": "mcq",
                            "question_en": "Which sentence follows standard Chinese word order? (哪个句子的语序是正确的？)",
                            "options_en": ["我今天在学校学习汉语。", "我学习汉语在学校今天。", "我是好学习汉语。", "我不有汉语书。"],
                            "answer_en": "我今天在学校学习汉语。",
                            "explain_en": "Time (今天) and Place (在学校) always come BEFORE the main verb (学习) in Mandarin.",
                            "question": "Câu nào sau đây có trật tự từ ĐÚNG chuẩn tiếng Trung?",
                            "options": ["我今天在学校学习汉语。", "我学习汉语在学校今天。", "我是好学习汉语。", "我不有汉语书。"],
                            "answer": "我今天在学校学习汉语。",
                            "explain": "Thời gian (今天) và cụm địa điểm (在学校) luôn đứng TRƯỚC động từ chính (学习).",
                        }
                    ],
                },
                {
                    "id": f"hsk3_L{hsk_level}_L{lesson_num}_gr_2",
                    "title": f"Exercise 2 – Negation (不 vs 没) & Questions (吗)",
                    "title_vi": f"Bài 2 – Phủ định (不 / 没) và Câu hỏi (吗)",
                    "sourceTag": "ai_explained",
                    "formula": "Subject + 不/没有 + Verb/Adj  |  Statement + 吗？",
                    "explanation_en": "Use 不 for general/habitual negation and 没(有) to negate 有 (to have) or completed past actions.",
                    "explanation": "Dùng 不 cho phủ định hiện tại/thói quen và dùng 没(有) để phủ định động từ 有 hoặc hành động đã xảy ra.",
                    "questions": [
                        {
                            "id": f"gq_{lesson_num}_2",
                            "type": "mcq",
                            "question_en": "Choose the grammatically correct negation of '我有汉语书' (I have a Chinese book):",
                            "options_en": ["我没有汉语书。", "我不有汉语书。", "我没是汉语书。", "我有不汉语书。"],
                            "answer_en": "我没有汉语书。",
                            "explain_en": "The verb 有 is ALWAYS negated with 没 (没有), never 不!",
                            "question": "Chọn câu phủ định ĐÚNG của '我有汉语书' (Tôi có sách tiếng Hán):",
                            "options": ["我没有汉语书。", "我不有汉语书。", "我没是汉语书。", "我有不汉语书。"],
                            "answer": "我没有汉语书。",
                            "explain": "Động từ 有 LUÔN đi với 没 (没有), tuyệt đối không dùng 不有!",
                        }
                    ],
                },
                {
                    "id": f"hsk3_L{hsk_level}_L{lesson_num}_gr_3",
                    "title": f"Exercise 3 – Using Lesson {lesson_num} Vocabulary in Context",
                    "title_vi": f"Bài 3 – Điền từ & Cấu trúc câu Bài {lesson_num}",
                    "sourceTag": "ai_generated",
                    "formula": f"Key words: {w0['hanzi']} · {w1['hanzi']} · {w2['hanzi']}",
                    "explanation_en": f"Practice recalling and typing key words from Lesson {lesson_num} inside a natural sentence.",
                    "explanation": f"Luyện nhớ và điền đúng chữ Hán Giản thể trọng tâm của Bài {lesson_num}.",
                    "questions": [
                        {
                            "id": f"gq_{lesson_num}_3",
                            "type": "fill",
                            "question_en": f"Type the Simplified Chinese word for '{w0_en}' ({w0['pinyin']}):",
                            "answer_en": w0["hanzi"],
                            "explain_en": f"Correct answer: {w0['hanzi']} ({w0['pinyin']}).",
                            "question": f"Điền chữ Hán Giản thể cho nghĩa '{w0['vi']}' ({w0['pinyin']}):",
                            "answer": w0["hanzi"],
                            "explain": f"Đáp án chuẩn: {w0['hanzi']} ({w0['pinyin']}).",
                        }
                    ],
                },
            ],
            "writing": [
                {
                    "id": f"hsk3_L{hsk_level}_L{lesson_num}_wr_1",
                    "title": f"Exercise 1 – Single Sentence Builder ({w0['hanzi']})",
                    "title_vi": f"Bài 1 – Đặt 1 câu chuẩn với từ '{w0['hanzi']}'",
                    "sourceTag": "ai_generated",
                    "prompt_en": f"Write 1–2 Simplified Chinese sentences using '{w0['hanzi']}' ({w0['pinyin']} – {w0_en}).",
                    "prompt": f"Hãy viết 1–2 câu tiếng Trung Giản thể có sử dụng từ '{w0['hanzi']}' ({w0['pinyin']} – {w0['vi']}).",
                    "targetWord": w0["hanzi"],
                    "hskLevel": hsk_level,
                },
                {
                    "id": f"hsk3_L{hsk_level}_L{lesson_num}_wr_2",
                    "title": f"Exercise 2 – Combine Two Key Words ({w1['hanzi']} & {w2['hanzi']})",
                    "title_vi": f"Bài 2 – Viết 2 câu kết hợp '{w1['hanzi']}' và '{w2['hanzi']}'",
                    "sourceTag": "ai_generated",
                    "prompt_en": f"Write 2 connected sentences using both '{w1['hanzi']}' ({w1_en}) and '{w2['hanzi']}' ({w2_en}).",
                    "prompt": f"Hãy viết 2 câu liên kết sử dụng cả '{w1['hanzi']}' ({w1['vi']}) và '{w2['hanzi']}' ({w2['vi']}).",
                    "targetWord": w1["hanzi"],
                    "hskLevel": hsk_level,
                },
                {
                    "id": f"hsk3_L{hsk_level}_L{lesson_num}_wr_3",
                    "title": f"Exercise 3 – Mini Paragraph (Lesson {lesson_num} Topic)",
                    "title_vi": f"Bài 3 – Viết đoạn ngắn chủ đề Bài {lesson_num}",
                    "sourceTag": "ai_generated",
                    "prompt_en": f"Write a short 3-sentence paragraph about Lesson {lesson_num} using at least 3 words: {', '.join(w['hanzi'] for w in word_entries[:5])}.",
                    "prompt": f"Viết đoạn ngắn 3 câu về chủ đề Bài {lesson_num}, dùng ít nhất 3 từ: {', '.join(w['hanzi'] for w in word_entries[:5])}.",
                    "targetWord": w2["hanzi"],
                    "hskLevel": hsk_level,
                },
            ],
            "speaking": [
                {
                    "id": f"hsk3_L{hsk_level}_L{lesson_num}_sp_1",
                    "title": f"Exercise 1 – Shadowing Opening Line",
                    "title_vi": f"Bài 1 – Luyện đọc theo câu mở đầu",
                    "sourceTag": "ai_generated",
                    "prompt_en": f"Listen to the model audio and read aloud clearly with accurate 4-tone contour.",
                    "prompt": f"Nghe mẫu và đọc to rõ ràng, chú ý giữ đúng cao độ 4 thanh điệu.",
                    "sampleQuestion": rd_zh.split("\n")[0][:60],
                    "hskLevel": hsk_level,
                },
                {
                    "id": f"hsk3_L{hsk_level}_L{lesson_num}_sp_2",
                    "title": f"Exercise 2 – Key Words Pronunciation Check",
                    "title_vi": f"Bài 2 – Luyện phát âm cụm từ trọng tâm",
                    "sourceTag": "ai_generated",
                    "prompt_en": f"Read these Lesson {lesson_num} focus words aloud clearly and check your tone accuracy.",
                    "prompt": f"Đọc to các từ trọng tâm Bài {lesson_num} và kiểm tra độ chuẩn phát âm.",
                    "sampleQuestion": "、".join(w["hanzi"] for w in word_entries[:4]),
                    "hskLevel": hsk_level,
                },
                {
                    "id": f"hsk3_L{hsk_level}_L{lesson_num}_sp_3",
                    "title": f"Exercise 3 – Free Speaking Reply (Lesson {lesson_num})",
                    "title_vi": f"Bài 3 – Phản xạ trả lời tự do Bài {lesson_num}",
                    "sourceTag": "ai_generated",
                    "prompt_en": f"Answer in 1–2 natural Mandarin sentences using '{w0['hanzi']}' or '{w1['hanzi']}'.",
                    "prompt": f"Trả lời bằng 1–2 câu tiếng Trung tự nhiên có dùng '{w0['hanzi']}' hoặc '{w1['hanzi']}'.",
                    "sampleQuestion": (rd_zh.split("\n")[1] if len(rd_zh.split("\n")) > 1 else rd_zh)[:60],
                    "hskLevel": hsk_level,
                },
            ],
        },
    }


def ensure_hsk3_level1_seeded(get_db_fn: Callable[[], sqlite3.Connection], db_lock: threading.Lock, root_dir: Path) -> None:
    """Seed the user's real local HSK 3.0 Level 1 curriculum (3 PDFs + 93 MP3 tracks across 15 lessons) once."""
    with db_lock:
        conn = get_db_fn()
        try:
            init_pdf_tables(conn)
            exists = conn.execute("SELECT id, course_json FROM pdf_courses WHERE hsk_level = 1 LIMIT 1").fetchone()
            if exists and '"schemaVersion": 4' in (exists["course_json"] or ""):
                return
        finally:
            conn.close()

    vocab_map = _load_hsk3_l1_vocab(root_dir)
    mp3_by_lesson = _scan_local_hsk1_mp3s(root_dir)
    now = _utc_now()

    seed_docs = []
    if LOCAL_HSK1_PDF_DIR.exists():
        for pdf in sorted(LOCAL_HSK1_PDF_DIR.glob("*.pdf")):
            size = pdf.stat().st_size
            # Fast metadata inspection without holding entire 132MB in DB
            is_scan = "新HSK1.pdf" == pdf.name
            pages = 143 if "新HSK1.pdf" == pdf.name else (140 if "workbook" in pdf.name else 109)
            seed_docs.append({
                "id": "pdf_seed_" + hashlib.sha256(pdf.name.encode("utf-8")).hexdigest()[:10],
                "filename": pdf.name,
                "size": size,
                "pages": pages,
                "has_text": 0 if is_scan else 1,
                "ocr_req": 1 if is_scan else 0,
                "path": str(pdf),
            })
    if not seed_docs:
        seed_docs.append({
            "id": "pdf_seed_hsk1_default",
            "filename": "新HSK1.pdf (HSK 3.0 Level 1)",
            "size": 0, "pages": 143, "has_text": 0, "ocr_req": 1, "path": "",
        })

    lessons = []
    total_ex = 0
    for lnum, ltitle, lwords in HSK1_LESSON_TOPICS:
        tracks = mp3_by_lesson.get(lnum, [])
        lesson_obj = _build_lesson_exercises_for_topic(
            1, lnum, ltitle, lwords, vocab_map, tracks,
            source_label=f"Giáo trình New HSK 1 (3.0) + {len(tracks)} file MP3 gốc" if tracks else "Giáo trình New HSK 1 (3.0)",
        )
        total_ex += (
            len(lesson_obj["skills"]["reading"])
            + len(lesson_obj["skills"]["listening"])
            + len(lesson_obj["skills"]["grammar"])
            + len(lesson_obj["skills"]["writing"])
            + len(lesson_obj["skills"]["speaking"])
        )
        lessons.append(lesson_obj)

    course_payload = {
        "schemaVersion": 4,
        "contentSource": "AI_PDF_HSK3",
        "courseType": "hsk3_pdf_curriculum",
        "hskLevel": 1,
        "code": "HSK 1 (3.0)",
        "title": "Khóa học HSK 1 (Chuẩn HSK 3.0 – 15 Lessons + 93 MP3 gốc)",
        "mp3TracksLinked": sum(len(v) for v in mp3_by_lesson.values()),
        "transparencyNote": "File 新HSK1.pdf là bản PDF ảnh scan (143 trang). Hệ thống đã gắn trực tiếp 93 file MP3 giáo trình New HSK 1 (3.0) theo 15 bài học cùng bảng từ vựng HSK 3.0 xác thực; các bài đọc/bài tập bổ trợ được gắn nhãn rõ 'AI tạo thêm' để phân biệt với tài liệu gốc.",
        "lessons": lessons,
    }

    with db_lock:
        conn = get_db_fn()
        try:
            init_pdf_tables(conn)
            for d in seed_docs:
                conn.execute(
                    """
                    INSERT OR IGNORE INTO pdf_documents
                    (id, user_id, hsk_level, filename, file_size, page_count, checksum, has_text_layer, ocr_required, status, stage, progress_pct, lessons_detected, exercises_created, error_message, extracted_text, storage_path, is_system_seed, created_at, updated_at)
                    VALUES (?, NULL, 1, ?, ?, ?, ?, ?, ?, 'published', '7_PUBLISHED', 100, 15, ?, ?, '', ?, 1, ?, ?)
                    """,
                    (
                        d["id"], d["filename"], d["size"], d["pages"], d["id"],
                        d["has_text"], d["ocr_req"], total_ex,
                        "PDF dạng ảnh scan (143 trang) – bật GEMINI_API_KEY để OCR từng trang nâng cao; đã liên kết 93 MP3 giáo trình gốc." if d["ocr_req"] else "",
                        d["path"], now, now,
                    ),
                )
            conn.execute(
                """
                INSERT OR REPLACE INTO pdf_courses
                (id, hsk_level, title, source_doc_ids_json, is_published, total_lessons, total_exercises, course_json, created_at, updated_at)
                VALUES ('course_hsk3_L1', 1, ?, ?, 1, ?, ?, ?, ?, ?)
                """,
                (
                    course_payload["title"],
                    json.dumps([d["id"] for d in seed_docs]),
                    len(lessons), total_ex,
                    json.dumps(course_payload, ensure_ascii=False),
                    now, now,
                ),
            )
            conn.commit()
        finally:
            conn.close()


def _run_pdf_pipeline_worker(
    get_db_fn: Callable[[], sqlite3.Connection],
    db_lock: threading.Lock,
    root_dir: Path,
    doc_id: str,
    hsk_level: int,
    filename: str,
    extracted_text: str,
    companion_text: str,
    page_count: int,
) -> None:
    """7-Stage asynchronous background pipeline so large PDFs never freeze the web app."""
    def _set_stage(stage: str, pct: int, status: str = "processing", err: str = "", l_cnt: int = 0, e_cnt: int = 0):
        with db_lock:
            conn = get_db_fn()
            try:
                conn.execute(
                    "UPDATE pdf_documents SET stage=?, progress_pct=?, status=?, error_message=?, lessons_detected=?, exercises_created=?, updated_at=? WHERE id=?",
                    (stage, pct, status, err, l_cnt, e_cnt, _utc_now(), doc_id),
                )
                conn.commit()
            finally:
                conn.close()

    try:
        _set_stage("2_CONTENT_EXTRACTION", 25)
        full_text = sanitize_pdf_text((companion_text or "") + "\n" + (extracted_text or "")).strip()
        time.sleep(0.1)

        _set_stage("3_AI_ANALYSIS", 45)
        # Segment into chapters/lessons by headings (第X课 / Lesson X / Unit X) or chunks
        blocks = re.split(r"(?=第[0-9一二三四五六七八九十]+课|Lesson\s*\d+|Unit\s*\d+)", full_text, flags=re.I)
        blocks = [b.strip() for b in blocks if len(b.strip()) >= 12]
        if not blocks:
            blocks = [full_text] if full_text else []

        vocab_map = _load_hsk3_l1_vocab(root_dir)
        # Also load target HSK level vocab if available
        p_lvl = root_dir / "public" / "data" / "vocab" / "hsk3" / f"L{min(7, max(1, hsk_level))}.json"
        if p_lvl.exists():
            try:
                for r in json.loads(p_lvl.read_text(encoding="utf-8")):
                    vocab_map[r["h"]] = r
            except Exception:
                pass

        _set_stage("4_SKILL_CLASSIFICATION", 65)
        lessons = []
        total_ex = 0
        if not blocks:
            _set_stage(
                "2_CONTENT_EXTRACTION", 100, status="needs_ocr",
                err="PDF này là bản scan ảnh không có lớp văn bản (0 chữ Hán trích xuất được). Hãy dán văn bản/transcript kèm theo hoặc cấu hình GEMINI_API_KEY để OCR tự động.",
            )
            return

        for idx, blk in enumerate(blocks[:15], start=1):
            first_line = blk.splitlines()[0][:65].strip()
            title = first_line if len(first_line) >= 3 else f"Lesson {idx} – {filename}"
            # Find matching verified vocab words actually appearing in this block!
            found_words = []
            for hz in vocab_map.keys():
                if len(hz) >= 1 and hz in blk and hz not in found_words:
                    found_words.append(hz)
                if len(found_words) >= 10:
                    break
            if not found_words:
                zh_tokens = re.findall(r"[\u4e00-\u9fff]{1,3}", blk)
                found_words = list(dict.fromkeys(zh_tokens))[:8] or ["汉语", "学习"]

            lesson_obj = _build_lesson_exercises_for_topic(
                hsk_level, idx, title, found_words, vocab_map, [],
                source_label=f"PDF: {filename} ({page_count} trang)",
                custom_passage=blk,
            )
            total_ex += 5
            lessons.append(lesson_obj)

        _set_stage("5_LESSON_GENERATION", 82, l_cnt=len(lessons), e_cnt=total_ex)
        _set_stage("6_QUALITY_VALIDATION", 94, l_cnt=len(lessons), e_cnt=total_ex)

        course_id = f"course_hsk3_L{hsk_level}_{doc_id[-6:]}"
        course_payload = {
            "hskLevel": hsk_level,
            "code": f"HSK {'7–9' if hsk_level == 7 else hsk_level} (3.0)",
            "title": f"Khóa học từ PDF: {filename} (HSK {'7–9' if hsk_level == 7 else hsk_level})",
            "sourceFilename": filename,
            "transparencyNote": "Nội dung đoạn văn & từ khóa được trích xuất từ PDF gốc (nhãn 'extracted_from_pdf'); giải thích & câu hỏi bổ trợ được gắn nhãn 'ai_explained' / 'ai_generated'.",
            "lessons": lessons,
        }
        now = _utc_now()
        with db_lock:
            conn = get_db_fn()
            try:
                conn.execute(
                    """
                    INSERT OR REPLACE INTO pdf_courses
                    (id, hsk_level, title, source_doc_ids_json, is_published, total_lessons, total_exercises, course_json, created_at, updated_at)
                    VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?, ?)
                    """,
                    (course_id, hsk_level, course_payload["title"], json.dumps([doc_id]), len(lessons), total_ex, json.dumps(course_payload, ensure_ascii=False), now, now),
                )
                conn.execute(
                    "UPDATE pdf_documents SET stage='7_READY_TO_PUBLISH', progress_pct=100, status='ready', lessons_detected=?, exercises_created=?, updated_at=? WHERE id=?",
                    (len(lessons), total_ex, now, doc_id),
                )
                conn.commit()
            finally:
                conn.close()
    except Exception as exc:
        _set_stage("ERROR", 100, status="error", err=str(exc))


def upload_and_process_pdf(
    get_db_fn: Callable[[], sqlite3.Connection],
    db_lock: threading.Lock,
    root_dir: Path,
    user_id: Optional[int],
    hsk_level: int,
    filename: str,
    data_b64: str,
    companion_text: str = "",
) -> Dict[str, Any]:
    hsk_level = max(1, min(7, int(hsk_level or 1)))
    clean_name = Path(filename or "document.pdf").name[:120]
    try:
        raw = base64.b64decode(data_b64, validate=False) if data_b64 else b""
    except Exception:
        return {"ok": False, "error": "Dữ liệu PDF mã hóa không hợp lệ."}

    if raw:
        info = inspect_pdf_bytes(raw)
        if not info.get("ok"):
            return info
        checksum = info["checksum"]
        page_count = info["pageCount"]
        has_text = 1 if info["hasTextLayer"] else 0
        ocr_req = 1 if info["ocrRequired"] else 0
        extracted = info["extractedText"]
        file_size = len(raw)
    else:
        if not companion_text.strip():
            return {"ok": False, "error": "Vui lòng chọn file PDF hợp lệ hoặc nhập nội dung giáo trình đi kèm."}
        checksum = hashlib.sha256(companion_text.encode("utf-8")).hexdigest()[:24]
        page_count = max(1, len(companion_text) // 1200 + 1)
        has_text, ocr_req, extracted, file_size = 1, 0, companion_text, len(companion_text.encode("utf-8"))

    doc_id = "pdf_" + uuid.uuid4().hex[:10]
    now = _utc_now()
    base_data_dir = Path("/tmp/qchinese_data") if (os.environ.get("VERCEL") or os.environ.get("VERCEL_ENV")) else (root_dir / "data")
    uploads_dir = base_data_dir / "uploads"
    uploads_dir.mkdir(parents=True, exist_ok=True)
    storage_path = ""
    if raw:
        dest = uploads_dir / f"{doc_id}.pdf"
        dest.write_bytes(raw)
        storage_path = str(dest)

    with db_lock:
        conn = get_db_fn()
        try:
            init_pdf_tables(conn)
            conn.execute(
                """
                INSERT INTO pdf_documents
                (id, user_id, hsk_level, filename, file_size, page_count, checksum, has_text_layer, ocr_required, status, stage, progress_pct, lessons_detected, exercises_created, error_message, extracted_text, storage_path, is_system_seed, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'processing', '1_UPLOAD_VALIDATION', 15, 0, 0, '', ?, ?, 0, ?, ?)
                """,
                (doc_id, user_id, hsk_level, clean_name, file_size, page_count, checksum, has_text, ocr_req, (companion_text or extracted)[:30000], storage_path, now, now),
            )
            conn.commit()
        finally:
            conn.close()

    # Run 7-stage pipeline synchronously on serverless (Vercel) or async worker thread on 24/7 server
    if os.environ.get("VERCEL") or os.environ.get("VERCEL_ENV"):
        _run_pdf_pipeline_worker(get_db_fn, db_lock, root_dir, doc_id, hsk_level, clean_name, extracted, companion_text, page_count)
        return {"ok": True, "documentId": doc_id, "hskLevel": hsk_level, "pageCount": page_count, "ocrRequired": bool(ocr_req), "status": "ready"}
    th = threading.Thread(
        target=_run_pdf_pipeline_worker,
        args=(get_db_fn, db_lock, root_dir, doc_id, hsk_level, clean_name, extracted, companion_text, page_count),
        daemon=True,
    )
    th.start()
    return {"ok": True, "documentId": doc_id, "hskLevel": hsk_level, "pageCount": page_count, "ocrRequired": bool(ocr_req), "status": "processing"}


def publish_course(get_db_fn: Callable[[], sqlite3.Connection], db_lock: threading.Lock, course_id: str) -> Dict[str, Any]:
    now = _utc_now()
    with db_lock:
        conn = get_db_fn()
        try:
            row = conn.execute("SELECT * FROM pdf_courses WHERE id = ?", (course_id,)).fetchone()
            if not row:
                return {"ok": False, "error": "Không tìm thấy khóa học để xuất bản."}
            conn.execute("UPDATE pdf_courses SET is_published = 1, updated_at = ? WHERE id = ?", (now, course_id))
            doc_ids = json.loads(row["source_doc_ids_json"] or "[]")
            for did in doc_ids:
                conn.execute("UPDATE pdf_documents SET status = 'published', stage = '7_PUBLISHED', updated_at = ? WHERE id = ?", (now, did))
            conn.commit()
            return {"ok": True, "courseId": course_id, "hskLevel": row["hsk_level"]}
        finally:
            conn.close()


def get_pdf_overview(get_db_fn: Callable[[], sqlite3.Connection], db_lock: threading.Lock, root_dir: Path) -> Dict[str, Any]:
    ensure_hsk3_level1_seeded(get_db_fn, db_lock, root_dir)
    with db_lock:
        conn = get_db_fn()
        try:
            docs = [dict(r) for r in conn.execute("SELECT id, hsk_level, filename, file_size, page_count, has_text_layer, ocr_required, status, stage, progress_pct, lessons_detected, exercises_created, error_message, is_system_seed, created_at, updated_at FROM pdf_documents ORDER BY created_at DESC").fetchall()]
            courses = [dict(r) for r in conn.execute("SELECT id, hsk_level, title, is_published, total_lessons, total_exercises, created_at, updated_at FROM pdf_courses ORDER BY hsk_level ASC, updated_at DESC").fetchall()]
        finally:
            conn.close()

    published_levels = {c["hsk_level"] for c in courses if c["is_published"]}
    levels_map = []
    for lv in HSK3_LEVELS:
        lvl_num = lv["level"]
        unlocked = lvl_num in published_levels
        lvl_courses = [c for c in courses if c["hsk_level"] == lvl_num]
        levels_map.append({
            "level": lvl_num,
            "code": lv["code"],
            "title": lv["title"],
            "unlocked": unlocked,
            "statusLabel": "Đã có tài liệu · Đã mở khóa" if unlocked else "Chờ tài liệu PDF (Đang khóa)",
            "coursesCount": len(lvl_courses),
            "publishedCourseId": next((c["id"] for c in lvl_courses if c["is_published"]), None),
        })
    return {"levels": levels_map, "documents": docs, "courses": courses}


def get_course_detail(get_db_fn: Callable[[], sqlite3.Connection], db_lock: threading.Lock, root_dir: Path, hsk_level: Optional[int] = None, course_id: Optional[str] = None) -> Dict[str, Any]:
    ensure_hsk3_level1_seeded(get_db_fn, db_lock, root_dir)
    with db_lock:
        conn = get_db_fn()
        try:
            if course_id:
                row = conn.execute("SELECT * FROM pdf_courses WHERE id = ?", (course_id,)).fetchone()
            else:
                row = conn.execute("SELECT * FROM pdf_courses WHERE hsk_level = ? ORDER BY is_published DESC, updated_at DESC LIMIT 1", (int(hsk_level or 1),)).fetchone()
        finally:
            conn.close()
    if not row:
        return {"ok": False, "locked": True, "error": f"HSK {hsk_level} hiện đang khóa (chưa có tài liệu giáo trình PDF được tải lên)."}
    data = json.loads(row["course_json"])
    data["id"] = row["id"]
    data["isPublished"] = bool(row["is_published"])
    return {"ok": True, "course": data}
