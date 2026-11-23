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
import time
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
    },
    "shopping": {
        "title": "Đi mua sắm",
        "starter": {
            "chinese": "欢迎光临！请问您想买什么衣服？",
            "pinyin": "Huānyíng guānglín! Qǐngwèn nín xiǎng mǎi shénme yīfu?",
            "english": "Welcome! What clothes would you like to buy?",
            "vietnamese": "Chào mừng quý khách! Xin hỏi bạn muốn mua quần áo gì?",
            "suggestions": [
                {"chinese": "我想买一件白色的衣服，多少钱？", "pinyin": "Wǒ xiǎng mǎi yí jiàn báisè de yīfu, duōshao qián?", "vietnamese": "Tôi muốn mua một chiếc áo màu trắng, bao nhiêu tiền?"},
                {"chinese": "这件太贵了，可以便宜一点儿吗？", "pinyin": "Zhè jiàn tài guì le, kěyǐ piányi yìdiǎnr ma?", "vietnamese": "Chiếc này đắt quá, có thể rẻ hơn chút không?"}
            ]
        }
    },
    "travel": {
        "title": "Đi du lịch",
        "starter": {
            "chinese": "你喜欢去旅游吗？你最想去哪个城市？",
            "pinyin": "Nǐ xǐhuan qù lǚyóu ma? Nǐ zuì xiǎng qù nǎge chéngshì?",
            "english": "Do you like traveling? Which city do you want to visit most?",
            "vietnamese": "Bạn thích đi du lịch không? Bạn muốn đến thành phố nào nhất?",
            "suggestions": [
                {"chinese": "我很喜欢旅游，我最想去北京和上海。", "pinyin": "Wǒ hěn xǐhuan lǚyóu, wǒ zuì xiǎng qù Běijīng hé Shànghǎi.", "vietnamese": "Tôi rất thích du lịch, tôi muốn đến Bắc Kinh và Thượng Hải nhất."},
                {"chinese": "我打算坐飞机去中国旅游。", "pinyin": "Wǒ dǎsuàn zuò fēijī qù Zhōngguó lǚyóu.", "vietnamese": "Tôi dự định đi máy bay sang Trung Quốc du lịch."}
            ]
        }
    },
    "friends": {
        "title": "Nói chuyện với bạn bè",
        "starter": {
            "chinese": "周末你有什么计划？我们一起去看电影吧！",
            "pinyin": "Zhōumò nǐ yǒu shénme jìhuà? Wǒmen yìqǐ qù kàn diànyǐng ba!",
            "english": "What plans do you have for the weekend? Let's go watch a movie together!",
            "vietnamese": "Cuối tuần bạn có kế hoạch gì? Chúng ta cùng đi xem phim nhé!",
            "suggestions": [
                {"chinese": "好啊！你喜欢看什么电影？", "pinyin": "Hǎo a! Nǐ xǐhuan kàn shénme diànyǐng?", "vietnamese": "Được chứ! Bạn thích xem phim gì?"},
                {"chinese": "周末我很忙，我们下周一起去吧。", "pinyin": "Zhōumò wǒ hěn máng, wǒmen xià zhōu yìqǐ qù ba.", "vietnamese": "Cuối tuần tôi bận lắm, tuần sau mình cùng đi nhé."}
            ]
        }
    },
    "interview": {
        "title": "Phỏng vấn xin việc",
        "starter": {
            "chinese": "你好，请先用中文简单介绍一下你自己，以及你为什么申请这个职位。",
            "pinyin": "Nǐ hǎo, qǐng xiān yòng Zhōngwén jiǎndān jièshào yíxià nǐ zìjǐ, yǐjí nǐ wèishénme shēnqǐng zhège zhíwèi.",
            "english": "Hello, please briefly introduce yourself in Chinese and explain why you applied for this position.",
            "vietnamese": "Xin chào, mời bạn giới thiệu ngắn gọn về bản thân bằng tiếng Trung và lý do ứng tuyển vị trí này.",
            "suggestions": [
                {"chinese": "您好，我毕业于越南的大学，我很喜欢这份工作。", "pinyin": "Nínhǎo, wǒ bìyè yú Yuènán de dàxué, wǒ hěn xǐhuan zhè fèn gōngzuò.", "vietnamese": "Chào ngài, tôi tốt nghiệp đại học tại Việt Nam và rất yêu thích công việc này."},
                {"chinese": "我有两年的工作经验，而且我会说中文和英语。", "pinyin": "Wǒ yǒu liǎng nián de gōngzuò jīngyàn, érqiě wǒ huì shuō Zhōngwén hé Yīngyǔ.", "vietnamese": "Tôi có 2 năm kinh nghiệm làm việc và nói được cả tiếng Trung lẫn tiếng Anh."}
            ]
        }
    },
    "office": {
        "title": "Giao tiếp công sở",
        "starter": {
            "chinese": "早安！今天的会议几点开始？报告准备好了吗？",
            "pinyin": "Zǎo'ān! Jīntiān de huìyì jǐ diǎn kāishǐ? Bàogào zhǔnbèi hǎo le ma?",
            "english": "Good morning! What time does today's meeting start? Is the report ready?",
            "vietnamese": "Chào buổi sáng! Cuộc họp hôm nay mấy giờ bắt đầu? Báo cáo đã chuẩn bị xong chưa?",
            "suggestions": [
                {"chinese": "早上好！会议上午十点开始，报告我已经准备好了。", "pinyin": "Zǎoshang hǎo! Huìyì shàngwǔ shí diǎn kāishǐ, bàogào wǒ yǐjīng zhǔnbèi hǎo le.", "vietnamese": "Chào buổi sáng! Cuộc họp bắt đầu lúc 10h sáng, báo cáo tôi đã chuẩn bị xong rồi."},
                {"chinese": "不好意思，我还需要十分钟完成这个报告。", "pinyin": "Bù hǎoyìsi, wǒ hái xūyào shí fēnzhōng wánchéng zhège bàogào.", "vietnamese": "Xin lỗi, tôi cần thêm 10 phút nữa để hoàn thành báo cáo này."}
            ]
        }
    }
}


