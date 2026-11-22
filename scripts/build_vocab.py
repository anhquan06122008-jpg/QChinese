# -*- coding: utf-8 -*-
"""
Build QChinese vocabulary library (HSK 2.0 levels 1-6 + HSK 3.0 levels 1-6 & 7-9) from verified sources.

Sources:
  * complete.json        - drkameleon/complete-hsk-vocabulary (MIT). Word lists per HSK version/level,
                           pinyin, traditional form, POS tags; definitions from CC-CEDICT (CC BY-SA 4.0).
  * Unihan_Readings.txt  - Unicode Consortium, field kVietnamese (Han-Viet reading per character).
  * legacy_vocab.json    - the 35 hand-curated words that shipped with QChinese v1 (kept, ids preserved).
  * vi_manual.tsv        - verified Vietnamese meanings for HSK 1, HSK 2 & core HSK 3-6 words.

Nothing here invents words or HSK levels: membership comes strictly from complete.json.
Primary form selection prioritizes modern everyday Mandarin readings over surnames/archaic/variant forms.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "data" / "sources"
OUT = ROOT / "public" / "data" / "vocab"

VERSIONS = {
    "hsk2": {
        "prefix": "old",
        "levels": [1, 2, 3, 4, 5, 6],
        "label": "HSK 2.0 (Chuẩn 6 cấp – 5.000 từ)",
        "short": "HSK 2.0",
        "note": "Hệ thống HSK 2.0 (2010, 6 cấp) đang được sử dụng phổ biến trong kỳ thi HSK quốc tế.",
        "official": {1: 150, 2: 150, 3: 300, 4: 600, 5: 1300, 6: 2500},
    },
    "hsk3": {
        "prefix": "new",
        "levels": [1, 2, 3, 4, 5, 6, 7],
        "label": "HSK 3.0 (Chuẩn mới 9 cấp – Cấp 1–6 & 7–9)",
        "short": "HSK 3.0",
        "note": "Hệ thống HSK 3.0 (2021, 9 cấp). Cấp 7–9 được gộp vào mục HSK 7–9 (new-7 trong nguồn complete-hsk-vocabulary).",
        "official": {1: 500, 2: 772, 3: 973, 4: 1000, 5: 1071, 6: 1140, 7: 5636},
    },
}

TOPICS = [
    ("greeting", "Chào hỏi & giao tiếp"),
    ("family", "Gia đình & bạn bè"),
    ("school", "Trường học & giáo dục"),
    ("work", "Công việc & nghề nghiệp"),
    ("time", "Thời gian & ngày tháng"),
    ("numbers", "Số đếm"),
    ("food", "Đồ ăn & thức uống"),
    ("shopping", "Mua sắm"),
    ("travel", "Du lịch"),
    ("transport", "Giao thông"),
    ("health", "Sức khỏe"),
    ("emotion", "Cảm xúc"),
    ("weather", "Thời tiết"),
    ("tech", "Công nghệ"),
    ("society", "Xã hội"),
    ("culture", "Văn hóa"),
    ("economy", "Kinh tế"),
    ("politics", "Chính trị"),
    ("environment", "Môi trường"),
    ("other", "Đời sống & Khác"),
]

TOPIC_RULES = [
    ("numbers", r"^(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|hundred|thousand|million|billion|half|pair|several|few|a few|number|digit|how many|how much|first|second \(|third|fourth|fifth|tenth|double|triple|percent|fraction|quarter|dozen|many|much)\b|\bten thousand\b|\bhundred million\b"),
    ("family", r"\b(father|mother|parent|dad|mom|mum|son|daughter|brother|sister|husband|wife|family|grandfather|grandmother|grandpa|grandma|uncle|aunt|cousin|nephew|niece|child|children|baby|kid|marriage|marry|married|wedding|relative|friend|boyfriend|girlfriend|neighbou?r|spouse|household|couple|lover|fianc|bride|groom|pregnan|birth|offspring|descendant|ancestor|elder|younger)\b"),
    ("food", r"\b(eat|drink|food|meal|rice|noodle|bread|meat|beef|pork|chicken|duck|fish|egg|vegetable|fruit|apple|banana|pear|grape|peach|orange|melon|tea|coffee|milk|beer|wine|liquor|alcohol|restaurant|cook|cooking|dish|breakfast|lunch|dinner|supper|hungry|hunger|thirsty|delicious|tasty|sweet|sour|bitter|spicy|salty|soup|cake|candy|sugar|salt|flavou?r|taste|menu|bowl|chopstick|cup|snack|dumpling|juice|cuisine|feed|diet|vegetarian|bean|potato|tomato|onion|garlic|oil|vinegar|sauce|seasoning|pepper|beverage|bake|fry|boil)\b"),
    ("health", r"\b(doctor|hospital|medicine|medical|sick|sickness|ill|illness|disease|health|healthy|body|head|eye|ear|nose|mouth|hand|finger|arm|leg|foot|heart|pain|painful|fever|cough|sleep|rest|exercise|sport|patient|treat|treatment|injury|injure|wound|blood|nurse|dentist|tooth|teeth|stomach|hair|skin|physical|diet|vitamin|drug|pill|surgery|clinic|symptom|cure|recover|fitness|muscle|bone|brain|lung|liver|kidney|face|neck|shoulder|waist|belly|breath|swim|run|jog|weight|fat|thin|disabled)\b"),
    ("weather", r"\b(weather|rain|rainy|snow|wind|windy|cloud|cloudy|sun|sunny|sunshine|hot|cold|warm|cool|temperature|storm|thunder|lightning|climate|fog|foggy|dry|humid|humidity|typhoon|hurricane|flood|drought|frost|ice|freeze|season|spring|summer|autumn|fall|winter|degree|celsius|forecast|shade)\b"),
    ("transport", r"\b(car|bus|train|plane|airplane|aircraft|subway|metro|bicycle|bike|taxi|cab|road|street|traffic|drive|driver|driving|ride|station|ship|boat|route|intersection|highway|license|wheel|vehicle|flight|fly|railway|rail|bridge|lane|crossing|parking|park a|track|pedestrian|passenger|truck|motorcycle|gas station|fuel|petrol|helmet)\b"),
    ("travel", r"\b(travel|trip|tour|tourist|tourism|hotel|airport|passport|ticket|visa|journey|scenery|scenic|luggage|baggage|destination|sightseeing|abroad|vacation|holiday|resort|reserve|reservation|book a|check in|check-in|guide|attraction|landscape|souvenir|itinerary|camp|backpack|hostel|customs|embark|arrive|depart|overseas|foreign|map)\b"),
    ("shopping", r"\b(buy|bought|purchase|sell|sale|shop|shopping|store|market|price|cheap|expensive|money|yuan|dollar|pay|payment|cost|customer|goods|merchandise|supermarket|discount|bargain|change|cash|clothes|clothing|shirt|trousers|pants|skirt|dress|shoes|shoe|sock|hat|coat|jacket|wear|size|try on|receipt|refund|brand|fashion|jewel|gift|present|wallet|bag|purse|credit card|coupon|retail|wholesale|worth|afford|spend|waste|save money|cheaper)\b"),
    ("school", r"\b(school|student|pupil|teacher|class|classroom|classmate|study|learn|lesson|university|college|campus|exam|examination|test|homework|book|textbook|read|reading|write|writing|character|chinese language|english|education|educate|library|pen|pencil|paper|dictionary|professor|graduat|knowledge|course|subject|major|degree|diploma|grade|score|mark|teach|teaching|tutor|lecture|curriculum|academic|scholar|literacy|vocabulary|grammar|sentence|essay|composition|question|answer|dormitory|semester|term|kindergarten|primary|secondary|blackboard|notebook|eraser|ruler)\b"),
    ("work", r"\b(work|worker|job|company|corporation|firm|office|boss|manager|director|salary|wage|employ|employee|employer|staff|colleague|career|profession|professional|occupation|hire|resign|engineer|lawyer|secretary|driver|cook|chef|waiter|clerk|officer|meeting|conference|project|task|duty|responsib|application|apply|interview|resume|promotion|retire|unemployed|overtime|business trip|customer service|workshop|factory|plant|team|supervisor|assistant|labou?r|vocation|position|post|department|branch|headquarter|appoint|recruit|training)\b"),
    ("emotion", r"\b(happy|happiness|glad|sad|sadness|sorrow|angry|anger|love|like|dislike|hate|afraid|fear|scared|frighten|worry|worried|excited|excitement|nervous|surprise|surprised|feel|feeling|mood|emotion|cry|weep|laugh|smile|lonely|proud|pride|shy|satisfied|satisf|disappoint|pity|regret|upset|anxious|anxiety|comfortable|moved|touched|jealous|envy|embarrass|ashamed|shame|bored|boring|interesting|interest|cheerful|depressed|miserable|pleasure|delight|joy|enjoy|annoy|patient|impatient|lovely|cute|kind|warm-hearted|polite|rude|brave|courage|confident|confidence|trust|hope|expect|wish|miss|care)\b"),
    ("tech", r"\b(computer|laptop|phone|telephone|cell phone|mobile|internet|online|network|software|hardware|digital|technology|technical|electronic|electronics|email|e-mail|camera|television|tv|screen|data|database|program|programming|robot|machine|device|electric|electricity|radio|website|web|video|photo|photograph|information|engine|battery|science|scientific|invention|invent|experiment|laboratory|satellite|internet cafe|app|download|upload|click|keyboard|mouse|password|account|chip|artificial intelligence|automat|equipment|instrument|appliance|gadget|monitor|printer|copy|scan)\b"),
    ("economy", r"\b(economy|economic|economics|trade|finance|financial|bank|invest|investment|tax|profit|income|industry|industrial|enterprise|capital|stock|share|insurance|loan|budget|debt|commerce|commercial|export|import|consumption|consume|wealth|currency|growth|fund|property|real estate|agriculture|agricultural|farm|farmer|crop|production|produce|product|manufactur|supply|demand|inflation|deposit|interest rate|asset|revenue|bankrupt|contract|cooperat|competition|competitive|market share|monopoly|exchange rate|accounting|audit|commodity|logistics|resource)\b"),
    ("politics", r"\b(politic|political|politics|government|state|nation|national|president|prime minister|minister|party|election|vote|military|army|soldier|war|peace|policy|democracy|democratic|official|diplomatic|diplomat|international|sovereign|sovereignty|congress|parliament|regime|administration|authority|leader|leadership|revolution|communis|socialis|republic|embassy|treaty|territory|ideology|constitution|law|legal|legislat|court|judge|justice|police|crime|criminal|prison|rights|citizen|citizenship|public security|ministry|bureau|commission|mayor|province|county|capital city|central government|local government|armed|weapon|nuclear|alliance|sanction)\b"),
    ("environment", r"\b(environment|environmental|pollution|polluted|nature|natural|earth|planet|ecology|ecological|ecosystem|protect|protection|forest|tree|river|mountain|sea|ocean|lake|animal|plant|flower|grass|energy|recycle|recycling|waste|garbage|rubbish|green|global warming|species|bird|insect|wildlife|sky|land|soil|air|stone|rock|island|beach|desert|valley|hill|stream|pond|wave|moon|star|sun|universe|space|cat|dog|horse|cow|pig|sheep|tiger|lion|monkey|panda|rabbit|mouse|rat|snake|dragon|bear|elephant|wolf|fox|deer|leaf|root|seed|bamboo|rose|conserv|ecolog|clean|dirty)\b"),
    ("culture", r"\b(culture|cultural|art|artist|artistic|music|musical|song|sing|singer|dance|dancing|movie|film|cinema|paint|painting|literature|literary|poem|poetry|novel|story|history|historic|historical|tradition|traditional|festival|religion|religious|buddhis|temple|museum|theat|opera|calligraphy|ancient|dynasty|heritage|performance|perform|entertainment|game|play|sports|athlet|olympic|football|soccer|basketball|badminton|ping.?pong|tennis|chess|hobby|collect|exhibition|gallery|sculpture|folk|myth|legend|philosoph|confuc|custom|ritual|ceremony|spring festival|new year|lunar|zodiac|instrument|piano|violin|guitar|drum|writer|author|poet|actor|actress|celebrity|star|idol|show|stage|broadcast|magazine|newspaper)\b"),
    ("society", r"\b(society|social|public|community|crowd|population|group|organi[sz]ation|media|news|relationship|behaviou?r|moral|morality|equal|equality|welfare|poverty|poor|rich|youth|elderly|old people|gender|safety|safe|security|volunteer|charity|donat|help|support|assist|rescue|accident|danger|dangerous|risk|emergency|conflict|dispute|contradict|collective|individual|personal|private|privacy|rule|regulation|order|discipline|obey|respect|civiliz|civil|urban|rural|city|village|town|resident|immigra|migrant|unemploy|discriminat|prejudice|obligation|duty|right|freedom|liberty|opinion|attitude|view|value|belief|faith|ethic|virtue|honest|fair|trust|reputation|status|class|position|identity|race|ethnic|nationality|minority|majority)\b"),
    ("greeting", r"\b(hello|hi\b|goodbye|bye|thank|thanks|sorry|excuse me|please|welcome|greet|greeting|polite|how are you|introduce|introduction|name|speak|say|said|tell|ask|answer|reply|talk|call|chat|communicate|communication|conversation|language|nice to meet|pardon|apolog|congratulat|blessing|bless|wish|farewell|see you|good morning|good night|you're welcome|mr|mrs|miss|ms|sir|madam|gentleman|lady|ladies|surname|address|title|speech|word|mean|meaning|explain|express|discuss|discussion|argue|debate|inform|notify|announce|report|tell me|recommend|suggest|invite|invitation|visit|meet|guest|host)\b"),
]
TOPIC_RE = [(tid, re.compile(rx, re.I)) for tid, rx in TOPIC_RULES]

POS_CATS = [
    ("noun", "Danh từ"), ("verb", "Động từ"), ("adj", "Tính từ"), ("pron", "Đại từ"),
    ("adv", "Phó từ"), ("prep", "Giới từ"), ("conj", "Liên từ"), ("measure", "Lượng từ"),
    ("particle", "Trợ từ"), ("numeral", "Số từ"), ("other", "Khác"),
]
POS_MAP = {
    "n": ["noun"], "nr": ["noun"], "ns": ["noun"], "nt": ["noun"], "nz": ["noun"], "t": ["noun"],
    "s": ["noun"], "f": ["noun"], "tg": ["noun"], "vn": ["verb", "noun"],
    "v": ["verb"], "a": ["adj"], "an": ["adj", "noun"], "ad": ["adj", "adv"], "Ag": ["adj"],
    "d": ["adv"], "r": ["pron"], "Rg": ["pron"], "p": ["prep"], "c": ["conj"], "cc": ["conj"],
    "q": ["measure"], "qv": ["measure"], "qt": ["measure"], "u": ["particle"], "y": ["particle"],
    "m": ["numeral"], "Mg": ["numeral"], "mq": ["numeral", "measure"],
}

# Explicit primary-reading overrides for high-frequency multi-reading words where CEDICT lists a rare reading first
PRIMARY_PINYIN_OVERRIDE = {
    "个": "ge4", "都": "dou1", "上": "shang4", "能": "neng2", "那": "na4",
    "年": "nian2", "吗": "ma5", "几": "ji3", "听": "ting1", "钱": "qian2",
    "三": "san1", "水": "shui3", "日": "ri4", "坐": "zuo4", "书": "shu1",
    "读": "du2", "冷": "leng3", "东西": "dong1 xi5", "和": "he2", "里": "li3",
    "要": "yao4", "也": "ye3", "还": "hai2", "着": "zhe5", "吧": "ba5",
    "得": "de5", "为": "wei4", "从": "cong2", "最": "zui4", "新": "xin1",
    "比": "bi3", "向": "xiang4", "别": "bie2", "告诉": "gao4 su5", "号": "hao4",
    "高": "gao1", "张": "zhang1", "笑": "xiao4", "路": "lu4", "门": "men2",
    "错": "cuo4", "药": "yao4", "黑": "hei1", "元": "yuan2", "红": "hong2",
    "离": "li2", "白": "bai2", "妻子": "qi1 zi5", "鱼": "yu2", "累": "lei4",
    "船": "chuan2", "雪": "xue3", "百": "bai3", "题": "ti2", "阴": "yin1",
    "少": "shao3", "长": "chang2", "行": "xing2", "觉": "jue2", "乐": "le4",
    "干": "gan4", "只": "zhi3", "重": "zhong4", "便": "bian4", "发": "fa1",
    "种": "zhong3", "空": "kong1", "分": "fen1", "数": "shu4", "好": "hao3",
    "看": "kan4", "教": "jiao1", "漂": "piao4", "没": "mei2", "会": "hui4",
    "大": "da4", "地": "de5", "过": "guo4", "太": "tai4",
}

PENALTY_RE = re.compile(
    r"^(surname |old variant|variant of|abbr\. for|used in |see |archaic|erhua variant|\(dialect\)|\(coll\.\) what\?|\(chess\)|mythical beast|loanword)",
    re.I,
)


def pick_primary_form(forms, simplified):
    """Select the primary modern Mandarin form instead of surnames/archaic/variant entries."""
    if len(forms) == 1:
        return forms[0], []

    def score_form(f):
        py = f.get("transcriptions", {}).get("pinyin", "").strip()
        meanings = f.get("meanings") or []
        m0 = meanings[0] if meanings else ""
        sc = 0
        # Penalize capitalized proper-noun/surname forms when lowercase forms exist
        if py and py[0].isupper() and simplified not in ("中国", "北京", "汉语", "中文", "越南", "英语", "上海"):
            sc -= 50
        if PENALTY_RE.search(m0):
            sc -= 40
        if any("surname " in m.lower() for m in meanings[:2]):
            sc -= 35
        if any("variant of " in m.lower() or "archaic" in m.lower() or "used in " in m.lower() for m in meanings[:2]):
            sc -= 25
        # Reward richer everyday glosses
        sc += min(len(meanings), 6) * 3
        if f.get("classifiers"):
            sc += 5
        return sc

    override = PRIMARY_PINYIN_OVERRIDE.get(simplified)
    if override:
        ov_norm = override.lower().replace(" ", "")
        matches = [(idx, f) for idx, f in enumerate(forms)
                   if f.get("transcriptions", {}).get("numeric", "").lower().replace(" ", "") == ov_norm]
        if matches:
            matches.sort(key=lambda pair: score_form(pair[1]), reverse=True)
            best_idx, best_form = matches[0]
            rest = [f for i, f in enumerate(forms) if i != best_idx]
            return best_form, rest

    ranked = sorted(enumerate(forms), key=lambda pair: score_form(pair[1]), reverse=True)
    best_idx, best_form = ranked[0]
    rest = [f for i, f in ranked[1:]]
    return best_form, rest


def load_unihan_vi():
    m = {}
    p = SRC / "Unihan_Readings.txt"
    if not p.exists():
        print("WARN: Unihan_Readings.txt missing - Han-Viet will be empty", file=sys.stderr)
        return m
    for line in p.read_text(encoding="utf-8").splitlines():
        if line.startswith("#") or "\tkVietnamese\t" not in line:
            continue
        cp, _, val = line.split("\t")
        ch = chr(int(cp[2:], 16))
        m[ch] = val.split()
    return m


def han_viet(word_trad, word_simp, uni):
    out = []
    for i, ch in enumerate(word_simp):
        cands = uni.get(ch)
        if not cands and word_trad and i < len(word_trad):
            cands = uni.get(word_trad[i])
        if not cands:
            return ""
        out.append("/".join(cands[:2]))
    return " ".join(out)


def classify_topic(meanings, pos_codes):
    if "m" in pos_codes and len(pos_codes) <= 2:
        return "numbers"
    if pos_codes and pos_codes[0] in ("t", "tg"):
        return "time"
    glosses = [g.lower() for g in meanings[:4]]
    text = " | ".join(glosses)
    if re.search(r"\b(day|week|month|year|today|tomorrow|yesterday|morning|afternoon|evening|night|hour|minute|o'clock|now|early|late|date|calendar|moment|already|always|often|usually|before|after|while|period|decade|century|since|recently|soon|ago|midnight|noon|dawn|dusk|sunday|monday|tuesday|wednesday|thursday|friday|saturday|time)\b", text) and not re.search(r"\b(school|doctor|company)\b", text):
        return "time"
    for tid, rx in TOPIC_RE:
        if rx.search(text):
            return tid
    return "other"


def pos_categories(codes):
    cats = []
    for c in codes:
        for k in POS_MAP.get(c, ["other"]):
            if k not in cats:
                cats.append(k)
    return cats or ["other"]


def read_vi_manual():
    p = SRC / "vi_manual.tsv"
    m = {}
    if not p.exists():
        return m
    for line in p.read_text(encoding="utf-8").splitlines():
        if not line.strip() or line.startswith("#"):
            continue
        parts = line.split("\t")
        if len(parts) >= 2:
            m[parts[0].strip()] = [x.strip() for x in parts[1].split(";") if x.strip()]
    return m


def main():
    data = json.loads((SRC / "complete.json").read_text(encoding="utf-8"))
    uni = load_unihan_vi()
    legacy = json.loads((SRC / "legacy_vocab.json").read_text(encoding="utf-8"))
    legacy_by_h = {w["hanzi"]: w for w in legacy["vocab"]}
    legacy_topic_map = {
        "greeting": "greeting", "family": "family", "school": "school", "work": "work", "food": "food",
        "shopping": "shopping", "travel": "travel", "time": "time", "emotion": "emotion", "daily": "other",
    }
    vi_manual = read_vi_manual()

    OUT.mkdir(parents=True, exist_ok=True)
    manifest = {
        "schema": 2,
        "versions": {},
        "topics": [{"id": i, "label": l} for i, l in TOPICS],
        "pos": [{"id": i, "label": l} for i, l in POS_CATS],
        "sources": [
            {"name": "complete-hsk-vocabulary (drkameleon)", "url": "https://github.com/drkameleon/complete-hsk-vocabulary", "license": "MIT", "use": "Danh sách từ HSK 2.0 (cấp 1–6) & HSK 3.0 (cấp 1–9), Pinyin, chữ Phồn thể, từ loại"},
            {"name": "CC-CEDICT", "url": "https://cc-cedict.org", "license": "CC BY-SA 4.0", "use": "Nghĩa tiếng Anh & phân tách cách đọc"},
            {"name": "Unicode Unihan (kVietnamese)", "url": "https://www.unicode.org/charts/unihan.html", "license": "Unicode Terms of Use", "use": "Âm Hán Việt từng chữ (hỗ trợ người Việt liên hệ từ gốc)"},
            {"name": "QChinese Curated Vietnamese Glossary", "url": "", "license": "Project", "use": "Nghĩa tiếng Việt chuẩn hóa cho 100% HSK 1–2 và từ cốt lõi HSK 3–6, kèm ví dụ"},
        ],
        "notes": {
            "topic": "Chủ đề được phân loại tự động dựa trên nghĩa chuẩn & từ loại (heuristic) và giữ nguyên chủ đề biên soạn cho nhóm từ cốt lõi.",
            "vi": "100% HSK 1–2 (HSK 2.0) và nhóm từ cốt lõi HSK 3–6 có nghĩa tiếng Việt biên soạn; các từ nâng cao hơn hiển thị nghĩa tiếng Anh CC-CEDICT + âm Hán Việt Unihan và hỗ trợ giải thích sâu bằng AI Tutor.",
            "examples": "Ví dụ mẫu có sẵn cho nhóm từ cốt lõi; mọi từ đều có thể mở AI Giải thích từ vựng để xem ví dụ và phân biệt từ dễ nhầm.",
        },
        "legacyMismatches": [],
    }

    for vkey, vinfo in VERSIONS.items():
        pref = vinfo["prefix"]
        vdir = OUT / vkey
        vdir.mkdir(exist_ok=True)
        levels = {}
        for lvl in vinfo["levels"]:
            tag = f"{pref}-{lvl}"
            rows = []
            seen = set()
            dup = 0
            for e in data:
                if tag not in e["level"]:
                    continue
                s = e["simplified"]
                if s in seen:
                    dup += 1
                    continue
                seen.add(s)
                f0, rest_forms = pick_primary_form(e["forms"], s)
                py = f0["transcriptions"]["pinyin"].replace("  ", " ").strip()
                pn = f0["transcriptions"]["numeric"].strip()
                meanings = [m for m in f0.get("meanings", []) if m]
                trad = f0.get("traditional") or ""
                row = {
                    "id": "",
                    "h": s,
                    "p": py,
                    "n": pn,
                    "pos": pos_categories(e.get("pos", [])),
                    "c": classify_topic(meanings, e.get("pos", [])),
                    "e": meanings[:6],
                    "f": e.get("frequency") or 0,
                }
                if trad and trad != s:
                    row["t"] = trad
                hv = han_viet(trad, s, uni)
                if hv:
                    row["hv"] = hv
                if f0.get("classifiers"):
                    row["cl"] = f0["classifiers"][:4]
                if rest_forms:
                    row["alt"] = [
                        {"p": f["transcriptions"]["pinyin"].strip(), "e": (f.get("meanings") or [])[:3]}
                        for f in rest_forms[:3]
                    ]
                if e.get("radical"):
                    row["r"] = e["radical"]

                lw = legacy_by_h.get(s)
                if lw:
                    row["id"] = lw["id"]
                    row["vi"] = lw["meanings"]["vietnamese"]
                    if lw.get("topic") and lw.get("topic") != "daily":
                        row["c"] = legacy_topic_map.get(lw["topic"], row["c"])
                    row["ex"] = lw.get("examples", [])
                    if lw.get("confused_with"):
                        row["cf"] = lw["confused_with"]
                    if lw.get("vietnamese_pronunciation_hint"):
                        row["vh"] = lw["vietnamese_pronunciation_hint"]
                    row["cur"] = 1
                    if lw["hsk_level"] != lvl:
                        manifest["legacyMismatches"].append({
                            "version": vkey, "hanzi": s, "legacyLevel": lw["hsk_level"], "officialLevel": lvl
                        })
                elif s in vi_manual:
                    row["vi"] = vi_manual[s]
                    row["man"] = 1

                if not row["id"]:
                    row["id"] = f"{vkey}_{s}"
                rows.append(row)

            rows.sort(key=lambda r: (r["f"] if r["f"] else 10**9))
            (vdir / f"L{lvl}.json").write_text(json.dumps(rows, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
            off = vinfo["official"][lvl]
            levels[str(lvl)] = {
                "count": len(rows),
                "official": off,
                "diff": len(rows) - off,
                "duplicatesRemoved": dup,
                "withVietnamese": sum(1 for r in rows if "vi" in r),
                "withHanViet": sum(1 for r in rows if "hv" in r),
                "withExamples": sum(1 for r in rows if r.get("ex")),
                "topicClassified": sum(1 for r in rows if r["c"] != "other"),
            }
        manifest["versions"][vkey] = {
            "label": vinfo["label"],
            "short": vinfo["short"],
            "note": vinfo["note"],
            "levels": levels,
            "total": sum(l["count"] for l in levels.values()),
            "officialTotal": sum(vinfo["official"].values()),
        }

    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=1), encoding="utf-8")
    for v, info in manifest["versions"].items():
        print(f"{v}: {info['total']} / {info['officialTotal']}")
        for l, d in info["levels"].items():
            print(f"  L{l}: count={d['count']} (official={d['official']}) vi={d['withVietnamese']} hv={d['withHanViet']} topics={d['topicClassified']}")


if __name__ == "__main__":
    main()
