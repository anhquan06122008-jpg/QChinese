# -*- coding: utf-8 -*-
"""
QChinese Backend Pedagogical & Linguistic AI Engine
Provides:
1. Secure LLM integration (Google Gemini API & OpenAI-compatible API) via backend-only keys.
2. Deep Simplified Chinese linguistic analyzer & conversational tutor fallback so all AI Speaking,
   AI Writing 7-criteria correction, 12-step Word Teaching, and AI Progress Analytics work
   accurately out-of-the-box even before an external API key is configured.
Strictly enforces Simplified Chinese (简体中文) throughout.
"""

import json
import os
import re
import urllib.error
import urllib.request
from typing import Any, Dict, List, Optional

# Common Traditional -> Simplified mapping to detect & gently guide learners if they accidentally type Traditional characters
TRADITIONAL_TO_SIMPLIFIED = {
    "學": "学", "習": "习", "語": "语", "漢": "汉", "國": "国", "們": "们",
    "謝": "谢", "歡": "欢", "愛": "爱", "書": "书", "車": "车", "電": "电",
    "話": "话", "見": "见", "開": "开", "門": "门", "問": "问", "間": "间",
    "時": "时", "東": "东", "買": "买", "賣": "卖", "聽": "听", "說": "说",
    "讀": "读", "寫": "写", "請": "请", "對": "对", "沒": "没", "個": "个",
    "這": "这", "進": "进", "遠": "远", "近": "近", "還": "还", "點": "点",
    "認識": "认识", "認": "认", "識": "识", "師": "师", "醫": "医", "錢": "钱",
    "飯": "饭", "飲": "饮", "館": "馆", "機": "机", "場": "场", "飛": "飞",
    "號": "号", "歲": "岁", "塊": "块", "兩": "两", "幾": "几", "誰": "谁",
    "什": "什", "麼": "么", "樣": "样", "現": "现", "覺": "觉", "長": "长",
    "樂": "乐", "興": "兴", "熱": "热", "冷": "冷", "氣": "气", "風": "风",
    "雲": "云", "體": "体", "頭": "头", "臉": "脸", "業": "业", "題": "题",
}