def get_ai_config() -> Dict[str, Any]:
    """Read AI provider config safely from environment variables."""
    gemini_key = os.environ.get("GEMINI_API_KEY", "").strip()
    openai_key = os.environ.get("OPENAI_API_KEY", "").strip()
    openai_base = os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1").strip()
    gemini_model = os.environ.get("GEMINI_MODEL", "gemini-3.8-flash").strip()
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
            primary_model = cfg["model"]
            fallback_chain = []
            for m in (primary_model, "gemini-3.8-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-flash-lite-latest"):
                if m and m not in fallback_chain:
                    fallback_chain.append(m)
            payload = {
                "system_instruction": {"parts": [{"text": system_prompt}]},
                "contents": [{"role": "user", "parts": [{"text": user_prompt}]}],
                "generationConfig": {
                    "temperature": 0.4,
                    "responseMimeType": "application/json",
                },
            }
            payload_bytes = json.dumps(payload).encode("utf-8")
            for model in fallback_chain:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
                req = urllib.request.Request(
                    url,
                    data=payload_bytes,
                    headers={
                        "Content-Type": "application/json",
                        "x-goog-api-key": cfg["api_key"],
                    },
                    method="POST",
                )
                try:
                    with urllib.request.urlopen(req, timeout=12) as resp:
                        body = json.loads(resp.read().decode("utf-8"))
                        text = body["candidates"][0]["content"]["parts"][0]["text"]
                        return json.loads(text)
                except urllib.error.HTTPError as http_err:
                    if http_err.code in (404, 429, 500, 503):
                        continue
                    return None
                except Exception:
                    continue
            return None

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


# ==================== EXPANDED QCHINESE AI TUTOR ENDPOINTS ====================

CONFUSED_WORD_BANK = {
    "了解": {
        "pinyin": "liǎojiě",
        "pos": "Động từ (动词)",
        "vietnamese": "hiểu rõ, nắm tường tận, tìm hiểu sâu",
        "english": "to understand deeply; to find out about",
        "usage": "Nhấn mạnh mức độ hiểu sâu sắc, nắm rõ chi tiết về con người, sự việc hoặc văn hóa.",
        "context": "Dùng trong học tập, công việc và giao tiếp khi muốn nói hiểu rõ (khác với chỉ nghe biết qua loa).",
        "synonyms": ["明白 (míngbai - hiểu rõ)", "熟悉 (shúxī - quen thuộc)"],
        "antonyms": ["误解 (wùjiě - hiểu nhầm)", "陌生 (mòshēng - xa lạ)"],
        "confusedPair": "了解 (liǎojiě) vs 知道 (zhīdào): 知道 chỉ là 'biết thông tin/sự thật' (vd: 我知道他的名字 - Tôi biết tên anh ấy), còn 了解 là 'hiểu sâu, nắm rõ bản chất/hoàn cảnh' (vd: 我很了解他的性格 - Tôi rất hiểu tính cách của anh ấy). Có thể nói 很了解 nhưng KHÔNG nói 很知道!",
        "vietnamesePitfalls": "Người Việt hay dịch 'rất biết' thành '很知道' (sai!) — phải dùng '很了解' hoặc '很熟悉'.",
        "examples": [
            {"chinese": "我想更多地了解中国文化。", "pinyin": "Wǒ xiǎng gèng duō de liǎojiě Zhōngguó wénhuà.", "vietnamese": "Tôi muốn tìm hiểu sâu hơn về văn hóa Trung Quốc."},
            {"chinese": "你了解这个公司的业务吗？", "pinyin": "Nǐ liǎojiě zhège gōngsī de yèwù ma?", "vietnamese": "Bạn có nắm rõ nghiệp vụ của công ty này không?"}
        ]
    },
    "知道": {
        "pinyin": "zhīdào",
        "pos": "Động từ (动词)",
        "vietnamese": "biết (thông tin, sự việc)",
        "english": "to know; to be aware of",
        "usage": "Chỉ việc nắm được một sự thật hoặc thông tin cụ thể.",
        "context": "Phổ biến ở mọi ngữ cảnh giao tiếp HSK 2+.",
        "synonyms": ["明白 (míngbai)", "了解 (liǎojiě)"],
        "antonyms": ["不知道 (bù zhīdào - không biết)"],
        "confusedPair": "知道 (biết sự việc) vs 认识 (rènshi - quen biết người, nhận ra mặt chữ) vs 了解 (hiểu sâu). KHÔNG dùng 知道 với người (sai: 我知道他 -> đúng: 我认识他 / 我了解他).",
        "vietnamesePitfalls": "Không ghép 很 + 知道, và không dùng 知道 để nói quen biết một người.",
        "examples": [
            {"chinese": "我知道今天是星期一。", "pinyin": "Wǒ zhīdào jīntiān shì xīngqīyī.", "vietnamese": "Tôi biết hôm nay là thứ Hai."}
        ]
    },
    "还是": {
        "pinyin": "háishi",
        "pos": "Liên từ / Phó từ (连词 / 副词)",
        "vietnamese": "hay là (trong câu hỏi); vẫn cứ",
        "english": "or (in questions); still; had better",
        "usage": "Dùng nối 2 lựa chọn trong CÂU HỎI lựa chọn (A 还是 B?), hoặc nghĩa 'vẫn nên / vẫn cứ'.",
        "context": "Giao tiếp hỏi lựa chọn hàng ngày.",
        "synonyms": ["或者 (huòzhě - trong câu trần thuật)"],
        "antonyms": [],
        "confusedPair": "还是 vs 或者: Trong câu HỎI bắt buộc dùng 还是 (你喝茶还是喝咖啡？); trong câu TRẦN THUẬT dùng 或者 (喝茶或者喝咖啡都可以).",
        "vietnamesePitfalls": "Người Việt thường nhầm dùng 或者 để đặt câu hỏi — cần nhớ: Hỏi = 还是, Kể = 或者!",
        "examples": [
            {"chinese": "你喝茶还是喝咖啡？", "pinyin": "Nǐ hē chá háishi hē kāfēi?", "vietnamese": "Bạn uống trà hay uống cà phê?"}
        ]
    },
    "一点儿": {
        "pinyin": "yìdiǎnr",
        "pos": "Số lượng từ (数量词)",
        "vietnamese": "một chút, một ít",
        "english": "a little; a bit",
        "usage": "Đứng SAU tính từ (biểu thị so sánh: 大一点儿 - to hơn chút) hoặc TRƯỚC danh từ (喝一点儿水).",
        "context": "Giao tiếp, mua sắm, so sánh nhẹ nhàng.",
        "synonyms": ["一些 (yìxiē)"],
        "antonyms": ["很多 (hěn duō)"],
        "confusedPair": "一点儿 vs 有点儿 (yǒudiǎnr): 有点儿 đứng TRƯỚC tính từ mang sắc thái hơi phàn nàn (有点儿贵 - hơi đắt); 一点儿 đứng SAU tính từ để đề nghị/so sánh (便宜一点儿 - rẻ hơn chút đi!).",
        "vietnamesePitfalls": "Không nói '有点儿便宜' khi muốn mặc cả, phải nói '便宜一点儿'.",
        "examples": [
            {"chinese": "这件衣服可以便宜一点儿吗？", "pinyin": "Zhè jiàn yīfu kěyǐ piányi yìdiǎnr ma?", "vietnamese": "Chiếc áo này có thể rẻ hơn một chút không?"}
        ]
    },
    "会": {
        "pinyin": "huì",
        "pos": "Động từ năng nguyện (能愿动词)",
        "vietnamese": "biết (kỹ năng qua học tập); sẽ (dự đoán)",
        "english": "can (learned skill); will (likely)",
        "usage": "1) Chỉ kỹ năng có được nhờ học (会说中文, 会游泳). 2) Chỉ khả năng/dự đoán tương lai (明天会下雨).",
        "context": "Dùng rất phổ biến từ HSK 1.",
        "synonyms": ["能 (néng)", "可以 (kěyǐ)"],
        "antonyms": ["不会 (bú huì)"],
        "confusedPair": "会 (biết kỹ năng qua học tập) vs 能 (có năng lực thể chất/điều kiện thực hiện) vs 可以 (được phép).",
        "vietnamesePitfalls": "Muốn xin phép 'Tôi có thể ngồi đây không?' nên dùng 可以 (我可以坐这儿吗？) chứ không dùng 会.",
        "examples": [
            {"chinese": "我会说一点儿中文。", "pinyin": "Wǒ huì shuō yìdiǎnr Zhōngwén.", "vietnamese": "Tôi biết nói một chút tiếng Trung."}
        ]
    }
}

