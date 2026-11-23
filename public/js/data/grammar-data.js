/* -*- coding: utf-8 -*-
 * QChinese – External Grammar Learning Library (HSK 1 – HSK 6, Simplified Chinese 简体中文)
 * Independent from AI PDF HSK 3.0 (contentSource: "EXTERNAL_LIBRARY")
 * Includes 5 exercise types per lesson:
 *   1. Bài tập cấu trúc câu (structureMatch)
 *   2. Điền từ (fillBlank)
 *   3. Chọn đáp án (multipleChoice)
 *   4. Sắp xếp câu (reorder)
 *   5. Sửa lỗi ngữ pháp (errorCorrection)
 *   + Tự viết câu với AI chấm bài (freeWritePrompt)
 */

window.QCHINESE_GRAMMAR = [
  {
    id: "g_shi",
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "grammar",
    hsk_level: 1,
    topic: "Cấu trúc câu cơ bản",
    title: "Câu chữ 是 (shì) – Khẳng định & Phủ định danh tính",
    formula: "Chủ ngữ + 是 / 不是 + Danh từ (Tân ngữ)",
    explainVi: "Động từ hệ từ 是 (shì - là) dùng để nối chủ ngữ với danh từ chỉ tên gọi, nghề nghiệp, quốc tịch hoặc mối quan hệ. Thể phủ định là 不是 (bú shì – không phải là; chú ý 不 biến điệu thành thanh 2 trước 是).",
    explainEn: "The copula verb 是 (shì - to be) connects a subject with a noun or noun phrase indicating identity, profession, or nationality. Negated with 不是 (bú shì).",
    commonMistakes: "LỖI KINH ĐIỂN CỦA NGƯỜI VIỆT: Không dùng 是 trước tính từ! Ví dụ 'Tôi khỏe' phải nói 我很好 (Wǒ hěn hǎo), TUYỆT ĐỐI không nói *我是好.",
    sourceAttribution: { name: "QChinese Open Grammar Library", license: "CC BY-SA 4.0" },
    examples: [
      { chinese: "我是学生。", pinyin: "Wǒ shì xuésheng.", english: "I am a student.", vietnamese: "Tôi là học sinh / sinh viên." },
      { chinese: "他不是老师，他是医生。", pinyin: "Tā bú shì lǎoshī, tā shì yīshēng.", english: "He is not a teacher; he is a doctor.", vietnamese: "Anh ấy không phải là giáo viên, anh ấy là bác sĩ." }
    ],
    exercises: {
      structureMatch: {
        question: "Cấu trúc nào đúng với câu định danh chữ 是?",
        options: [
          "Chủ ngữ + 是 / 不是 + Danh từ / Cụm danh từ",
          "Chủ ngữ + 是 + Tính từ đơn âm tiết",
          "是 + Chủ ngữ + Động từ",
          "Chủ ngữ + Danh từ + 是"
        ],
        answer: "Chủ ngữ + 是 / 不是 + Danh từ / Cụm danh từ",
        explain: "Động từ hệ từ 是 đứng giữa Chủ ngữ và Danh từ tân ngữ."
      },
      fillBlank: {
        sentence: "我 ___ 越南人。",
        options: ["是", "很", "在", "有"],
        answer: "是",
        explain: "Sau chỗ trống là danh từ chỉ quốc tịch '越南人' (người Việt Nam), nên dùng động từ hệ từ 是."
      },
      reorder: {
        words: ["不是", "他", "我哥哥", "。"],
        answer: "他不是我哥哥。",
        pinyin: "Tā bú shì wǒ gēge.",
        vi: "Anh ấy không phải là anh trai tôi.",
        explain: "Trật tự chuẩn: Chủ ngữ (他) + Phủ định (不是) + Cụm danh từ (我哥哥)."
      },
      multipleChoice: {
        question: "Câu nào dưới đây ĐÚNG ngữ pháp tiếng Trung?",
        options: [
          "我是很好。",
          "王先生是我们的中文老师。",
          "她是漂亮。",
          "我不有书。"
        ],
        answer: "王先生是我们的中文老师。",
        explain: "'我们的中文老师' là cụm danh từ nên đi với 是 hoàn toàn chính xác. Các câu '我是很好', '她是漂亮' sai vì dùng 是 trước tính từ."
      },
      errorCorrection: {
        wrongSentence: "我的汉语老师是很热情。",
        options: [
          "我的汉语老师很热情。",
          "我的汉语老师是热情。",
          "是很热情我的汉语老师。",
          "我的汉语老师不很是热情。"
        ],
        answer: "我的汉语老师很热情。",
        explain: "热情 (nhiệt tình) là tính từ nên dùng phó từ 很 làm vị ngữ trực tiếp, phải bỏ chữ 是 thừa."
      },
      freeWritePrompt: "Hãy tự viết 1 câu giới thiệu bạn là người nước nào hoặc nghề nghiệp của bạn bằng cấu trúc 是 / 不是."
    }
  },
  {
    id: "g_hen_adj",
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "grammar",
    hsk_level: 1,
    topic: "Câu vị ngữ tính từ",
    title: "Câu vị ngữ tính từ với 很 (hěn)",
    formula: "Chủ ngữ + 很 / 不 + Tính từ",
    explainVi: "Trong tiếng Trung, tính từ có thể trực tiếp làm vị ngữ mà KHÔNG cần động từ 是. Ở câu trần thuật khẳng định đơn giản, người bản xứ thường thêm phó từ 很 (hěn) trước tính từ để câu cân bằng nhịp điệu. Phủ định dùng 不 + Tính từ (bỏ 很).",
    explainEn: "Adjectives function directly as predicates in Chinese without 是. In simple affirmative statements, 很 (hěn) is typically placed before the adjective for natural rhythm.",
    commonMistakes: "1) Thêm nhầm 是 trước tính từ (*中文是难 → sửa thành 中文很难). 2) Khi phủ định quên bỏ 很 (nói 'không bận' là 不忙).",
    sourceAttribution: { name: "QChinese Open Grammar Library", license: "CC BY-SA 4.0" },
    examples: [
      { chinese: "今天天气很好。", pinyin: "Jīntiān tiānqì hěn hǎo.", english: "The weather is nice today.", vietnamese: "Hôm nay thời tiết rất đẹp." },
      { chinese: "汉字不难，很有意思。", pinyin: "Hànzì bù nán, hěn yǒuyìsi.", english: "Chinese characters are not hard; they are very interesting.", vietnamese: "Chữ Hán không khó, rất thú vị." }
    ],
    exercises: {
      structureMatch: {
        question: "Khi muốn nói 'Món ăn Trung Quốc rất ngon', ta áp dụng công thức nào?",
        options: [
          "Chủ ngữ (中国菜) + 很 + Tính từ (好吃)",
          "Chủ ngữ (中国菜) + 是 + Tính từ (好吃)",
          "Chủ ngữ (中国菜) + 有 + Tính từ (好吃)",
          "Tính từ (好吃) + 很 + Chủ ngữ (中国菜)"
        ],
        answer: "Chủ ngữ (中国菜) + 很 + Tính từ (好吃)",
        explain: "Câu vị ngữ tính từ khẳng định dùng: Chủ ngữ + 很 + Tính từ."
      },
      fillBlank: {
        sentence: "妈妈做的菜 ___ 好吃。",
        options: ["很", "是", "有", "在"],
        answer: "很",
        explain: "好吃 (ngon) là tính từ làm vị ngữ, dùng phó từ mức độ 很 đứng trước chứ không dùng 是."
      },
      reorder: {
        words: ["今天", "工作", "忙", "很", "爸爸", "。"],
        answer: "今天爸爸工作很忙。",
        altAnswers: ["爸爸今天工作很忙。"],
        pinyin: "Jīntiān bàba gōngzuò hěn máng.",
        vi: "Hôm nay công việc của bố rất bận.",
        explain: "Thời gian (今天) đứng đầu hoặc ngay sau chủ ngữ (爸爸), cuối câu là 很 + tính từ 忙."
      },
      multipleChoice: {
        question: "Muốn nói 'Cà phê không đắt' bằng tiếng Trung chuẩn:",
        options: ["咖啡不贵。", "咖啡是不贵。", "咖啡没贵。", "不贵是咖啡。"],
        answer: "咖啡不贵。",
        explain: "Tính từ 贵 (đắt) phủ định trực tiếp bằng 不 → 咖啡不贵。"
      },
      errorCorrection: {
        wrongSentence: "这件衣服是很漂亮。",
        options: [
          "这件衣服很漂亮。",
          "这件衣服漂亮是。",
          "是这件衣服很漂亮。",
          "这件衣服有很漂亮。"
        ],
        answer: "这件衣服很漂亮。",
        explain: "漂亮 là tính từ, không dùng 是 trước 很漂亮."
      },
      freeWritePrompt: "Hãy viết 1 câu miêu tả đồ ăn, thời tiết hoặc việc học tiếng Trung sử dụng 很 + Tính từ."
    }
  },
  {
    id: "g_time_place_order",
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "grammar",
    hsk_level: 1,
    topic: "Trật tự từ & Trạng ngữ",
    title: "Trật tự vàng: Chủ ngữ + Thời gian + Ở Địa điểm + Hành động",
    formula: "Chủ ngữ + [Thời gian] + [在 + Địa điểm] + Động từ + Tân ngữ",
    explainVi: "Khác biệt lớn nhất giữa tiếng Việt và tiếng Trung: Tiếng Trung BẮT BUỘC đưa Thời gian và Cụm địa điểm (在 + nơi chốn) lên TRƯỚC động từ chính!",
    explainEn: "In Chinese, time expressions and location phrases (在 + place) MUST precede the main action verb: Subject + Time + 在 Place + Verb + Object.",
    commonMistakes: "Đặt '今天' hoặc '在学校 / 在家' ra cuối câu theo thói quen tiếng Việt (*我学习中文在学校今天 → Sửa đúng: 我今天在学校学习中文).",
    sourceAttribution: { name: "QChinese Open Grammar Library", license: "CC BY-SA 4.0" },
    examples: [
      { chinese: "我每天在家学习中文。", pinyin: "Wǒ měitiān zài jiā xuéxí Zhōngwén.", english: "I study Chinese at home every day.", vietnamese: "Mỗi ngày tôi học tiếng Trung ở nhà." },
      { chinese: "明天上午我们在咖啡馆见面。", pinyin: "Míngtiān shàngwǔ wǒmen zài kāfēiguǎn jiànmiàn.", english: "Tomorrow morning we will meet at the cafe.", vietnamese: "Sáng mai chúng mình gặp nhau ở quán cà phê nhé." }
    ],
    exercises: {
      structureMatch: {
        question: "Trật tự thành phần câu chuẩn trong tiếng Trung là gì?",
        options: [
          "Chủ ngữ + Thời gian + 在 Địa điểm + Động từ + Tân ngữ",
          "Chủ ngữ + Động từ + Tân ngữ + 在 Địa điểm + Thời gian",
          "Chủ ngữ + 在 Địa điểm + Động từ + Thời gian",
          "Động từ + Chủ ngữ + Thời gian + Địa điểm"
        ],
        answer: "Chủ ngữ + Thời gian + 在 Địa điểm + Động từ + Tân ngữ",
        explain: "Trạng ngữ chỉ thời gian và địa điểm luôn đứng trước động từ chính."
      },
      fillBlank: {
        sentence: "我姐姐 ___ 医院工作。",
        options: ["在", "是", "有", "很"],
        answer: "在",
        explain: "Cụm '在 + Địa điểm (医院)' đứng trước động từ '工作' để chỉ nơi diễn ra hành động."
      },
      reorder: {
        words: ["看书", "晚上", "在房间", "我", "。"],
        answer: "我晚上在房间看书。",
        altAnswers: ["晚上我在房间看书。"],
        pinyin: "Wǒ wǎnshang zài fángjiān kàn shū.",
        vi: "Buổi tối tôi đọc sách ở trong phòng.",
        explain: "Chủ ngữ (我) + Thời gian (晚上) + Địa điểm (在房间) + Động từ (看书)."
      },
      multipleChoice: {
        question: "Chọn câu dịch đúng cho: 'Hôm nay tôi ăn cơm ở nhà hàng':",
        options: [
          "我吃饭在饭馆今天。",
          "我今天在饭馆吃饭。",
          "我在饭馆吃饭今天。",
          "今天我吃饭在饭馆。"
        ],
        answer: "我今天在饭馆吃饭。",
        explain: "Thời gian 今天 → Địa điểm 在饭馆 → Hành động 吃饭."
      },
      errorCorrection: {
        wrongSentence: "我学习汉语在学校每天早上。",
        options: [
          "我每天早上在学校学习汉语。",
          "我学习汉语每天早上在学校。",
          "在学校学习汉语我每天早上。",
          "我每天早上学习汉语在学校。"
        ],
        answer: "我每天早上在学校学习汉语。",
        explain: "Đưa trạng ngữ thời gian '每天早上' và trạng ngữ địa điểm '在学校' lên trước động từ '学习汉语'."
      },
      freeWritePrompt: "Hãy viết 1 câu nói rõ bạn làm việc gì, vào lúc nào và ở đâu theo đúng công thức: Chủ ngữ + Thời gian + 在 Địa điểm + Động từ."
    }
  },
  {
    id: "g_measure_words",
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "grammar",
    hsk_level: 1,
    topic: "Lượng từ (量词)",
    title: "Cách dùng Lượng từ tiếng Trung (个, 本, 杯, 口, 件)",
    formula: "Số từ / 这 / 那 / 几 + Lượng từ + Danh từ",
    explainVi: "Trong tiếng Trung, giữa Số từ (一, 两, 三...) hoặc Đại từ chỉ định (这, 那, 哪, 几) và Danh từ BẮT BUỘC phải có Lượng từ phù hợp: 个 (người/vật chung), 本 (sách/vở), 杯 (cốc/tách), 口 (nhân khẩu trong nhà), 件 (áo/sự việc).",
    explainEn: "A measure word (classifier) is mandatory between a number/demonstrative (这, 那, 几) and a noun. Common classifiers: 个, 本 (books), 杯 (cups), 件 (clothes/matters).",
    commonMistakes: "1) Quên lượng từ (*三书 → 三本书; *这人 → 这个人). 2) Dùng 二 trước lượng từ (*二本书 → phải dùng 两本书).",
    sourceAttribution: { name: "QChinese Open Grammar Library", license: "CC BY-SA 4.0" },
    examples: [
      { chinese: "我想买两本中文书和一杯热茶。", pinyin: "Wǒ xiǎng mǎi liǎng běn Zhōngwén shū hé yì bēi rè chá.", english: "I want to buy two Chinese books and a cup of hot tea.", vietnamese: "Tôi muốn mua hai quyển sách tiếng Trung và một cốc trà nóng." },
      { chinese: "这件衣服很漂亮。", pinyin: "Zhè jiàn yīfu hěn piàoliang.", english: "This piece of clothing is very pretty.", vietnamese: "Bộ quần áo này rất đẹp." }
    ],
    exercises: {
      structureMatch: {
        question: "Cấu trúc nào đúng khi kết hợp số lượng với danh từ?",
        options: [
          "Số từ / 这 / 那 + Lượng từ + Danh từ",
          "Số từ + Danh từ (không cần lượng từ)",
          "Lượng từ + Số từ + Danh từ",
          "Danh từ + Lượng từ + Số từ"
        ],
        answer: "Số từ / 这 / 那 + Lượng từ + Danh từ",
        explain: "Lượng từ luôn đứng giữa Số từ/Đại từ chỉ định và Danh từ."
      },
      fillBlank: {
        sentence: "昨天我买了两 ___ 汉语词典。",
        options: ["本", "杯", "件", "口"],
        answer: "本",
        explain: "词典 (từ điển / sách vở) đi với lượng từ chuyên dụng 本 (běn)."
      },
      reorder: {
        words: ["热咖啡", "我要", "两杯", "。"],
        answer: "我要两杯热咖啡。",
        pinyin: "Wǒ yào liǎng bēi rè kāfēi.",
        vi: "Cho tôi hai cốc cà phê nóng.",
        explain: "Chủ ngữ (我) + Động từ (要) + Số lượng từ (两杯) + Danh từ (热咖啡)."
      },
      multipleChoice: {
        question: "Cụm từ nào chỉ 'hai quyển sách' ĐÚNG ngữ pháp?",
        options: ["两本书", "二本书", "两书", "本两书"],
        answer: "两本书",
        explain: "Khi đếm số lượng 2 + Lượng từ + Danh từ, bắt buộc dùng 两 (liǎng) chứ không dùng 二."
      },
      errorCorrection: {
        wrongSentence: "我买了一衣服和二书。",
        options: [
          "我买了一件衣服和两本书。",
          "我买了一个衣服和二本书。",
          "我买了衣服一件和书两本。",
          "我买一件了衣服和两书。"
        ],
        answer: "我买了一件衣服和两本书。",
        explain: "Quần áo dùng lượng từ 件 (一件衣服), sách dùng lượng từ 本 và số 2 trước lượng từ dùng 两 (两本书)."
      },
      freeWritePrompt: "Hãy viết 1 câu có sử dụng ít nhất 1 lượng từ (ví dụ: 一杯茶, 两本书, 三个人, 这件衣服)."
    }
  },
  {
    id: "g_bu_vs_mei",
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "grammar",
    hsk_level: 2,
    topic: "Phó từ phủ định",
    title: "Phân biệt phủ định 不 (bù) và 没 / 没有 (méi / méiyǒu)",
    formula: "不 + Động từ hiện tại/tương lai/tính từ  |  没(有) + 有 / Hành động quá khứ",
    explainVi: "1) Động từ 有 (có) LUÔN phủ định bằng 没 → 没有 (không có). 2) 不 phủ định thói quen hiện tại, tương lai hoặc ý muốn chủ quan; 没 / 没有 phủ định sự việc trong quá khứ hoặc kết quả khách quan ('chưa / đã không làm', và khi đã có 没 thì bỏ 了 cuối câu!).",
    explainEn: "Use 不 for habitual, future, volitional actions, and adjectives. Use 没(有) strictly for negating 有 ('to have') and for actions that did not happen in the past.",
    commonMistakes: "1) Nói *我不有钱 (sai) → phải nói 我没有钱. 2) Giữ cả 没 lẫn 了 trong cùng câu (*我没去了 → sửa thành 我没去).",
    sourceAttribution: { name: "QChinese Open Grammar Library", license: "CC BY-SA 4.0" },
    examples: [
      { chinese: "我今天没有时间，明天不去商店。", pinyin: "Wǒ jīntiān méiyǒu shíjiān, míngtiān bú qù shāngdiàn.", english: "I don't have time today, and tomorrow I won't go to the store.", vietnamese: "Hôm nay tôi không có thời gian, ngày mai không đi cửa hàng." },
      { chinese: "昨天晚上我没看电影。", pinyin: "Zuótiān wǎnshang wǒ méi kàn diànyǐng.", english: "Last night I didn't watch a movie.", vietnamese: "Tối hôm qua tôi đã không xem phim." }
    ],
    exercises: {
      structureMatch: {
        question: "Quy tắc nào ĐÚNG khi phân biệt 不 và 没?",
        options: [
          "没 dùng cho động từ 有 và hành động chưa xảy ra trong quá khứ; 不 dùng cho hiện tại, tương lai và tính từ",
          "不 luôn đi với động từ 有 (*不有)",
          "没 luôn đi kèm với 了 ở cuối câu (*没...了)",
          "不 chỉ dùng cho quá khứ, 没 chỉ dùng cho tương lai"
        ],
        answer: "没 dùng cho động từ 有 và hành động chưa xảy ra trong quá khứ; 不 dùng cho hiện tại, tương lai và tính từ",
        explain: "Ghi nhớ: 没有 (không có), 没 + V (đã không làm trong quá khứ), 不 + Adj/V (hiện tại/tương lai)."
      },
      fillBlank: {
        sentence: "对不起，我现在 ___ 零钱。",
        options: ["没有", "不有", "不是", "不"],
        answer: "没有",
        explain: "Phủ định sở hữu ('không có tiền lẻ') bắt buộc dùng 没有."
      },
      reorder: {
        words: ["早饭", "今天早上", "吃", "我", "没", "。"],
        answer: "今天早上我没吃早饭。",
        altAnswers: ["我今天早上没吃早饭。"],
        pinyin: "Jīntiān zǎoshang wǒ méi chī zǎofàn.",
        vi: "Sáng nay tôi chưa / đã không ăn sáng.",
        explain: "Sự việc sáng nay chưa diễn ra nên dùng 没 trước động từ 吃 (không thêm 了)."
      },
      multipleChoice: {
        question: "Câu nào dưới đây ĐÚNG ngữ pháp?",
        options: [
          "昨天他没来学校了。",
          "昨天他没来学校。",
          "昨天他不来学校了。",
          "他不有中文词典。"
        ],
        answer: "昨天他没来学校。",
        explain: "Phủ định hành động quá khứ (昨天) dùng 没 và KHÔNG thêm 了 ở cuối câu."
      },
      errorCorrection: {
        wrongSentence: "昨天晚上我没做作业了。",
        options: [
          "昨天晚上我没做作业。",
          "昨天晚上我不做作业了。",
          "昨天晚上我没了做作业。",
          "我昨天晚上不有做作业。"
        ],
        answer: "昨天晚上我没做作业。",
        explain: "Khi phủ định hành động quá khứ bằng 没, tuyệt đối không giữ trợ từ 了 ở cuối câu."
      },
      freeWritePrompt: "Hãy đặt 1 câu sử dụng 没有 (không có...) hoặc 没 + Động từ (hôm qua/sáng nay chưa làm gì)."
    }
  },
  {
    id: "g_le_guo",
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "grammar",
    hsk_level: 2,
    topic: "Trợ từ động thái (动态助词)",
    title: "Trợ từ động thái 了 (đã hoàn thành) và 过 (đã từng trải nghiệm)",
    formula: "Động từ + 了 (+ Số lượng / Tân ngữ)  |  Động từ + 过 + Tân ngữ (Phủ định: 没 + V + 过)",
    explainVi: "了 (le) đặt sau động từ hoặc cuối câu để chỉ hành động đã hoàn tất hoặc tình huống thay đổi. 过 (guò) đặt ngay sau động từ để nhấn mạnh kinh nghiệm trong quá khứ ('đã từng làm gì đó'). Khi phủ định kinh nghiệm dùng: 没(有) + Động từ + 过 (vẫn giữ 过!).",
    explainEn: "了 indicates completion of an action or change of state. 过 indicates past experience ('have ever done'). Note: negation of 过 keeps 过 (没去过).",
    commonMistakes: "Khi phủ định 了 thì phải BỎ 了 (没去), nhưng khi phủ định trải nghiệm 过 thì phải GIỮ 过 (没去过中国).",
    sourceAttribution: { name: "QChinese Open Grammar Library", license: "CC BY-SA 4.0" },
    examples: [
      { chinese: "我去过北京两次。", pinyin: "Wǒ qù guo Běijīng liǎng cì.", english: "I have been to Beijing twice.", vietnamese: "Tôi đã từng đi Bắc Kinh hai lần." },
      { chinese: "我还没吃过这种中国菜。", pinyin: "Wǒ hái méi chī guo zhè zhǒng Zhōngguó cài.", english: "I haven't tried this kind of Chinese dish yet.", vietnamese: "Tôi vẫn chưa từng ăn món Trung Quốc này." }
    ],
    exercises: {
      structureMatch: {
        question: "Muốn diễn đạt 'Tôi chưa từng xem bộ phim này', dùng công thức nào?",
        options: [
          "Chủ ngữ + 没(有) + Động từ + 过 + Tân ngữ",
          "Chủ ngữ + 不 + Động từ + 过 + Tân ngữ",
          "Chủ ngữ + 没 + Động từ + 了 + 过",
          "Chủ ngữ + 过 + 没 + Động từ"
        ],
        answer: "Chủ ngữ + 没(有) + Động từ + 过 + Tân ngữ",
        explain: "Phủ định trải nghiệm dùng 没(有) + Động từ + 过 + Tân ngữ."
      },
      fillBlank: {
        sentence: "你去 ___ 上海吗？",
        options: ["过", "了", "着", "的"],
        answer: "过",
        explain: "Hỏi về trải nghiệm trong đời ('Bạn đã từng đi Thượng Hải chưa?') dùng trợ từ 过."
      },
      reorder: {
        words: ["我", "两次", "看过", "这部电影", "。"],
        answer: "我看过这部电影两次。",
        altAnswers: ["这部电影我看过两次。", "我看过两次这部电影。"],
        pinyin: "Wǒ kàn guo zhè bù diànyǐng liǎng cì.",
        vi: "Tôi đã từng xem bộ phim này hai lần.",
        explain: "Động từ + 过 (看过) + Tân ngữ + Bổ ngữ tần suất (两次)."
      },
      multipleChoice: {
        question: "Chọn câu đúng ngữ pháp:",
        options: [
          "我没吃过北京烤鸭。",
          "我不吃过北京烤鸭。",
          "我没吃北京烤鸭过。",
          "我吃过没北京烤鸭。"
        ],
        answer: "我没吃过北京烤鸭。",
        explain: "Trợ từ 过 đứng liền ngay sau động từ 吃, phía trước phủ định bằng 没."
      },
      errorCorrection: {
        wrongSentence: "我不去过中国旅游。",
        options: [
          "我没去过中国旅游。",
          "我不去了中国旅游。",
          "我没去中国旅游过。",
          "我过没去中国旅游。"
        ],
        answer: "我没去过中国旅游。",
        explain: "Trợ từ trải nghiệm 过 phải phủ định bằng 没 (没去过), không dùng 不."
      },
      freeWritePrompt: "Hãy viết 1 câu kể về nơi bạn đã từng đi (去过) hoặc món ăn bạn đã từng thử (吃过)."
    }
  },
  {
    id: "g_suiran_danshi",
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "grammar",
    hsk_level: 3,
    topic: "Liên từ & Câu phức",
    title: "Cặp liên từ nhượng bộ 虽然……，但是…… (Tuy..., nhưng...)",
    formula: "虽然 + Mệnh đề A，但是 / 可是 + Mệnh đề B",
    explainVi: "Khác với tiếng Anh (không dùng cả Although và But trong cùng một câu), tiếng Trung BẮT BUỘC dùng cả cặp 虽然……，但是…… để nối vế nhượng bộ và vế chuyển ý!",
    explainEn: "Unlike English ('although' cannot pair with 'but'), Chinese naturally pairs 虽然 (although) in the first clause with 但是 (but/however) in the second clause.",
    commonMistakes: "Bỏ mất 但是 ở vế sau do ảnh hưởng của tiếng Anh!",
    sourceAttribution: { name: "QChinese Open Grammar Library", license: "CC BY-SA 4.0" },
    examples: [
      { chinese: "虽然汉字有点儿难，但是很有意思。", pinyin: "Suīrán Hànzì yǒudiǎnr nán, dànshì hěn yǒuyìsi.", english: "Although Chinese characters are a bit hard, they are very interesting.", vietnamese: "Tuy chữ Hán hơi khó một chút, nhưng rất thú vị." }
    ],
    exercises: {
      structureMatch: {
        question: "Cặp liên từ nào biểu thị quan hệ nhượng bộ 'Tuy..., nhưng...'?",
        options: [
          "虽然……，但是……",
          "因为……，所以……",
          "不但……，而且……",
          "如果……，就……"
        ],
        answer: "虽然……，但是……",
        explain: "虽然 (tuy rằng) luôn sóng đôi với 但是 / 可是 (nhưng)."
      },
      fillBlank: {
        sentence: "虽然外面很冷，___ 他还是每天早上跑步。",
        options: ["但是", "因为", "所以", "如果"],
        answer: "但是",
        explain: "Cặp liên từ cố định: 虽然……，但是…… (Tuy..., nhưng...)."
      },
      reorder: {
        words: ["虽然", "很忙，", "我", "但是", "每天学习中文", "。"],
        answer: "虽然我很忙，但是每天学习中文。",
        altAnswers: ["我虽然很忙，但是每天学习中文。"],
        pinyin: "Suīrán wǒ hěn máng, dànshì měitiān xuéxí Zhōngwén.",
        vi: "Tuy tôi rất bận, nhưng mỗi ngày đều học tiếng Trung.",
        explain: "虽然 có thể đứng trước hoặc ngay sau chủ ngữ vế 1, vế 2 bắt đầu bằng 但是."
      },
      multipleChoice: {
        question: "Chọn câu dùng cặp liên từ nhượng bộ tự nhiên nhất:",
        options: [
          "虽然这件衣服很贵，但是质量非常好。",
          "虽然这件衣服很贵，所以质量非常好。",
          "因为这件衣服很贵，但是我不买。",
          "这件衣服虽然很贵，因为很好看。"
        ],
        answer: "虽然这件衣服很贵，但是质量非常好。",
        explain: "虽然 đi với 但是 diễn tả sự đối lập giữa giá đắt và chất lượng cực tốt."
      },
      errorCorrection: {
        wrongSentence: "虽然今天下雨，所以我还去学校上课。",
        options: [
          "虽然今天下雨，但是我还去学校上课。",
          "因为今天下雨，但是我还去学校上课。",
          "虽然今天下雨，而且我还去学校上课。",
          "今天虽然下雨，所以去学校上课。"
        ],
        answer: "虽然今天下雨，但是我还去学校上课。",
        explain: "Vế đầu dùng 虽然 (Tuy trời mưa) thì vế sau chuyển ý phải dùng 但是 (nhưng tôi vẫn đi học), không dùng 所以."
      },
      freeWritePrompt: "Hãy viết 1 câu với cặp 虽然……，但是…… nói về việc học tiếng Trung hoặc cuộc sống của bạn."
    }
  },
  {
    id: "g_de_complement",
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "grammar",
    hsk_level: 3,
    topic: "Bổ ngữ trạng thái / trình độ",
    title: "Bổ ngữ trạng thái với trợ từ 得 (de) – Đánh giá mức độ hành động",
    formula: "Động từ + 得 + (很 / 非常 / 不) + Tính từ   |   [Có tân ngữ]: Động từ + Tân ngữ + Động từ + 得 + Tính từ",
    explainVi: "Trợ từ kết cấu 得 (de) đứng sau động từ để nối với cụm tính từ đánh giá hành động đó diễn ra như thế nào (nhanh, chậm, giỏi, đẹp...). Đặc biệt: Nếu động từ mang tân ngữ (như 说中文, 写汉字), ta phải lặp lại động từ hoặc đưa tân ngữ lên trước: 他说中文说得很好 hoặc 他中文说得很好!",
    explainEn: "Use Verb + 得 + Adjective to describe how well or in what manner an action is performed. When an object is present, repeat the verb or front the object.",
    commonMistakes: "Đặt 得 ngay sau tân ngữ (*他说中文得很好 → SAI! Phải nói: 他说中文说得很好 hoặc 他中文说得很好).",
    sourceAttribution: { name: "QChinese Open Grammar Library", license: "CC BY-SA 4.0" },
    examples: [
      { chinese: "她写汉字写得非常漂亮。", pinyin: "Tā xiě Hànzì xiě de fēicháng piàoliang.", english: "She writes Chinese characters very beautifully.", vietnamese: "Cô ấy viết chữ Hán vô cùng đẹp." },
      { chinese: "你今天来得很早，跑得也很快。", pinyin: "Nǐ jīntiān lái de hěn zǎo, pǎo de yě hěn kuài.", english: "You came very early today and ran very fast too.", vietnamese: "Hôm nay bạn đến rất sớm, chạy cũng rất nhanh." }
    ],
    exercises: {
      structureMatch: {
        question: "Khi động từ có mang tân ngữ (ví dụ: 说汉语), công thức bổ ngữ trạng thái nào ĐÚNG?",
        options: [
          "Chủ ngữ + Động từ + Tân ngữ + Động từ + 得 + Phó từ + Tính từ",
          "Chủ ngữ + Động từ + Tân ngữ + 得 + Tính từ",
          "Chủ ngữ + 得 + Động từ + Tân ngữ + Tính từ",
          "Chủ ngữ + Động từ + 的 + Tính từ"
        ],
        answer: "Chủ ngữ + Động từ + Tân ngữ + Động từ + 得 + Phó từ + Tính từ",
        explain: "Trợ từ 得 bắt buộc phải đứng ngay sau Động từ, không được đứng sau Tân ngữ."
      },
      fillBlank: {
        sentence: "明安说汉语说 ___ 很流利。",
        options: ["得", "的", "地", "了"],
        answer: "得",
        explain: "Sau động từ 说 dùng trợ từ 得 (Động từ + 得 + Tính từ)."
      },
      reorder: {
        words: ["妈妈", "做菜", "好吃", "做得", "非常", "。"],
        answer: "妈妈做菜做得非常好吃。",
        altAnswers: ["妈妈菜做得非常好吃。"],
        pinyin: "Māma zuò cài zuò de fēicháng hǎochī.",
        vi: "Mẹ nấu ăn ngon vô cùng.",
        explain: "Lặp lại động từ 做 trước 得: 做菜做得非常好吃."
      },
      multipleChoice: {
        question: "Câu nào dưới đây ĐÚNG ngữ pháp?",
        options: [
          "他唱中文歌唱得很好听。",
          "他唱中文歌得很好听。",
          "他唱得中文歌很好听。",
          "他唱中文歌的很好听。"
        ],
        answer: "他唱中文歌唱得很好听。",
        explain: "唱中文歌 là cụm động tân, phải lặp lại động từ 唱 trước 得 → 唱中文歌唱得很好听."
      },
      errorCorrection: {
        wrongSentence: "弟弟每天早上起床得太晚。",
        options: [
          "弟弟每天早上起床起得太晚。",
          "弟弟每天早上起床的太晚。",
          "弟弟每天早上得起床太晚。",
          "弟弟每天早上起太晚床得。"
        ],
        answer: "弟弟每天早上起床起得太晚。",
        explain: "起床 là từ ly hợp (Động + Tân), khi thêm bổ ngữ trạng thái phải lặp lại động từ 起 → 起床起得太晚."
      },
      freeWritePrompt: "Hãy viết 1 câu nhận xét việc nói tiếng Trung, viết chữ Hán hoặc nấu ăn sử dụng cấu trúc Động từ + 得 + Tính từ."
    }
  },
  {
    id: "g_ba_sentence",
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "grammar",
    hsk_level: 4,
    topic: "Câu đặc biệt HSK 4",
    title: "Câu chữ 把 (bǎ) – Tác động làm thay đổi vị trí / trạng thái sự vật",
    formula: "Chủ ngữ + (没/已经) + 把 + Tân ngữ xác định + Động từ + Thành phần khác (了 / 在… / 到… / 完)",
    explainVi: "Câu chữ 把 đưa tân ngữ xác định lên trước động từ để nhấn mạnh chủ ngữ xử lý, tác động làm tân ngữ thay đổi vị trí hoặc trạng thái. Động từ trong câu chữ 把 KHÔNG ĐƯỢC đứng trơ trọi một mình mà phải có bổ ngữ kết quả, bổ ngữ xu hướng, 在 + nơi chốn, hoặc 了!",
    explainEn: "The 把 construction fronts a definite object before the verb to show how an action disposes of, moves, or changes that object. The verb MUST take a complement or particle.",
    commonMistakes: "1) Để động từ trơ trọi ở cuối câu (*我把作业做 → phải có kết quả: 我把作业做完了). 2) Đặt phó từ phủ định 没 / 不 sau 把 (phải đặt TRƯỚC 把).",
    sourceAttribution: { name: "QChinese Open Grammar Library", license: "CC BY-SA 4.0" },
    examples: [
      { chinese: "请把生词写在本子上。", pinyin: "Qǐng bǎ shēngcí xiě zài běnzi shàng.", english: "Please write the new words down in the notebook.", vietnamese: "Xin hãy viết từ mới vào trong vở." },
      { chinese: "我已经把今天的课文读完了。", pinyin: "Wǒ yǐjīng bǎ jīntiān de kèwén dú wán le.", english: "I have already finished reading today's text.", vietnamese: "Tôi đã đọc xong bài khóa hôm nay rồi." }
    ],
    exercises: {
      structureMatch: {
        question: "Trong câu chữ 把, các phó từ phủ định (没, 不) hoặc động từ năng nguyện (想, 要, 应该) phải đặt ở đâu?",
        options: [
          "Đặt ngay TRƯỚC chữ 把",
          "Đặt sau chữ 把 và trước Động từ",
          "Đặt ở cuối câu",
          "Đặt sau Động từ chính"
        ],
        answer: "Đặt ngay TRƯỚC chữ 把",
        explain: "Mọi phó từ phủ định, thời gian (已经) và động từ năng nguyện đều phải đứng trước 把."
      },
      fillBlank: {
        sentence: "请 ___ 这杯热茶放在桌子上。",
        options: ["把", "被", "是", "跟"],
        answer: "把",
        explain: "Đưa tân ngữ xác định '这杯热茶' lên trước động từ '放在桌子上' (đặt lên bàn)."
      },
      reorder: {
        words: ["我", "把", "已经", "做完了", "今天的练习", "。"],
        answer: "我已经把今天的练习做完了。",
        pinyin: "Wǒ yǐjīng bǎ jīntiān de liànxí zuò wán le.",
        vi: "Tôi đã làm xong bài luyện tập hôm nay rồi.",
        explain: "Phó từ 已经 đứng trước 把; động từ 做 có bổ ngữ kết quả 完 + 了."
      },
      multipleChoice: {
        question: "Câu chữ 把 nào dưới đây ĐÚNG ngữ pháp?",
        options: [
          "他把那本书看。",
          "他把那本书看完了。",
          "他把看完了那本书。",
          "他把那本书没看完。"
        ],
        answer: "他把那本书看完了。",
        explain: "Trong câu chữ 把, sau động từ 看 bắt buộc phải có thành phần bổ sung kết quả (完了), và 没 phải đứng trước 把."
      },
      errorCorrection: {
        wrongSentence: "我把护照没放在包里。",
        options: [
          "我没把护照放在包里。",
          "我把没护照放在包里。",
          "我把护照放没在包里。",
          "我把护照放在包里没。"
        ],
        answer: "我没把护照放在包里。",
        explain: "Phó từ phủ định 没 bắt buộc phải đặt TRƯỚC giới từ 把 (我没把...)."
      },
      freeWritePrompt: "Hãy viết 1 câu chữ 把 (ví dụ: cất sách lên bàn, uống hết cốc cà phê, hoặc làm xong bài tập)."
    }
  },
  {
    id: "g_bei_passive",
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "grammar",
    hsk_level: 4,
    topic: "Câu bị động",
    title: "Câu bị động chữ 被 (bèi) – Diễn đạt sự việc chịu tác động",
    formula: "Chủ ngữ (bị tác động) + (没) + 被 + (Tác nhân) + Động từ + Thành phần bổ ngữ/了",
    explainVi: "Câu chữ 被 dùng để nhấn mạnh đối tượng chịu tác động của hành động. Tương tự câu chữ 把, động từ sau 被 phải có kết quả hoặc trạng thái đi kèm (了, 完, 走...), và phó từ phủ định 没 / 不 phải đứng TRƯỚC 被.",
    explainEn: "The 被 (bèi) passive voice highlights how the subject is affected by an action. Like 把, the verb requires a result complement or particle, and negation precedes 被.",
    commonMistakes: "Quên thành phần bổ ngữ sau động từ (*我的蛋糕被吃 → phải viết 我的蛋糕被弟弟吃了).",
    sourceAttribution: { name: "QChinese Open Grammar Library", license: "CC BY-SA 4.0" },
    examples: [
      { chinese: "桌上的苹果被弟弟吃完了。", pinyin: "Zhuō shàng de píngguǒ bèi dìdi chī wán le.", english: "The apples on the table were eaten up by my younger brother.", vietnamese: "Táo trên bàn bị em trai ăn hết rồi." },
      { chinese: "他的好成绩被老师表扬了。", pinyin: "Tā de hǎo chéngjì bèi lǎoshī biǎoyáng le.", english: "His good grades were praised by the teacher.", vietnamese: "Thành tích tốt của cậu ấy được thầy giáo biểu dương." }
    ],
    exercises: {
      structureMatch: {
        question: "Cấu trúc nào đúng với câu bị động chữ 被?",
        options: [
          "Đối tượng chịu tác động + 被 + (Chủ thể gây ra) + Động từ + Bổ ngữ / 了",
          "Chủ thể gây ra + 被 + Đối tượng chịu tác động + Động từ",
          "Đối tượng chịu tác động + Động từ + 被 + Chủ thể",
          "被 + Động từ + Chủ ngữ"
        ],
        answer: "Đối tượng chịu tác động + 被 + (Chủ thể gây ra) + Động từ + Bổ ngữ / 了",
        explain: "Chủ ngữ của câu chữ 被 là người/vật chịu tác động."
      },
      fillBlank: {
        sentence: "我的雨伞 ___ 朋友借走了。",
        options: ["被", "把", "从", "向"],
        answer: "被",
        explain: "'Chiếc ô của tôi được/bị bạn mượn đi rồi' là câu bị động dùng 被."
      },
      reorder: {
        words: ["那本词典", "被", "借走了", "同学", "。"],
        answer: "那本词典被同学借走了。",
        pinyin: "Nà běn cídiǎn bèi tóngxué jiè zǒu le.",
        vi: "Cuốn từ điển đó đã được bạn cùng lớp mượn đi rồi.",
        explain: "Chủ ngữ chịu tác động (那本词典) + 被 + Tác nhân (同学) + Động từ + Kết quả (借走了)."
      },
      multipleChoice: {
        question: "Câu bị động nào dưới đây ĐÚNG ngữ pháp?",
        options: [
          "我的手机没被弄丢。",
          "我的手机被没弄丢。",
          "我的手机被朋友拿。",
          "朋友被我的手机借走了。"
        ],
        answer: "我的手机没被弄丢。",
        explain: "Phó từ phủ định 没 đứng trước 被 và động từ có bổ ngữ kết quả 丢."
      },
      errorCorrection: {
        wrongSentence: "我的自行车被小偷偷。",
        options: [
          "我的自行车被小偷偷走了。",
          "小偷被我的自行车偷走了。",
          "我的自行车被偷小偷。",
          "我的自行车偷被小偷了。"
        ],
        answer: "我的自行车被小偷偷走了。",
        explain: "Động từ 偷 trong câu chữ 被 không được đứng trơ trọi mà cần bổ ngữ xu hướng/kết quả 走了."
      },
      freeWritePrompt: "Hãy viết 1 câu bị động sử dụng chữ 被."
    }
  },
  {
    id: "g_bujin_erqie",
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "grammar",
    hsk_level: 5,
    topic: "Cấu trúc tăng tiến",
    title: "Cấu trúc tăng tiến 不仅……，而且…… (Không những..., mà còn...)",
    formula: "Chủ ngữ + 不仅 + Vế 1，而且 + (还 / 也) + Vế 2",
    explainVi: "Dùng để diễn đạt quan hệ tăng tiến sâu sắc hơn ở vế thứ hai. Nếu hai vế CÙNG một chủ ngữ, chủ ngữ đặt TRƯỚC 不仅; nếu hai vế KHÁC chủ ngữ, 不仅 đặt ở đầu câu trước chủ ngữ 1.",
    explainEn: "Expresses progressive addition ('not only..., but also...'). Place the subject before 不仅 when both clauses share the same subject.",
    commonMistakes: "Đặt sai vị trí chủ ngữ khi hai vế cùng nói về 1 người, hoặc ghép nhầm 不仅 với 但是.",
    sourceAttribution: { name: "QChinese Open Grammar Library", license: "CC BY-SA 4.0" },
    examples: [
      { chinese: "她不仅会说流利的中文，而且汉字也写得非常漂亮。", pinyin: "Tā bùjǐn huì shuō liúlì de Zhōngwén, érqiě Hànzì yě xiě de fēicháng piàoliang.", english: "She can not only speak fluent Chinese, but also writes Chinese characters beautifully.", vietnamese: "Cô ấy không những nói tiếng Trung lưu loát mà chữ Hán cũng viết vô cùng đẹp." }
    ],
    exercises: {
      structureMatch: {
        question: "Khi hai vế câu có CÙNG một chủ ngữ, vị trí của 不仅 như thế nào?",
        options: [
          "Chủ ngữ + 不仅 + Vế 1，而且 + Vế 2",
          "不仅 + Chủ ngữ + Vế 1，但是 + Vế 2",
          "Chủ ngữ + Vế 1 + 不仅，而且 + Vế 2",
          "而且 + Vế 1，不仅 + Vế 2"
        ],
        answer: "Chủ ngữ + 不仅 + Vế 1，而且 + Vế 2",
        explain: "Khi cùng chủ ngữ, chủ ngữ đặt ở đầu câu trước 不仅."
      },
      fillBlank: {
        sentence: "每天阅读 ___ 能扩大词汇量，而且能培养语感。",
        options: ["不仅", "虽然", "只要", "无论"],
        answer: "不仅",
        explain: "Vế sau có 而且 → vế đầu dùng 不仅 tạo cấu trúc tăng tiến 'Không những..., mà còn...'."
      },
      reorder: {
        words: ["这家饭馆的菜", "不仅", "好吃，", "而且", "很便宜", "。"],
        answer: "这家饭馆的菜不仅好吃，而且很便宜。",
        pinyin: "Zhè jiā fànguǎn de cài bùjǐn hǎochī, érqiě hěn piányi.",
        vi: "Món ăn nhà hàng này không những ngon mà còn rất rẻ.",
        explain: "Cùng chủ ngữ '这家饭馆的菜' nên đặt chủ ngữ trước 不仅."
      },
      multipleChoice: {
        question: "Chọn câu sử dụng 不仅……而且…… chuẩn xác nhất:",
        options: [
          "他不仅喜欢听中文歌，而且还会唱很多首。",
          "他虽然喜欢听中文歌，而且还会唱。",
          "不仅他喜欢听歌，但是他会唱。",
          "他不仅喜欢听歌，所以还会唱。"
        ],
        answer: "他不仅喜欢听中文歌，而且还会唱很多首。",
        explain: "Cùng chủ ngữ 他 đứng đầu, nối bằng 不仅……，而且还…… rất tự nhiên."
      },
      errorCorrection: {
        wrongSentence: "她不仅学习很努力，但是常常帮助同学。",
        options: [
          "她不仅学习很努力，而且常常帮助同学。",
          "虽然她学习很努力，而且常常帮助同学。",
          "她不仅学习很努力，所以常常帮助同学。",
          "她而且学习很努力，不仅常常帮助同学。"
        ],
        answer: "她不仅学习很努力，而且常常帮助同学。",
        explain: "Cặp liên từ tăng tiến là 不仅……，而且…… (không ghép 不仅 với 但是)."
      },
      freeWritePrompt: "Hãy viết 1 câu dùng 不仅……，而且…… để khen một người bạn, một thành phố hoặc lợi ích của việc học tiếng Trung."
    }
  },
  {
    id: "g_yuqi_buru",
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "grammar",
    hsk_level: 6,
    topic: "Cấu trúc nghị luận HSK 6",
    title: "Cấu trúc so sánh chọn lựa học thuật 与其……，不如…… (Thà rằng..., chi bằng...)",
    formula: "与其 + Phương án A（kém hơn），不如 + Phương án B（tốt hơn）",
    explainVi: "Cấu trúc nâng cao HSK 6 dùng khi cân nhắc hai lựa chọn: bác bỏ phương án A (kém hiệu quả) để khẳng định lựa chọn B là tối ưu hơn ('Thay vì làm A, chi bằng làm B').",
    explainEn: "Advanced HSK 6 comparative choice structure ('Rather than doing A, it would be better to do B'), weighing two options and choosing B.",
    commonMistakes: "Đảo ngược vị trí phương án tốt/xấu! Hãy nhớ: sau 与其 là điều KHÔNG nên làm, sau 不如 mới là điều NÊN chọn.",
    sourceAttribution: { name: "QChinese Open Grammar Library", license: "CC BY-SA 4.0" },
    examples: [
      { chinese: "与其死记硬背几百个孤立的生词，不如结合真实的语境来运用它们。", pinyin: "Yǔqí sǐjìyìngbèi jǐ bǎi gè gūlì de shēngcí, bùrú jiéhé zhēnshí de yǔjìng lái yùnyòng tāmen.", english: "Rather than rote-memorizing hundreds of isolated words, it is better to apply them in authentic contexts.", vietnamese: "Thay vì học vẹt hàng trăm từ mới rời rạc, chi bằng kết hợp ngữ cảnh thực tế để vận dụng chúng." }
    ],
    exercises: {
      structureMatch: {
        question: "Trong cấu trúc 与其 A，不如 B, người nói khuyên chọn phương án nào?",
        options: [
          "Bác bỏ phương án A và khuyên chọn phương án B (tốt hơn)",
          "Khuyên chọn phương án A thay vì B",
          "Chọn cả hai phương án A và B cùng lúc",
          "Từ chối cả hai phương án A và B"
        ],
        answer: "Bác bỏ phương án A và khuyên chọn phương án B (tốt hơn)",
        explain: "Sau 与其 là phương án kém ưu tiên, sau 不如 là phương án được lựa chọn."
      },
      fillBlank: {
        sentence: "与其在家里担心考试结果，___ 现在开始认真复习。",
        options: ["不如", "而且", "但是", "尽管"],
        answer: "不如",
        explain: "与其……，不如……: Thay vì ngồi nhà lo lắng kết quả thi, chi bằng bắt đầu ôn tập nghiêm túc ngay bây giờ."
      },
      reorder: {
        words: ["与其", "等别人帮忙，", "不如", "自己想办法解决", "。"],
        answer: "与其等别人帮忙，不如自己想办法解决。",
        pinyin: "Yǔqí děng biérén bāngmáng, bùrú zìjǐ xiǎng bànfǎ jiějué.",
        vi: "Thay vì ngồi đợi người khác giúp đỡ, chi bằng tự mình tìm cách giải quyết.",
        explain: "Phương án bị loại bỏ đi sau 与其, phương án chủ động tối ưu đi sau 不如."
      },
      multipleChoice: {
        question: "Ý nghĩa chính xác của câu '周末与其去人多的地方排队，不如在家安静地看书' là:",
        options: [
          "Cuối tuần thà ra chỗ đông người xếp hàng còn hơn ở nhà đọc sách.",
          "Cuối tuần thay vì đến nơi đông người xếp hàng, chi bằng ở nhà yên tĩnh đọc sách.",
          "Cuối tuần vừa đi xếp hàng vừa về nhà đọc sách.",
          "Dù cuối tuần đông người nhưng vẫn thích xếp hàng mua sách."
        ],
        answer: "Cuối tuần thay vì đến nơi đông người xếp hàng, chi bằng ở nhà yên tĩnh đọc sách.",
        explain: "Sau 不如 là lựa chọn người nói ưu tiên ('在家安静地看书')."
      },
      errorCorrection: {
        wrongSentence: "与其浪费时间抱怨，而且马上行动起来。",
        options: [
          "与其浪费时间抱怨，不如马上行动起来。",
          "虽然浪费时间抱怨，不如马上行动起来。",
          "与其浪费时间抱怨，但是马上行动起来。",
          "不如浪费时间抱怨，与其马上行动起来。"
        ],
        answer: "与其浪费时间抱怨，不如马上行动起来。",
        explain: "Cặp cấu trúc cố định là 与其……，不如…… (Thay vì..., chi bằng...)."
      },
      freeWritePrompt: "Hãy viết 1 câu nghị luận ngắn sử dụng cấu trúc 与其……，不如…… chia sẻ kinh nghiệm học tập hoặc làm việc."
    }
  }
];