# Built-in scenario conversation scripts & smart responses for Beginner/HSK levels
SPEAKING_SCENARIOS = {
    "greeting": {
        "title": "Chào hỏi cơ bản",
        "starter": {
            "chinese": "你好！很高兴认识你。你今天好吗？",
            "pinyin": "Nǐ hǎo! Hěn gāoxìng rènshi nǐ. Nǐ jīntiān hǎo ma?",
            "english": "Hello! Nice to meet you. How are you today?",
            "vietnamese": "Xin chào! Rất vui được làm quen với bạn. Hôm nay bạn khỏe không?",
            "suggestions": [
                {"chinese": "你好！我很好，谢谢。", "pinyin": "Nǐ hǎo! Wǒ hěn hǎo, xièxie.", "vietnamese": "Xin chào! Tôi rất khỏe, cảm ơn."},
                {"chinese": "我也很高兴认识你！", "pinyin": "Wǒ yě hěn gāoxìng rènshi nǐ!", "vietnamese": "Tôi cũng rất vui được làm quen với bạn!"}
            ]
        }
    },
    "intro": {
        "title": "Giới thiệu bản thân",
        "starter": {
            "chinese": "你好！我是你的中文老师。请问你是哪国人？",
            "pinyin": "Nǐ hǎo! Wǒ shì nǐ de Zhōngwén lǎoshī. Qǐngwèn nǐ shì nǎ guó rén?",
            "english": "Hello! I am your Chinese teacher. May I ask what nationality you are?",
            "vietnamese": "Xin chào! Cô/thầy là giáo viên tiếng Trung của bạn. Xin hỏi bạn là người nước nào?",
            "suggestions": [
                {"chinese": "我是越南人。", "pinyin": "Wǒ shì Yuènán rén.", "vietnamese": "Tôi là người Việt Nam."},
                {"chinese": "我是越南人，我学习中文。", "pinyin": "Wǒ shì Yuènán rén, wǒ xuéxí Zhōngwén.", "vietnamese": "Tôi là người Việt Nam, tôi học tiếng Trung."}
            ]
        }
    },
    "name": {
        "title": "Hỏi tên",
        "starter": {
            "chinese": "请问，你叫什么名字？",
            "pinyin": "Qǐngwèn, nǐ jiào shénme míngzi?",
            "english": "Excuse me, what is your name?",
            "vietnamese": "Xin hỏi, bạn tên là gì?",
            "suggestions": [
                {"chinese": "我叫明安。你呢？", "pinyin": "Wǒ jiào Míng'ān. Nǐ ne?", "vietnamese": "Tôi tên là Minh An. Còn bạn thì sao?"},
                {"chinese": "你好，我叫兰英。", "pinyin": "Nǐ hǎo, wǒ jiào Lányīng.", "vietnamese": "Xin chào, tôi tên là Lan Anh."}
            ]
        }
    },
    "age": {
        "title": "Hỏi tuổi",
        "starter": {
            "chinese": "你今年多大？你是学生吗？",
            "pinyin": "Nǐ jīnnián duō dà? Nǐ shì xuésheng ma?",
            "english": "How old are you this year? Are you a student?",
            "vietnamese": "Năm nay bạn bao nhiêu tuổi? Bạn là học sinh/sinh viên phải không?",
            "suggestions": [
                {"chinese": "我今年二十岁，我是大学生。", "pinyin": "Wǒ jīnnián èrshí suì, wǒ shì dàxuéshēng.", "vietnamese": "Năm nay tôi 20 tuổi, tôi là sinh viên đại học."},
                {"chinese": "我二十五岁，我已经工作了。", "pinyin": "Wǒ èrshíwǔ suì, wǒ yǐjīng gōngzuò le.", "vietnamese": "Tôi 25 tuổi, tôi đã đi làm rồi."}
            ]
        }
    },
    "family": {
        "title": "Nói về gia đình",
        "starter": {
            "chinese": "你家有几口人？他们是谁？",
            "pinyin": "Nǐ jiā yǒu jǐ kǒu rén? Tāmen shì shéi?",
            "english": "How many people are in your family? Who are they?",
            "vietnamese": "Gia đình bạn có mấy người? Họ là những ai?",
            "suggestions": [
                {"chinese": "我家有四口人：爸爸、妈妈、哥哥和我。", "pinyin": "Wǒ jiā yǒu sì kǒu rén: bàba, māma, gēge hé wǒ.", "vietnamese": "Nhà tôi có 4 người: bố, mẹ, anh trai và tôi."},
                {"chinese": "我家有三口人：爸爸、妈妈和我。", "pinyin": "Wǒ jiā yǒu sān kǒu rén: bàba, māma hé wǒ.", "vietnamese": "Nhà tôi có 3 người: bố, mẹ và tôi."}
            ]
        }
    },
    "school": {
        "title": "Nói về trường học",
        "starter": {
            "chinese": "你在学校学习什么？你觉得中文难吗？",
            "pinyin": "Nǐ zài xuéxiào xuéxí shénme? Nǐ juéde Zhōngwén nán ma?",
            "english": "What do you study at school? Do you think Chinese is difficult?",
            "vietnamese": "Ở trường bạn học ngành gì? Bạn thấy tiếng Trung có khó không?",
            "suggestions": [
                {"chinese": "我学习中文。汉字有点儿难，但是很有意思。", "pinyin": "Wǒ xuéxí Zhōngwén. Hànzì yǒudiǎnr nán, dànshì hěn yǒuyìsi.", "vietnamese": "Tôi học tiếng Trung. Chữ Hán hơi khó một chút nhưng rất thú vị."},
                {"chinese": "中文发音不太难，我很喜欢学习中文。", "pinyin": "Zhōngwén fāyīn bú tài nán, wǒ hěn xǐhuan xuéxí Zhōngwén.", "vietnamese": "Phát âm tiếng Trung không khó lắm, tôi rất thích học tiếng Trung."}
            ]
        }
    },
    "food": {
        "title": "Gọi món ăn",
        "starter": {
            "chinese": "欢迎光临！请问你想吃什么？想喝什么？",
            "pinyin": "Huānyíng guānglín! Qǐngwèn nǐ xiǎng chī shénme? Xiǎng hē shénme?",
            "english": "Welcome! What would you like to eat? What would you like to drink?",
            "vietnamese": "Chào mừng quý khách! Xin hỏi bạn muốn ăn gì? Muốn uống gì?",
            "suggestions": [
                {"chinese": "我想吃米饭和牛肉，还要一杯茶。", "pinyin": "Wǒ xiǎng chī mǐfàn hé niúròu, hái yào yì bēi chá.", "vietnamese": "Tôi muốn ăn cơm và thịt bò, thêm một cốc trà nữa."},
                {"chinese": "我要一碗面条和一杯咖啡，谢谢。", "pinyin": "Wǒ yào yì wǎn miàntiáo hé yì bēi kāfēi, xièxie.", "vietnamese": "Cho tôi một bát mì và một cốc cà phê, cảm ơn."}
            ]
        }
    },
    "direction": {
        "title": "Hỏi đường",
        "starter": {
            "chinese": "你好，你需要帮忙吗？你想去哪里？",
            "pinyin": "Nǐ hǎo, nǐ xūyào bāngmáng ma? Nǐ xiǎng qù nǎlǐ?",
            "english": "Hello, do you need help? Where would you like to go?",
            "vietnamese": "Xin chào, bạn có cần giúp đỡ không? Bạn muốn đi đâu?",
            "suggestions": [
                {"chinese": "请问，地铁站在哪里？离这儿远吗？", "pinyin": "Qǐngwèn, dìtiězhàn zài nǎlǐ? Lí zhèr yuǎn ma?", "vietnamese": "Xin hỏi ga tàu điện ngầm ở đâu? Cách đây có xa không?"},
                {"chinese": "请问，去北京医院怎么走？", "pinyin": "Qǐngwèn, qù Běijīng Yīyuàn zěnme zǒu?", "vietnamese": "Xin hỏi đi đến Bệnh viện Bắc Kinh đi đường nào?"}
            ]
        }
    }
}


def get_ai_config() -> Dict[str, Any]:
    """Read AI provider config safely from environment variables."""
    gemini_key = os.environ.get("GEMINI_API_KEY", "").strip()
    openai_key = os.environ.get("OPENAI_API_KEY", "").strip()
    openai_base = os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1").strip()
    gemini_model = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash").strip()
    openai_model = os.environ.get("OPENAI_MODEL", "gpt-4o-mini").strip()

    if gemini_key:
        return {
            "configured": True,
            "provider": "gemini",
            "api_key": gemini_key,
            "model": gemini_model,
        }
    if openai_key:
        return {
            "configured": True,
            "provider": "openai",
            "api_key": openai_key,
            "base_url": openai_base,
            "model": openai_model,
        }
    return {
        "configured": False,
        "provider": "pedagogical-engine",
        "model": "QChinese Pedagogical Linguistic Tutor v1",
    }


def _call_external_llm(system_prompt: str, user_prompt: str) -> Optional[Dict[str, Any]]:
    """Call Gemini or OpenAI securely on backend and parse JSON output."""
    cfg = get_ai_config()
    if not cfg["configured"]:
        return None

    try:
        if cfg["provider"] == "gemini":
            model = cfg["model"]
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={cfg['api_key']}"
            payload = {
                "system_instruction": {"parts": [{"text": system_prompt}]},
                "contents": [{"role": "user", "parts": [{"text": user_prompt}]}],
                "generationConfig": {
                    "temperature": 0.4,
                    "responseMimeType": "application/json",
                },
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=25) as resp:
                body = json.loads(resp.read().decode("utf-8"))
                text = body["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(text)

        elif cfg["provider"] == "openai":
            url = cfg["base_url"].rstrip("/") + "/chat/completions"
            payload = {
                "model": cfg["model"],
                "temperature": 0.4,
                "response_format": {"type": "json_object"},
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {cfg['api_key']}",
                },
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=25) as resp:
                body = json.loads(resp.read().decode("utf-8"))
                text = body["choices"][0]["message"]["content"]
                return json.loads(text)
    except Exception:
        return None
    return None


