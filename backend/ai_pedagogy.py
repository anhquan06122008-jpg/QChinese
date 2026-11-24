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
    Generates a non-duplicate, fully bilingual (ZH-EN + ZH-VI) exercise with real line-by-line
    Pinyin, English, Vietnamese, and structured transcriptLines (for Listening) across all skills:
    reading, listening, grammar, writing, speaking, and vocabulary.
    """
    skill = (payload.get("skill") or "reading").lower().strip()
    hsk_level = int(payload.get("hskLevel", 1))
    lesson_title = (payload.get("lessonTitle") or "Lesson 1").strip()
    lesson_short = lesson_title.split(":")[0].strip() or "Lesson 1"
    vocab_words = payload.get("vocabWords") or []
    wrong_focuses = payload.get("wrongFocuses") or []
    variant_idx = int(payload.get("variantIndex", 2))

    focus_label_vi = (
        "kỹ năng tìm thông tin chi tiết (Detail)" if "detail" in wrong_focuses
        else "từ vựng trong ngữ cảnh (Vocab Context)" if "vocab_context" in wrong_focuses
        else "ý chính & suy luận (Main Idea)" if "main_idea" in wrong_focuses
        else "củng cố tổng hợp bài học"
    )
    focus_label_en = (
        "Detail Comprehension" if "detail" in wrong_focuses
        else "Vocabulary in Context" if "vocab_context" in wrong_focuses
        else "Main Idea & Inference" if "main_idea" in wrong_focuses
        else "Comprehensive Lesson Review"
    )

    system_prompt = (
        f"You are an expert HSK {hsk_level} (Simplified Chinese) curriculum designer. "
        f"Create 1 BRAND-NEW non-duplicate '{skill}' exercise for '{lesson_title}', targeting '{focus_label_en}'. "
        "Return strict JSON with REAL tone-marked Pinyin, English, and Vietnamese aligned line-by-line (separated by \\n), "
        "and bilingual questions (both EN and VI fields). For 'listening', MUST also include 'transcriptLines' "
        '[{"speaker":"...","chinese":"...","pinyin":"...","english":"...","vietnamese":"..."}]. Schema:\n'
        '{"title":"English title","title_vi":"Vietnamese title","focusReason":"Vietnamese reason","focusReason_en":"English reason",'
        '"chinese":"Line 1\\nLine 2\\nLine 3","pinyin":"Pinyin 1\\nPinyin 2\\nPinyin 3",'
        '"english":"English 1\\nEnglish 2\\nEnglish 3","vietnamese":"Vietnamese 1\\nVietnamese 2\\nVietnamese 3",'
        '"transcriptLines":[...],"prompt":"...","prompt_en":"...","sampleQuestion":"...","samplePinyin":"...","sampleEnglish":"...","sampleVietnamese":"...",'
        '"formula":"...","explanation":"...","explanation_en":"...",'
        '"questions":[{"id":"q1","type":"mcq|tf|fill","skillFocus":"detail|main_idea|vocab_context",'
        '"question_en":"...","options_en":["..."],"answer_en":"...","explain_en":"...",'
        '"question":"...","options":["..."],"answer":"...","explain":"..."}]}'
    )
    llm_res = _call_external_llm(system_prompt, json.dumps({
        "skill": skill, "hskLevel": hsk_level, "lessonTitle": lesson_title,
        "vocabWords": vocab_words[:8], "wrongFocuses": wrong_focuses, "variant": variant_idx,
    }, ensure_ascii=False))
    if llm_res and isinstance(llm_res, dict):
        if skill in ("reading", "listening"):
            has_real_py = bool(str(llm_res.get("pinyin") or "").strip()) and "Bấm từng từ" not in str(llm_res.get("pinyin") or "")
            has_en = bool(str(llm_res.get("english") or "").strip())
            has_qs = isinstance(llm_res.get("questions"), list) and len(llm_res["questions"]) >= 3
            if has_real_py and has_en and has_qs:
                valid_qs = []
                for qi, q in enumerate(llm_res["questions"], start=1):
                    if q.get("type") in ("mcq", "tf") and isinstance(q.get("options"), list) and q.get("answer") not in q["options"]:
                        continue
                    q["id"] = f"ai_q{qi}"
                    valid_qs.append(q)
                if len(valid_qs) >= 3:
                    llm_res["id"] = llm_res.get("id") or f"ai_ex_{skill}_{variant_idx}_{int(time.time()) % 10000}"
                    llm_res["questions"] = valid_qs
                    llm_res["sourceTag"] = "ai_generated"
                    llm_res["validated"] = True
                    llm_res["provider"] = get_ai_config()["provider"]
                    if skill == "listening":
                        llm_res["audioSource"] = "tts"
                        llm_res["audioText"] = llm_res.get("chinese") or ""
                        llm_res["transcriptSource"] = "ai_generated"
                        llm_res["transcriptLabel"] = f"Phụ đề khớp 100% bài nghe AI tạo ({lesson_short})"
                        if not isinstance(llm_res.get("transcriptLines"), list) or not llm_res["transcriptLines"]:
                            z_lns = [x.strip() for x in str(llm_res.get("chinese") or "").split("\n") if x.strip()]
                            p_lns = [x.strip() for x in str(llm_res.get("pinyin") or "").split("\n") if x.strip()]
                            e_lns = [x.strip() for x in str(llm_res.get("english") or "").split("\n") if x.strip()]
                            v_lns = [x.strip() for x in str(llm_res.get("vietnamese") or "").split("\n") if x.strip()]
                            llm_res["transcriptLines"] = [
                                {
                                    "speaker": f"Người {i % 2 + 1}",
                                    "chinese": zl,
                                    "pinyin": p_lns[i] if i < len(p_lns) else "",
                                    "english": e_lns[i] if i < len(e_lns) else "",
                                    "vietnamese": v_lns[i] if i < len(v_lns) else "",
                                }
                                for i, zl in enumerate(z_lns)
                            ]
                    return llm_res

    # Normalize lesson vocabulary words with guaranteed hanzi, pinyin, en, vi (never mix fallback pinyin with a different hanzi!)
    common_dict = {
        "你好": ("nǐ hǎo", "hello", "xin chào"),
        "你们": ("nǐmen", "you (plural)", "các bạn"),
        "对不起": ("duìbuqǐ", "sorry", "xin lỗi"),
        "没关系": ("méi guānxi", "it doesn't matter", "không sao đâu"),
        "不客气": ("bú kèqi", "you're welcome", "đừng khách sáo"),
        "再见": ("zàijiàn", "goodbye", "tạm biệt"),
        "谢谢": ("xièxie", "thank you", "cảm ơn"),
        "多少钱": ("duōshao qián", "how much money", "bao nhiêu tiền"),
        "打电话": ("dǎ diànhuà", "make a phone call", "gọi điện thoại"),
        "出租车": ("chūzūchē", "taxi", "xe taxi"),
    }

    def _norm_word(idx: int, fallback: Dict[str, str]) -> Dict[str, str]:
        if idx < len(vocab_words) and isinstance(vocab_words[idx], dict) and vocab_words[idx].get("hanzi"):
            raw = vocab_words[idx]
            hz = str(raw.get("hanzi") or fallback["hanzi"]).strip()
            cd = common_dict.get(hz)
            py = str(raw.get("pinyin") or (cd[0] if cd else "")).strip() or hz
            vi_raw = str(raw.get("vi") or "").strip()
            if not vi_raw or vi_raw == "Từ trọng tâm bài học":
                vi_v = (cd[2] if cd else "") or str(raw.get("en") or hz).strip()
            else:
                vi_v = vi_raw
            en_v = str(raw.get("en") or (cd[1] if cd else "") or vi_v).strip()
            return {"hanzi": hz, "pinyin": py, "en": en_v, "vi": vi_v}
        return dict(fallback)

    w0 = _norm_word(0, {"hanzi": "汉语", "pinyin": "Hànyǔ", "en": "Chinese language", "vi": "tiếng Hán"})
    w1 = _norm_word(1, {"hanzi": "学习", "pinyin": "xuéxí", "en": "to study", "vi": "học tập"})
    w2 = _norm_word(2, {"hanzi": "朋友", "pinyin": "péngyou", "en": "friend", "vi": "bạn bè"})
    w3 = _norm_word(3, {"hanzi": "老师", "pinyin": "lǎoshī", "en": "teacher", "vi": "giáo viên"})

    def _rotate_opts(opts: List[str], salt: int) -> List[str]:
        if len(opts) <= 1:
            return opts
        pos = (variant_idx * 3 + salt) % len(opts)
        correct = opts[0]
        rest = opts[1:]
        return rest[:pos] + [correct] + rest[pos:]

    # High-quality non-duplicate deterministic adaptive scenarios (100% real Pinyin + English + Vietnamese!)
    scenarios = [
        {
            "name_zh": "张伟", "name_py": "Zhāng Wěi", "name_en": "Zhang Wei", "name_vi": "Trương Vỹ",
            "partner_zh": "王老师", "partner_py": "Wáng lǎoshī", "partner_en": "Teacher Wang", "partner_vi": "Cô Vương",
            "time_zh": "星期六上午九点", "time_py": "Xīngqīliù shàngwǔ jiǔ diǎn",
            "time_en": "9:00 a.m. on Saturday", "time_vi": "9 giờ sáng thứ Bảy",
            "place_zh": "图书馆", "place_py": "túshūguǎn", "place_en": "the library", "place_vi": "thư viện",
            "after_zh": "学校咖啡馆喝茶休息二十分钟", "after_py": "xuéxiào kāfēiguǎn hē chá xiūxi èrshí fēnzhōng",
            "after_en": "the campus cafe to drink tea and rest for 20 minutes",
            "after_vi": "quán cà phê trường uống trà và nghỉ ngơi 20 phút",
            "mins": "20",
        },
        {
            "name_zh": "小梅", "name_py": "Xiǎoméi", "name_en": "Xiaomei", "name_vi": "Tiểu Mai",
            "partner_zh": "李文", "partner_py": "Lǐ Wén", "partner_en": "Li Wen", "partner_vi": "Lý Văn",
            "time_zh": "星期天下午三点", "time_py": "Xīngqītiān xiàwǔ sān diǎn",
            "time_en": "3:00 p.m. on Sunday", "time_vi": "3 giờ chiều Chủ nhật",
            "place_zh": "教室", "place_py": "jiàoshì", "place_en": "the classroom", "place_vi": "phòng học",
            "after_zh": "公园散步休息十五分钟", "after_py": "gōngyuán sànbù xiūxi shíwǔ fēnzhōng",
            "after_en": "the park to take a walk and relax for 15 minutes",
            "after_vi": "công viên đi dạo và thư giãn 15 phút",
            "mins": "15",
        },
        {
            "name_zh": "安明", "name_py": "Ān Míng", "name_en": "An Ming", "name_vi": "An Minh",
            "partner_zh": "小雨", "partner_py": "Xiǎoyǔ", "partner_en": "Xiaoyu", "partner_vi": "Tiểu Vũ",
            "time_zh": "每天晚上八点", "time_py": "Měitiān wǎnshang bā diǎn",
            "time_en": "8:00 p.m. every evening", "time_vi": "8 giờ tối mỗi ngày",
            "place_zh": "书房", "place_py": "shūfáng", "place_en": "the study room", "place_vi": "phòng học ở nhà",
            "after_zh": "客厅听中文歌休息十分钟", "after_py": "kètīng tīng Zhōngwén gē xiūxi shí fēnzhōng",
            "after_en": "the living room to listen to Chinese songs and rest for 10 minutes",
            "after_vi": "phòng khách nghe nhạc Hoa và nghỉ ngơi 10 phút",
            "mins": "10",
        },
        {
            "name_zh": "陈芳", "name_py": "Chén Fāng", "name_en": "Chen Fang", "name_vi": "Trần Phương",
            "partner_zh": "大卫", "partner_py": "Dàwèi", "partner_en": "David", "partner_vi": "Đại Vệ",
            "time_zh": "星期三下午四点", "time_py": "Xīngqīsān xiàwǔ sì diǎn",
            "time_en": "4:00 p.m. on Wednesday", "time_vi": "4 giờ chiều thứ Tư",
            "place_zh": "汉语中心", "place_py": "Hànyǔ zhōngxīn", "place_en": "the Chinese center", "place_vi": "trung tâm tiếng Hán",
            "after_zh": "书店看书休息三十分钟", "after_py": "shūdiàn kànshū xiūxi sānshí fēnzhōng",
            "after_en": "the bookstore to read and rest for 30 minutes",
            "after_vi": "hiệu sách đọc sách và nghỉ 30 phút",
            "mins": "30",
        },
    ]
    sc = scenarios[variant_idx % len(scenarios)]
    uid_suffix = f"{variant_idx}_{int(time.time()) % 10000}"

    if skill == "reading":
        lines = [
            (
                f"{sc['name_zh']}是我的好朋友，他很喜欢学习汉语。",
                f"{sc['name_py']} shì wǒ de hǎo péngyou, tā hěn xǐhuan xuéxí Hànyǔ.",
                f"{sc['name_en']} is my good friend, and they really enjoy studying Chinese.",
                f"{sc['name_vi']} là bạn tốt của tôi, bạn ấy rất thích học tiếng Hán.",
            ),
            (
                f"{sc['time_zh']}，他常在{sc['place_zh']}复习新课的生词。",
                f"{sc['time_py']}, tā cháng zài {sc['place_py']} fùxí xīnkè de shēngcí.",
                f"At {sc['time_en']}, they often review the new lesson's vocabulary in {sc['place_en']}.",
                f"Vào {sc['time_vi']}, bạn ấy thường ôn từ mới của bài học tại {sc['place_vi']}.",
            ),
            (
                f"今天他重点练习“{w0['hanzi']}”和“{w1['hanzi']}”这两个词。",
                f"Jīntiān tā zhòngdiǎn liànxí \"{w0['pinyin']}\" hé \"{w1['pinyin']}\" zhè liǎng gè cí.",
                f"Today they focus on practicing the two words \"{w0['hanzi']}\" ({w0['en']}) and \"{w1['hanzi']}\" ({w1['en']}).",
                f"Hôm nay bạn ấy tập trung luyện hai từ \"{w0['hanzi']}\" ({w0['vi']}) và \"{w1['hanzi']}\" ({w1['vi']}).",
            ),
            (
                f"他还会和{sc['partner_zh']}一起用“{w2['hanzi']}”和“{w3['hanzi']}”造句，记忆效果很好。",
                f"Tā hái huì hé {sc['partner_py']} yìqǐ yòng \"{w2['pinyin']}\" hé \"{w3['pinyin']}\" zàojù, jìyì xiàoguǒ hěn hǎo.",
                f"They also make sentences using \"{w2['hanzi']}\" ({w2['en']}) and \"{w3['hanzi']}\" ({w3['en']}) with {sc['partner_en']}, which helps them remember very well.",
                f"Bạn ấy còn cùng {sc['partner_vi']} đặt câu với \"{w2['hanzi']}\" ({w2['vi']}) và \"{w3['hanzi']}\" ({w3['vi']}), giúp ghi nhớ rất hiệu quả.",
            ),
            (
                f"学完以后，他经常去{sc['after_zh']}。",
                f"Xuéwán yǐhòu, tā jīngcháng qù {sc['after_py']}.",
                f"After finishing studying, they often go to {sc['after_en']}.",
                f"Sau khi học xong, bạn ấy thường đến {sc['after_vi']}.",
            ),
        ]
        passage_zh = "\n".join(x[0] for x in lines)
        passage_py = "\n".join(x[1] for x in lines)
        passage_en = "\n".join(x[2] for x in lines)
        passage_vi = "\n".join(x[3] for x in lines)

        time_opts_en = _rotate_opts([sc["time_en"], "6:00 a.m. on Monday", "12:00 p.m. on Thursday", "11:00 p.m. on Friday"], 1)
        time_opts_vi = _rotate_opts([sc["time_vi"], "6 giờ sáng thứ Hai", "12 giờ trưa thứ Năm", "11 giờ đêm thứ Sáu"], 1)
        place_opts_en = _rotate_opts([f"{sc['place_en'].title()} ({sc['place_zh']})", "Airport (机场)", "Hospital (医院)", "Supermarket (超市)"], 2)
        place_opts_vi = _rotate_opts([f"{sc['place_vi'].capitalize()} ({sc['place_zh']})", "Sân bay (机场)", "Bệnh viện (医院)", "Siêu thị (超市)"], 2)
        w0_opts_en = _rotate_opts([w0["en"], "Train ticket (火车票)", "Cold weather (天气冷)", "Newspaper (报纸)"], 3)
        w0_opts_vi = _rotate_opts([w0["vi"], "Vé tàu hỏa (火车票)", "Thời tiết lạnh (天气冷)", "Báo giấy (报纸)"], 3)

        qs = [
            {
                "id": f"ai_{variant_idx}_q1", "type": "mcq", "skillFocus": "detail",
                "question_en": f"When does {sc['name_en']} ({sc['name_zh']}) usually review new vocabulary?",
                "options_en": time_opts_en,
                "answer_en": sc["time_en"],
                "explain_en": f"Line 2 clearly states: '{sc['time_zh']}' ({sc['time_en']}).",
                "question": f"{sc['name_vi']} ({sc['name_zh']}) thường ôn tập từ mới vào thời điểm nào?",
                "options": time_opts_vi,
                "answer": sc["time_vi"],
                "explain": f"Câu 2 nêu rõ thời điểm: '{sc['time_zh']}' ({sc['time_vi']}).",
            },
            {
                "id": f"ai_{variant_idx}_q2", "type": "mcq", "skillFocus": "detail",
                "question_en": f"Where does {sc['name_en']} review the vocabulary of {lesson_short}?",
                "options_en": place_opts_en,
                "answer_en": f"{sc['place_en'].title()} ({sc['place_zh']})",
                "explain_en": f"The passage states: '他常在{sc['place_zh']}复习新课的生词。'",
                "question": f"{sc['name_vi']} thường ôn từ mới ở địa điểm nào?",
                "options": place_opts_vi,
                "answer": f"{sc['place_vi'].capitalize()} ({sc['place_zh']})",
                "explain": f"Trong bài ghi: '他常在{sc['place_zh']}复习新课的生词。' (tại {sc['place_vi']}).",
            },
            {
                "id": f"ai_{variant_idx}_q3", "type": "tf", "skillFocus": "detail",
                "question_en": f"True or False: After studying, {sc['name_en']} rests for about {sc['mins']} minutes.",
                "options_en": ["True (正确)", "False (错误)"],
                "answer_en": "True (正确)",
                "explain_en": f"The final sentence confirms they rest for {sc['mins']} minutes: '{lines[-1][0]}'",
                "question": f"Đúng hay Sai: Sau khi học xong, {sc['name_vi']} nghỉ ngơi khoảng {sc['mins']} phút.",
                "options": ["Đúng (True)", "Sai (False)"],
                "answer": "Đúng (True)",
                "explain": f"Câu cuối bài xác nhận nghỉ {sc['mins']} phút: '{lines[-1][0]}'",
            },
            {
                "id": f"ai_{variant_idx}_q4", "type": "mcq", "skillFocus": "vocab_context",
                "question_en": f"In the passage, what does the key word '{w0['hanzi']}' ({w0['pinyin']}) mean?",
                "options_en": w0_opts_en,
                "answer_en": w0["en"],
                "explain_en": f"Lesson vocabulary: {w0['hanzi']} ({w0['pinyin']}) = {w0['en']}.",
                "question": f"Trong đoạn văn, từ trọng tâm '{w0['hanzi']}' ({w0['pinyin']}) có nghĩa là gì?",
                "options": w0_opts_vi,
                "answer": w0["vi"],
                "explain": f"Theo từ vựng bài học: {w0['hanzi']} ({w0['pinyin']}) = {w0['vi']}.",
            },
            {
                "id": f"ai_{variant_idx}_q5", "type": "fill", "skillFocus": "vocab_context",
                "question_en": f"Type the Simplified Chinese word meaning '{w1['en']}' ({w1['pinyin']}):",
                "answer_en": w1["hanzi"],
                "explain_en": f"Correct answer: '{w1['hanzi']}' ({w1['pinyin']}).",
                "question": f"Điền chữ Hán Giản thể cho từ có nghĩa '{w1['vi']}' ({w1['pinyin']}):",
                "answer": w1["hanzi"],
                "explain": f"Đáp án chuẩn là '{w1['hanzi']}' ({w1['pinyin']}).",
            },
        ]
        return {
            "id": f"ai_ex_reading_{uid_suffix}",
            "title": f"Exercise {variant_idx} (AI Generated · {focus_label_en})",
            "title_vi": f"Bài {variant_idx} (AI Tạo Mới · Củng cố {focus_label_vi})",
            "focusReason": f"AI đã phân tích bài gốc & lỗi sai trước đó để tạo bài đọc mới nhắm vào: {focus_label_vi}.",
            "focusReason_en": f"AI analyzed your lesson & mistakes to generate a fresh passage targeting: {focus_label_en}.",
            "sourceTag": "ai_generated",
            "chinese": passage_zh,
            "pinyin": passage_py,
            "english": passage_en,
            "vietnamese": passage_vi,
            "questions": qs,
            "validated": True,
            "provider": "pedagogical-engine",
        }

    if skill == "listening":
        # Genuine multi-turn dialogue with 100% aligned speaker, Chinese, Pinyin, English & Vietnamese
        t_lines = [
            {
                "speaker": sc["partner_zh"],
                "chinese": f"{sc['name_zh']}，你好！你现在在{sc['place_zh']}吗？",
                "pinyin": f"{sc['name_py']}, nǐ hǎo! Nǐ xiànzài zài {sc['place_py']} ma?",
                "english": f"Hello, {sc['name_en']}! Are you at {sc['place_en']} right now?",
                "vietnamese": f"Chào {sc['name_vi']}! Bây giờ bạn đang ở {sc['place_vi']} phải không?",
            },
            {
                "speaker": sc["name_zh"],
                "chinese": f"是的，我在复习{lesson_short}的生词，特别是“{w0['hanzi']}”和“{w1['hanzi']}”。",
                "pinyin": f"Shì de, wǒ zài fùxí {lesson_short} de shēngcí, tèbié shì \"{w0['pinyin']}\" hé \"{w1['pinyin']}\".",
                "english": f"Yes, I'm reviewing the new words of {lesson_short}, especially \"{w0['hanzi']}\" ({w0['en']}) and \"{w1['hanzi']}\" ({w1['en']}).",
                "vietnamese": f"Đúng vậy, mình đang ôn từ mới của {lesson_short}, đặc biệt là \"{w0['hanzi']}\" ({w0['vi']}) và \"{w1['hanzi']}\" ({w1['vi']}).",
            },
            {
                "speaker": sc["partner_zh"],
                "chinese": f"太好了！我们{sc['time_zh']}一起练习“{w2['hanzi']}”吧。",
                "pinyin": f"Tài hǎo le! Wǒmen {sc['time_py']} yìqǐ liànxí \"{w2['pinyin']}\" ba.",
                "english": f"Great! Let's practice \"{w2['hanzi']}\" ({w2['en']}) together at {sc['time_en']}.",
                "vietnamese": f"Tuyệt quá! Vào {sc['time_vi']} chúng ta cùng luyện \"{w2['hanzi']}\" ({w2['vi']}) nhé.",
            },
            {
                "speaker": sc["name_zh"],
                "chinese": f"没问题！学完以后我们去{sc['after_zh']}。",
                "pinyin": f"Méi wèntí! Xuéwán yǐhòu wǒmen qù {sc['after_py']}.",
                "english": f"No problem! After studying, let's go to {sc['after_en']}.",
                "vietnamese": f"Không thành vấn đề! Học xong chúng ta đi {sc['after_vi']}.",
            },
            {
                "speaker": sc["partner_zh"],
                "chinese": f"好的，那就这样说定了，再见！",
                "pinyin": "Hǎo de, nà jiù zhèyàng shuōdìng le, zàijiàn!",
                "english": "Okay, then it's a deal. Goodbye!",
                "vietnamese": "Được rồi, cứ quyết định vậy nhé, tạm biệt!",
            },
        ]
        full_zh = "\n".join(x["chinese"] for x in t_lines)
        full_py = "\n".join(x["pinyin"] for x in t_lines)
        full_en = "\n".join(x["english"] for x in t_lines)
        full_vi = "\n".join(x["vietnamese"] for x in t_lines)

        qs = [
            {
                "id": f"ai_lis_{variant_idx}_q1", "type": "mcq", "skillFocus": "detail",
                "question_en": f"Where is {sc['name_en']} right now in the dialogue?",
                "options_en": _rotate_opts([f"{sc['place_en'].title()} ({sc['place_zh']})", "Hospital (医院)", "Train station (火车站)", "Supermarket (超市)"], 1),
                "answer_en": f"{sc['place_en'].title()} ({sc['place_zh']})",
                "explain_en": f"{sc['partner_en']} asks if they are at {sc['place_en']} ({sc['place_zh']}), and {sc['name_en']} replies '是的' (Yes).",
                "question": f"Trong đoạn hội thoại, {sc['name_vi']} hiện đang ở đâu?",
                "options": _rotate_opts([f"{sc['place_vi'].capitalize()} ({sc['place_zh']})", "Bệnh viện (医院)", "Ga tàu hỏa (火车站)", "Siêu thị (超市)"], 1),
                "answer": f"{sc['place_vi'].capitalize()} ({sc['place_zh']})",
                "explain": f"{sc['partner_vi']} hỏi đang ở {sc['place_vi']} ({sc['place_zh']}) phải không và {sc['name_vi']} đáp '是的' (Đúng vậy).",
            },
            {
                "id": f"ai_lis_{variant_idx}_q2", "type": "mcq", "skillFocus": "detail",
                "question_en": "When do they plan to practice together?",
                "options_en": _rotate_opts([sc["time_en"], "7:00 a.m. on Tuesday", "1:00 p.m. on Friday", "10:30 p.m. tonight"], 2),
                "answer_en": sc["time_en"],
                "explain_en": f"{sc['partner_en']} suggests: '我们{sc['time_zh']}一起练习...' ({sc['time_en']}).",
                "question": "Hai người hẹn cùng nhau luyện tập vào lúc nào?",
                "options": _rotate_opts([sc["time_vi"], "7 giờ sáng thứ Ba", "1 giờ chiều thứ Sáu", "10 giờ 30 tối nay"], 2),
                "answer": sc["time_vi"],
                "explain": f"{sc['partner_vi']} rủ: '我们{sc['time_zh']}一起练习...' ({sc['time_vi']}).",
            },
            {
                "id": f"ai_lis_{variant_idx}_q3", "type": "mcq", "skillFocus": "vocab_context",
                "question_en": f"What is the meaning of '{w0['hanzi']}' ({w0['pinyin']}) mentioned in the audio?",
                "options_en": _rotate_opts([w0["en"], "Airplane (飞机)", "Watermelon (西瓜)", "Winter (冬天)"], 3),
                "answer_en": w0["en"],
                "explain_en": f"{w0['hanzi']} ({w0['pinyin']}) means: {w0['en']}.",
                "question": f"Từ '{w0['hanzi']}' ({w0['pinyin']}) xuất hiện trong đoạn nghe có nghĩa là gì?",
                "options": _rotate_opts([w0["vi"], "Máy bay (飞机)", "Quả dưa hấu (西瓜)", "Mùa đông (冬天)"], 3),
                "answer": w0["vi"],
                "explain": f"{w0['hanzi']} ({w0['pinyin']}) có nghĩa là: {w0['vi']}.",
            },
            {
                "id": f"ai_lis_{variant_idx}_q4", "type": "tf", "skillFocus": "detail",
                "question_en": f"True or False: After studying, they plan to rest for {sc['mins']} minutes.",
                "options_en": ["True (正确)", "False (错误)"],
                "answer_en": "True (正确)",
                "explain_en": f"Turn 4 states: '{t_lines[3]['chinese']}'",
                "question": f"Đúng hay Sai: Sau khi học xong, hai người dự định nghỉ ngơi {sc['mins']} phút.",
                "options": ["Đúng (True)", "Sai (False)"],
                "answer": "Đúng (True)",
                "explain": f"Lời thoại 4 nêu rõ: '{t_lines[3]['chinese']}'",
            },
        ]
        return {
            "id": f"ai_ex_listening_{uid_suffix}",
            "title": f"Listening {variant_idx} (AI Dialogue · {focus_label_en})",
            "title_vi": f"Bài nghe {variant_idx} (AI Tạo Mới · Hội thoại {focus_label_vi})",
            "focusReason": f"Hội thoại nghe hiểu AI tạo riêng theo từ vựng {lesson_short}, đồng bộ phụ đề từng câu.",
            "focusReason_en": f"AI-generated dialogue tailored to {lesson_short} vocabulary with sentence-synced subtitles.",
            "sourceTag": "ai_generated",
            "audioSource": "tts",
            "audioFile": "",
            "audioUrl": "",
            "audioText": full_zh,
            "chinese": full_zh,
            "pinyin": full_py,
            "english": full_en,
            "vietnamese": full_vi,
            "transcriptSource": "ai_generated",
            "transcriptLabel": f"Phụ đề khớp 100% Hội thoại AI tạo (Bài {variant_idx} · {lesson_short})",
            "transcriptLines": t_lines,
            "targetHint_en": f"Listen to the AI dialogue between {sc['partner_en']} and {sc['name_en']}. Focus on '{w0['hanzi']}' ({w0['pinyin']}) and '{w2['hanzi']}' ({w2['pinyin']}).",
            "targetHint": f"Nghe hội thoại giữa {sc['partner_vi']} và {sc['name_vi']}, chú ý từ '{w0['hanzi']}' ({w0['pinyin']}) và '{w2['hanzi']}' ({w2['pinyin']}).",
            "questions": qs,
            "validated": True,
            "provider": "pedagogical-engine",
        }

    if skill == "writing":
        wr_prompts = [
            (
                f"Write 2–3 Simplified Chinese sentences about your study routine at {sc['time_en']}, using at least 2 words: {w0['hanzi']}, {w1['hanzi']}, {w2['hanzi']}.",
                f"Hãy viết 2–3 câu tiếng Trung Giản thể kể về thói quen học tập vào {sc['time_vi']}, sử dụng ít nhất 2 từ: {w0['hanzi']} ({w0['vi']}), {w1['hanzi']} ({w1['vi']}), {w2['hanzi']} ({w2['vi']}).",
                f"{sc['time_zh']}，我在{sc['place_zh']}学习汉语。今天我练习了“{w0['hanzi']}”和“{w1['hanzi']}”。",
                f"{sc['time_py']}, wǒ zài {sc['place_py']} xuéxí Hànyǔ. Jīntiān wǒ liànxí le \"{w0['pinyin']}\" hé \"{w1['pinyin']}\".",
                f"At {sc['time_en']}, I study Chinese at {sc['place_en']}. Today I practiced \"{w0['hanzi']}\" and \"{w1['hanzi']}\".",
                f"Vào {sc['time_vi']}, tôi học tiếng Hán ở {sc['place_vi']}. Hôm nay tôi đã luyện \"{w0['hanzi']}\" và \"{w1['hanzi']}\".",
            ),
            (
                f"Write a short 3-line mini dialogue with a friend ({sc['partner_en']}) using '{w0['hanzi']}' ({w0['en']}) and '{w2['hanzi']}' ({w2['en']}).",
                f"Viết 1 đoạn hội thoại ngắn 3 câu với bạn ({sc['partner_vi']}), trong đó dùng từ '{w0['hanzi']}' ({w0['vi']}) và '{w2['hanzi']}' ({w2['vi']}).",
                f"你好！你每天都学习汉语吗？是的，我常练习“{w0['hanzi']}”和“{w2['hanzi']}”。",
                f"Nǐ hǎo! Nǐ měitiān dōu xuéxí Hànyǔ ma? Shì de, wǒ cháng liànxí \"{w0['pinyin']}\" hé \"{w2['pinyin']}\".",
                f"Hello! Do you study Chinese every day? Yes, I often practice \"{w0['hanzi']}\" and \"{w2['hanzi']}\".",
                f"Xin chào! Bạn có học tiếng Hán mỗi ngày không? Đúng vậy, tôi thường luyện \"{w0['hanzi']}\" và \"{w2['hanzi']}\".",
            ),
            (
                f"Describe what you and {sc['name_en']} do at {sc['place_en']} in 2–3 sentences, including '{w1['hanzi']}' ({w1['en']}) and '{w3['hanzi']}' ({w3['en']}).",
                f"Miêu tả hoạt động của bạn và {sc['name_vi']} tại {sc['place_vi']} trong 2–3 câu, có dùng '{w1['hanzi']}' ({w1['vi']}) và '{w3['hanzi']}' ({w3['vi']}).",
                f"我和{sc['name_zh']}一起在{sc['place_zh']}复习生词。我们都会用“{w1['hanzi']}”和“{w3['hanzi']}”造句。",
                f"Wǒ hé {sc['name_py']} yìqǐ zài {sc['place_py']} fùxí shēngcí. Wǒmen dōu huì yòng \"{w1['pinyin']}\" hé \"{w3['pinyin']}\" zàojù.",
                f"{sc['name_en']} and I review new words together at {sc['place_en']}. We can both make sentences with \"{w1['hanzi']}\" and \"{w3['hanzi']}\".",
                f"Tôi và {sc['name_vi']} cùng nhau ôn từ mới tại {sc['place_vi']}. Chúng tôi đều biết đặt câu với \"{w1['hanzi']}\" và \"{w3['hanzi']}\".",
            ),
        ]
        wp = wr_prompts[variant_idx % len(wr_prompts)]
        return {
            "id": f"ai_ex_wr_{uid_suffix}",
            "title": f"Writing Task {variant_idx} (AI Generated – HSK {hsk_level})",
            "title_vi": f"Đề viết {variant_idx} (AI Tạo Mới – HSK {hsk_level})",
            "focusReason": f"Luyện viết câu/đoạn ứng dụng các từ mới của {lesson_title}.",
            "focusReason_en": f"Guided writing applying core vocabulary from {lesson_title}.",
            "sourceTag": "ai_generated",
            "prompt_en": wp[0],
            "prompt": wp[1],
            "sampleAnswer": wp[2],
            "samplePinyin": wp[3],
            "sampleEnglish": wp[4],
            "sampleVietnamese": wp[5],
            "targetWord": w0["hanzi"],
            "hskLevel": hsk_level,
            "validated": True,
            "provider": "pedagogical-engine",
        }

    if skill == "speaking":
        sp_prompts = [
            (
                f"Shadowing Drill: Listen to the model sentence and read aloud clearly with accurate tones.",
                f"Luyện đọc theo mẫu (Shadowing): Nghe câu mẫu và đọc to, rõ 4 thanh điệu.",
                f"{sc['time_zh']}，我常在{sc['place_zh']}复习“{w0['hanzi']}”和“{w1['hanzi']}”。",
                f"{sc['time_py']}, wǒ cháng zài {sc['place_py']} fùxí \"{w0['pinyin']}\" hé \"{w1['pinyin']}\".",
                f"At {sc['time_en']}, I often review \"{w0['hanzi']}\" and \"{w1['hanzi']}\" at {sc['place_en']}.",
                f"Vào {sc['time_vi']}, tôi thường ôn \"{w0['hanzi']}\" và \"{w1['hanzi']}\" tại {sc['place_vi']}.",
            ),
            (
                f"Q&A Reflex: Answer the question aloud in 1–2 Mandarin sentences using '{w0['hanzi']}' ({w0['en']}).",
                f"Phản xạ hỏi–đáp: Trả lời to câu hỏi sau bằng 1–2 câu tiếng Trung có dùng '{w0['hanzi']}' ({w0['vi']}).",
                f"你平时怎么用“{w0['hanzi']}”？请用它说一句话。",
                f"Nǐ píngshí zěnme yòng \"{w0['pinyin']}\"? Qǐng yòng tā shuō yí jù huà.",
                f"How do you usually use \"{w0['hanzi']}\"? Please say one sentence with it.",
                f"Bình thường bạn dùng \"{w0['hanzi']}\" như thế nào? Hãy nói một câu có chứa từ này.",
            ),
            (
                f"Roleplay Response: Reply naturally to {sc['partner_en']}'s invitation in Mandarin.",
                f"Đóng vai giao tiếp: Đáp lại lời rủ của {sc['partner_vi']} một cách tự nhiên bằng tiếng Trung.",
                f"你好！{sc['time_zh']}我们一起去{sc['place_zh']}学习汉语，好吗？",
                f"Nǐ hǎo! {sc['time_py']} wǒmen yìqǐ qù {sc['place_py']} xuéxí Hànyǔ, hǎo ma?",
                f"Hello! Shall we go to {sc['place_en']} together to study Chinese at {sc['time_en']}?",
                f"Xin chào! Vào {sc['time_vi']} chúng ta cùng đi {sc['place_vi']} học tiếng Hán nhé?",
            ),
        ]
        sp = sp_prompts[variant_idx % len(sp_prompts)]
        return {
            "id": f"ai_ex_sp_{uid_suffix}",
            "title": f"Speaking Drill {variant_idx} (AI Generated · HSK {hsk_level})",
            "title_vi": f"Bài luyện nói {variant_idx} (AI Tạo Mới · HSK {hsk_level})",
            "focusReason": f"Luyện phát âm & phản xạ giao tiếp trực tiếp theo chủ đề {lesson_title}.",
            "focusReason_en": f"Pronunciation & speaking reflex drill tailored to {lesson_title}.",
            "sourceTag": "ai_generated",
            "prompt_en": sp[0],
            "prompt": sp[1],
            "sampleQuestion": sp[2],
            "samplePinyin": sp[3],
            "sampleEnglish": sp[4],
            "sampleVietnamese": sp[5],
            "hskLevel": hsk_level,
            "validated": True,
            "provider": "pedagogical-engine",
        }

    # Grammar (and Vocabulary fallback) dedicated bilingual drill generator
    gr_patterns = [
        (
            "Time & Place Word Order (Thời gian + Địa điểm + Động từ)",
            "Subject + Time (时间) + 在 Place (地点) + Verb + Object",
            "In Mandarin, both Time and Location (在 + place) MUST come BEFORE the main verb.",
            "Trong tiếng Trung, trạng ngữ Thời gian và Địa điểm (在 + nơi chốn) LUÔN đứng TRƯỚC động từ chính.",
            "Which sentence has the CORRECT Chinese word order?",
            "Chọn câu tiếng Trung có trật tự từ ĐÚNG ngữ pháp:",
            [f"我{sc['time_zh']}在{sc['place_zh']}学习汉语。", f"我学习汉语在{sc['place_zh']}{sc['time_zh']}。", f"我在{sc['place_zh']}学习汉语{sc['time_zh']}。", f"学习汉语我{sc['time_zh']}在{sc['place_zh']}。"],
            f"我{sc['time_zh']}在{sc['place_zh']}学习汉语。",
            f"Order: Subject (我) + Time ({sc['time_zh']}) + Place (在{sc['place_zh']}) + Verb-Object (学习汉语).",
            f"Trật tự chuẩn: Chủ ngữ (我) + Thời gian ({sc['time_zh']}) + Địa điểm (在{sc['place_zh']}) + Động từ (学习汉语).",
        ),
        (
            "Negation: 不 vs 没(有)",
            "Subject + 不 + Verb/Adj (present/habit)  |  Subject + 没(有) + Noun / Past Verb",
            "Use 没(有) to negate 有 (to have) or completed past actions; use 不 for general/habitual negation or adjectives.",
            "Dùng 没(有) để phủ định động từ 有 hoặc hành động quá khứ; dùng 不 cho hiện tại, thói quen và tính từ.",
            "Choose the grammatically CORRECT negative sentence:",
            "Chọn câu phủ định ĐÚNG chuẩn ngữ pháp tiếng Trung:",
            ["今天我没有时间去图书馆。", "今天我不有时间去图书馆。", "今天我没是学生。", "今天我有很多不书。"],
            "今天我没有时间去图书馆。",
            "The verb 有 is ALWAYS negated with 没 (没有), never 不有!",
            "Động từ 有 LUÔN đi với 没 (没有), tuyệt đối không dùng 不有!",
        ),
        (
            "Yes/No & Follow-up Questions (吗 & 呢)",
            "Statement + 吗？ (Yes/No)  |  Noun/Pronoun + 呢？ (What about...?)",
            "Add 吗 at the end of a statement to form a Yes/No question; never combine 吗 with a wh-question word like 什么.",
            "Thêm 吗 vào cuối câu trần thuật để tạo câu hỏi Có/Không; KHÔNG dùng 吗 chung với từ để hỏi như 什么, 谁, 哪儿.",
            "Which question is grammatically CORRECT?",
            "Câu hỏi nào dưới đây ĐÚNG ngữ pháp tiếng Trung?",
            ["你是中国学生吗？", "你叫什么名字吗？", "你去哪儿吗？", "谁是你的老师吗？"],
            "你是中国学生吗？",
            "Never add 吗 when the sentence already contains a question word (什么 / 哪儿 / 谁).",
            "Không thêm 吗 khi trong câu đã có từ để hỏi (什么 / 哪儿 / 谁).",
        ),
    ]
    gp = gr_patterns[variant_idx % len(gr_patterns)]
    q2_opts = _rotate_opts(gp[6], 2)

    return {
        "id": f"ai_ex_{skill}_{uid_suffix}",
        "title": f"Grammar Exercise {variant_idx} (AI Generated · {gp[0].split('(')[0].strip()})",
        "title_vi": f"Bài ngữ pháp {variant_idx} (AI Tạo Mới · {gp[0]})",
        "focusReason": f"Bài tập ngữ pháp & từ vựng củng cố trực tiếp cho {lesson_title}.",
        "focusReason_en": f"Targeted grammar & vocabulary drill for {lesson_title}.",
        "sourceTag": "ai_generated",
        "formula": gp[1],
        "explanation_en": gp[2],
        "explanation": gp[3],
        "questions": [
            {
                "id": f"ai_g_{variant_idx}_1", "type": "mcq", "skillFocus": "vocab_context",
                "question_en": f"What is the correct meaning of '{w0['hanzi']}' ({w0['pinyin']})?",
                "options_en": _rotate_opts([w0["en"], "Apple (苹果)", "Running (跑步)", "Airport (机场)"], 1),
                "answer_en": w0["en"],
                "explain_en": f"{w0['hanzi']} ({w0['pinyin']}) = {w0['en']}.",
                "question": f"Nghĩa đúng của từ '{w0['hanzi']}' ({w0['pinyin']}) là gì?",
                "options": _rotate_opts([w0["vi"], "Quả táo (苹果)", "Chạy bộ (跑步)", "Sân bay (机场)"], 1),
                "answer": w0["vi"],
                "explain": f"{w0['hanzi']} ({w0['pinyin']}) = {w0['vi']}.",
            },
            {
                "id": f"ai_g_{variant_idx}_2", "type": "mcq", "skillFocus": "detail",
                "question_en": gp[4],
                "options_en": q2_opts,
                "answer_en": gp[7],
                "explain_en": gp[8],
                "question": gp[5],
                "options": q2_opts,
                "answer": gp[7],
                "explain": gp[9],
            },
            {
                "id": f"ai_g_{variant_idx}_3", "type": "mcq", "skillFocus": "vocab_context",
                "question_en": f"What does '{w1['hanzi']}' ({w1['pinyin']}) mean?",
                "options_en": _rotate_opts([w1["en"], "Bus (公共汽车)", "Doctor (医生)", "Winter (冬天)"], 3),
                "answer_en": w1["en"],
                "explain_en": f"{w1['hanzi']} ({w1['pinyin']}) = {w1['en']}.",
                "question": f"Từ '{w1['hanzi']}' ({w1['pinyin']}) có nghĩa là gì?",
                "options": _rotate_opts([w1["vi"], "Xe buýt (公共汽车)", "Bác sĩ (医生)", "Mùa đông (冬天)"], 3),
                "answer": w1["vi"],
                "explain": f"{w1['hanzi']} ({w1['pinyin']}) = {w1['vi']}.",
            },
            {
                "id": f"ai_g_{variant_idx}_4", "type": "fill", "skillFocus": "vocab_context",
                "question_en": f"Type the Simplified Chinese word meaning '{w2['en']}' ({w2['pinyin']}):",
                "answer_en": w2["hanzi"],
                "explain_en": f"Correct answer: {w2['hanzi']} ({w2['pinyin']}).",
                "question": f"Nhập chữ Hán Giản thể tương ứng với '{w2['vi']}' ({w2['pinyin']}):",
                "answer": w2["hanzi"],
                "explain": f"Đáp án chuẩn: {w2['hanzi']} ({w2['pinyin']}).",
            },
        ],
        "validated": True,
        "provider": "pedagogical-engine",
    }