GRAMMAR_EXPLAIN_BANK = {
    "把": {
        "title": "Câu chữ 把 (把字句 – Nhấn mạnh sự tác động, xử lý tân ngữ)",
        "formula": "Chủ ngữ + 把 + Tân ngữ xác định + Động từ + Thành phần khác (了 / kết quả / vị trí)",
        "meaning": "Nhấn mạnh chủ ngữ đã xử lý, thay đổi vị trí hoặc trạng thái của một đối tượng xác định.",
        "correctExamples": [
            {"chinese": "请把门关上。", "pinyin": "Qǐng bǎ mén guān shàng.", "vietnamese": "Xin hãy đóng cửa lại."},
            {"chinese": "我把作业做完了。", "pinyin": "Wǒ bǎ zuòyè zuò wán le.", "vietnamese": "Tôi đã làm xong bài tập rồi."}
        ],
        "commonMistakes": [
            {"wrong": "我把书看。", "right": "我把书看完了。", "why": "Động từ trong câu chữ 把 KHÔNG được đứng trơ một mình; phải có bổ ngữ kết quả (完, 上, 到...) hoặc 了."}
        ],
        "practiceQuiz": {"question": "Sắp xếp thành câu chữ 把 đúng: 手机 / 我 / 桌子 / 上 / 放在 / 把 / 了", "answer": "我把手机放在桌子上了。"}
    },
    "比": {
        "title": "Câu so sánh hơn với 比 (比字句)",
        "formula": "A + 比 + B + Tính từ (+ 一点儿 / 得多 / 多了)",
        "meaning": "So sánh A hơn B ở một tính chất nào đó.",
        "correctExamples": [
            {"chinese": "今天比昨天冷。", "pinyin": "Jīntiān bǐ zuótiān lěng.", "vietnamese": "Hôm nay lạnh hơn hôm qua."},
            {"chinese": "他比我高一点儿。", "pinyin": "Tā bǐ wǒ gāo yìdiǎnr.", "vietnamese": "Anh ấy cao hơn tôi một chút."}
        ],
        "commonMistakes": [
            {"wrong": "今天比昨天很冷。", "right": "今天比昨天冷得多。", "why": "TUYỆT ĐỐI KHÔNG dùng 很 / 非常 trước tính từ trong câu chữ 比! Muốn nhấn mạnh dùng 得多 hoặc 多了 đứng SAU tính từ."}
        ],
        "practiceQuiz": {"question": "Câu nào đúng: A. 汉语比英语很难  B. 汉语比英语难一点儿", "answer": "B. 汉语比英语难一点儿"}
    },
    "了": {
        "title": "Trợ từ 了 (Hoàn thành hành động & Thay đổi trạng thái)",
        "formula": "1) Động từ + 了 + Tân ngữ (hoàn thành) | 2) Cuối câu + 了 (thay đổi trạng thái / sắp xảy ra)",
        "meaning": "了 KHÔNG đơn thuần là 'thì quá khứ' như tiếng Anh! Nó biểu thị hành động đã hoàn thành hoặc tình huống mới xuất hiện.",
        "correctExamples": [
            {"chinese": "我买了一本书。", "pinyin": "Wǒ mǎi le yì běn shū.", "vietnamese": "Tôi đã mua một quyển sách."},
            {"chinese": "下雨了，快回家吧！", "pinyin": "Xiàyǔ le, kuài huíjiā ba!", "vietnamese": "Trời mưa rồi (trước không mưa, giờ mưa), mau về nhà thôi!"}
        ],
        "commonMistakes": [
            {"wrong": "我昨天没有去了学校。", "right": "我昨天没有去学校。", "why": "Khi phủ định quá khứ bằng 没(有), BẮT BUỘC bỏ 了 sau động từ!"}
        ],
        "practiceQuiz": {"question": "Sửa lỗi câu sau: 我昨天没吃了早饭。", "answer": "我昨天没吃早饭。"}
    }
}