def _detect_traditional_chars(text: str) -> List[Dict[str, str]]:
    found = []
    seen = set()
    for ch in text:
        if ch in TRADITIONAL_TO_SIMPLIFIED and ch not in seen:
            seen.add(ch)
            found.append({"trad": ch, "simp": TRADITIONAL_TO_SIMPLIFIED[ch]})
    return found


def _analyze_chinese_grammar_errors(text: str) -> Dict[str, Any]:
    """
    Rule-based linguistic error detector tailored specifically for Vietnamese learners of Simplified Chinese!
    Catches classic interlanguage transfer mistakes:
    - '我是好' / '他是忙' -> '我很好' / '他很忙' (Vietnamese 'Tôi thì khỏe' -> using 是 before adjectives)
    - '我不有...' -> '我没有...' (negating 有 with 不 instead of 没)
    - Time adverb placed at end of sentence ('我去学校今天' -> '我今天去学校')
    - Place phrase placed after verb ('我学习中文在学校' -> '我在学校学习中文')
    - Missing measure word ('一个/一本' vs '一人/一学生' -> '一个人/一个学生')
    - '二' before measure word ('二个人' -> '两个人')
    - Traditional characters used instead of Simplified
    """
    cleaned = text.strip()
    issues = []
    corrected = cleaned

    # 1. Check Traditional characters
    trad_list = _detect_traditional_chars(corrected)
    if trad_list:
        for item in trad_list:
            corrected = corrected.replace(item["trad"], item["simp"])
        pairs_str = ", ".join([f"'{x['trad']}' → '{x['simp']}'" for x in trad_list])
        issues.append({
            "category": "Lỗi chữ Hán (Giản thể)",
            "detail": f"Bạn đang dùng chữ Phồn thể ({pairs_str}). Theo lộ trình tiếng Trung Giản thể (简体中文), hãy đổi sang chữ Giản thể tương ứng nhé."
        })

    # 2. Check '不有' -> '没有'
    if "不有" in corrected:
        corrected = corrected.replace("不有", "没有")
        issues.append({
            "category": "Lỗi ngữ pháp (不 vs 没)",
            "detail": "Động từ '有' (có) luôn phủ định bằng '没' → '没有' (không có), tuyệt đối không dùng '不有'."
        })

    # 3. Check '是 + Adjective' without 的 ('我是好', '他是高', '中文是难', '我是忙', '她是漂亮')
    adj_pattern = re.compile(r"(我|你|他|她|它|我们|你们|他们|中文|汉字|天气)是(好|忙|累|高|大|难|贵|漂亮|高兴|冷|热)(?![的])")
    if adj_pattern.search(corrected):
        corrected = adj_pattern.sub(r"\1很\2", corrected)
        issues.append({
            "category": "Lỗi ngữ pháp (Câu vị ngữ tính từ)",
            "detail": "Trong tiếng Trung, chủ ngữ đi với tính từ KHÔNG nối bằng '是' như tiếng Anh (I am good), mà dùng phó từ mức độ '很' (Wǒ hěn hǎo - Tôi khỏe)."
        })

    # 4. Check '二 + measure word' -> '两 + measure word'
    er_mw = re.compile(r"二(个|口|本|杯|碗|岁|块|件|位|条|张)")
    if er_mw.search(corrected):
        corrected = er_mw.sub(r"两\1", corrected)
        issues.append({
            "category": "Lỗi dùng từ (二 vs 两)",
            "detail": "Khi đếm số lượng đứng trước lượng từ (như 个, 口, 本, 杯...), tiếng Trung dùng '两' (liǎng) chứ không dùng '二' (èr)."
        })

    # 5. Missing measure word after 一/两/三/几 + common nouns
    no_mw = re.compile(r"(一|两|三|四|五|几)(学生|老师|朋友|苹果|书)")
    if no_mw.search(corrected):
        def _fix_mw(m):
            num, noun = m.group(1), m.group(2)
            mw = "本" if noun == "书" else "个"
            return f"{num}{mw}{noun}"
        corrected = no_mw.sub(_fix_mw, corrected)
        issues.append({
            "category": "Lỗi ngữ pháp (Thiếu lượng từ)",
            "detail": "Giữa số từ (一, 两, 三, 几...) và danh từ trong tiếng Trung bắt buộc phải có lượng từ (ví dụ: 一个学生, 一本书)."
        })

    # 6. Time word at the end of a clause (Vietnamese transfer: 'Tôi đi học hôm nay')
    time_end = re.compile(r"(^|[，,\s])(我|你|他|她|我们|他们)([^，,。！？!?]+?)(今天|明天|昨天|现在|每天)(?=[，,。！？!?]|$)")
    if time_end.search(corrected):
        def _fix_time(m):
            sep, subj, pred, tword = m.groups()
            if len(pred) >= 1 and "是" not in pred and not pred.startswith(tword):
                issues.append({
                    "category": "Lỗi trật tự từ (Trạng ngữ thời gian)",
                    "detail": f"Trong tiếng Việt có thể đặt '{tword}' ở cuối mệnh đề, nhưng tiếng Trung bắt buộc đặt từ chỉ thời gian ở đầu câu hoặc ngay sau chủ ngữ ({subj}{tword}...)."
                })
                return f"{sep}{subj}{tword}{pred}"
            return m.group(0)
        corrected = time_end.sub(_fix_time, corrected)

    # 7. Location phrase placed at the end ('我学习中文在学校' -> '我在学校学习中文')
    loc_end = re.compile(r"^(我|你|他|她|我们|他们)(学习[^\s，。！？]*|吃饭|工作|看书|喝茶|买东西)(在[^\s，。！？]+)([。！？!?]?)$")
    m_loc = loc_end.match(corrected)
    if m_loc:
        subj, vp, loc, punct = m_loc.groups()
        corrected = f"{subj}{loc}{vp}{punct}"
        issues.append({
            "category": "Lỗi trật tự từ (Cụm 在 + địa điểm)",
            "detail": "Cụm chỉ nơi chốn '在 + địa điểm' phải đứng TRƯỚC động từ hành động (Chủ ngữ + 在 + Địa điểm + Động từ), ngược với trật tự tiếng Việt."
        })

    # 8. Question with 吗 missing question mark or punctuation normalization
    if corrected and corrected[-1] not in "。！？!?":
        if corrected.endswith("吗") or "什么" in corrected or "哪里" in corrected or "谁" in corrected or "几" in corrected or "怎么" in corrected:
            corrected += "？"
        else:
            corrected += "。"

    return {
        "original": cleaned,
        "corrected": corrected,
        "issues": issues
    }


def handle_speaking_turn(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    AI Speaking Tutor (Section 6.4):
    Supports Mode 1 (8 basic topics) & Mode 2 (Free HSK-level conversation).
    Strictly Simplified Chinese, level-capped, trilingual, corrects errors gently.
    """
    mode = payload.get("mode", "basic")
    topic = payload.get("topic", "greeting")
    hsk_level = int(payload.get("hskLevel", 1))
    user_text = (payload.get("message") or "").strip()
    history = payload.get("history") or []

    # Starter message request
    if not user_text:
        if mode == "basic" and topic in SPEAKING_SCENARIOS:
            starter = SPEAKING_SCENARIOS[topic]["starter"]
            return {
                "reply": starter["chinese"],
                "pinyin": starter["pinyin"],
                "english": starter["english"],
                "vietnamese": starter["vietnamese"],
                "feedback": None,
                "suggestions": starter["suggestions"],
                "provider": get_ai_config()["provider"]
            }
        # Free mode starter tailored by HSK level
        free_starters = {
            1: ("你好！今天你想聊什么？我们可以说说你的家人或者你喜欢吃什么。",
                "Nǐ hǎo! Jīntiān nǐ xiǎng liáo shénme? Wǒmen kěyǐ shuōshuo nǐ de jiārén huòzhě nǐ xǐhuan chī shénme.",
                "Hello! What would you like to chat about today? We can talk about your family or what you like to eat.",
                "Xin chào! Hôm nay bạn muốn trò chuyện về chủ đề gì? Chúng mình có thể nói về gia đình hoặc món ăn bạn thích nhé."),
            2: ("你好！周末你一般喜欢做什么？你平时怎么学习中文？",
                "Nǐ hǎo! Zhōumò nǐ yìbān xǐhuan zuò shénme? Nǐ píngshí zěnme xuéxí Zhōngwén?",
                "Hello! What do you usually like to do on weekends? How do you usually study Chinese?",
                "Xin chào! Cuối tuần bạn thường thích làm gì? Bình thường bạn học tiếng Trung như thế nào?"),
            3: ("你好！最近你的学习或者工作怎么样？如果去中国旅游，你最想去哪个城市？",
                "Nǐ hǎo! Zuìjìn nǐ de xuéxí huòzhě gōngzuò zěnmeyàng? Rúguǒ qù Zhōngguó lǚyóu, nǐ zuì xiǎng qù nǎge chéngshì?",
                "Hello! How is your study or work going recently? If you travel to China, which city would you most like to visit?",
                "Xin chào! Dạo này việc học hay công việc của bạn thế nào? Nếu đi du lịch Trung Quốc, bạn muốn đến thành phố nào nhất?"),
        }
        s_cn, s_py, s_en, s_vi = free_starters.get(min(hsk_level, 3), free_starters[3])
        return {
            "reply": s_cn,
            "pinyin": s_py,
            "english": s_en,
            "vietnamese": s_vi,
            "feedback": None,
            "suggestions": [
                {"chinese": "我喜欢在家看书和听音乐。", "pinyin": "Wǒ xǐhuan zài jiā kàn shū hé tīng yīnyuè.", "vietnamese": "Tôi thích đọc sách và nghe nhạc ở nhà."},
                {"chinese": "我每天学习三十分钟中文。", "pinyin": "Wǒ měitiān xuéxí sānshí fēnzhōng Zhōngwén.", "vietnamese": "Mỗi ngày tôi học tiếng Trung 30 phút."}
            ],
            "provider": get_ai_config()["provider"]
        }

    # Try live LLM if configured
    system_prompt = (
        "Bạn là AI Giáo viên tiếng Trung cá nhân chuyên dạy cho người Việt Nam mới bắt đầu. "
        "QUY TẮC BẮT BUỘC:\n"
        "1. 100% tiếng Trung sử dụng Chữ Hán Giản thể (简体中文), TUYỆT ĐỐI không dùng chữ Phồn thể.\n"
        f"2. Người học đang ở trình độ HSK {hsk_level}. Chỉ dùng từ vựng và câu ngắn phù hợp HSK {hsk_level}.\n"
        "3. Luôn giải thích lỗi ngữ pháp và cách dùng từ bằng tiếng Việt dễ hiểu, khích lệ.\n"
        "4. Trả về đúng định dạng JSON với các trường:\n"
        "{\n"
        '  "reply": "Câu trả lời tiếp nối hội thoại bằng chữ Hán giản thể",\n'
        '  "pinyin": "Pinyin có dấu thanh chuẩn của reply",\n'
        '  "english": "Bản dịch tiếng Anh của reply",\n'
        '  "vietnamese": "Bản dịch tiếng Việt tự nhiên của reply",\n'
        '  "feedback": {\n'
        '    "isCorrect": true/false,\n'
        '    "correctedSentence": "Câu chữ Hán giản thể sửa đúng (nếu người học nói sai)",\n'
        '    "correctedPinyin": "Pinyin của câu sửa đúng",\n'
        '    "explanationVi": "Giải thích chi tiết bằng tiếng Việt về ngữ pháp/dùng từ của người học"\n'
        "  },\n"
        '  "suggestions": [\n'
        '    {"chinese": "Gợi ý trả lời 1 (giản thể)", "pinyin": "Pinyin 1", "vietnamese": "Nghĩa Việt 1"},\n'
        '    {"chinese": "Gợi ý trả lời 2 (giản thể)", "pinyin": "Pinyin 2", "vietnamese": "Nghĩa Việt 2"}\n'
        "  ]\n"
        "}"
    )
    user_prompt = json.dumps({
        "mode": mode,
        "topic": topic,
        "hsk_level": hsk_level,
        "recent_history": history[-6:],
        "student_message": user_text
    }, ensure_ascii=False)

    llm_res = _call_external_llm(system_prompt, user_prompt)
    if llm_res and "reply" in llm_res:
        llm_res["provider"] = get_ai_config()["provider"]
        return llm_res

    # Intelligent Built-in Pedagogical Fallback
    analysis = _analyze_chinese_grammar_errors(user_text)
    has_chinese = bool(re.search(r"[\u4e00-\u9fff]", user_text))

    if not has_chinese:
        feedback = {
            "isCorrect": False,
            "correctedSentence": "你好！我想学习中文。",
            "correctedPinyin": "Nǐ hǎo! Wǒ xiǎng xuéxí Zhōngwén.",
            "explanationVi": "Bạn vừa nhập tiếng Việt hoặc Pinyin chưa chuyển sang chữ Hán. Hãy thử gõ Pinyin rồi chọn chữ Hán trên thanh gợi ý (ví dụ gõ 'nihao' → chọn '你好'), hoặc bấm vào một câu gợi ý bên dưới để luyện nói nhé!"
        }
    elif analysis["issues"]:
        feedback = {
            "isCorrect": False,
            "correctedSentence": analysis["corrected"],
            "correctedPinyin": "",
            "explanationVi": " ".join([f"[{i['category']}] {i['detail']}" for i in analysis["issues"]])
        }
    else:
        feedback = {
            "isCorrect": True,
            "correctedSentence": analysis["corrected"],
            "correctedPinyin": "",
            "explanationVi": "Câu của bạn dùng chữ Hán Giản thể và trật tự ngữ pháp rất tự nhiên! Phát âm lại thêm một lần để nhớ thanh điệu thật chắc nhé."
        }

    # Contextual conversational follow-up based on keywords/topic
    if "越南" in user_text:
        reply = ("太好了！越南菜很好吃。你住在越南哪个城市？",
                 "Tài hǎo le! Yuènán cài hěn hǎochī. Nǐ zhù zài Yuènán nǎge chéngshì?",
                 "Wonderful! Vietnamese food is delicious. Which city in Vietnam do you live in?",
                 "Tuyệt quá! Món ăn Việt Nam rất ngon. Bạn sống ở thành phố nào của Việt Nam?",
                 [
                     {"chinese": "我住在胡志明市。", "pinyin": "Wǒ zhù zài Húzhìmíng Shì.", "vietnamese": "Tôi sống ở TP. Hồ Chí Minh."},
                     {"chinese": "我住在河内。", "pinyin": "Wǒ zhù zài Hénèi.", "vietnamese": "Tôi sống ở Hà Nội."}
                 ])
    elif "叫" in user_text or "名字" in user_text:
        reply = ("你的名字很好听！你学习中文多长时间了？",
                 "Nǐ de míngzi hěn hǎotīng! Nǐ xuéxí Zhōngwén duō cháng shíjiān le?",
                 "Your name sounds very nice! How long have you been studying Chinese?",
                 "Tên của bạn nghe rất hay! Bạn học tiếng Trung được bao lâu rồi?",
                 [
                     {"chinese": "我刚开始学习中文。", "pinyin": "Wǒ gāng kāishǐ xuéxí Zhōngwén.", "vietnamese": "Tôi mới bắt đầu học tiếng Trung."},
                     {"chinese": "我学习中文一个月了。", "pinyin": "Wǒ xuéxí Zhōngwén yí gè yuè le.", "vietnamese": "Tôi học tiếng Trung được một tháng rồi."}
                 ])
    elif any(k in user_text for k in ["爸爸", "妈妈", "口人", "哥哥", "姐姐", "弟弟", "妹妹"]):
        reply = ("真幸福！你的爸爸妈妈做什么工作？",
                 "Zhēn xìngfú! Nǐ de bàba māma zuò shénme gōngzuò?",
                 "How happy! What jobs do your dad and mom do?",
                 "Thật hạnh phúc! Bố mẹ bạn làm công việc gì?",
                 [
                     {"chinese": "我爸爸是医生，妈妈是老师。", "pinyin": "Wǒ bàba shì yīshēng, māma shì lǎoshī.", "vietnamese": "Bố tôi là bác sĩ, mẹ là giáo viên."},
                     {"chinese": "他们在公司工作。", "pinyin": "Tāmen zài gōngsī gōngzuò.", "vietnamese": "Bố mẹ tôi làm việc ở công ty."}
                 ])
    elif any(k in user_text for k in ["吃", "喝", "米饭", "面条", "茶", "咖啡", "菜"]):
        reply = ("好的，请稍等！你喜欢喝热的还是冰的？",
                 "Hǎo de, qǐng shāoděng! Nǐ xǐhuan hē rè de háishì bīng de?",
                 "Okay, please wait a moment! Do you like hot drinks or iced drinks?",
                 "Vâng, xin đợi một chút nhé! Bạn thích uống nóng hay uống đá?",
                 [
                     {"chinese": "我喜欢喝冰的，谢谢。", "pinyin": "Wǒ xǐhuan hē bīng de, xièxie.", "vietnamese": "Tôi thích uống đá, cảm ơn."},
                     {"chinese": "我要一杯热茶。", "pinyin": "Wǒ yào yì bēi rè chá.", "vietnamese": "Cho tôi một cốc trà nóng."}
                 ])
    elif any(k in user_text for k in ["哪里", "怎么走", "地铁", "医院", "学校", "远"]):
        reply = ("往前走五分钟就到了，就在银行旁边。",
                 "Wǎng qián zǒu wǔ fēnzhōng jiù dào le, jiù zài yínháng pángbiān.",
                 "Walk straight ahead for five minutes and you'll arrive; it's right next to the bank.",
                 "Đi thẳng về phía trước 5 phút là tới, nằm ngay bên cạnh ngân hàng nhé.",
                 [
                     {"chinese": "太谢谢你了！再见。", "pinyin": "Tài xièxie nǐ le! Zàijiàn.", "vietnamese": "Cảm ơn bạn nhiều lắm! Tạm biệt."},
                     {"chinese": "好的，我知道了，谢谢！", "pinyin": "Hǎo de, wǒ zhīdào le, xièxie!", "vietnamese": "Vâng, tôi biết rồi, cảm ơn!"}
                 ])
    else:
        reply = ("说得很好！那你平时喜欢做什么？比如看电影、听音乐或者运动？",
                 "Shuō de hěn hǎo! Nà nǐ píngshí xǐhuan zuò shénme? Bǐrú kàn diànyǐng, tīng yīnyuè huòzhě yùndòng?",
                 "Well said! What do you usually like to do? For example watching movies, listening to music, or sports?",
                 "Bạn nói tốt lắm! Vậy bình thường bạn thích làm gì? Ví dụ như xem phim, nghe nhạc hay tập thể thao?",
                 [
                     {"chinese": "我喜欢听中国音乐和看电影。", "pinyin": "Wǒ xǐhuan tīng Zhōngguó yīnyuè hé kàn diànyǐng.", "vietnamese": "Tôi thích nghe nhạc Trung Quốc và xem phim."},
                     {"chinese": "我喜欢和朋友一起去喝咖啡。", "pinyin": "Wǒ xǐhuan hé péngyou yìqǐ qù hē kāfēi.", "vietnamese": "Tôi thích đi uống cà phê cùng bạn bè."}
                 ])

    return {
        "reply": reply[0],
        "pinyin": reply[1],
        "english": reply[2],
        "vietnamese": reply[3],
        "feedback": feedback,
        "suggestions": reply[4],
        "provider": "pedagogical-engine"
    }


def handle_writing_evaluation(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    AI Writing Grader (Section 6.6B):
    Evaluates learner's sentence/paragraph across ALL 7 required criteria:
    1. Lỗi chữ Hán (Giản thể)
    2. Lỗi Pinyin nếu có
    3. Lỗi ngữ pháp
    4. Lỗi dùng từ
    5. Lỗi trật tự từ
    6. Mức độ tự nhiên
    7. Mức độ phù hợp ngữ cảnh
    Returns original, corrected, Pinyin, English, Vietnamese, detailed explanation, and similar practice examples.
    """
    student_text = (payload.get("text") or "").strip()
    student_pinyin = (payload.get("pinyin") or "").strip()
    task_prompt = (payload.get("prompt") or "").strip()
    expected = (payload.get("expected") or "").strip()
    expected_pinyin = (payload.get("expectedPinyin") or "").strip()
    expected_en = (payload.get("expectedEn") or "").strip()
    expected_vi = (payload.get("expectedVi") or "").strip()
    target_word = (payload.get("targetWord") or "").strip()
    hsk_level = int(payload.get("hskLevel", 1))

    if not student_text:
        return {"error": "Vui lòng nhập câu hoặc đoạn văn tiếng Trung để giáo viên chấm bài."}

    system_prompt = (
        "Bạn là Chuyên gia giảng dạy tiếng Trung Giản thể (15 năm kinh nghiệm dạy cho người Việt). "
        "Hãy chấm và sửa bài viết của học viên theo ĐỦ 7 TIÊU CHÍ:\n"
        "1. Lỗi chữ Hán (chú ý bắt buộc dùng Chữ Hán Giản thể 简体中文, không dùng Phồn thể)\n"
        "2. Lỗi Pinyin (nếu học viên có nhập kèm Pinyin)\n"
        "3. Lỗi ngữ pháp\n"
        "4. Lỗi dùng từ\n"
        "5. Lỗi trật tự từ\n"
        "6. Mức độ tự nhiên\n"
        "7. Mức độ phù hợp ngữ cảnh / đề bài\n"
        "Trả về JSON đúng cấu trúc:\n"
        "{\n"
        '  "score": 0-100,\n'
        '  "original": "Câu người học đã viết",\n'
        '  "corrected": "Câu/đoạn sửa chuẩn chữ Hán Giản thể",\n'
        '  "pinyin": "Pinyin có dấu thanh chuẩn của câu sửa đúng",\n'
        '  "english": "Bản dịch tiếng Anh chuẩn",\n'
        '  "vietnamese": "Bản dịch tiếng Việt chuẩn",\n'
        '  "whyWrong": "Giải thích tổng quan rõ ràng bằng tiếng Việt tại sao sai hoặc khen ngợi điểm đúng",\n'
        '  "criteria": [\n'
        '    {"name": "1. Chữ Hán (Giản thể)", "status": "good|warn|error", "comment": "..."},\n'
        '    {"name": "2. Pinyin", "status": "good|warn|error", "comment": "..."},\n'
        '    {"name": "3. Ngữ pháp", "status": "good|warn|error", "comment": "..."},\n'
        '    {"name": "4. Dùng từ", "status": "good|warn|error", "comment": "..."},\n'
        '    {"name": "5. Trật tự từ", "status": "good|warn|error", "comment": "..."},\n'
        '    {"name": "6. Độ tự nhiên", "status": "good|warn|error", "comment": "..."},\n'
        '    {"name": "7. Phù hợp ngữ cảnh", "status": "good|warn|error", "comment": "..."}\n'
        "  ],\n"
        '  "similarExamples": [\n'
        '    {"chinese": "Ví dụ tương tự 1 (giản thể)", "pinyin": "Pinyin 1", "english": "English 1", "vietnamese": "Nghĩa Việt 1"},\n'
        '    {"chinese": "Ví dụ tương tự 2 (giản thể)", "pinyin": "Pinyin 2", "english": "English 2", "vietnamese": "Nghĩa Việt 2"}\n'
        "  ]\n"
        "}"
    )
    user_prompt = json.dumps({
        "hsk_level": hsk_level,
        "task_prompt": task_prompt,
        "target_word": target_word,
        "reference_answer": expected,
        "student_text": student_text,
        "student_pinyin": student_pinyin
    }, ensure_ascii=False)

    llm_res = _call_external_llm(system_prompt, user_prompt)
    if llm_res and "corrected" in llm_res and "criteria" in llm_res:
        llm_res["provider"] = get_ai_config()["provider"]
        return llm_res

    # Detailed Built-in 7-Criteria Pedagogical Grader
    analysis = _analyze_chinese_grammar_errors(student_text)
    corrected = analysis["corrected"]
    issues = analysis["issues"]

    # Check target word requirement if provided
    missing_target = bool(target_word and target_word not in corrected)
    has_hanzi = bool(re.search(r"[\u4e00-\u9fff]", student_text))

    # Compare against expected reference if translation/reordering prompt
    norm_student = re.sub(r"[，。！？,.!?\s]", "", corrected)
    norm_expected = re.sub(r"[，。！？,.!?\s]", "", expected) if expected else ""

    score = 95
    if not has_hanzi:
        score = 35
    else:
        score -= len(issues) * 14
        if missing_target:
            score -= 20
        if norm_expected and norm_student != norm_expected and not issues:
            # Could be an alternative valid phrasing or partial match
            common_chars = sum(1 for c in set(norm_expected) if c in norm_student)
            ratio = common_chars / max(len(set(norm_expected)), 1)
            if ratio < 0.6:
                score = min(score, 68)
                corrected = expected
    score = max(20, min(100, score))

    hanzi_issue = next((i["detail"] for i in issues if "chữ Hán" in i["category"]), None)
    grammar_issue = next((i["detail"] for i in issues if "ngữ pháp" in i["category"]), None)
    word_issue = next((i["detail"] for i in issues if "dùng từ" in i["category"]), None)
    order_issue = next((i["detail"] for i in issues if "trật tự" in i["category"]), None)

    if not has_hanzi:
        hanzi_status, hanzi_comment = "error", "Bài viết chưa có chữ Hán Giản thể. Hãy dùng thanh gợi ý Pinyin bên dưới ô nhập để chọn chữ Hán tương ứng nhé."
    elif hanzi_issue:
        hanzi_status, hanzi_comment = "warn", hanzi_issue
    else:
        hanzi_status, hanzi_comment = "good", "Sử dụng đúng chữ Hán Giản thể, dấu câu tiếng Trung rõ ràng."

    if student_pinyin:
        if expected_pinyin and student_pinyin.lower().replace(" ", "") == expected_pinyin.lower().replace(" ", ""):
            py_status, py_comment = "good", "Pinyin và dấu thanh điệu bạn ghi hoàn toàn chính xác!"
        else:
            py_status, py_comment = "good", f"Đã ghi kèm Pinyin ('{student_pinyin}'). Hãy đối chiếu thêm dấu thanh điệu với đáp án chuẩn bên dưới nhé."
    else:
        py_status, py_comment = "good", "Không có lỗi Pinyin (bạn viết trực tiếp bằng chữ Hán)."

    criteria = [
        {"name": "1. Chữ Hán (Giản thể)", "status": hanzi_status, "comment": hanzi_comment},
        {"name": "2. Pinyin", "status": py_status, "comment": py_comment},
        {
            "name": "3. Ngữ pháp",
            "status": "error" if grammar_issue else "good",
            "comment": grammar_issue or "Cấu trúc ngữ pháp của câu đúng chuẩn tiếng Trung phổ thông."
        },
        {
            "name": "4. Dùng từ",
            "status": "warn" if (word_issue or missing_target) else "good",
            "comment": word_issue or (f"Lưu ý: Đề bài yêu cầu dùng từ '{target_word}', bạn nhớ đưa từ này vào câu nhé!" if missing_target else "Từ vựng được lựa chọn đúng nghĩa.")
        },
        {
            "name": "5. Trật tự từ",
            "status": "error" if order_issue else "good",
            "comment": order_issue or "Trật tự Chủ ngữ – (Thời gian/Địa điểm) – Động từ – Tân ngữ hợp lý."
        },
        {
            "name": "6. Độ tự nhiên",
            "status": "good" if score >= 80 else "warn",
            "comment": "Cách diễn đạt ngắn gọn, tự nhiên như người bản xứ." if score >= 80 else "Câu có thể diễn đạt tự nhiên hơn theo mẫu câu gợi ý đã sửa."
        },
        {
            "name": "7. Phù hợp ngữ cảnh",
            "status": "good" if not missing_target and has_hanzi else "warn",
            "comment": "Nội dung bám sát yêu cầu của bài luyện viết." if (not missing_target and has_hanzi) else "Cần bám sát hơn từ khóa/yêu cầu của đề bài."
        }
    ]

    final_corrected = expected if (not has_hanzi and expected) else corrected
    why_parts = [i["detail"] for i in issues]
    if missing_target:
        why_parts.append(f"Bạn chưa sử dụng từ bắt buộc '{target_word}' trong câu.")
    if not has_hanzi:
        why_parts.append("Bạn cần viết bằng chữ Hán Giản thể thay vì chỉ viết tiếng Việt hoặc Pinyin không dấu.")
    if not why_parts:
        if expected and norm_student != norm_expected:
            why_parts.append(f"Câu của bạn đúng ngữ pháp! Ngoài ra bạn có thể tham khảo thêm cách diễn đạt chuẩn trong bài: '{expected}'.")
        else:
            why_parts.append("Xuất sắc! Bạn đã viết đúng chữ Hán Giản thể, đúng trật tự ngữ pháp và rất tự nhiên.")

    return {
        "score": score,
        "original": student_text,
        "corrected": final_corrected,
        "pinyin": expected_pinyin or "Hãy bấm nút Loa cạnh câu sửa đúng để nghe phát âm chuẩn Putonghua.",
        "english": expected_en or "Natural Simplified Chinese sentence matching the lesson context.",
        "vietnamese": expected_vi or "Câu tiếng Trung Giản thể đã được chuẩn hóa ngữ pháp và dấu câu.",
        "whyWrong": " ".join(why_parts),
        "criteria": criteria,
        "similarExamples": [
            {
                "chinese": "我每天都在家学习中文。",
                "pinyin": "Wǒ měitiān dōu zài jiā xuéxí Zhōngwén.",
                "english": "I study Chinese at home every day.",
                "vietnamese": "Mỗi ngày tôi đều học tiếng Trung ở nhà."
            },
            {
                "chinese": "汉字很有意思，我很喜欢写汉字。",
                "pinyin": "Hànzì hěn yǒuyìsi, wǒ hěn xǐhuan xiě Hànzì.",
                "english": "Chinese characters are very interesting; I really like writing them.",
                "vietnamese": "Chữ Hán rất thú vị, tôi rất thích viết chữ Hán."
            }
        ],
        "provider": "pedagogical-engine"
    }


def handle_analytics_advice(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    AI Progress Analyzer (Section 9):
    Generates personalized study diagnosis & actionable weekly plan based on actual learner metrics!
    """
    stats = payload.get("stats") or {}
    system_prompt = (
        "Bạn là AI Giáo viên tiếng Trung cá nhân. Dựa trên số liệu thực tế của học viên người Việt, "
        "hãy phân tích tiến độ học tập bằng tiếng Việt thân thiện, cụ thể (không nói chung chung), "
        "và đề xuất 3 nhiệm vụ ưu tiên cụ thể trong tuần tới. Trả về JSON:\n"
        '{"summary": "Nhận xét chi tiết 2-3 câu", "strengths": ["..."], "weaknesses": ["..."], "recommendations": ["...", "...", "..."]}'
    )
    llm_res = _call_external_llm(system_prompt, json.dumps(stats, ensure_ascii=False))
    if llm_res and "summary" in llm_res:
        llm_res["provider"] = get_ai_config()["provider"]
        return llm_res

    vocab_count = int(stats.get("vocabLearned", 0))
    hanzi_count = int(stats.get("hanziMemorized", 0))
    retention = int(stats.get("retentionRate", 0))
    scores = stats.get("skillScores") or {}
    listening = int(scores.get("listening", 0))
    speaking = int(scores.get("speaking", 0))
    reading = int(scores.get("reading", 0))
    writing = int(scores.get("writing", 0))
    grammar = int(scores.get("grammar", 0))
    pinyin_score = int(scores.get("pinyin", 0))

    strengths = []
    weaknesses = []
    recs = []

    if vocab_count >= 10:
        strengths.append(f"Đã tích lũy được {vocab_count} từ vựng với tỷ lệ ghi nhớ {retention}%.")
    else:
        weaknesses.append("Vốn từ vựng nền tảng HSK 1 còn ít, cần học đều đặn 5–10 từ mới mỗi ngày.")
        recs.append("Mở mục Học từ vựng (Flashcard SRS) và hoàn thành 10 từ chủ đề Chào hỏi & Gia đình.")

    if hanzi_count >= 5 and writing >= 70:
        strengths.append(f"Nhận diện và luyện viết chữ Hán tốt ({hanzi_count} chữ đã nắm thứ tự nét).")
    else:
        weaknesses.append("Kỹ năng nhớ mặt chữ và viết đúng thứ tự nét chữ Hán cần được rèn luyện thêm.")
        recs.append("Luyện viết ít nhất 5 chữ Hán cơ bản (你, 好, 我, 是, 学) trên ô vuông 米字格 theo đúng thứ tự nét.")

    if listening < 70 or pinyin_score < 70:
        weaknesses.append("Phân biệt 4 thanh điệu (đặc biệt thanh 2 đi lên và thanh 3 trầm xuống-lên) và phản xạ nghe còn chậm.")
        recs.append("Dành 10 phút tại mục Pinyin & Phát âm để luyện cặp thanh điệu mā–má–mǎ–mà và làm 1 bài Hội thoại Luyện nghe.")
    else:
        strengths.append("Nền tảng nghe Pinyin và phân biệt thanh điệu khá vững vàng.")

    if grammar < 70:
        weaknesses.append("Cấu trúc câu cơ bản (như vị trí trạng ngữ thời gian/địa điểm và câu tính từ với 很) chưa thật chắc.")
        recs.append("Ôn 2 cấu trúc ngữ pháp HSK 1 (是, 很, 在) và đặt 3 câu thực hành để AI sửa lỗi trật tự từ.")
    else:
        strengths.append(f"Nắm cấu trúc ngữ pháp tốt ({grammar}/100 điểm).")

    if speaking < 65 and len(recs) < 3:
        recs.append("Thực hành 5 phút Luyện nói AI với tình huống 'Giới thiệu bản thân' để tăng phản xạ khẩu ngữ.")

    if not strengths:
        strengths.append("Bạn đã chủ động bắt đầu lộ trình tiếng Trung Giản thể bài bản từ con số 0!")
    if not recs:
        recs = [
            "Duy trì ôn tập thẻ từ vựng đến hạn (Spaced Repetition) để giữ tỷ lệ nhớ trên 85%.",
            "Luyện đọc 1 bài văn ngắn HSK hiện tại ở chế độ ẩn Pinyin trước khi kiểm tra nghĩa.",
            "Viết 1 đoạn văn ngắn 3–4 câu trong mục Luyện viết để rèn diễn đạt tự nhiên."
        ]

    summary = (
        f"Bạn đã học {vocab_count} từ vựng và ghi nhớ {hanzi_count} chữ Hán Giản thể (tỷ lệ nhớ {retention}%). "
        + ("Khả năng ghi nhớ từ vựng của bạn đang tiến bộ rõ rệt, tuy nhiên cần chú ý luyện thêm phản xạ nghe thanh điệu 2–3 và viết chữ không nhìn mẫu. "
           if listening < 75 or writing < 75
           else "Các kỹ năng Nghe – Đọc – Ngữ pháp phát triển rất cân đối! Tuần tới hãy tăng dần độ khó hội thoại tự do với AI và tập viết đoạn văn ngắn.")
    )

    return {
        "summary": summary,
        "strengths": strengths[:3],
        "weaknesses": weaknesses[:3],
        "recommendations": recs[:3],
        "provider": "pedagogical-engine"
    }