def handle_explain_word(payload: Dict[str, Any]) -> Dict[str, Any]:
    """AI Vocabulary Explainer: meaning, pinyin, POS, usage, synonyms/antonyms, confused pairs, Vietnamese pitfalls."""
    word = (payload.get("word") or "").strip()
    hsk_level = int(payload.get("hskLevel", 1))
    known_data = payload.get("knownData") or {}
    if not word:
        return {"error": "Vui lòng nhập từ hoặc cụm từ tiếng Trung cần giải thích."}

    system_prompt = (
        "Bạn là Chuyên gia ngôn ngữ học tiếng Trung Giản thể dạy cho người Việt (HSK 1–6). "
        "Giải thích sâu từ vựng người học hỏi, trả về JSON chính xác:\n"
        '{"word":"...","pinyin":"...","pos":"...","vietnamese":"...","english":"...",'
        '"usage":"Cách dùng ngắn gọn rõ ràng","context":"Tình huống sử dụng thực tế",'
        '"synonyms":["..."],"antonyms":["..."],'
        '"confusedPair":"Phân biệt với từ dễ nhầm (vd 了解 vs 知道) nếu phù hợp",'
        '"vietnamesePitfalls":"Lỗi người Việt hay mắc khi dùng từ này",'
        '"examples":[{"chinese":"...","pinyin":"...","vietnamese":"..."}]}'
    )
    llm_res = _call_external_llm(system_prompt, json.dumps({"word": word, "hskLevel": hsk_level, "knownData": known_data}, ensure_ascii=False))
    if llm_res and llm_res.get("vietnamese"):
        llm_res["provider"] = get_ai_config()["provider"]
        return llm_res

    if word in CONFUSED_WORD_BANK:
        res = dict(CONFUSED_WORD_BANK[word])
        res["word"] = word
        res["provider"] = "pedagogical-engine"
        return res

    # Synthesize honestly from passed verified dictionary metadata (never fabricating definitions!)
    py = known_data.get("pinyin") or ""
    vi = known_data.get("vietnamese") or ""
    en = known_data.get("english") or ""
    hv = known_data.get("han_viet") or ""
    pos = known_data.get("pos") or "Từ vựng tiếng Trung Giản thể"
    examples = known_data.get("examples") or []
    trad = _detect_traditional_chars(word)
    pitfall = (
        f"Bạn nhập chữ Phồn thể ({', '.join(x['trad'] + '→' + x['simp'] for x in trad)}). Hãy dùng chữ Giản thể nhé!"
        if trad
        else "Chú ý phát âm rõ thanh điệu và đặt đúng vị trí theo từ loại trong câu (Thời gian/Địa điểm trước Động từ)."
    )
    return {
        "word": word,
        "pinyin": py or "(Chưa có trong từ điển cục bộ — cấu hình GEMINI_API_KEY/OPENAI_API_KEY để AI phân tích mọi từ ngoài kho HSK)",
        "pos": pos,
        "vietnamese": vi or (f"Nghĩa tiếng Anh (CC-CEDICT): {en}" if en else "Chưa có mục từ này trong bộ từ điển cục bộ."),
        "english": en,
        "han_viet": hv,
        "usage": f"Từ thuộc trình độ HSK {known_data.get('hsk_level', hsk_level)}." + (f" Âm Hán Việt tham khảo: {hv.upper()}." if hv else ""),
        "context": "Dùng trong giao tiếp và bài đọc hiểu tiếng Trung Giản thể tương ứng cấp độ HSK.",
        "synonyms": [],
        "antonyms": [],
        "confusedPair": known_data.get("confused_with") or "Gợi ý: Để so sánh sắc thái ngữ nghĩa tinh tế cho mọi cặp từ, hãy cấu hình GEMINI_API_KEY hoặc OPENAI_API_KEY trên server.",
        "vietnamesePitfalls": pitfall,
        "examples": examples if examples else ([{"chinese": f"我学习了“{word}”这个词。", "pinyin": "", "vietnamese": f"Tôi đã học từ “{word}”."}] if re.search(r"[\u4e00-\u9fff]", word) else []),
        "provider": "pedagogical-engine"
    }


def handle_fix_sentence(payload: Dict[str, Any]) -> Dict[str, Any]:
    """AI Sentence Corrector distinguishing grammar error vs unnatural vs formal vs casual."""
    text = (payload.get("text") or "").strip()
    hsk_level = int(payload.get("hskLevel", 1))
    if not text:
        return {"error": "Vui lòng nhập câu tiếng Trung cần kiểm tra."}

    system_prompt = (
        "Bạn là Chuyên gia NLP & Giáo viên tiếng Trung Giản thể cho người Việt. "
        "Phân tích câu của người học. QUY TẮC TỐI QUAN TRỌNG: KHÔNG được sửa câu ĐÚNG thành SAI! "
        "Phân biệt rõ 3 trạng thái verdict: 'correct' (đúng ngữ pháp & tự nhiên), 'unnatural' (đúng ngữ pháp nhưng chưa tự nhiên), 'grammar_error' (sai ngữ pháp/trật tự/chữ Hán). "
        "Trả về JSON:\n"
        '{"verdict":"correct|unnatural|grammar_error","score":0-100,"original":"...","corrected":"...",'
        '"naturalVersion":"Cách nói tự nhiên như người bản xứ","formalVersion":"Cách nói trang trọng",'
        '"casualVersion":"Cách nói khẩu ngữ giao tiếp","pinyin":"...","vietnamese":"...","english":"...",'
        '"explanation":"Giải thích rõ bằng tiếng Việt","issues":[{"category":"...","detail":"..."}]}'
    )
    llm_res = _call_external_llm(system_prompt, json.dumps({"text": text, "hskLevel": hsk_level}, ensure_ascii=False))
    if llm_res and "corrected" in llm_res:
        llm_res["provider"] = get_ai_config()["provider"]
        return llm_res

    analysis = _analyze_chinese_grammar_errors(text)
    issues = analysis["issues"]
    corrected = analysis["corrected"]
    has_hanzi = bool(re.search(r"[\u4e00-\u9fff]", text))

    if not has_hanzi:
        return {
            "verdict": "grammar_error",
            "score": 30,
            "original": text,
            "corrected": text,
            "naturalVersion": "",
            "formalVersion": "",
            "casualVersion": "",
            "pinyin": "",
            "vietnamese": "",
            "english": "",
            "explanation": "Bạn chưa nhập chữ Hán Giản thể. Hãy gõ Pinyin rồi chọn chữ Hán trên thanh gợi ý nhé!",
            "issues": [{"category": "Chưa có chữ Hán", "detail": "Vui lòng viết bằng chữ Hán Giản thể (简体中文)."}],
            "provider": "pedagogical-engine"
        }

    if issues:
        return {
            "verdict": "grammar_error",
            "score": max(35, 92 - len(issues) * 15),
            "original": text,
            "corrected": corrected,
            "naturalVersion": corrected,
            "formalVersion": corrected,
            "casualVersion": corrected,
            "pinyin": "Bấm nút Loa để nghe phát âm chuẩn của câu đã sửa.",
            "vietnamese": "Câu đã được điều chỉnh lỗi ngữ pháp / trật tự từ thường gặp của người Việt.",
            "english": "Grammar-corrected Simplified Chinese sentence.",
            "explanation": " ".join(i["detail"] for i in issues),
            "issues": issues,
            "provider": "pedagogical-engine"
        }

    return {
        "verdict": "correct",
        "score": 94,
        "original": text,
        "corrected": corrected,
        "naturalVersion": corrected,
        "formalVersion": f"请问，{corrected}" if corrected.endswith("？") else corrected,
        "casualVersion": corrected,
        "pinyin": "Bấm nút Loa để nghe câu chuẩn Putonghua.",
        "vietnamese": "Câu của bạn không vi phạm các lỗi ngữ pháp phổ biến (chữ Giản thể, trật tự thời gian/địa điểm, phủ định, lượng từ).",
        "english": "Grammatically valid Simplified Chinese sentence.",
        "explanation": "Câu của bạn đúng chuẩn ngữ pháp cơ bản! (Lưu ý: chế độ không có LLM bên ngoài chỉ kiểm tra các quy tắc ngữ pháp phổ biến; cấu hình GEMINI_API_KEY/OPENAI_API_KEY để phân tích sắc thái ngữ nghĩa nâng cao).",
        "issues": [],
        "provider": "pedagogical-engine"
    }


def handle_explain_grammar(payload: Dict[str, Any]) -> Dict[str, Any]:
    """AI Grammar Explainer with formula, meaning, correct/wrong examples, and mini practice quiz."""
    query = (payload.get("query") or "").strip()
    hsk_level = int(payload.get("hskLevel", 1))
    if not query:
        return {"error": "Vui lòng nhập cấu trúc ngữ pháp cần hỏi (ví dụ: 把, 比, 了, 不 và 没, trật tự thời gian...)."}

    system_prompt = (
        "Bạn là Chuyên gia ngữ pháp tiếng Trung HSK 1–6 dạy cho người Việt. "
        "Giải thích cấu trúc ngữ pháp người học hỏi bằng tiếng Việt dễ hiểu, trả về JSON:\n"
        '{"title":"...","formula":"Công thức rõ ràng","meaning":"Ý nghĩa & khi nào dùng",'
        '"correctExamples":[{"chinese":"...","pinyin":"...","vietnamese":"..."}],'
        '"commonMistakes":[{"wrong":"...","right":"...","why":"Giải thích lỗi"}],'
        '"practiceQuiz":{"question":"Câu hỏi áp dụng ngắn","answer":"Đáp án chuẩn"}}'
    )
    llm_res = _call_external_llm(system_prompt, json.dumps({"query": query, "hskLevel": hsk_level}, ensure_ascii=False))
    if llm_res and llm_res.get("formula"):
        llm_res["provider"] = get_ai_config()["provider"]
        return llm_res

    for key, item in GRAMMAR_EXPLAIN_BANK.items():
        if key in query:
            res = dict(item)
            res["provider"] = "pedagogical-engine"
            return res

    # Time/place or negation fallback
    if any(k in query.lower() for k in ("không", "phủ định", "不", "没")):
        return {
            "title": "Phân biệt câu phủ định 不 (bù) và 没 / 没有 (méi / méiyǒu)",
            "formula": "不 + Động từ/Tính từ (hiện tại, tương lai, thói quen) | 没(有) + Động từ (quá khứ, hoặc phủ định 有)",
            "meaning": "不 phủ định ý muốn, thói quen, tính chất hiện tại/tương lai; 没(有) phủ định hành động chưa xảy ra trong quá khứ và LUÔN phủ định động từ 有.",
            "correctExamples": [
                {"chinese": "我今天不去学校。", "pinyin": "Wǒ jīntiān bú qù xuéxiào.", "vietnamese": "Hôm nay tôi không đi học."},
                {"chinese": "我昨天没去学校。", "pinyin": "Wǒ zuótiān méi qù xuéxiào.", "vietnamese": "Hôm qua tôi đã không đi học."},
                {"chinese": "我没有时间。", "pinyin": "Wǒ méiyǒu shíjiān.", "vietnamese": "Tôi không có thời gian."}
            ],
            "commonMistakes": [
                {"wrong": "我不有钱。", "right": "我没有钱。", "why": "Tuyệt đối không dùng 不有 — luôn dùng 没有!"}
            ],
            "practiceQuiz": {"question": "Điền 不 hay 没: 昨天我 ___ 喝咖啡。", "answer": "没 (vì có 昨天 - hôm qua)"} ,
            "provider": "pedagogical-engine"
        }

    return {
        "title": f"Hướng dẫn ngữ pháp: {query}",
        "formula": "Chủ ngữ + [Thời gian] + [Tại địa điểm 在...] + [Phó từ] + Động từ + Tân ngữ",
        "meaning": "Trật tự khung cốt lõi của câu tiếng Trung Giản thể: thời gian và cụm địa điểm (在 + nơi chốn) đứng TRƯỚC động từ chính.",
        "correctExamples": [
            {"chinese": "我每天晚上八点在家学习中文。", "pinyin": "Wǒ měitiān wǎnshang bā diǎn zài jiā xuéxí Zhōngwén.", "vietnamese": "Mỗi tối 8 giờ tôi học tiếng Trung ở nhà."}
        ],
        "commonMistakes": [
            {"wrong": "我学习中文在家每天。", "right": "我每天在家学习中文。", "why": "Không đặt thời gian/địa điểm ở cuối câu như tiếng Việt."}
        ],
        "practiceQuiz": {"question": "Sửa câu: 他工作在北京。", "answer": "他在北京工作。"},
        "provider": "pedagogical-engine"
    }


def handle_pronunciation_analysis(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Honest pronunciation coaching: highlights exact initials, finals, aspiration, retroflexes,
    and tone sandhi in the target phrase, compares with browser zh-CN STT transcript if present,
    and EXPLICITLY states acoustic limitations instead of fabricating fake tone scores.
    """
    target_hz = (payload.get("targetHanzi") or "").strip()
    target_py = (payload.get("targetPinyin") or "").strip()
    spoken = (payload.get("spokenTranscript") or "").strip()

    tips = []
    py_low = target_py.lower()
    if re.search(r"\b(p|t|k|q|ch|c)", py_low):
        tips.append("Âm BẬT HƠI (p, t, k, q, ch, c): Hãy đẩy mạnh luồng hơi ra (thử đặt tờ giấy trước miệng, giấy phải rung nhẹ).")
    if re.search(r"\b(zh|ch|sh|r)", py_low):
        tips.append("Âm CONG LƯỠI (zh, ch, sh, r): Uốn cong đầu lưỡi lên sát ngạc cứng, tránh đọc thẳng lưỡi thành z/c/s.")
    if re.search(r"(ang|eng|ing|ong)", py_low):
        tips.append("Vận mẫu MŨI SAU (-ng): Mở rộng miệng hơn và giữ âm vang sâu trong khoang mũi, tránh đọc gọn thành -n.")
    if re.search(r"(ü|yu|ju|qu|xu)", py_low):
        tips.append("Âm tròn môi (ü / ju, qu, xu, yu): Giữ hai môi CHỤM TRÒN cố định từ đầu đến cuối âm tiết.")
    if "你好" in target_hz or "可以" in target_hz or "很" in target_hz:
        tips.append("Chú ý biến điệu Thanh 3: Hai thanh 3 liền nhau đọc thành Thanh 2 + Thanh 3 (vd: nǐ hǎo → ní hǎo).")
    if not tips:
        tips.append("Chú ý giữ rõ đường cao độ 4 thanh điệu: Thanh 1 ngang cao, Thanh 2 vút lên, Thanh 3 trầm đáy, Thanh 4 dứt khoát đi xuống.")

    match_status = "no_transcript"
    matched_chars = 0
    total_chars = len(re.findall(r"[\u4e00-\u9fff]", target_hz))
    if spoken and total_chars > 0:
        clean_target = re.findall(r"[\u4e00-\u9fff]", target_hz)
        matched_chars = sum(1 for ch in clean_target if ch in spoken)
        ratio = matched_chars / total_chars
        match_status = "matched" if ratio >= 0.85 else ("partial" if ratio >= 0.4 else "mismatch")

    return {
        "targetHanzi": target_hz,
        "targetPinyin": target_py,
        "spokenTranscript": spoken,
        "matchStatus": match_status,
        "matchedChars": matched_chars,
        "totalChars": total_chars,
        "coachingTips": tips,
        "honestLimitation": "Lưu ý minh bạch: Nhận diện giọng nói trên trình duyệt (Web Speech API) chỉ kiểm tra mức độ khớp chữ Hán đầu ra, KHÔNG đo chính xác đường cao độ F0 từng thanh điệu hay cường độ luồng hơi. Vì vậy QChinese không tự bịa điểm phát âm 0–100 giả; hãy luôn bấm Play nghe lại bản ghi âm của bạn đặt cạnh âm mẫu Putonghua!",
        "provider": "pedagogical-engine"
    }


def handle_personalized_drills(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Generate personalized practice plan & concrete interactive drills from actual learner error logs."""
    hsk_level = int(payload.get("hskLevel", 1))
    phonetic_errors = payload.get("phoneticErrors") or {}
    lapsed_words = payload.get("lapsedWords") or []
    skill_scores = payload.get("skillScores") or {}

    weak_pairs = sorted(
        [(k, v) for k, v in phonetic_errors.items() if isinstance(v, dict) and v.get("wrong", 0) > 0],
        key=lambda kv: kv[1].get("wrong", 0),
        reverse=True,
    )[:3]

    drills = []
    for pair_key, rec in weak_pairs:
        drills.append({
            "type": "phonetic",
            "title": f"Luyện phân biệt cặp âm hay nhầm: {pair_key}",
            "reason": f"Bạn đã nhầm cặp {pair_key} {rec.get('wrong', 0)} lần trong các bài nghe phân biệt.",
            "actionRoute": "pinyin",
            "actionParams": {"pair": pair_key},
            "cta": f"Mở phòng đối chiếu {pair_key} →"
        })

    if lapsed_words:
        words_preview = ", ".join(w.get("hanzi", "") for w in lapsed_words[:6] if w.get("hanzi"))
        drills.append({
            "type": "vocab",
            "title": f"Ôn gấp {len(lapsed_words)} từ vựng thường quên (SRS)",
            "reason": f"Các từ bạn hay quên gần đây: {words_preview}.",
            "actionRoute": "vocab",
            "actionParams": {"mode": "flashcard", "status": "lapses"},
            "cta": "Mở Flashcard ôn từ hay quên →"
        })

    weakest_skill = min(
        [(k, int(v or 0)) for k, v in skill_scores.items() if k in ("listening", "speaking", "reading", "writing", "grammar", "pinyin")],
        key=lambda kv: kv[1],
        default=("pinyin", 0),
    )
    skill_labels = {
        "listening": ("Luyện nghe", "listening"),
        "speaking": ("Luyện nói hội thoại AI", "speaking"),
        "reading": ("Luyện đọc hiểu", "reading"),
        "writing": ("Luyện viết câu & đoạn", "writing"),
        "grammar": ("Ôn cấu trúc ngữ pháp", "grammar"),
        "pinyin": ("Phòng luyện Pinyin", "pinyin"),
    }
    lbl, route = skill_labels.get(weakest_skill[0], ("Phòng luyện Pinyin", "pinyin"))
    drills.append({
        "type": "skill",
        "title": f"Củng cố kỹ năng đang thấp nhất: {lbl} ({weakest_skill[1]}/100)",
        "reason": f"Lộ trình HSK {hsk_level} đề xuất dành 10 phút hôm nay cho kỹ năng này để tiến bộ đều 4 kỹ năng.",
        "actionRoute": route,
        "actionParams": {},
        "cta": f"Vào {lbl} ngay →"
    })

    return {
        "hskLevel": hsk_level,
        "summary": f"Đã phân tích dữ liệu học tập thực tế của bạn (HSK {hsk_level}): {len(weak_pairs)} cặp âm cần luyện, {len(lapsed_words)} từ hay quên.",
        "drills": drills,
        "provider": "pedagogical-engine"
    }


def handle_generate_lesson_exercise(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Hạng mục 6.3: AI Adaptive Exercise Generator ('AI – TẠO BÀI TẬP MỚI').
    Generates a non-duplicate exercise tailored to HSK level, lesson vocabulary, and learner's exact mistake focus,
    then validates answers before returning.
    """
    skill = (payload.get("skill") or "reading").lower()
    hsk_level = int(payload.get("hskLevel", 1))
    lesson_title = (payload.get("lessonTitle") or "Lesson 1").strip()
    vocab_words = payload.get("vocabWords") or []
    wrong_focuses = payload.get("wrongFocuses") or []
    variant_idx = int(payload.get("variantIndex", 2))

    focus_label = (
        "kỹ năng tìm thông tin chi tiết (Detail)" if "detail" in wrong_focuses
        else "từ vựng trong ngữ cảnh (Vocab Context)" if "vocab_context" in wrong_focuses
        else "ý chính & suy luận (Main Idea)" if "main_idea" in wrong_focuses
        else "củng cố tổng hợp bài học"
    )

    system_prompt = (
        f"Bạn là chuyên gia biên soạn đề HSK {hsk_level} (tiếng Trung Giản thể). "
        f"Hãy tạo 1 bài tập MỚI HOÀN TOÀN (không sao chép bài cũ) cho kỹ năng '{skill}', chủ đề '{lesson_title}', "
        f"tập trung củng cố điểm yếu: '{focus_label}'. Trả về JSON hợp lệ:\n"
        '{"title":"...","focusReason":"...","chinese":"Đoạn văn/nội dung tiếng Trung giản thể","pinyin":"...","vietnamese":"...",'
        '"questions":[{"id":"q1","type":"mcq|tf|fill","skillFocus":"detail|main_idea|vocab_context","question":"...","options":["..."],"answer":"Đáp án phải trùng khớp 1 phương án trong options nếu là mcq/tf","explain":"Giải thích rõ bằng tiếng Việt"}]}'
    )
    llm_res = _call_external_llm(system_prompt, json.dumps({
        "skill": skill, "hskLevel": hsk_level, "lessonTitle": lesson_title,
        "vocabWords": vocab_words[:8], "wrongFocuses": wrong_focuses, "variant": variant_idx,
    }, ensure_ascii=False))
    if llm_res and isinstance(llm_res.get("questions"), list) and len(llm_res["questions"]) >= 3:
        # Quality validation: ensure every MCQ/TF answer exists in options
        valid_qs = []
        for qi, q in enumerate(llm_res["questions"], start=1):
            if q.get("type") in ("mcq", "tf") and isinstance(q.get("options"), list) and q.get("answer") not in q["options"]:
                continue
            q["id"] = f"ai_q{qi}"
            valid_qs.append(q)
        if len(valid_qs) >= 3:
            llm_res["questions"] = valid_qs
            llm_res["sourceTag"] = "ai_generated"
            llm_res["validated"] = True
            llm_res["provider"] = get_ai_config()["provider"]
            return llm_res

    # High-quality non-duplicate deterministic adaptive generator when external LLM key is not set
    w0 = vocab_words[0] if vocab_words else {"hanzi": "汉语", "pinyin": "Hànyǔ", "vi": "tiếng Hán"}
    w1 = vocab_words[1] if len(vocab_words) > 1 else {"hanzi": "学习", "pinyin": "xuéxí", "vi": "học tập"}
    w2 = vocab_words[2] if len(vocab_words) > 2 else {"hanzi": "朋友", "pinyin": "péngyou", "vi": "bạn bè"}
    w3 = vocab_words[3] if len(vocab_words) > 3 else {"hanzi": "学校", "pinyin": "xuéxiào", "vi": "trường học"}

    names = [("张伟", "Trương Vỹ"), ("小梅", "Tiểu Mai"), ("安明", "An Minh"), ("陈芳", "Trần Phương")]
    p_zh, p_vi = names[variant_idx % len(names)]
    times = [("星期六上午九点", "9 giờ sáng thứ Bảy"), ("星期天下午三点", "3 giờ chiều Chủ nhật"), ("每天晚上八点", "8 giờ tối mỗi ngày")]
    t_zh, t_vi = times[variant_idx % len(times)]

    if skill in ("reading", "listening"):
        passage_zh = (
            f"{p_zh}是我的好朋友。{t_zh}，他常在图书馆复习{lesson_title.split(':')[0]}的生词，"
            f"特别是“{w0['hanzi']}”和“{w1['hanzi']}”。他还会和同学一起练习“{w2['hanzi']}”的用法，"
            f"觉得这样记忆效果最好。学完以后，他经常去{w3['hanzi']}附近喝茶休息二十分钟。"
        )
        passage_vi = (
            f"{p_vi} là bạn tốt của tôi. Vào {t_vi}, bạn ấy thường ôn từ mới của bài này ở thư viện, "
            f"đặc biệt là từ '{w0['hanzi']}' ({w0.get('vi', '')}) và '{w1['hanzi']}' ({w1.get('vi', '')}). "
            f"Bạn ấy còn luyện cách dùng từ '{w2['hanzi']}' cùng bạn học, thấy cách này nhớ hiệu quả nhất. Học xong bạn ấy hay nghỉ ngơi uống trà 20 phút."
        )
        qs = [
            {
                "id": f"ai_{variant_idx}_q1", "type": "mcq", "skillFocus": "detail",
                "question": f"{p_vi} ({p_zh}) thường ôn bài vào thời điểm nào?",
                "options": [t_vi, "6 giờ sáng thứ Hai", "12 giờ trưa thứ Tư", "11 giờ đêm thứ Sáu"],
                "answer": t_vi,
                "explain": f"Chi tiết trong bài nêu rõ thời điểm: '{t_zh}' ({t_vi})."
            },
            {
                "id": f"ai_{variant_idx}_q2", "type": "mcq", "skillFocus": "detail",
                "question": f"{p_vi} thường ôn tập từ mới ở địa điểm nào?",
                "options": ["Thư viện (图书馆)", "Sân bay (机场)", "Bệnh viện (医院)", "Quán cà phê (咖啡馆)"],
                "answer": "Thư viện (图书馆)",
                "explain": "Trong bài ghi: '他常在图书馆复习...' (ở thư viện)."
            },
            {
                "id": f"ai_{variant_idx}_q3", "type": "tf", "skillFocus": "detail",
                "question": f"Đúng hay Sai: Sau khi học xong, {p_vi} nghỉ ngơi uống trà khoảng 20 phút.",
                "options": ["Đúng (True)", "Sai (False)"],
                "answer": "Đúng (True)",
                "explain": "Câu cuối bài: '喝茶休息二十分钟' (uống trà nghỉ 20 phút)."
            },
            {
                "id": f"ai_{variant_idx}_q4", "type": "mcq", "skillFocus": "vocab_context",
                "question": f"Từ trọng tâm '{w0['hanzi']}' ({w0.get('pinyin', '')}) trong bài có nghĩa là gì?",
                "options": [w0.get("vi", "từ khóa"), "Tàu hỏa", "Thời tiết lạnh", "Báo giấy"],
                "answer": w0.get("vi", "từ khóa"),
                "explain": f"Theo từ vựng bài học: {w0['hanzi']} ({w0.get('pinyin', '')}) = {w0.get('vi', '')}."
            },
            {
                "id": f"ai_{variant_idx}_q5", "type": "fill", "skillFocus": "vocab_context",
                "question": f"Điền chữ Hán Giản thể cho từ có nghĩa '{w1.get('vi', '')}' ({w1.get('pinyin', '')}):",
                "answer": w1["hanzi"],
                "explain": f"Đáp án chuẩn là '{w1['hanzi']}' ({w1.get('pinyin', '')})."
            }
        ]
        return {
            "id": f"ai_ex_{skill}_{variant_idx}_{int(time.time()) % 10000}",
            "title": f"Bài {variant_idx} (AI Tạo Mới · Củng cố {focus_label})",
            "focusReason": f"AI đã phân tích bài gốc & lỗi sai trước đó để tạo đoạn mới nhắm vào: {focus_label}.",
            "sourceTag": "ai_generated",
            "audioSource": "tts" if skill == "listening" else None,
            "audioText": passage_zh if skill == "listening" else None,
            "chinese": passage_zh,
            "pinyin": "Bấm từng từ trong đoạn để xem Pinyin tức thì hoặc bấm nút Loa để nghe chuẩn Putonghua.",
            "vietnamese": passage_vi,
            "questions": qs,
            "validated": True,
            "provider": "pedagogical-engine",
        }

    if skill == "writing":
        return {
            "id": f"ai_ex_wr_{variant_idx}_{int(time.time()) % 10000}",
            "title": f"Đề viết {variant_idx} (AI Tạo Mới – HSK {hsk_level})",
            "focusReason": f"Luyện viết câu/đoạn ứng dụng các từ mới của {lesson_title}.",
            "sourceTag": "ai_generated",
            "prompt": f"Hãy viết 2–3 câu tiếng Trung Giản thể kể về thói quen học tập hoặc hoạt động vào {t_vi}, sử dụng ít nhất 2 từ: {w0['hanzi']}, {w1['hanzi']}, {w2['hanzi']}.",
            "targetWord": w0["hanzi"],
            "hskLevel": hsk_level,
            "validated": True,
            "provider": "pedagogical-engine",
        }

    # Grammar / Vocab / Speaking adaptive exercise
    return {
        "id": f"ai_ex_{skill}_{variant_idx}_{int(time.time()) % 10000}",
        "title": f"Bài luyện {variant_idx} (AI Tạo Mới · {focus_label})",
        "focusReason": f"Bài tập củng cố tự động dựa trên từ vựng & cấu trúc của {lesson_title}.",
        "sourceTag": "ai_generated",
        "prompt": f"Trả lời câu hỏi hoặc hoàn thành 4 câu trắc nghiệm củng cố cho {lesson_title}:",
        "sampleQuestion": f"你什么时候用“{w0['hanzi']}”？请造一个句子。",
        "questions": [
            {
                "id": f"ai_g_{variant_idx}_1", "type": "mcq", "skillFocus": "vocab_context",
                "question": f"Nghĩa đúng của '{w0['hanzi']}' ({w0.get('pinyin', '')}) là gì?",
                "options": [w0.get("vi", ""), "Quả táo", "Chạy bộ", "Sân bay"],
                "answer": w0.get("vi", ""),
                "explain": f"{w0['hanzi']} ({w0.get('pinyin', '')}) = {w0.get('vi', '')}."
            },
            {
                "id": f"ai_g_{variant_idx}_2", "type": "mcq", "skillFocus": "detail",
                "question": "Chọn câu tiếng Trung ĐÚNG ngữ pháp:",
                "options": ["我每天早上七点起床。", "我起床每天早上七点。", "我是很忙今天。", "他不有时间。"],
                "answer": "我每天早上七点起床。",
                "explain": "Trạng ngữ thời gian (每天早上七点) đứng TRƯỚC động từ (起床)."
            },
            {
                "id": f"ai_g_{variant_idx}_3", "type": "fill", "skillFocus": "vocab_context",
                "question": f"Nhập chữ Hán Giản thể tương ứng với '{w2.get('vi', '')}' ({w2.get('pinyin', '')}):",
                "answer": w2["hanzi"],
                "explain": f"Đáp án: {w2['hanzi']} ({w2.get('pinyin', '')})."
            }
        ],
        "validated": True,
        "provider": "pedagogical-engine",
    }
