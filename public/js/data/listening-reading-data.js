/* -*- coding: utf-8 -*-
 * QChinese – External Learning Library Dataset (HSK 1–6, Simplified Chinese 简体中文)
 * 100% Independent from AI PDF HSK 3.0 (contentSource: "EXTERNAL_LIBRARY")
 * Includes:
 *   - QCHINESE_HSK_ROADMAP & QCHINESE_PLACEMENT_TEST & QCHINESE_LEVEL_EXAMS
 *   - QCHINESE_LISTENING (8 Lessons across 5 Categories: Hội thoại đời sống, Hội thoại học tập, Nghe thông báo, Nghe phỏng vấn, Nghe tình huống thực tế)
 *   - QCHINESE_READING (12 Academic & Real-Life Passages across HSK 1–6 with multi-question comprehension, answers & bilingual explanations)
 *   - QCHINESE_TRANSLATION_LESSONS (18 Vietnamese -> Chinese Paragraph & Sentence Translation Lessons across HSK 1–6)
 *   - QCHINESE_WRITING_TASKS (External Writing Studio Prompts across HSK 1–6)
 *   - QCHINESE_SPEAKING_SCENARIOS (External Speaking Library across 4 Modes)
 */

window.QCHINESE_HSK_ROADMAP = [
  {
    level: 1,
    badge: "HSK 1",
    stage: "Người mới bắt đầu (Con số 0)",
    vocabTarget: "150–300 từ nền tảng",
    desc: "Làm quen Pinyin, 4 thanh điệu + biến điệu, bộ thủ, nét chữ Hán cơ bản, từ vựng và các mẫu câu giao tiếp hàng ngày đơn giản nhất.",
    milestones: ["Đọc chuẩn bảng Pinyin & phân biệt 4 thanh điệu", "Viết đúng thứ tự nét 50–100 chữ Hán cốt lõi", "Chào hỏi, giới thiệu bản thân, gia đình, gọi món, thời gian"]
  },
  {
    level: 2,
    badge: "HSK 2",
    stage: "Sơ cấp",
    vocabTarget: "300–600 từ thông dụng",
    desc: "Mở rộng từ vựng đời sống, giao tiếp tự tin trong các tình huống quen thuộc (mua sắm, hỏi đường, công việc, sức khỏe) và nắm vững mẫu câu cơ bản.",
    milestones: ["Phân biệt 不 vs 没, bổ ngữ kết quả cơ bản", "Nghe hiểu hội thoại tốc độ vừa phải", "Viết đoạn tự giới thiệu 4–6 câu"]
  },
  {
    level: 3,
    badge: "HSK 3",
    stage: "Sơ trung cấp",
    vocabTarget: "600–1.000 từ",
    desc: "Giao tiếp độc lập trong học tập, công việc và du lịch; bắt đầu đọc hiểu đoạn văn dài không phụ thuộc vào Pinyin.",
    milestones: ["Sử dụng thành thạo liên từ 虽然…但是…, 因为…所以…", "Đọc hiểu văn bản chữ Hán không kèm Pinyin", "Trò chuyện tự do 5–10 phút theo chủ đề"]
  },
  {
    level: 4,
    badge: "HSK 4",
    stage: "Trung cấp",
    vocabTarget: "1.200–2.000 từ",
    desc: "Diễn đạt quan điểm cá nhân mạch lạc, nắm chắc câu chữ 把 / 被, đọc hiểu nội dung xã hội – văn hóa và viết đoạn văn hoàn chỉnh.",
    milestones: ["Thảo luận ưu/nhược điểm một vấn đề", "Đọc tin tức ngắn và câu chuyện văn hóa", "Viết đoạn văn 100–150 chữ đúng ngữ cảnh"]
  },
  {
    level: 5,
    badge: "HSK 5",
    stage: "Trung cao cấp",
    vocabTarget: "2.500+ từ",
    desc: "Đọc hiểu báo chí, văn bản dài, hiểu nội dung học thuật phổ thông, xem phim/chương trình tiếng Trung và giao tiếp linh hoạt.",
    milestones: ["Phân biệt từ đồng nghĩa sắc thái tinh tế (效率 vs 效果)", "Nghe hiểu hội thoại dài nhiều lượt", "Viết bài luận ngắn 250–300 chữ"]
  },
  {
    level: 6,
    badge: "HSK 6",
    stage: "Cao cấp",
    vocabTarget: "5.000+ từ & Thành ngữ (成语)",
    desc: "Làm chủ khả năng đọc hiểu chuyên sâu, thành ngữ 4 chữ, diễn đạt tinh tế, nghe hiểu tốc độ bản xứ và sử dụng tiếng Trung chuyên nghiệp.",
    milestones: ["Vận dụng thành ngữ (潜移默化, 举一反三) tự nhiên", "Đọc hiểu văn bản nghị luận & tóm tắt ý chính", "Giao tiếp và viết học thuật/công sở chuẩn xác"]
  }
];

/* 3.2. Placement Test – 7 Mandatory Skill Sections */
window.QCHINESE_PLACEMENT_TEST = [
  {
    id: "pt_1",
    skill: "pinyin",
    skillLabel: "Pinyin & Thanh điệu",
    hskWeight: 1,
    type: "choice",
    audioText: "好",
    prompt: "Bấm nút Loa nghe âm phát ra và chọn Pinyin + dấu thanh điệu chính xác (nghĩa là 'tốt/khỏe'):",
    options: ["hāo (Thanh 1)", "háo (Thanh 2)", "hǎo (Thanh 3)", "hào (Thanh 4)"],
    answer: "hǎo (Thanh 3)",
    explain: "Chữ 好 mang Thanh 3 (hǎo) — giọng hạ trầm xuống thấp rồi nâng lên."
  },
  {
    id: "pt_2",
    skill: "pinyin",
    skillLabel: "Pinyin & Thanh điệu",
    hskWeight: 1,
    type: "choice",
    prompt: "Khi hai âm tiết Thanh 3 đi liền nhau như '你好 (nǐ hǎo)', âm đầu tiên được phát âm thực tế như thế nào?",
    options: ["Đọc thành Thanh 2 (ní hǎo)", "Đọc thành Thanh 4 (nì hǎo)", "Đọc thành Thanh 1 (nī hǎo)", "Bỏ hẳn không đọc"],
    answer: "Đọc thành Thanh 2 (ní hǎo)",
    explain: "Quy tắc biến điệu cốt lõi: Thanh 3 + Thanh 3 → đọc thành Thanh 2 + Thanh 3 (ní hǎo), dù mặt chữ Pinyin vẫn viết nǐ hǎo."
  },
  {
    id: "pt_3",
    skill: "vocab",
    skillLabel: "Từ vựng",
    hskWeight: 1,
    type: "choice",
    prompt: "Từ '学生 (xuésheng)' có nghĩa tiếng Việt là gì?",
    options: ["Giáo viên", "Học sinh / Sinh viên", "Bác sĩ", "Bạn bè"],
    answer: "Học sinh / Sinh viên",
    explain: "学生 (xuésheng) nghĩa là học sinh hoặc sinh viên; còn 老师 (lǎoshī) là giáo viên."
  },
  {
    id: "pt_4",
    skill: "vocab",
    skillLabel: "Từ vựng",
    hskWeight: 2,
    type: "choice",
    prompt: "Trong câu '这件衣服很便宜', từ '便宜 (piányi)' có nghĩa là:",
    options: ["Rất đắt", "Rất rẻ", "Rất thuận tiện", "Rất đẹp"],
    answer: "Rất rẻ",
    explain: "便宜 đọc là piányi nghĩa là 'rẻ' (phân biệt với 方便 fāngbiàn là 'thuận tiện')."
  },
  {
    id: "pt_5",
    skill: "hanzi",
    skillLabel: "Chữ Hán",
    hskWeight: 1,
    type: "choice",
    prompt: "Nhìn mặt chữ Giản thể: Chữ nào dưới đây mang nghĩa là 'MUA' (mǎi)?",
    options: ["买", "卖", "读", "头"],
    answer: "买",
    explain: "买 (mǎi - 6 nét, không có chữ 十 trên đầu) là MUA; còn 卖 (mài - có chữ 十 trên đầu) là BÁN."
  },
  {
    id: "pt_6",
    skill: "hanzi",
    skillLabel: "Chữ Hán",
    hskWeight: 2,
    type: "choice",
    prompt: "Chữ '妈 (mā - mẹ)' có bộ thủ nào ở bên trái để biểu thị ý nghĩa liên quan đến người phụ nữ?",
    options: ["Bộ Nữ 女", "Bộ Khẩu 口", "Bộ Nhân 亻", "Bộ Nhật 日"],
    answer: "Bộ Nữ 女",
    explain: "Chữ 妈 gồm bộ Nữ 女 bên trái (chỉ ý người mẹ) và chữ Mã 马 Giản thể bên phải (chỉ âm ma)."
  },
  {
    id: "pt_7",
    skill: "grammar",
    skillLabel: "Ngữ pháp",
    hskWeight: 1,
    type: "choice",
    prompt: "Muốn nói 'Hôm nay tôi học tiếng Trung ở nhà', câu nào đúng trật tự ngữ pháp tiếng Trung?",
    options: [
      "我学习中文在家今天。",
      "我今天在家学习中文。",
      "今天我学习中文在家。",
      "我是学习中文今天。"
    ],
    answer: "我今天在家学习中文。",
    explain: "Công thức vàng: Chủ ngữ (我) + Thời gian (今天) + 在 Địa điểm (在家) + Động từ + Tân ngữ (学习中文)."
  },
  {
    id: "pt_8",
    skill: "grammar",
    skillLabel: "Ngữ pháp",
    hskWeight: 3,
    type: "choice",
    prompt: "Chọn câu sử dụng cấu trúc ngữ pháp HSK 3–4 hoàn toàn chính xác:",
    options: [
      "虽然汉字有点儿难，但是很有意思。",
      "我不有时间去商店。",
      "昨天他没来学校了。",
      "请把这本书看。"
    ],
    answer: "虽然汉字有点儿难，但是很有意思。",
    explain: "Cặp liên từ nhượng bộ 虽然……，但是…… dùng hoàn toàn chuẩn xác."
  },
  {
    id: "pt_9",
    skill: "listening",
    skillLabel: "Nghe hiểu",
    hskWeight: 1,
    type: "choice",
    audioText: "我家有四口人。",
    prompt: "Bấm nút Loa nghe câu tiếng Trung và chọn thông tin đúng:",
    options: [
      "Gia đình người nói có 4 người.",
      "Gia đình người nói có 3 người.",
      "Người nói năm nay 14 tuổi.",
      "Người nói muốn mua 4 quyển sách."
    ],
    answer: "Gia đình người nói có 4 người.",
    explain: "Câu vừa nghe là: '我家有四口人。' (Wǒ jiā yǒu sì kǒu rén — Gia đình tôi có 4 người)."
  },
  {
    id: "pt_10",
    skill: "listening",
    skillLabel: "Nghe hiểu",
    hskWeight: 2,
    type: "choice",
    audioText: "明天上午九点我们在学校见面。",
    prompt: "Nghe câu thông báo và cho biết hai người hẹn gặp nhau ở đâu và lúc mấy giờ?",
    options: [
      "9 giờ sáng mai ở trường học",
      "9 giờ tối nay ở nhà hàng",
      "8 giờ sáng mai ở bệnh viện",
      "10 giờ trưa mai ở công ty"
    ],
    answer: "9 giờ sáng mai ở trường học",
    explain: "Audio: '明天上午九点我们在学校见面。' (9 giờ sáng ngày mai chúng ta gặp nhau ở trường học)."
  },
  {
    id: "pt_11",
    skill: "reading",
    skillLabel: "Đọc hiểu",
    hskWeight: 2,
    type: "choice",
    passage: "我叫明安，是越南人。我现在每天学习三十分钟中文。我觉得说中文不太难，我很喜欢写汉字。",
    prompt: "Đọc đoạn văn ngắn trên và cho biết thông tin nào ĐÚNG với Minh An?",
    options: [
      "Minh An học tiếng Trung 30 phút mỗi ngày và rất thích viết chữ Hán.",
      "Minh An là người Trung Quốc đang học tiếng Việt.",
      "Minh An thấy nói tiếng Trung cực kỳ khó và không thích viết chữ.",
      "Minh An chỉ học tiếng Trung vào cuối tuần."
    ],
    answer: "Minh An học tiếng Trung 30 phút mỗi ngày và rất thích viết chữ Hán.",
    explain: "Trong bài nêu rõ: '每天学习三十分钟中文' (học 30 phút mỗi ngày) và '我很喜欢写汉字' (rất thích viết chữ Hán)."
  },
  {
    id: "pt_12",
    skill: "writing",
    skillLabel: "Viết & Sắp xếp câu",
    hskWeight: 1,
    type: "reorder",
    prompt: "Sắp xếp các mảnh từ sau thành câu hoàn chỉnh nghĩa là 'Tôi thích học tiếng Trung.':",
    words: ["学习", "我", "中文", "喜欢", "。"],
    answer: "我喜欢学习中文。",
    explain: "Chủ ngữ 我 + Động từ tâm lý 喜欢 + Cụm động tân 学习中文 + Dấu chấm tròn 。"
  }
];

/* Level-Up Exams (Strict Competency Gate for HSK 1 -> 6) */
window.QCHINESE_LEVEL_EXAMS = {
  1: [
    { q: "Chọn Pinyin đúng của '谢谢' (Cảm ơn):", options: ["xièxie", "xǐexie", "qièqie", "jièjie"], answer: "xièxie" },
    { q: "Câu nào dịch đúng 'Tôi khỏe, cảm ơn'?", options: ["我很好，谢谢。", "我是好，谢谢。", "我好是，谢谢。", "很我好，谢谢。"], answer: "我很好，谢谢。" },
    { q: "Chữ Hán nào chỉ 'Tháng / Mặt trăng' (4 nét)?", options: ["月", "日", "目", "口"], answer: "月" },
    { q: "Chọn từ điền vào chỗ trống: '我家 ___ 四口人。'", options: ["有", "是", "在", "很"], answer: "有" },
    { q: "Sắp xếp đúng nghĩa 'Hôm nay anh ấy đọc sách ở nhà':", options: ["他今天在家看书。", "他看书在家今天。", "他是在家看书今天。", "今天在家他书看。"], answer: "他今天在家看书。" }
  ],
  2: [
    { q: "Phân biệt âm đọc đúng của từ '便宜' (rẻ):", options: ["piányi", "biànyí", "piānyì", "biānyi"], answer: "piányi" },
    { q: "Chọn câu phủ định quá khứ ĐÚNG ngữ pháp:", options: ["昨天我没去商店。", "昨天我没去了商店。", "昨天我不有去商店。", "昨天我没是去商店。"], answer: "昨天我没去商店。" },
    { q: "Chữ '觉' trong '睡觉 (ngủ)' và '觉得 (cảm thấy)' lần lượt đọc là:", options: ["jiào và jué", "jué và jiào", "jiǎo và jué", "xué và jiào"], answer: "jiào và jué" },
    { q: "'Năm nay mùa hè tôi muốn đi Trung Quốc du lịch' viết là:", options: ["今年夏天我想去中国旅游。", "我想旅游去中国今年夏天。", "今年夏天我是去旅游中国。", "我想去中国旅游在今年夏天。"], answer: "今年夏天我想去中国旅游。" }
  ],
  3: [
    { q: "Điền liên từ đúng: '虽然工作很忙，___ 我每天都复习汉字。'", options: ["但是", "所以", "而且", "因为"], answer: "但是" },
    { q: "Trong câu '我已经习惯早起了', từ '习惯' đóng vai trò nghĩa là:", options: ["Đã quen với việc dậy sớm", "Thói quen xấu", "Môi trường sống", "Quan hệ bạn bè"], answer: "Đã quen với việc dậy sớm" },
    { q: "Đáp lại câu '对不起' (Xin lỗi) một cách tự nhiên nhất:", options: ["没关系", "不客气", "再见", "太好了"], answer: "没关系" }
  ],
  4: [
    { q: "Chọn câu chữ 把 chuẩn xác ngữ pháp HSK 4:", options: ["我已经把今天的练习做完了。", "我已经把今天的练习做。", "我把做完了今天的练习。", "我不把练习已经做。"], answer: "我已经把今天的练习做完了。" },
    { q: "Từ nào mang nghĩa 'kiên trì bền bỉ không bỏ cuộc'?", options: ["坚持", "交流", "环境", "便宜"], answer: "坚持" }
  ],
  5: [
    { q: "Cụm từ cố định chuẩn để nói 'nâng cao hiệu suất học tập' là:", options: ["提高学习效率", "提高学习效果", "把握学习习惯", "交流学习效率"], answer: "提高学习效率" },
    { q: "Chọn câu dùng cấu trúc tăng tiến HSK 5 đúng:", options: ["她不仅会说中文，而且汉字也写得很漂亮。", "不仅她会说中文，但是汉字写得漂亮。", "她虽然会说中文，而且写得漂亮。", "她不仅会说中文，所以写得漂亮。"], answer: "她不仅会说中文，而且汉字也写得很漂亮。" }
  ]
};

/* ==========================================================================
   EXTERNAL LISTENING LIBRARY (8 Lessons across 5 Categories, HSK 1–6)
   contentSource: "EXTERNAL_LIBRARY" — 100% Independent of AI PDF HSK 3.0
   ========================================================================== */
window.QCHINESE_LISTENING = [
  {
    id: "lis_greeting_1",
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "listening",
    hsk_level: 1,
    category: "Hội thoại học tập",
    categoryEn: "Campus Dialogue",
    title: "Bài 1: Làm quen bạn mới ở lớp tiếng Trung (认识新同学)",
    summary: "Luyện nghe lời chào hỏi, hỏi tên, quốc tịch và ngành học ở khuôn viên trường đại học.",
    sourceAttribution: { name: "QChinese Open Audio Corpus", license: "CC BY-SA 4.0" },
    lines: [
      { speaker: "王老师", chinese: "你好！请问你叫什么名字？", pinyin: "Nǐ hǎo! Qǐngwèn nǐ jiào shénme míngzi?", english: "Hello! May I ask what your name is?", vietnamese: "Xin chào! Xin hỏi bạn tên là gì?" },
      { speaker: "明安", chinese: "老师您好！我叫明安。", pinyin: "Lǎoshī nín hǎo! Wǒ jiào Míng'ān.", english: "Hello Teacher! My name is Minh An.", vietnamese: "Em chào thầy/cô ạ! Em tên là Minh An." },
      { speaker: "王老师", chinese: "你是哪国人？", pinyin: "Nǐ shì nǎ guó rén?", english: "What nationality are you?", vietnamese: "Em là người nước nào?" },
      { speaker: "明安", chinese: "我是越南人，我是大学生。", pinyin: "Wǒ shì Yuènán rén, wǒ shì dàxuéshēng.", english: "I am Vietnamese, and I am a university student.", vietnamese: "Em là người Việt Nam, em là sinh viên đại học." },
      { speaker: "王老师", chinese: "欢迎你学习中文！", pinyin: "Huānyíng nǐ xuéxí Zhōngwén!", english: "Welcome to learning Chinese!", vietnamese: "Chào mừng em đến học tiếng Trung!" }
    ],
    vocabNotes: [
      { hz: "请问", py: "qǐngwèn", vi: "xin hỏi (lịch sự trước khi đặt câu hỏi)" },
      { hz: "名字", py: "míngzi", vi: "tên gọi" },
      { hz: "大学生", py: "dàxuéshēng", vi: "sinh viên đại học" },
      { hz: "欢迎", py: "huānyíng", vi: "chào mừng, hoan nghênh" }
    ],
    grammarNotes: "Dùng kính ngữ 您 (nín) khi chào thầy giáo 王老师; dùng 哪国人 (người nước nào) để hỏi quốc tịch.",
    exercises: {
      mcq: {
        question: "Minh An giới thiệu mình là người nước nào và làm nghề gì?",
        options: [
          "Người Việt Nam, là sinh viên đại học",
          "Người Trung Quốc, là giáo viên",
          "Người Việt Nam, là bác sĩ",
          "Người Anh, là học sinh"
        ],
        answer: "Người Việt Nam, là sinh viên đại học"
      },
      fillBlank: {
        audioText: "请问你叫什么名字？",
        before: "请问你叫 ___ 名字？",
        answer: "什么",
        hint: "Từ để hỏi 'cái gì / gì' (shénme)"
      },
      dictation: {
        audioText: "我是越南人。",
        answer: "我是越南人。",
        pinyinHint: "Wǒ shì Yuènán rén."
      },
      reorder: {
        audioText: "欢迎你学习中文！",
        words: ["中文", "欢迎", "学习", "你", "！"],
        answer: "欢迎你学习中文！"
      }
    }
  },
  {
    id: "lis_food_1",
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "listening",
    hsk_level: 1,
    category: "Hội thoại đời sống",
    categoryEn: "Daily Conversation",
    title: "Bài 2: Gọi món ăn trưa tại quán ăn (在饭馆点菜)",
    summary: "Luyện nghe từ vựng món ăn, đồ uống, lượng từ 碗 (bát), 杯 (cốc) và thanh toán giá tiền.",
    sourceAttribution: { name: "QChinese Open Audio Corpus", license: "CC BY-SA 4.0" },
    lines: [
      { speaker: "服务员", chinese: "你好！请问你想吃什么？", pinyin: "Nǐ hǎo! Qǐngwèn nǐ xiǎng chī shénme?", english: "Hello! What would you like to eat?", vietnamese: "Xin chào! Xin hỏi bạn muốn ăn gì?" },
      { speaker: "兰英", chinese: "我要一碗牛肉面，谢谢。", pinyin: "Wǒ yào yì wǎn niúròumiàn, xièxie.", english: "I would like a bowl of beef noodles, thank you.", vietnamese: "Cho tôi một bát mì bò, cảm ơn." },
      { speaker: "服务员", chinese: "你想喝什么？我们有茶和咖啡。", pinyin: "Nǐ xiǎng hē shénme? Wǒmen yǒu chá hé kāfēi.", english: "What would you like to drink? We have tea and coffee.", vietnamese: "Bạn muốn uống gì? Chúng tôi có trà và cà phê." },
      { speaker: "兰英", chinese: "我要一杯热茶。一共多少钱？", pinyin: "Wǒ yào yì bēi rè chá. Yígòng duōshao qián?", english: "I'd like a cup of hot tea. How much is it in total?", vietnamese: "Cho tôi một cốc trà nóng. Tổng cộng bao nhiêu tiền?" },
      { speaker: "服务员", chinese: "一共二十五块钱。", pinyin: "Yígòng èrshíwǔ kuài qián.", english: "Twenty-five yuan in total.", vietnamese: "Tổng cộng 25 đồng (tệ)." }
    ],
    vocabNotes: [
      { hz: "牛肉面", py: "niúròumiàn", vi: "mì thịt bò" },
      { hz: "一共", py: "yígòng", vi: "tổng cộng" },
      { hz: "多少钱", py: "duōshao qián", vi: "bao nhiêu tiền" },
      { hz: "块", py: "kuài", vi: "đồng / tệ (đơn vị tiền khẩu ngữ)" }
    ],
    grammarNotes: "Chú ý biến điệu của 一: trước 碗 (wǎn - thanh 3) và 杯 (bēi - thanh 1), 一 đều đọc thành thanh 4 (yì wǎn, yì bēi).",
    exercises: {
      mcq: {
        question: "Lan Anh đã gọi những món gì và tổng hết bao nhiêu tiền?",
        options: [
          "1 bát mì bò + 1 cốc trà nóng, tổng 25 tệ",
          "1 bát cơm + 1 ly cà phê, tổng 25 tệ",
          "2 bát mì bò + 1 cốc nước, tổng 35 tệ",
          "1 bát mì bò + 1 cốc cà phê đá, tổng 20 tệ"
        ],
        answer: "1 bát mì bò + 1 cốc trà nóng, tổng 25 tệ"
      },
      fillBlank: {
        audioText: "我要一杯热茶。",
        before: "我要一 ___ 热茶。",
        answer: "杯",
        hint: "Lượng từ chỉ 'cốc / ly' (bēi)"
      },
      dictation: {
        audioText: "你想喝什么？",
        answer: "你想喝什么？",
        pinyinHint: "Nǐ xiǎng hē shénme?"
      },
      reorder: {
        audioText: "一共二十五块钱。",
        words: ["二十五", "一共", "块钱", "。"],
        answer: "一共二十五块钱。"
      }
    }
  },
  {
    id: "lis_hsk2_plan",
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "listening",
    hsk_level: 2,
    category: "Hội thoại đời sống",
    categoryEn: "Daily Conversation",
    title: "Bài 3: Rủ bạn đi hiệu sách và uống cà phê (周末去书店)",
    summary: "Luyện nghe mốc thời gian cuối tuần, mục đích chuyến đi và địa điểm hẹn gặp.",
    sourceAttribution: { name: "QChinese Open Audio Corpus", license: "CC BY-SA 4.0" },
    lines: [
      { speaker: "小王", chinese: "明天是周末，你有什么打算？", pinyin: "Míngtiān shì zhōumò, nǐ yǒu shénme dǎsuàn?", english: "Tomorrow is the weekend; do you have any plans?", vietnamese: "Ngày mai là cuối tuần rồi, bạn có dự định gì không?" },
      { speaker: "小阮", chinese: "我想去书店买两本中文书。", pinyin: "Wǒ xiǎng qù shūdiàn mǎi liǎng běn Zhōngwén shū.", english: "I want to go to the bookstore to buy two Chinese books.", vietnamese: "Mình muốn đến hiệu sách mua hai quyển sách tiếng Trung." },
      { speaker: "小王", chinese: "那家书店旁边有一家很好的咖啡馆，我们一起去吧！", pinyin: "Nà jiā shūdiàn pángbiān yǒu yì jiā hěn hǎo de kāfēiguǎn, wǒmen yìqǐ qù ba!", english: "Next to that bookstore there is a great cafe; let's go together!", vietnamese: "Cạnh hiệu sách đó có một quán cà phê rất tuyệt, chúng mình đi cùng nhau nhé!" },
      { speaker: "小阮", chinese: "好啊！明天下午两点在地铁站见面。", pinyin: "Hǎo a! Míngtiān xiàwǔ liǎng diǎn zài dìtiězhàn jiànmiàn.", english: "Sounds great! Let's meet at the subway station at 2 PM tomorrow.", vietnamese: "Được đấy! 2 giờ chiều mai gặp nhau ở ga tàu điện ngầm nhé." }
    ],
    vocabNotes: [
      { hz: "打算", py: "dǎsuàn", vi: "dự định, kế hoạch" },
      { hz: "旁边", py: "pángbiān", vi: "bên cạnh" },
      { hz: "地铁站", py: "dìtiězhàn", vi: "ga tàu điện ngầm" }
    ],
    grammarNotes: "Khi nói số lượng 2 quyển sách và 2 giờ chiều, đều dùng 两 (liǎng běn shū, liǎng diǎn) chứ không dùng 二!",
    exercises: {
      mcq: {
        question: "Hai bạn hẹn gặp nhau lúc mấy giờ và ở đâu?",
        options: [
          "2 giờ chiều mai tại ga tàu điện ngầm",
          "2 giờ chiều nay tại trường học",
          "9 giờ sáng mai tại hiệu sách",
          "3 giờ chiều mai tại bệnh viện"
        ],
        answer: "2 giờ chiều mai tại ga tàu điện ngầm"
      },
      fillBlank: {
        audioText: "我想去书店买两本中文书。",
        before: "我想去书店买 ___ 本中文书。",
        answer: "两",
        hint: "Số 'hai' khi đứng trước lượng từ 本 (liǎng)"
      },
      dictation: {
        audioText: "我们一起去吧！",
        answer: "我们一起去吧！",
        pinyinHint: "Wǒmen yìqǐ qù ba!"
      },
      reorder: {
        audioText: "明天下午两点在地铁站见面。",
        words: ["在地铁站", "明天下午", "见面", "两点", "。"],
        answer: "明天下午两点在地铁站见面。"
      }
    }
  },
  {
    id: "lis_hsk2_announcement",
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "listening",
    hsk_level: 2,
    category: "Nghe thông báo",
    categoryEn: "Public Announcement",
    title: "Bài 4: Thông báo giờ mở cửa thư viện trường (图书馆广播通知)",
    summary: "Luyện nghe thông báo của thư viện về thời gian mở cửa, quy định mượn sách và giữ trật tự.",
    sourceAttribution: { name: "QChinese Open Audio Corpus", license: "CC BY-SA 4.0" },
    lines: [
      { speaker: "广播员", chinese: "各位同学请注意，学校图书馆每天早上八点开门。", pinyin: "Gèwèi tóngxué qǐng zhùyì, xuéxiào túshūguǎn měitiān zǎoshang bā diǎn kāimén.", english: "Attention students, the university library opens at 8 AM every morning.", vietnamese: "Các bạn sinh viên chú ý, thư viện trường mở cửa lúc 8 giờ sáng mỗi ngày." },
      { speaker: "广播员", chinese: "借书的时候，请先出示您的学生证。", pinyin: "Jiè shū de shíhou, qǐng xiān chūshì nín de xuéshengzhèng.", english: "When borrowing books, please show your student ID card first.", vietnamese: "Khi mượn sách, vui lòng xuất trình thẻ sinh viên trước." },
      { speaker: "广播员", chinese: "每人一次最多可以借四本书，借期为十四天。", pinyin: "Měi rén yí cì zuìduō kěyǐ jiè sì běn shū, jièqī wéi shísì tiān.", english: "Each person can borrow up to four books at a time for fourteen days.", vietnamese: "Mỗi người một lần được mượn tối đa 4 quyển sách, thời hạn mượn là 14 ngày." },
      { speaker: "广播员", chinese: "在阅览室里请保持安静，不要大声说话。", pinyin: "Zài yuèlǎnshì lǐ qǐng bǎochí ānjìng, búyào dàshēng shuōhuà.", english: "Please keep quiet in the reading room and do not speak loudly.", vietnamese: "Trong phòng đọc xin giữ yên lặng, không nói chuyện lớn tiếng." }
    ],
    vocabNotes: [
      { hz: "图书馆", py: "túshūguǎn", vi: "thư viện" },
      { hz: "学生证", py: "xuéshengzhèng", vi: "thẻ sinh viên" },
      { hz: "最多", py: "zuìduō", vi: "nhiều nhất, tối đa" },
      { hz: "保持安静", py: "bǎochí ānjìng", vi: "giữ yên lặng" }
    ],
    grammarNotes: "Cấu trúc ……的时候 (khi...) đặt ở đầu vế câu chỉ thời điểm diễn ra hành động.",
    exercises: {
      mcq: {
        question: "Theo thông báo, mỗi sinh viên được mượn tối đa mấy quyển sách và trong bao lâu?",
        options: [
          "Tối đa 4 quyển sách trong 14 ngày",
          "Tối đa 2 quyển sách trong 7 ngày",
          "Tối đa 5 quyển sách trong 30 ngày",
          "Tối đa 8 quyển sách trong 14 ngày"
        ],
        answer: "Tối đa 4 quyển sách trong 14 ngày"
      },
      fillBlank: {
        audioText: "在阅览室里请保持安静。",
        before: "在阅览室里请保持 ___ 。",
        answer: "安静",
        hint: "Tính từ 'yên tĩnh / yên lặng' (ānjìng)"
      },
      dictation: {
        audioText: "不要大声说话。",
        answer: "不要大声说话。",
        pinyinHint: "Búyào dàshēng shuōhuà."
      },
      reorder: {
        audioText: "学校图书馆每天早上八点开门。",
        words: ["学校图书馆", "早上八点", "每天", "开门", "。"],
        answer: "学校图书馆每天早上八点开门。"
      }
    }
  },
  {
    id: "lis_hsk3_scenario",
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "listening",
    hsk_level: 3,
    category: "Nghe tình huống thực tế",
    categoryEn: "Real-World Scenario",
    title: "Bài 5: Làm thủ tục nhận phòng khách sạn ở Bắc Kinh (在酒店办理入住)",
    summary: "Luyện nghe tình huống lễ tân khách sạn kiểm tra hộ chiếu, bữa sáng và mật khẩu Wi-Fi.",
    sourceAttribution: { name: "QChinese Open Audio Corpus", license: "CC BY-SA 4.0" },
    lines: [
      { speaker: "前台", chinese: "您好！欢迎光临北京和平酒店，请问您预订房间了吗？", pinyin: "Nín hǎo! Huānyíng guānglín Běijīng Hépíng Jiǔdiàn, qǐngwèn nín yùdìng fángjiān le ma?", english: "Hello! Welcome to Beijing Peace Hotel. Did you book a room?", vietnamese: "Xin chào! Chào mừng quý khách đến khách sạn Hòa Bình Bắc Kinh, quý khách đã đặt phòng chưa ạ?" },
      { speaker: "明安", chinese: "我已经预订了一间双人房，这是我的护照。", pinyin: "Wǒ yǐjīng yùdìng le yì jiān shuāngrénfáng, zhè shì wǒ de hùzhào.", english: "I have booked a double room; here is my passport.", vietnamese: "Tôi đã đặt một phòng đôi rồi, đây là hộ chiếu của tôi." },
      { speaker: "前台", chinese: "好的，您的房间在六楼六零八号，房费包含每天早上的自助早餐。", pinyin: "Hǎo de, nín de fángjiān zài liù lóu liùlíngbā hào, fángfèi bāohán měitiān zǎoshang de zìzhù zǎocān.", english: "Alright, your room is Room 608 on the 6th floor. The room rate includes the daily breakfast buffet.", vietnamese: "Vâng, phòng của quý khách ở tầng 6 số 608, tiền phòng đã bao gồm bữa sáng tự chọn mỗi ngày." },
      { speaker: "明安", chinese: "太好了！请问酒店的无线网络密码是多少？", pinyin: "Tài hǎo le! Qǐngwèn jiǔdiàn de wúxiàn wǎngluò mìmǎ shì duōshao?", english: "Great! What is the hotel's Wi-Fi password?", vietnamese: "Tuyệt quá! Xin hỏi mật khẩu mạng Wi-Fi của khách sạn là gì?" },
      { speaker: "前台", chinese: "密码就印在您的房卡背面。祝您入住愉快！", pinyin: "Mìmǎ jiù yìn zài nín de fángkǎ bèimiàn. Zhù nín rùzhù yúkuài!", english: "The password is printed right on the back of your room keycard. Enjoy your stay!", vietnamese: "Mật khẩu được in ngay mặt sau thẻ phòng của quý khách. Chúc quý khách lưu trú vui vẻ!" }
    ],
    vocabNotes: [
      { hz: "预订", py: "yùdìng", vi: "đặt trước (phòng, vé)" },
      { hz: "护照", py: "hùzhào", vi: "hộ chiếu" },
      { hz: "密码", py: "mìmǎ", vi: "mật khẩu" },
      { hz: "房卡", py: "fángkǎ", vi: "thẻ phòng khách sạn" }
    ],
    grammarNotes: "Dùng lượng từ 间 (jiān) cho phòng ở: 一间双人房 (một phòng đôi).",
    exercises: {
      mcq: {
        question: "Mật khẩu Wi-Fi của khách sạn được ghi ở đâu?",
        options: [
          "In ở mặt sau của thẻ phòng (房卡背面)",
          "Dán ở cửa thang máy tầng 6",
          "Ghi trong hộ chiếu của khách",
          "Phải gọi điện hỏi nhà hàng"
        ],
        answer: "In ở mặt sau của thẻ phòng (房卡背面)"
      },
      fillBlank: {
        audioText: "这是我的护照。",
        before: "这是我的 ___ 。",
        answer: "护照",
        hint: "Danh từ 'hộ chiếu' (hùzhào)"
      },
      dictation: {
        audioText: "祝您入住愉快！",
        answer: "祝您入住愉快！",
        pinyinHint: "Zhù nín rùzhù yúkuài!"
      },
      reorder: {
        audioText: "我已经预订了一间双人房。",
        words: ["一间", "我已经", "双人房", "预订了", "。"],
        answer: "我已经预订了一间双人房。"
      }
    }
  },
  {
    id: "lis_hsk4_interview",
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "listening",
    hsk_level: 4,
    category: "Nghe phỏng vấn",
    categoryEn: "Job Interview",
    title: "Bài 6: Phỏng vấn ứng viên thực tập ngành Công nghệ (科技公司实习面试)",
    summary: "Luyện nghe buổi phỏng vấn xin việc bằng tiếng Trung: kinh nghiệm học tập, kỹ năng lập trình và lý do ứng tuyển.",
    sourceAttribution: { name: "QChinese Open Audio Corpus", license: "CC BY-SA 4.0" },
    lines: [
      { speaker: "面试官", chinese: "你好！请先简单介绍一下你的专业和学习经历。", pinyin: "Nǐ hǎo! Qǐng xiān jiǎndān jièshào yíxià nǐ de zhuānyè hé xuéxí jīnglì.", english: "Hello! Please briefly introduce your major and educational background.", vietnamese: "Xin chào! Hãy giới thiệu ngắn gọn chuyên ngành và quá trình học tập của bạn trước nhé." },
      { speaker: "候选人", chinese: "您好！我学的是计算机科学专业，同时坚持学习了三年中文。", pinyin: "Nín hǎo! Wǒ xué de shì jìsuànjī kēxué zhuānyè, tóngshí jiānchí xuéxí le sān nián Zhōngwén.", english: "Hello! My major is Computer Science, and at the same time I have persistently studied Chinese for three years.", vietnamese: "Xin chào! Chuyên ngành của tôi là Khoa học máy tính, đồng thời tôi đã kiên trì học tiếng Trung được 3 năm." },
      { speaker: "面试官", chinese: "你为什么想申请我们公司的软件开发实习生岗位？", pinyin: "Nǐ wèishénme xiǎng shēnqǐng wǒmen gōngsī de ruǎnjiàn kāifā shíxíshēng gǎngwèi?", english: "Why do you want to apply for the software development intern position at our company?", vietnamese: "Tại sao bạn muốn ứng tuyển vị trí thực tập sinh phát triển phần mềm của công ty chúng tôi?" },
      { speaker: "候选人", chinese: "因为贵公司在人工智能领域很有实力，我希望把编程技术和跨文化沟通能力结合起来。", pinyin: "Yīnwèi guì gōngsī zài réngōng zhìnéng lǐngyù hěn yǒu shílì, wǒ xīwàng bǎ biānchéng jìshù hé kuàwénhuà gōutōng nénglì jiéhé qǐlái.", english: "Because your company is very strong in AI, and I hope to combine my programming skills with cross-cultural communication ability.", vietnamese: "Vì quý công ty rất có thực lực trong lĩnh vực trí tuệ nhân tạo, tôi hy vọng kết hợp kỹ thuật lập trình với năng lực giao tiếp liên văn hóa." }
    ],
    vocabNotes: [
      { hz: "专业", py: "zhuānyè", vi: "chuyên ngành" },
      { hz: "实习生", py: "shíxíshēng", vi: "thực tập sinh" },
      { hz: "人工智能", py: "réngōng zhìnéng", vi: "trí tuệ nhân tạo (AI)" },
      { hz: "结合", py: "jiéhé", vi: "kết hợp" }
    ],
    grammarNotes: "Cấu trúc 把 A 和 B 结合起来 (kết hợp A và B lại với nhau) rất hay dùng trong phỏng vấn và viết luận HSK 4–5.",
    exercises: {
      mcq: {
        question: "Ứng viên học chuyên ngành gì và có thế mạnh đặc biệt nào?",
        options: [
          "Chuyên ngành Khoa học máy tính và đã học tiếng Trung 3 năm",
          "Chuyên ngành Kinh tế quốc tế và mới học tiếng Trung 1 tháng",
          "Chuyên ngành Y khoa và muốn làm kế toán",
          "Chuyên ngành Du lịch và không biết lập trình"
        ],
        answer: "Chuyên ngành Khoa học máy tính và đã học tiếng Trung 3 năm"
      },
      fillBlank: {
        audioText: "请先简单介绍一下你的专业。",
        before: "请先简单 ___ 一下你的专业。",
        answer: "介绍",
        hint: "Động từ 'giới thiệu' (jièshào)"
      },
      dictation: {
        audioText: "我学的是计算机科学专业。",
        answer: "我学的是计算机科学专业。",
        pinyinHint: "Wǒ xué de shì jìsuànjī kēxué zhuānyè."
      },
      reorder: {
        audioText: "我坚持学习了三年中文。",
        words: ["三年", "我", "学习了", "坚持", "中文", "。"],
        answer: "我坚持学习了三年中文。"
      }
    }
  },
  {
    id: "lis_hsk5_airport",
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "listening",
    hsk_level: 5,
    category: "Nghe thông báo",
    categoryEn: "Public Announcement",
    title: "Bài 7: Thông báo thay đổi cửa lên máy bay tại sân bay quốc tế (机场登机口变更通知)",
    summary: "Luyện nghe thông báo sân bay tốc độ chuẩn bản xứ: số hiệu chuyến bay, lý do thay đổi và cửa ra tàu bay mới.",
    sourceAttribution: { name: "QChinese Open Audio Corpus", license: "CC BY-SA 4.0" },
    lines: [
      { speaker: "机场广播", chinese: "各位旅客请注意，乘坐CA185次航班前往上海浦东的旅客请注意。", pinyin: "Gèwèi lǚkè qǐng zhùyì, chéngzuò CA yībāwǔ cì hángbān qiánwǎng Shànghǎi Pǔdōng de lǚkè qǐng zhùyì.", english: "Attention passengers: passengers taking flight CA185 bound for Shanghai Pudong, please pay attention.", vietnamese: "Quý hành khách chú ý, hành khách đi chuyến bay CA185 đến Phố Đông Thượng Hải xin lưu ý." },
      { speaker: "机场广播", chinese: "由于天气原因，您乘坐的航班登机口已由原来的十二号变更为二十六号。", pinyin: "Yóuyú tiānqì yuányīn, nín chéngzuò de hángbān dēngjīkǒu yǐ yóu yuánlái de shí'èr hào biàngēng wéi èrshíliù hào.", english: "Due to weather conditions, your flight's boarding gate has been changed from Gate 12 to Gate 26.", vietnamese: "Do nguyên nhân thời tiết, cửa lên máy bay của chuyến bay đã thay đổi từ cửa số 12 ban đầu sang cửa số 26." },
      { speaker: "机场广播", chinese: "预计起飞时间为下午四点三十分，请带好您的随身行李前往二十六号登机口候机。", pinyin: "Yùjì qǐfēi shíjiān wéi xiàwǔ sì diǎn sānshí fēn, qǐng dài hǎo nín de suíshēn xíngli qiánwǎng èrshíliù hào dēngjīkǒu hòujī.", english: "The estimated departure time is 4:30 PM. Please take your carry-on luggage and proceed to Gate 26.", vietnamese: "Thời gian cất cánh dự kiến là 4 giờ 30 chiều, xin mang theo hành lý xách tay đến cửa số 26 chờ lên máy bay." }
    ],
    vocabNotes: [
      { hz: "航班", py: "hángbān", vi: "chuyến bay" },
      { hz: "登机口", py: "dēngjīkǒu", vi: "cửa lên máy bay (boarding gate)" },
      { hz: "变更", py: "biàngēng", vi: "thay đổi, điều chỉnh" },
      { hz: "随身行李", py: "suíshēn xíngli", vi: "hành lý xách tay" }
    ],
    grammarNotes: "Cấu trúc trang trọng 由 A 变更为 B (thay đổi từ A thành B) thường xuất hiện trong thông báo sân bay và nhà ga HSK 5.",
    exercises: {
      mcq: {
        question: "Cửa lên máy bay của chuyến bay CA185 đã được đổi sang cửa số mấy?",
        options: [
          "Đổi từ cửa số 12 sang cửa số 26",
          "Đổi từ cửa số 26 sang cửa số 12",
          "Đổi từ cửa số 15 sang cửa số 30",
          "Hủy chuyến bay không cất cánh"
        ],
        answer: "Đổi từ cửa số 12 sang cửa số 26"
      },
      fillBlank: {
        audioText: "由于天气原因。",
        before: "___ 天气原因。",
        answer: "由于",
        hint: "Liên từ trang trọng chỉ nguyên nhân 'do / bởi vì' (yóuyú)"
      },
      dictation: {
        audioText: "请带好您的随身行李。",
        answer: "请带好您的随身行李。",
        pinyinHint: "Qǐng dài hǎo nín de suíshēn xíngli."
      },
      reorder: {
        audioText: "预计起飞时间为下午四点三十分。",
        words: ["预计", "为", "起飞时间", "下午四点三十分", "。"],
        answer: "预计起飞时间为下午四点三十分。"
      }
    }
  },
  {
    id: "lis_hsk6_dialogue",
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "listening",
    hsk_level: 6,
    category: "Nghe phỏng vấn",
    categoryEn: "Academic Interview",
    title: "Bài 8: Tọa đàm về số hóa di sản văn hóa truyền thống (传统文化数字化访谈)",
    summary: "Luyện nghe phỏng vấn chuyên gia HSK 6 về việc ứng dụng công nghệ thực tế ảo để bảo tồn di sản văn hóa.",
    sourceAttribution: { name: "QChinese Open Audio Corpus", license: "CC BY-SA 4.0" },
    lines: [
      { speaker: "主持人", chinese: "陈教授您好，近年来许多博物馆纷纷利用数字技术重现古代文物，您如何看待这一趋势？", pinyin: "Chén jiàoshòu nín hǎo, jìnnián lái xǔduō bówùguǎn fēnfēn lìyòng shùzì jìshù chóngxiàn gǔdài wénwù, nín rúhé kàndài zhè yī qūshì?", english: "Hello Professor Chen, in recent years many museums have used digital technology to recreate ancient relics. How do you view this trend?", vietnamese: "Chào giáo sư Trần, những năm gần đây nhiều bảo tàng liên tiếp ứng dụng công nghệ số tái hiện cổ vật, ông nhìn nhận xu hướng này thế nào?" },
      { speaker: "陈教授", chinese: "这无疑是一项举一反三的创新举措。数字化不仅能够永久保存珍贵史料，还能让年轻一代身临其境地感受历史魅力。", pinyin: "Zhè wúyí shì yí xiàng jǔyī-fǎnsān de chuàngxīn jǔcuò. Shùzìhuà bùjǐn nénggòu yǒngjiǔ bǎocún zhēnguì shǐliào, hái néng ràng niánqīng yídài shēnlín-qíjìng de gǎnshòu lìshǐ mèilì.", english: "This is undoubtedly an innovative measure. Digitization not only permanently preserves precious historical materials, but also lets the younger generation experience the charm of history immersively.", vietnamese: "Đây chắc chắn là một bước đi sáng tạo. Số hóa không những bảo tồn vĩnh viễn sử liệu quý giá mà còn giúp thế hệ trẻ đắm mình cảm nhận sức hút lịch sử." }
    ],
    vocabNotes: [
      { hz: "博物馆", py: "bówùguǎn", vi: "viện bảo tàng" },
      { hz: "趋势", py: "qūshì", vi: "xu hướng, xu thế" },
      { hz: "身临其境", py: "shēnlín-qíjìng", vi: "như亲 thân có mặt tại hiện trường / sống động chân thực" },
      { hz: "魅力", py: "mèilì", vi: "sức hút, sự quyến rũ" }
    ],
    grammarNotes: "Thành ngữ 身临其境 (thân lâm kỳ cảnh) kết hợp trợ từ trạng ngữ 地: 身临其境地感受 (cảm nhận một cách chân thực sống động).",
    exercises: {
      mcq: {
        question: "Theo giáo sư Trần, hai lợi ích lớn nhất của việc số hóa cổ vật bảo tàng là gì?",
        options: [
          "Bảo tồn vĩnh viễn sử liệu quý giá và giúp thế hệ trẻ trải nghiệm lịch sử sống động",
          "Tăng giá vé vào cổng bảo tàng và giảm số lượng nhân viên",
          "Đóng cửa các bảo tàng truyền thống để bán cổ vật",
          "Thay thế hoàn toàn môn lịch sử ở trường học"
        ],
        answer: "Bảo tồn vĩnh viễn sử liệu quý giá và giúp thế hệ trẻ trải nghiệm lịch sử sống động"
      },
      fillBlank: {
        audioText: "您如何看待这一趋势？",
        before: "您如何看待这一 ___ ？",
        answer: "趋势",
        hint: "Danh từ HSK 5–6 nghĩa là 'xu hướng' (qūshì)"
      },
      dictation: {
        audioText: "永久保存珍贵史料。",
        answer: "永久保存珍贵史料。",
        pinyinHint: "Yǒngjiǔ bǎocún zhēnguì shǐliào."
      },
      reorder: {
        audioText: "让年轻一代感受历史魅力。",
        words: ["年轻一代", "让", "历史魅力", "感受", "。"],
        answer: "让年轻一代感受历史魅力。"
      }
    }
  }
];

/* ==========================================================================
   EXTERNAL READING LIBRARY (12 Graded Passages across HSK 1–6)
   Modeled directly on QEnglish Reading Academic cards & split-screen workspace!
   contentSource: "EXTERNAL_LIBRARY" — 100% Independent of AI PDF HSK 3.0
   ========================================================================== */
window.QCHINESE_READING = [
  {
    id: "ext_rd_hsk1_cafe",
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "reading",
    hsk_level: 1,
    topic: "Campus Life",
    topicVi: "Trường học",
    title: "A Student Cafe on Campus — 校园里的小咖啡馆",
    summary: "Quán cà phê Đậu Xanh trong khuôn viên trường đại học mở cửa lúc 7 giờ sáng mỗi ngày, là nơi sinh viên đọc sách và trò chuyện.",
    sourceAttribution: { name: "QChinese Open Reading Corpus", license: "CC BY-SA 4.0", url: "https://q-chinese.vercel.app/#reading" },
    sentences: [
      {
        zh: "绿豆咖啡馆是我们大学校园里的一家小咖啡馆。",
        py: "Lǜdòu Kāfēiguǎn shì wǒmen dàxué xiàoyuán lǐ de yì jiā xiǎo kāfēiguǎn.",
        en: "Green Bean Cafe is a small cafe inside our university campus.",
        vi: "Quán cà phê Đậu Xanh là một quán cà phê nhỏ trong khuôn viên trường đại học của chúng tôi.",
        tokens: [
          { w: "绿豆", py: "lǜdòu", en: "green bean", vi: "đậu xanh" },
          { w: "咖啡馆", py: "kāfēiguǎn", en: "cafe", vi: "quán cà phê" },
          { w: "是", py: "shì", en: "is", vi: "là" },
          { w: "我们大学", py: "wǒmen dàxué", en: "our university", vi: "đại học chúng tôi" },
          { w: "校园里", py: "xiàoyuán lǐ", en: "inside the campus", vi: "trong khuôn viên trường" },
          { w: "的", py: "de", en: "of", vi: "của" },
          { w: "一家", py: "yì jiā", en: "one (establishment)", vi: "một quán/tiệm" },
          { w: "小咖啡馆", py: "xiǎo kāfēiguǎn", en: "small cafe", vi: "quán cà phê nhỏ" },
          { w: "。", py: "", punct: true }
        ]
      },
      {
        zh: "它每天早上七点开门，晚上九点关门。",
        py: "Tā měitiān zǎoshang qī diǎn kāimén, wǎnshang jiǔ diǎn guānmén.",
        en: "It opens at seven o'clock every morning and closes at nine o'clock in the evening.",
        vi: "Quán mở cửa lúc 7 giờ sáng mỗi ngày và đóng cửa lúc 9 giờ tối.",
        tokens: [
          { w: "它", py: "tā", en: "it", vi: "nó / quán" },
          { w: "每天早上", py: "měitiān zǎoshang", en: "every morning", vi: "sáng nào cũng" },
          { w: "七点", py: "qī diǎn", en: "7 o'clock", vi: "7 giờ" },
          { w: "开门", py: "kāimén", en: "to open", vi: "mở cửa" },
          { w: "，", py: "", punct: true },
          { w: "晚上九点", py: "wǎnshang jiǔ diǎn", en: "9 PM", vi: "9 giờ tối" },
          { w: "关门", py: "guānmén", en: "to close", vi: "đóng cửa" },
          { w: "。", py: "", punct: true }
        ]
      },
      {
        zh: "这里的茶、咖啡和面包都很便宜，也很好吃。",
        py: "Zhèlǐ de chá, kāfēi hé miànbāo dōu hěn piányi, yě hěn hǎochī.",
        en: "The tea, coffee, and bread here are all very cheap and delicious.",
        vi: "Trà, cà phê và bánh mì ở đây đều rất rẻ và cũng rất ngon.",
        tokens: [
          { w: "这里", py: "zhèlǐ", en: "here", vi: "ở đây" },
          { w: "的", py: "de", en: "of", vi: "của" },
          { w: "茶", py: "chá", en: "tea", vi: "trà" },
          { w: "、", py: "", punct: true },
          { w: "咖啡", py: "kāfēi", en: "coffee", vi: "cà phê" },
          { w: "和", py: "hé", en: "and", vi: "và" },
          { w: "面包", py: "miànbāo", en: "bread", vi: "bánh mì" },
          { w: "都很便宜", py: "dōu hěn piányi", en: "are all very cheap", vi: "đều rất rẻ" },
          { w: "，", py: "", punct: true },
          { w: "也很好吃", py: "yě hěn hǎochī", en: "also very tasty", vi: "cũng rất ngon" },
          { w: "。", py: "", punct: true }
        ]
      },
      {
        zh: "下课以后，我和朋友常常来这里看中文书。",
        py: "Xiàkè yǐhòu, wǒ hé péngyou chángcháng lái zhèlǐ kàn Zhōngwén shū.",
        en: "After class, my friends and I often come here to read Chinese books.",
        vi: "Sau khi tan học, tôi và bạn bè thường đến đây đọc sách tiếng Trung.",
        tokens: [
          { w: "下课以后", py: "xiàkè yǐhòu", en: "after class", vi: "sau khi tan học" },
          { w: "，", py: "", punct: true },
          { w: "我和朋友", py: "wǒ hé péngyou", en: "my friend and I", vi: "tôi và bạn bè" },
          { w: "常常", py: "chángcháng", en: "often", vi: "thường xuyên" },
          { w: "来这里", py: "lái zhèlǐ", en: "come here", vi: "đến đây" },
          { w: "看中文书", py: "kàn Zhōngwén shū", en: "read Chinese books", vi: "đọc sách tiếng Trung" },
          { w: "。", py: "", punct: true }
        ]
      }
    ],
    quiz: [
      {
        q: "Quán cà phê Đậu Xanh (绿豆咖啡馆) nằm ở đâu?",
        q_en: "Where is Green Bean Cafe (绿豆咖啡馆) located?",
        options: ["Trong khuôn viên trường đại học", "Ở đối diện bệnh viện", "Ở gần sân bay", "Ở trung tâm mua sắm"],
        options_en: ["Inside the university campus (大学校园里)", "Opposite the hospital (医院对面)", "Near the airport (机场附近)", "Inside a shopping mall (商场里)"],
        answer: "Trong khuôn viên trường đại học",
        answer_en: "Inside the university campus (大学校园里)",
        explain: "Câu đầu tiên nêu rõ: '绿豆咖啡馆是我们大学校园里的一家小咖啡馆。'",
        explain_en: "Sentence 1 states: '绿豆咖啡馆是我们大学校园里的一家小咖啡馆。'"
      },
      {
        q: "Quán mở cửa vào lúc mấy giờ mỗi buổi sáng?",
        q_en: "What time does the cafe open every morning?",
        options: ["7 giờ sáng (早上七点)", "8 giờ sáng (早上八点)", "9 giờ sáng (早上九点)", "6 giờ sáng (早上六点)"],
        options_en: ["7:00 AM (早上七点)", "8:00 AM (早上八点)", "9:00 AM (早上九点)", "6:00 AM (早上六点)"],
        answer: "7 giờ sáng (早上七点)",
        answer_en: "7:00 AM (早上七点)",
        explain: "Câu 2: '它每天早上七点开门，晚上九点关门。'",
        explain_en: "Sentence 2 states: '它每天早上七点开门，晚上九点关门。'"
      },
      {
        q: "Đồ uống và bánh mì ở quán có đặc điểm gì?",
        q_en: "How are the drinks and bread at this cafe?",
        options: ["Rất rẻ và rất ngon (很便宜，也很好吃)", "Rất đắt nhưng ngon", "Rẻ nhưng ít món", "Chỉ bán trà không bán cà phê"],
        options_en: ["Very cheap and delicious (很便宜，也很好吃)", "Very expensive but tasty", "Cheap but very few items", "Only sells tea, no coffee"],
        answer: "Rất rẻ và rất ngon (很便宜，也很好吃)",
        answer_en: "Very cheap and delicious (很便宜，也很好吃)",
        explain: "Câu 3: '这里的茶、咖啡和面包都很便宜，也很好吃。'",
        explain_en: "Sentence 3 states: '这里的茶、咖啡和面包都很便宜，也很好吃。'"
      },
      {
        q: "Sau khi tan học, người viết và bạn bè thường đến quán làm gì?",
        q_en: "What do the author and friends often do here after class?",
        options: ["Đọc sách tiếng Trung (看中文书)", "Chơi bóng rổ", "Xem phim điện ảnh", "Nghe nhạc"],
        options_en: ["Read Chinese books (看中文书)", "Play basketball", "Watch movies", "Listen to music"],
        answer: "Đọc sách tiếng Trung (看中文书)",
        answer_en: "Read Chinese books (看中文书)",
        explain: "Câu cuối: '下课以后，我和朋友常常来这里看中文书。'",
        explain_en: "The final sentence says: '下课以后，我和朋友常常来这里看中文书。'"
      }
    ]
  },
  {
    id: "read_hsk1_day",
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "reading",
    hsk_level: 1,
    topic: "Daily Life",
    topicVi: "Đời sống",
    title: "My Daily Chinese Routine — 我的一天",
    summary: "Bài đọc sơ cấp HSK 1 giúp làm quen cách giới thiệu bản thân, thời gian biểu và sở thích học chữ Hán mỗi ngày.",
    sourceAttribution: { name: "QChinese Open Reading Corpus", license: "CC BY-SA 4.0", url: "https://q-chinese.vercel.app/#reading" },
    sentences: [
      {
        zh: "大家好！我叫明安，我是越南人。",
        py: "Dàjiā hǎo! Wǒ jiào Míng'ān, wǒ shì Yuènán rén.",
        en: "Hello everyone! My name is Minh An, and I am Vietnamese.",
        vi: "Chào mọi người! Mình tên là Minh An, mình là người Việt Nam.",
        tokens: [
          { w: "大家", py: "dàjiā", en: "everyone", vi: "mọi người" },
          { w: "好", py: "hǎo", en: "good / hello", vi: "chào / tốt" },
          { w: "！", py: "", punct: true },
          { w: "我", py: "wǒ", en: "I", vi: "tôi, mình" },
          { w: "叫", py: "jiào", en: "to be called", vi: "tên là" },
          { w: "明安", py: "Míng'ān", en: "Minh An", vi: "Minh An (tên riêng)" },
          { w: "，", py: "", punct: true },
          { w: "是", py: "shì", en: "am/is/are", vi: "là" },
          { w: "越南人", py: "Yuènán rén", en: "Vietnamese person", vi: "người Việt Nam" },
          { w: "。", py: "", punct: true }
        ]
      },
      {
        zh: "今年我开始从零学习中文。",
        py: "Jīnnián wǒ kāishǐ cóng líng xuéxí Zhōngwén.",
        en: "This year I started learning Chinese from zero.",
        vi: "Năm nay mình bắt đầu học tiếng Trung từ con số 0.",
        tokens: [
          { w: "今年", py: "jīnnián", en: "this year", vi: "năm nay" },
          { w: "我", py: "wǒ", en: "I", vi: "mình" },
          { w: "开始", py: "kāishǐ", en: "to start", vi: "bắt đầu" },
          { w: "从零", py: "cóng líng", en: "from zero", vi: "từ con số 0" },
          { w: "学习", py: "xuéxí", en: "to study", vi: "học tập" },
          { w: "中文", py: "Zhōngwén", en: "Chinese", vi: "tiếng Trung" },
          { w: "。", py: "", punct: true }
        ]
      },
      {
        zh: "每天早上八点，我在家听录音、读拼音。",
        py: "Měitiān zǎoshang bā diǎn, wǒ zài jiā tīng lùyīn, dú pīnyīn.",
        en: "Every morning at 8 o'clock, I listen to recordings and read Pinyin at home.",
        vi: "8 giờ sáng mỗi ngày, mình ở nhà nghe băng ghi âm và đọc Pinyin.",
        tokens: [
          { w: "每天", py: "měitiān", en: "every day", vi: "mỗi ngày" },
          { w: "早上", py: "zǎoshang", en: "morning", vi: "buổi sáng" },
          { w: "八点", py: "bā diǎn", en: "8 o'clock", vi: "8 giờ" },
          { w: "，", py: "", punct: true },
          { w: "我", py: "wǒ", en: "I", vi: "mình" },
          { w: "在家", py: "zài jiā", en: "at home", vi: "ở nhà" },
          { w: "听", py: "tīng", en: "to listen", vi: "nghe" },
          { w: "录音", py: "lùyīn", en: "audio recording", vi: "ghi âm / audio" },
          { w: "、", py: "", punct: true },
          { w: "读", py: "dú", en: "to read aloud", vi: "đọc thành tiếng" },
          { w: "拼音", py: "pīnyīn", en: "Pinyin", vi: "phiên âm Pinyin" },
          { w: "。", py: "", punct: true }
        ]
      },
      {
        zh: "晚上我练习写五个新汉字，还跟AI老师说中文。",
        py: "Wǎnshang wǒ liànxí xiě wǔ gè xīn Hànzì, hái gēn AI lǎoshī shuō Zhōngwén.",
        en: "In the evening I practice writing five new Chinese characters and speak Chinese with my AI teacher.",
        vi: "Buổi tối mình luyện viết 5 chữ Hán mới, còn nói tiếng Trung cùng giáo viên AI.",
        tokens: [
          { w: "晚上", py: "wǎnshang", en: "evening", vi: "buổi tối" },
          { w: "我", py: "wǒ", en: "I", vi: "mình" },
          { w: "练习", py: "liànxí", en: "to practice", vi: "luyện tập" },
          { w: "写", py: "xiě", en: "to write", vi: "viết" },
          { w: "五个", py: "wǔ gè", en: "five", vi: "năm chữ/cái" },
          { w: "新", py: "xīn", en: "new", vi: "mới" },
          { w: "汉字", py: "Hànzì", en: "Chinese characters", vi: "chữ Hán" },
          { w: "，", py: "", punct: true },
          { w: "还", py: "hái", en: "also, in addition", vi: "còn, ngoài ra" },
          { w: "跟", py: "gēn", en: "with", vi: "cùng với" },
          { w: "AI老师", py: "AI lǎoshī", en: "AI teacher", vi: "giáo viên AI" },
          { w: "说", py: "shuō", en: "to speak", vi: "nói" },
          { w: "中文", py: "Zhōngwén", en: "Chinese", vi: "tiếng Trung" },
          { w: "。", py: "", punct: true }
        ]
      }
    ],
    quiz: [
      {
        q: "Minh An là người nước nào?",
        q_en: "What is Minh An's nationality?",
        options: ["Người Việt Nam (越南人)", "Người Trung Quốc (中国人)", "Người Nhật Bản (日本人)", "Người Hàn Quốc (韩国人)"],
        options_en: ["Vietnamese (越南人)", "Chinese (中国人)", "Japanese (日本人)", "Korean (韩国人)"],
        answer: "Người Việt Nam (越南人)",
        answer_en: "Vietnamese (越南人)",
        explain: "Trong câu 1 có ghi: '我叫明安，我是越南人。'",
        explain_en: "Sentence 1 states: '我叫明安，我是越南人。'"
      },
      {
        q: "Buổi sáng lúc 8 giờ, Minh An làm gì ở nhà?",
        q_en: "What does Minh An do at home at 8 AM every morning?",
        options: ["Nghe audio và đọc Pinyin", "Đi siêu thị mua hoa quả", "Xem phim truyền hình", "Đi uống cà phê với bạn"],
        options_en: ["Listen to recordings and read Pinyin (听录音、读拼音)", "Buy fruit at the supermarket", "Watch TV dramas", "Drink coffee with friends"],
        answer: "Nghe audio và đọc Pinyin",
        answer_en: "Listen to recordings and read Pinyin (听录音、读拼音)",
        explain: "Câu 3: '每天早上八点，我在家听录音、读拼音。'",
        explain_en: "Sentence 3 states: '每天早上八点，我在家听录音、读拼音。'"
      },
      {
        q: "Mỗi buổi tối Minh An luyện viết bao nhiêu chữ Hán mới?",
        q_en: "How many new Chinese characters does Minh An practice writing each evening?",
        options: ["5 chữ Hán mới", "15 chữ Hán mới", "20 chữ Hán mới", "Không luyện viết"],
        options_en: ["5 new Chinese characters (五个新汉字)", "15 new characters", "20 new characters", "Does not practice writing"],
        answer: "5 chữ Hán mới",
        answer_en: "5 new Chinese characters (五个新汉字)",
        explain: "Câu 4: '晚上我练习写五个新汉字...'",
        explain_en: "Sentence 4 mentions: '晚上我练习写五个新汉字...'"
      },
      {
        q: "Ngoài viết chữ Hán, buổi tối Minh An còn luyện nói tiếng Trung với ai?",
        q_en: "Besides writing characters, who does Minh An practice speaking Chinese with in the evening?",
        options: ["Với giáo viên AI (跟AI老师)", "Với anh trai", "Với bác sĩ", "Một mình không nói"],
        options_en: ["With the AI teacher (跟AI老师)", "With an older brother", "With a doctor", "No one"],
        answer: "Với giáo viên AI (跟AI老师)",
        answer_en: "With the AI teacher (跟AI老师)",
        explain: "Cuối câu 4: '...还跟AI老师说中文。'",
        explain_en: "The end of sentence 4 says: '...还跟AI老师说中文。'"
      }
    ]
  },
  {
    id: "ext_rd_hsk2_uni",
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "reading",
    hsk_level: 2,
    topic: "University Life",
    topicVi: "Trường học",
    title: "My First Week at University — 我的大学第一周",
    summary: "Tuần đầu tiên bước vào giảng đường đại học vừa hồi hộp vừa hào hứng: làm quen thầy cô, bạn cùng lớp và thư viện lớn.",
    sourceAttribution: { name: "QChinese Open Reading Corpus", license: "CC BY-SA 4.0", url: "https://q-chinese.vercel.app/#reading" },
    sentences: [
      {
        zh: "上个星期是我上大学的第一周，我既有一点儿紧张，又非常高兴。",
        py: "Shàng gè xīngqī shì wǒ shàng dàxué de dì-yī zhōu, wǒ jì yǒu yìdiǎnr jǐnzhāng, yòu fēicháng gāoxìng.",
        en: "Last week was my first week at university; I was both a little nervous and very excited.",
        vi: "Tuần trước là tuần đầu tiên tôi học đại học, tôi vừa hơi hồi hộp một chút lại vừa vô cùng vui mừng.",
        tokens: [
          { w: "上个星期", py: "shàng gè xīngqī", en: "last week", vi: "tuần trước" },
          { w: "是", py: "shì", en: "was", vi: "là" },
          { w: "我上大学", py: "wǒ shàng dàxué", en: "my attending university", vi: "tôi đi học đại học" },
          { w: "的第一周", py: "de dì-yī zhōu", en: "the first week", vi: "tuần đầu tiên" },
          { w: "，", py: "", punct: true },
          { w: "既", py: "jì", en: "both", vi: "vừa..." },
          { w: "紧张", py: "jǐnzhāng", en: "nervous", vi: "căng thẳng / hồi hộp" },
          { w: "，", py: "", punct: true },
          { w: "又非常高兴", py: "yòu fēicháng gāoxìng", en: "and very happy", vi: "lại vừa rất vui" },
          { w: "。", py: "", punct: true }
        ]
      },
      {
        zh: "星期一早上七点半，我就到了新教室，认识了很多友好的新同学。",
        py: "Xīngqīyī zǎoshang qī diǎn bàn, wǒ jiù dào le xīn jiàoshì, rènshi le hěn duō yǒuhǎo de xīn tóngxué.",
        en: "On Monday at 7:30 AM, I arrived early at the new classroom and met many friendly new classmates.",
        vi: "7 giờ rưỡi sáng thứ Hai, tôi đã đến phòng học mới và làm quen được rất nhiều bạn học mới thân thiện.",
        tokens: [
          { w: "星期一早上", py: "Xīngqīyī zǎoshang", en: "Monday morning", vi: "sáng thứ Hai" },
          { w: "七点半", py: "qī diǎn bàn", en: "7:30", vi: "7 giờ rưỡi" },
          { w: "，", py: "", punct: true },
          { w: "我就到了", py: "wǒ jiù dào le", en: "I already arrived", vi: "tôi đã đến" },
          { w: "新教室", py: "xīn jiàoshì", en: "new classroom", vi: "phòng học mới" },
          { w: "，", py: "", punct: true },
          { w: "认识了", py: "rènshi le", en: "got to know", vi: "làm quen được" },
          { w: "友好", py: "yǒuhǎo", en: "friendly", vi: "thân thiện" },
          { w: "的新同学", py: "de xīn tóngxué", en: "new classmates", vi: "bạn học mới" },
          { w: "。", py: "", punct: true }
        ]
      },
      {
        zh: "我们的汉语老师讲课非常清楚，还教我们怎么在图书馆借中文书。",
        py: "Wǒmen de Hànyǔ lǎoshī jiǎngkè fēicháng qīngchu, hái jiāo wǒmen zěnme zài túshūguǎn jiè Zhōngwén shū.",
        en: "Our Chinese teacher explained the lesson very clearly and taught us how to borrow Chinese books in the library.",
        vi: "Thầy cô dạy tiếng Hán của chúng tôi giảng bài rất rõ ràng, còn hướng dẫn chúng tôi cách mượn sách tiếng Trung ở thư viện.",
        tokens: [
          { w: "我们的", py: "wǒmen de", en: "our", vi: "của chúng tôi" },
          { w: "汉语老师", py: "Hànyǔ lǎoshī", en: "Chinese teacher", vi: "giáo viên tiếng Hán" },
          { w: "讲课", py: "jiǎngkè", en: "teach / lecture", vi: "giảng bài" },
          { w: "非常清楚", py: "fēicháng qīngchu", en: "very clear", vi: "rất rõ ràng" },
          { w: "，", py: "", punct: true },
          { w: "还教我们", py: "hái jiāo wǒmen", en: "also taught us", vi: "còn dạy chúng tôi" },
          { w: "怎么", py: "zěnme", en: "how to", vi: "làm thế nào" },
          { w: "在图书馆", py: "zài túshūguǎn", en: "at the library", vi: "ở thư viện" },
          { w: "借中文书", py: "jiè Zhōngwén shū", en: "borrow Chinese books", vi: "mượn sách tiếng Trung" },
          { w: "。", py: "", punct: true }
        ]
      }
    ],
    quiz: [
      {
        q: "Cảm xúc của tác giả trong tuần đầu tiên lên đại học là gì?",
        q_en: "How did the author feel during the first week at university?",
        options: ["Vừa hơi hồi hộp vừa rất vui (既有一点儿紧张，又非常高兴)", "Rất buồn và mệt mỏi", "Chỉ thấy lo lắng không vui", "Thấy bài học quá dễ"],
        options_en: ["Both a bit nervous and very excited (既有一点儿紧张，又非常高兴)", "Very sad and tired", "Only worried", "Found everything too easy"],
        answer: "Vừa hơi hồi hộp vừa rất vui (既有一点儿紧张，又非常高兴)",
        answer_en: "Both a bit nervous and very excited (既有一点儿紧张，又非常高兴)",
        explain: "Câu 1: '我既有一点儿紧张，又非常高兴。'",
        explain_en: "Sentence 1 states: '我既有一点儿紧张，又非常高兴。'"
      },
      {
        q: "Sáng thứ Hai tác giả đến phòng học mới lúc mấy giờ?",
        q_en: "What time did the author arrive at the new classroom on Monday morning?",
        options: ["7 giờ 30 sáng (早上七点半)", "8 giờ đúng", "9 giờ sáng", "7 giờ kém 15"],
        options_en: ["7:30 AM (早上七点半)", "8:00 AM", "9:00 AM", "6:45 AM"],
        answer: "7 giờ 30 sáng (早上七点半)",
        answer_en: "7:30 AM (早上七点半)",
        explain: "Câu 2: '星期一早上七点半，我就到了新教室...'",
        explain_en: "Sentence 2 mentions: '星期一早上七点半，我就到了新教室...'"
      },
      {
        q: "Giáo viên tiếng Hán đã hướng dẫn sinh viên làm việc gì thêm?",
        q_en: "What else did the Chinese teacher teach the students to do?",
        options: ["Cách mượn sách tiếng Trung ở thư viện", "Cách mua vé tàu điện ngầm", "Cách nấu món ăn Trung Quốc", "Cách đăng ký ký túc xá"],
        options_en: ["How to borrow Chinese books in the library (在图书馆借中文书)", "How to buy subway tickets", "How to cook Chinese dishes", "How to apply for a dorm"],
        answer: "Cách mượn sách tiếng Trung ở thư viện",
        answer_en: "How to borrow Chinese books in the library (在图书馆借中文书)",
        explain: "Câu 3: '...还教我们怎么在图书馆借中文书。'",
        explain_en: "Sentence 3 states: '...还教我们怎么在图书馆借中文书。'"
      }
    ]
  },
  {
    id: "read_hsk2_coffee",
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "reading",
    hsk_level: 2,
    topic: "Chinese Culture",
    topicVi: "Văn hóa Trung Quốc",
    title: "Tea & Coffee Culture in My Family — 茶与咖啡",
    summary: "Bài đọc HSK 2 giúp rèn từ vựng đồ uống, văn hóa thưởng trà buổi sáng và liên từ nhượng bộ 虽然…但是…",
    sourceAttribution: { name: "QChinese Open Reading Corpus", license: "CC BY-SA 4.0", url: "https://q-chinese.vercel.app/#reading" },
    sentences: [
      {
        zh: "我家每个人都喜欢喝不同的饮料。",
        py: "Wǒ jiā měi gè rén dōu xǐhuan hē bùtóng de yǐnliào.",
        en: "Everyone in my family likes drinking different beverages.",
        vi: "Mỗi người trong gia đình tôi đều thích uống những thức uống khác nhau.",
        tokens: [
          { w: "我家", py: "wǒ jiā", en: "my family", vi: "nhà tôi" },
          { w: "每个人", py: "měi gè rén", en: "everyone", vi: "mỗi người" },
          { w: "都", py: "dōu", en: "all", vi: "đều" },
          { w: "喜欢", py: "xǐhuan", en: "to like", vi: "thích" },
          { w: "喝", py: "hē", en: "to drink", vi: "uống" },
          { w: "不同", py: "bùtóng", en: "different", vi: "khác nhau" },
          { w: "的", py: "de", en: "of (attributive)", vi: "trợ từ định ngữ" },
          { w: "饮料", py: "yǐnliào", en: "beverage", vi: "đồ uống" },
          { w: "。", py: "", punct: true }
        ]
      },
      {
        zh: "爸爸每天早上都要喝一杯热茶，他觉得喝茶对身体很好。",
        py: "Bàba měitiān zǎoshang dōu yào hē yì bēi rè chá, tā juéde hē chá duì shēntǐ hěn hǎo.",
        en: "Dad drinks a cup of hot tea every morning; he feels drinking tea is very good for health.",
        vi: "Sáng nào bố cũng uống một tách trà nóng, ông cảm thấy uống trà rất tốt cho sức khỏe.",
        tokens: [
          { w: "爸爸", py: "bàba", en: "Dad", vi: "bố" },
          { w: "每天早上", py: "měitiān zǎoshang", en: "every morning", vi: "mỗi buổi sáng" },
          { w: "都要", py: "dōu yào", en: "always wants to", vi: "đều muốn/cần" },
          { w: "喝", py: "hē", en: "drink", vi: "uống" },
          { w: "一杯", py: "yì bēi", en: "a cup of", vi: "một tách/cốc" },
          { w: "热茶", py: "rè chá", en: "hot tea", vi: "trà nóng" },
          { w: "，", py: "", punct: true },
          { w: "他", py: "tā", en: "he", vi: "ông ấy" },
          { w: "觉得", py: "juéde", en: "to think/feel", vi: "cảm thấy" },
          { w: "对身体很好", py: "duì shēntǐ hěn hǎo", en: "good for health", vi: "rất tốt cho sức khỏe" },
          { w: "。", py: "", punct: true }
        ]
      },
      {
        zh: "虽然越南冰咖啡有一点儿甜，但是我和姐姐都非常喜欢喝。",
        py: "Suīrán Yuènán bīng kāfēi yǒu yìdiǎnr tián, dànshì wǒ hé jiějie dōu fēicháng xǐhuan hē.",
        en: "Although Vietnamese iced coffee is a little sweet, my sister and I both love drinking it.",
        vi: "Tuy cà phê đá Việt Nam hơi ngọt một chút, nhưng chị gái và tôi đều vô cùng thích uống.",
        tokens: [
          { w: "虽然", py: "suīrán", en: "although", vi: "tuy rằng" },
          { w: "越南", py: "Yuènán", en: "Vietnam", vi: "Việt Nam" },
          { w: "冰咖啡", py: "bīng kāfēi", en: "iced coffee", vi: "cà phê đá" },
          { w: "有一点儿", py: "yǒu yìdiǎnr", en: "a little bit", vi: "hơi... một chút" },
          { w: "甜", py: "tián", en: "sweet", vi: "ngọt" },
          { w: "，", py: "", punct: true },
          { w: "但是", py: "dànshì", en: "but", vi: "nhưng" },
          { w: "我和姐姐", py: "wǒ hé jiějie", en: "my sister and I", vi: "tôi và chị gái" },
          { w: "都非常喜欢", py: "dōu fēicháng xǐhuan", en: "both really like", vi: "đều rất thích" },
          { w: "喝", py: "hē", en: "to drink", vi: "uống" },
          { w: "。", py: "", punct: true }
        ]
      }
    ],
    quiz: [
      {
        q: "Tại sao bố thích uống một cốc trà nóng vào mỗi sáng?",
        q_en: "Why does Dad like to drink a cup of hot tea every morning?",
        options: ["Vì ông thấy uống trà tốt cho sức khỏe", "Vì nhà hết cà phê", "Vì trà rẻ hơn sữa", "Vì trời mùa đông lạnh"],
        options_en: ["Because he feels drinking tea is good for health (对身体很好)", "Because there is no coffee at home", "Because tea is cheaper than milk", "Because it is cold in winter"],
        answer: "Vì ông thấy uống trà tốt cho sức khỏe",
        answer_en: "Because he feels drinking tea is good for health (对身体很好)",
        explain: "Câu 2: '...他觉得喝茶对身体很好。'",
        explain_en: "Sentence 2 states: '...他觉得喝茶对身体很好。'"
      },
      {
        q: "Người viết và chị gái thích uống thức uống nào?",
        q_en: "Which beverage do the author and older sister both love drinking?",
        options: ["Cà phê đá Việt Nam (越南冰咖啡)", "Trà xanh không đường", "Nước ép táo", "Sữa nóng"],
        options_en: ["Vietnamese iced coffee (越南冰咖啡)", "Unsweetened green tea", "Apple juice", "Hot milk"],
        answer: "Cà phê đá Việt Nam (越南冰咖啡)",
        answer_en: "Vietnamese iced coffee (越南冰咖啡)",
        explain: "Câu 3: '虽然越南冰咖啡有一点儿甜，但是我和姐姐都非常喜欢喝。'",
        explain_en: "Sentence 3 states: '虽然越南冰咖啡有一点儿甜，但是我和姐姐都非常喜欢喝。'"
      }
    ]
  },
  {
    id: "ext_rd_hsk2_social",
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "reading",
    hsk_level: 2,
    topic: "Social Media",
    topicVi: "Xã hội",
    title: "Using Social Media Safely — 安全使用社交媒体",
    summary: "Mạng xã hội giúp kết nối bạn bè và học ngoại ngữ, nhưng chúng ta cần bảo vệ thông tin cá nhân và giới hạn thời gian dùng điện thoại.",
    sourceAttribution: { name: "QChinese Open Reading Corpus", license: "CC BY-SA 4.0", url: "https://q-chinese.vercel.app/#reading" },
    sentences: [
      {
        zh: "现在，越来越多的年轻人每天都使用社交媒体和朋友聊天。",
        py: "Xiànzài, yuèláiyuè duō de niánqīngrén měitiān dōu shǐyòng shèjiāo méitǐ hé péngyou liáotiān.",
        en: "Nowadays, more and more young people use social media every day to chat with friends.",
        vi: "Hiện nay, ngày càng nhiều người trẻ mỗi ngày đều dùng mạng xã hội để trò chuyện với bạn bè.",
        tokens: [
          { w: "现在", py: "xiànzài", en: "nowadays", vi: "hiện nay" },
          { w: "，", py: "", punct: true },
          { w: "越来越多", py: "yuèláiyuè duō", en: "more and more", vi: "ngày càng nhiều" },
          { w: "的年轻人", py: "de niánqīngrén", en: "young people", vi: "người trẻ tuổi" },
          { w: "社交媒体", py: "shèjiāo méitǐ", en: "social media", vi: "mạng xã hội" },
          { w: "聊天", py: "liáotiān", en: "to chat", vi: "trò chuyện" },
          { w: "。", py: "", punct: true }
        ]
      },
      {
        zh: "不过，我们在网上不应该随便告诉陌生人自己的电话号码和家庭住址。",
        py: "Búguò, wǒmen zài wǎngshàng bù yīnggāi suíbiàn gàosu mòshēngrén zìjǐ de diànhuà hàomǎ hé jiātíng zhùzhǐ.",
        en: "However, online we should not carelessly tell strangers our phone number and home address.",
        vi: "Tuy nhiên, trên mạng chúng ta không nên tùy tiện cho người lạ biết số điện thoại và địa chỉ nhà của mình.",
        tokens: [
          { w: "不过", py: "búguò", en: "however", vi: "tuy nhiên" },
          { w: "，", py: "", punct: true },
          { w: "在网上", py: "zài wǎngshàng", en: "online", vi: "trên mạng" },
          { w: "不应该", py: "bù yīnggāi", en: "should not", vi: "không nên" },
          { w: "陌生人", py: "mòshēngrén", en: "stranger", vi: "người lạ" },
          { w: "电话号码", py: "diànhuà hàomǎ", en: "phone number", vi: "số điện thoại" },
          { w: "家庭住址", py: "jiātíng zhùzhǐ", en: "home address", vi: "địa chỉ nhà" },
          { w: "。", py: "", punct: true }
        ]
      },
      {
        zh: "每天看手机的时间也不要超过两个小时，现实生活比网络更重要。",
        py: "Měitiān kàn shǒujī de shíjiān yě búyào chāoguò liǎng gè xiǎoshí, xiànshí shēnghuó bǐ wǎngluò gèng zhòngyào.",
        en: "Also, try to limit your daily phone screen time to two hours; real life is more important than online life.",
        vi: "Thời gian xem điện thoại mỗi ngày cũng đừng vượt quá 2 tiếng, cuộc sống thực tế quan trọng hơn mạng ảo.",
        tokens: [
          { w: "看手机", py: "kàn shǒujī", en: "look at phone", vi: "xem điện thoại" },
          { w: "不要超过", py: "búyào chāoguò", en: "do not exceed", vi: "đừng vượt quá" },
          { w: "两个小时", py: "liǎng gè xiǎoshí", en: "two hours", vi: "hai tiếng đồng hồ" },
          { w: "，", py: "", punct: true },
          { w: "现实生活", py: "xiànshí shēnghuó", en: "real life", vi: "cuộc sống thực tế" },
          { w: "比网络更重要", py: "bǐ wǎngluò gèng zhòngyào", en: "more important than internet", vi: "quan trọng hơn mạng ảo" },
          { w: "。", py: "", punct: true }
        ]
      }
    ],
    quiz: [
      {
        q: "Theo bài đọc, thông tin nào KHÔNG nên tùy tiện tiết lộ cho người lạ trên mạng?",
        q_en: "According to the passage, what information should NOT be shared with strangers online?",
        options: ["Số điện thoại và địa chỉ nhà (电话号码和家庭住址)", "Sở thích đọc sách", "Món ăn yêu thích", "Tên trường đại học"],
        options_en: ["Phone number and home address (电话号码和家庭住址)", "Reading hobbies", "Favorite food", "University name"],
        answer: "Số điện thoại và địa chỉ nhà (电话号码和家庭住址)",
        answer_en: "Phone number and home address (电话号码和家庭住址)",
        explain: "Câu 2: '...不应该随便告诉陌生人自己的电话号码和家庭住址。'",
        explain_en: "Sentence 2 states: '...不应该随便告诉陌生人自己的电话号码和家庭住址。'"
      },
      {
        q: "Tác giả khuyên mỗi ngày không nên dùng điện thoại quá bao lâu?",
        q_en: "How much daily screen time does the author recommend not exceeding?",
        options: ["Không quá 2 tiếng đồng hồ (两个小时)", "Không quá 6 tiếng", "Không quá 10 phút", "Không giới hạn"],
        options_en: ["No more than two hours (两个小时)", "No more than six hours", "No more than ten minutes", "No limit"],
        answer: "Không quá 2 tiếng đồng hồ (两个小时)",
        answer_en: "No more than two hours (两个小时)",
        explain: "Câu 3: '每天看手机的时间也不要超过两个小时...'",
        explain_en: "Sentence 3 states: '每天看手机的时间也不要超过两个小时...'"
      }
    ]
  },
  {
    id: "ext_rd_hsk3_travel",
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "reading",
    hsk_level: 3,
    topic: "Travel",
    topicVi: "Du lịch",
    title: "High-Speed Train Travel to Beijing — 乘高铁去北京旅行",
    summary: "Trải nghiệm đi tàu cao tốc ở Trung Quốc: đặt vé qua điện thoại, tàu chạy êm ở vận tốc 300km/h và ngắm cảnh dọc đường.",
    sourceAttribution: { name: "QChinese Open Reading Corpus", license: "CC BY-SA 4.0", url: "https://q-chinese.vercel.app/#reading" },
    sentences: [
      {
        zh: "今年暑假，我和两个大学同学决定坐高铁去北京旅行。",
        py: "Jīnnián shǔjià, wǒ hé liǎng gè dàxué tóngxué juédìng zuò gāotiě qù Běijīng lǚxíng.",
        en: "This summer vacation, two university classmates and I decided to travel to Beijing by high-speed train.",
        vi: "Kỳ nghỉ hè năm nay, tôi và hai người bạn đại học quyết định đi tàu cao tốc đến Bắc Kinh du lịch.",
        tokens: [
          { w: "今年暑假", py: "jīnnián shǔjià", en: "this summer vacation", vi: "nghỉ hè năm nay" },
          { w: "，", py: "", punct: true },
          { w: "决定", py: "juédìng", en: "to decide", vi: "quyết định" },
          { w: "坐高铁", py: "zuò gāotiě", en: "take high-speed rail", vi: "đi tàu cao tốc" },
          { w: "去北京旅行", py: "qù Běijīng lǚxíng", en: "travel to Beijing", vi: "đi du lịch Bắc Kinh" },
          { w: "。", py: "", punct: true }
        ]
      },
      {
        zh: "现在买车票非常方便，只要在手机上预订，到了车站刷护照就能直接进站。",
        py: "Xiànzài mǎi chēpiào fēicháng fāngbiàn, zhǐyào zài shǒujī shàng yùdìng, dào le chēzhàn shuā hùzhào jiù néng zhíjiē jìnzhàn.",
        en: "Buying tickets is very convenient now; just book on your phone and scan your passport at the station to enter directly.",
        vi: "Bây giờ mua vé tàu vô cùng thuận tiện, chỉ cần đặt trên điện thoại, đến nhà ga quẹt hộ chiếu là có thể vào ga trực tiếp.",
        tokens: [
          { w: "买车票", py: "mǎi chēpiào", en: "buy train tickets", vi: "mua vé tàu" },
          { w: "非常方便", py: "fēicháng fāngbiàn", en: "very convenient", vi: "vô cùng thuận tiện" },
          { w: "，", py: "", punct: true },
          { w: "预订", py: "yùdìng", en: "book in advance", vi: "đặt trước" },
          { w: "刷护照", py: "shuā hùzhào", en: "scan passport", vi: "quẹt hộ chiếu" },
          { w: "直接进站", py: "zhíjiē jìnzhàn", en: "enter station directly", vi: "vào ga trực tiếp" },
          { w: "。", py: "", punct: true }
        ]
      },
      {
        zh: "高铁不但速度很快，而且车厢里又安静又干净，我们一路上都在看窗外的风景。",
        py: "Gāotiě búdàn sùdù hěn kuài, érqiě chēxiāng lǐ yòu ānjìng yòu gānjìng, wǒmen yílù shàng dōu zài kàn chuāngwài de fēngjǐng.",
        en: "The high-speed train is not only fast, but the cabin is also quiet and clean; we watched the scenery outside the window all the way.",
        vi: "Tàu cao tốc không những tốc độ rất nhanh mà trong toa tàu còn vừa yên tĩnh vừa sạch sẽ, suốt dọc đường chúng tôi đều ngắm phong cảnh ngoài cửa sổ.",
        tokens: [
          { w: "高铁", py: "gāotiě", en: "high-speed train", vi: "tàu cao tốc" },
          { w: "不但速度很快", py: "búdàn sùdù hěn kuài", en: "not only fast", vi: "không những tốc độ rất nhanh" },
          { w: "，", py: "", punct: true },
          { w: "而且", py: "érqiě", en: "but also", vi: "mà còn" },
          { w: "车厢里", py: "chēxiāng lǐ", en: "inside the carriage", vi: "trong toa tàu" },
          { w: "又安静又干净", py: "yòu ānjìng yòu gānjìng", en: "both quiet and clean", vi: "vừa yên tĩnh vừa sạch sẽ" },
          { w: "风景", py: "fēngjǐng", en: "scenery", vi: "phong cảnh" },
          { w: "。", py: "", punct: true }
        ]
      }
    ],
    quiz: [
      {
        q: "Làm thế nào hành khách có thể vào ga tàu cao tốc sau khi đặt vé trên điện thoại?",
        q_en: "How can passengers enter the high-speed rail station after booking tickets on their phones?",
        options: ["Quẹt hộ chiếu trực tiếp để vào ga (刷护照直接进站)", "Phải xếp hàng đổi vé giấy 2 tiếng", "Phải gửi thư bưu điện", "Chỉ nhận tiền mặt tại cửa tàu"],
        options_en: ["Scan passport directly to enter (刷护照直接进站)", "Wait two hours for paper tickets", "Send a postal letter", "Pay cash at the train door"],
        answer: "Quẹt hộ chiếu trực tiếp để vào ga (刷护照直接进站)",
        answer_en: "Scan passport directly to enter (刷护照直接进站)",
        explain: "Câu 2: '只要在手机上预订，到了车站刷护照就能直接进站。'",
        explain_en: "Sentence 2 states: '只要在手机上预订，到了车站刷护照就能直接进站。'"
      },
      {
        q: "Toa tàu cao tốc được miêu tả như thế nào?",
        q_en: "How is the high-speed train cabin described?",
        options: ["Tốc độ nhanh, vừa yên tĩnh vừa sạch sẽ", "Chậm nhưng rẻ", "Rất ồn và đông người", "Không có cửa sổ"],
        options_en: ["Fast, quiet, and clean (速度很快，又安静又干净)", "Slow but cheap", "Noisy and crowded", "No windows"],
        answer: "Tốc độ nhanh, vừa yên tĩnh vừa sạch sẽ",
        answer_en: "Fast, quiet, and clean (速度很快，又安静又干净)",
        explain: "Câu 3: '高铁不但速度很快，而且车厢里又安静又干净...'",
        explain_en: "Sentence 3 states: '高铁不但速度很快，而且车厢里又安静又干净...'"
      }
    ]
  },
  {
    id: "ext_rd_hsk4_ai",
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "reading",
    hsk_level: 4,
    topic: "Technology and AI",
    topicVi: "Công nghệ & AI",
    title: "The Rise of Artificial Intelligence in Education — 人工智能在教育中的应用",
    summary: "Trí tuệ nhân tạo (AI) đang thay đổi cách sinh viên học ngoại ngữ nhờ khả năng chấm bài tức thì và cá nhân hóa lộ trình học tập.",
    sourceAttribution: { name: "QChinese Open Reading Corpus", license: "CC BY-SA 4.0", url: "https://q-chinese.vercel.app/#reading" },
    sentences: [
      {
        zh: "近年来，人工智能技术正在深刻地改变我们学习外语的方式。",
        py: "Jìnnián lái, réngōng zhìnéng jìshù zhèngzài shēnkè de gǎibiàn wǒmen xuéxí wàiyǔ de fāngshì.",
        en: "In recent years, artificial intelligence technology has been profoundly changing the way we learn foreign languages.",
        vi: "Những năm gần đây, công nghệ trí tuệ nhân tạo đang thay đổi sâu sắc phương thức học ngoại ngữ của chúng ta.",
        tokens: [
          { w: "近年来", py: "jìnnián lái", en: "in recent years", vi: "những năm gần đây" },
          { w: "，", py: "", punct: true },
          { w: "人工智能", py: "réngōng zhìnéng", en: "artificial intelligence (AI)", vi: "trí tuệ nhân tạo" },
          { w: "深刻地改变", py: "shēnkè de gǎibiàn", en: "profoundly change", vi: "thay đổi sâu sắc" },
          { w: "学习外语", py: "xuéxí wàiyǔ", en: "learn foreign languages", vi: "học ngoại ngữ" },
          { w: "的方式", py: "de fāngshì", en: "way / method", vi: "phương thức" },
          { w: "。", py: "", punct: true }
        ]
      },
      {
        zh: "智能辅导系统可以根据每位学习者的水平，自动推荐合适的阅读文章和翻译练习。",
        py: "Zhìnéng fǔdǎo xìtǒng kěyǐ gēnjù měi wèi xuéxízhě de shuǐpíng, zìdòng tuījiàn héshì de yuèdú wénzhāng hé fānyì liànxí.",
        en: "Intelligent tutoring systems can automatically recommend suitable reading articles and translation exercises based on each learner's level.",
        vi: "Hệ thống gia sư thông minh có thể căn cứ vào trình độ của từng người học để tự động gợi ý bài đọc và bài tập dịch phù hợp.",
        tokens: [
          { w: "智能辅导系统", py: "zhìnéng fǔdǎo xìtǒng", en: "intelligent tutoring system", vi: "hệ thống gia sư thông minh" },
          { w: "根据", py: "gēnjù", en: "according to / based on", vi: "căn cứ vào" },
          { w: "水平", py: "shuǐpíng", en: "level / proficiency", vi: "trình độ" },
          { w: "，", py: "", punct: true },
          { w: "自动推荐", py: "zìdòng tuījiàn", en: "automatically recommend", vi: "tự động đề xuất" },
          { w: "翻译练习", py: "fānyì liànxí", en: "translation exercises", vi: "bài tập dịch" },
          { w: "。", py: "", punct: true }
        ]
      },
      {
        zh: "不过，工具再先进也只是辅助，真正的进步依然离不开学习者每天的坚持与思考。",
        py: "Búguò, gōngjù zài xiānjìn yě zhǐshì fǔzhù, zhēnzhèng de jìnbù yīrán líbukāi xuéxízhě měitiān de jiānchí yǔ sīkǎo.",
        en: "However, no matter how advanced tools are, they are only aids; true progress still depends on learners' daily persistence and thinking.",
        vi: "Tuy nhiên, công cụ có tiên tiến đến đâu cũng chỉ là hỗ trợ, sự tiến bộ thực sự vẫn không thể tách rời sự kiên trì và suy ngẫm mỗi ngày của người học.",
        tokens: [
          { w: "先进", py: "xiānjìn", en: "advanced", vi: "tiên tiến" },
          { w: "辅助", py: "fǔzhù", en: "assistance / aid", vi: "bổ trợ / hỗ trợ" },
          { w: "，", py: "", punct: true },
          { w: "真正的进步", py: "zhēnzhèng de jìnbù", en: "true progress", vi: "sự tiến bộ thực sự" },
          { w: "离不开", py: "líbukāi", en: "cannot do without", vi: "không thể tách rời" },
          { w: "坚持与思考", py: "jiānchí yǔ sīkǎo", en: "persistence and thinking", vi: "sự kiên trì và tư duy" },
          { w: "。", py: "", punct: true }
        ]
      }
    ],
    quiz: [
      {
        q: "Hệ thống gia sư AI có thể giúp người học ngoại ngữ như thế nào?",
        q_en: "How can an AI tutoring system help language learners?",
        options: [
          "Tự động gợi ý bài đọc và bài tập dịch phù hợp theo trình độ từng người",
          "Học hộ hoàn toàn để người học không cần đọc sách",
          "Thay thế toàn bộ kỳ thi đại học",
          "Chỉ dùng để chơi trò chơi"
        ],
        options_en: [
          "Automatically recommend suitable readings and translation drills based on learner level",
          "Study on behalf of the learner without any effort",
          "Replace all university exams",
          "Only used for gaming"
        ],
        answer: "Tự động gợi ý bài đọc và bài tập dịch phù hợp theo trình độ từng người",
        answer_en: "Automatically recommend suitable readings and translation drills based on learner level",
        explain: "Câu 2: '智能辅导系统可以根据每位学习者的水平，自动推荐合适的阅读文章和翻译练习。'",
        explain_en: "Sentence 2 states: '智能辅导系统可以根据每位学习者的水平，自动推荐合适的阅读文章和翻译练习。'"
      },
      {
        q: "Theo câu kết của bài, yếu tố quyết định sự tiến bộ thực sự là gì?",
        q_en: "According to the concluding sentence, what is essential for true progress?",
        options: [
          "Sự kiên trì và suy ngẫm mỗi ngày của chính người học (每天的坚持与思考)",
          "Mua thật nhiều máy tính đắt tiền",
          "Không cần ôn tập từ vựng",
          "Chỉ học một ngày trong tháng"
        ],
        options_en: [
          "The learner's daily persistence and active thinking (每天的坚持与思考)",
          "Buying expensive computers",
          "Never reviewing vocabulary",
          "Studying only one day a month"
        ],
        answer: "Sự kiên trì và suy ngẫm mỗi ngày của chính người học (每天的坚持与思考)",
        answer_en: "The learner's daily persistence and active thinking (每天的坚持与思考)",
        explain: "Câu 3: '...真正的进步依然离不开学习者每天的坚持与思考。'",
        explain_en: "Sentence 3 states: '...真正的进步依然离不开学习者每天的坚持与思考。'"
      }
    ]
  },
  {
    id: "ext_rd_hsk4_job",
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "reading",
    hsk_level: 4,
    topic: "Career and Jobs",
    topicVi: "Công việc",
    title: "How to Prepare for a Job Interview — 如何准备求职面试",
    summary: "Bí quyết chuẩn bị cho buổi phỏng vấn xin việc thành công: tìm hiểu kỹ về doanh nghiệp, chuẩn bị ví dụ thực tế và giữ thái độ tự tin.",
    sourceAttribution: { name: "QChinese Open Reading Corpus", license: "CC BY-SA 4.0", url: "https://q-chinese.vercel.app/#reading" },
    sentences: [
      {
        zh: "收到求职面试通知既让人兴奋，也常常让即将毕业的大学生感到有压力。",
        py: "Shōudào qiúzhí miànshì tōngzhī jì ràng rén xīngfèn, yě chángcháng ràng jíjiāng bìyè de dàxuéshēng gǎndào yǒu yālì.",
        en: "Receiving a job interview invitation is exciting, but it also often makes graduating university students feel stressed.",
        vi: "Nhận được thông báo phỏng vấn xin việc vừa khiến người ta hào hứng, lại vừa thường làm sinh viên sắp tốt nghiệp cảm thấy áp lực.",
        tokens: [
          { w: "求职面试", py: "qiúzhí miànshì", en: "job interview", vi: "phỏng vấn xin việc" },
          { w: "兴奋", py: "xīngfèn", en: "excited", vi: "hào hứng, phấn khởi" },
          { w: "，", py: "", punct: true },
          { w: "即将毕业", py: "jíjiāng bìyè", en: "about to graduate", vi: "sắp tốt nghiệp" },
          { w: "压力", py: "yālì", en: "pressure / stress", vi: "áp lực" },
          { w: "。", py: "", punct: true }
        ]
      },
      {
        zh: "首先，你应该提前了解那家公司的企业文化和岗位要求，并准备好具体的项目例子。",
        py: "Shǒuxiān, nǐ yīnggāi tíqián liǎojiě nà jiā gōngsī de qǐyè wénhuà hé gǎngwèi yāoqiú, bìng zhǔnbèi hǎo jùtǐ de xiàngmù lìzi.",
        en: "First, you should research the company's culture and job requirements in advance, and prepare concrete project examples.",
        vi: "Trước hết, bạn nên tìm hiểu trước văn hóa doanh nghiệp và yêu cầu vị trí của công ty đó, đồng thời chuẩn bị sẵn các ví dụ dự án cụ thể.",
        tokens: [
          { w: "首先", py: "shǒuxiān", en: "first of all", vi: "trước tiên" },
          { w: "提前了解", py: "tíqián liǎojiě", en: "understand in advance", vi: "tìm hiểu trước" },
          { w: "企业文化", py: "qǐyè wénhuà", en: "corporate culture", vi: "văn hóa doanh nghiệp" },
          { w: "岗位要求", py: "gǎngwèi yāoqiú", en: "job requirements", vi: "yêu cầu công việc" },
          { w: "具体", py: "jùtǐ", en: "concrete / specific", vi: "cụ thể" },
          { w: "。", py: "", punct: true }
        ]
      },
      {
        zh: "面试当天请准时到达，保持微笑和礼貌，用清楚的语言展示你的专业能力。",
        py: "Miànshì dāngtiān qǐng zhǔnshí dàodá, bǎochí wēixiào hé lǐmào, yòng qīngchu de yǔyán zhǎnshì nǐ de zhuānyè nénglì.",
        en: "On the day of the interview, arrive on time, stay polite with a smile, and demonstrate your professional skills clearly.",
        vi: "Ngày phỏng vấn hãy đến đúng giờ, giữ nụ cười và sự lịch sự, dùng ngôn ngữ rõ ràng để thể hiện năng lực chuyên môn của bạn.",
        tokens: [
          { w: "准时到达", py: "zhǔnshí dàodá", en: "arrive on time", vi: "đến đúng giờ" },
          { w: "保持微笑", py: "bǎochí wēixiào", en: "keep smiling", vi: "giữ nụ cười" },
          { w: "礼貌", py: "lǐmào", en: "polite / courtesy", vi: "lịch sự" },
          { w: "展示", py: "zhǎnshì", en: "demonstrate / show", vi: "thể hiện" },
          { w: "专业能力", py: "zhuānyè nénglì", en: "professional ability", vi: "năng lực chuyên môn" },
          { w: "。", py: "", punct: true }
        ]
      }
    ],
    quiz: [
      {
        q: "Trước khi đi phỏng vấn, ứng viên cần tìm hiểu trước điều gì?",
        q_en: "What should an applicant research in advance before an interview?",
        options: [
          "Văn hóa doanh nghiệp, yêu cầu vị trí và chuẩn bị ví dụ dự án cụ thể",
          "Chỉ cần mua quần áo mới mà không cần biết tên công ty",
          "Hỏi mức lương của giám đốc",
          "Đến muộn 30 phút để gây ấn tượng"
        ],
        options_en: [
          "Corporate culture, job requirements, and concrete project examples",
          "Only buy new clothes without knowing the company name",
          "Ask about the CEO's salary",
          "Arrive 30 minutes late"
        ],
        answer: "Văn hóa doanh nghiệp, yêu cầu vị trí và chuẩn bị ví dụ dự án cụ thể",
        answer_en: "Corporate culture, job requirements, and concrete project examples",
        explain: "Câu 2: '首先，你应该提前了解那家公司的企业文化和岗位要求，并准备好具体的项目例子。'",
        explain_en: "Sentence 2 states: '首先，你应该提前了解那家公司的企业文化和岗位要求，并准备好具体的项目例子。'"
      },
      {
        q: "Trong ngày phỏng vấn, thái độ nào được khuyên giữ?",
        q_en: "What attitude is recommended on the day of the interview?",
        options: [
          "Đến đúng giờ, mỉm cười lịch sự và trình bày rõ ràng năng lực chuyên môn",
          "Nói thật nhanh và ngắt lời người phỏng vấn",
          "Trả lời càng ngắn càng tốt, không nhìn người đối diện",
          "Không cần mang hồ sơ"
        ],
        options_en: [
          "Arrive on time, smile politely, and clearly present your professional skills",
          "Speak hastily and interrupt the interviewer",
          "Give one-word answers without eye contact",
          "Bring no documents"
        ],
        answer: "Đến đúng giờ, mỉm cười lịch sự và trình bày rõ ràng năng lực chuyên môn",
        answer_en: "Arrive on time, smile politely, and clearly present your professional skills",
        explain: "Câu 3: '面试当天请准时到达，保持微笑和礼貌，用清楚的语言展示你的专业能力。'",
        explain_en: "Sentence 3 states: '面试当天请准时到达，保持微笑和礼貌，用清楚的语言展示你的专业能力。'"
      }
    ]
  },
  {
    id: "read_hsk4_method",
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "reading",
    hsk_level: 4,
    topic: "Learning Chinese",
    topicVi: "Phương pháp học",
    title: "The Benefits of Mastering Chinese Radicals — 怎样高效记住汉字",
    summary: "Bài đọc trung cấp HSK 4 giải thích phương pháp học bộ thủ và đặt từ vào ngữ cảnh thực tế để nâng cao hiệu suất ghi nhớ.",
    sourceAttribution: { name: "QChinese Open Reading Corpus", license: "CC BY-SA 4.0", url: "https://q-chinese.vercel.app/#reading" },
    sentences: [
      {
        zh: "很多刚开始学中文的朋友觉得汉字很难写，也很容易忘记。",
        py: "Hěn duō gāng kāishǐ xué Zhōngwén de péngyou juéde Hànzì hěn nán xiě, yě hěn róngyì wàngjì.",
        en: "Many friends who just started learning Chinese feel characters are hard to write and easy to forget.",
        vi: "Nhiều bạn mới bắt đầu học tiếng Trung cảm thấy chữ Hán rất khó viết và cũng rất dễ quên.",
        tokens: [
          { w: "很多", py: "hěn duō", en: "many", vi: "rất nhiều" },
          { w: "刚开始", py: "gāng kāishǐ", en: "just started", vi: "vừa mới bắt đầu" },
          { w: "学中文", py: "xué Zhōngwén", en: "learn Chinese", vi: "học tiếng Trung" },
          { w: "的朋友", py: "de péngyou", en: "friends who...", vi: "những người bạn" },
          { w: "觉得", py: "juéde", en: "feel/think", vi: "cảm thấy" },
          { w: "汉字", py: "Hànzì", en: "Chinese characters", vi: "chữ Hán" },
          { w: "很难写", py: "hěn nán xiě", en: "hard to write", vi: "rất khó viết" },
          { w: "，", py: "", punct: true },
          { w: "也很容易", py: "yě hěn róngyì", en: "also very easy to", vi: "cũng rất dễ" },
          { w: "忘记", py: "wàngjì", en: "forget", vi: "quên" },
          { w: "。", py: "", punct: true }
        ]
      },
      {
        zh: "其实，只要先了解偏旁部首的意思，再把生词放进句子里使用，记忆效率就会大大提高。",
        py: "Qíshí, zhǐyào xiān liǎojiě piānpáng bùshǒu de yìsi, zài bǎ shēngcí fàng jìn jùzi lǐ shǐyòng, jìyì xiàolǜ jiù huì dàdà tígāo.",
        en: "Actually, as long as you understand the meaning of radicals first and put new words into sentences, memory efficiency will greatly improve.",
        vi: "Thực ra, chỉ cần hiểu ý nghĩa của các bộ thủ trước, rồi đưa từ mới vào trong câu để sử dụng, hiệu suất ghi nhớ sẽ tăng lên rõ rệt.",
        tokens: [
          { w: "其实", py: "qíshí", en: "actually", vi: "thực ra" },
          { w: "，", py: "", punct: true },
          { w: "只要", py: "zhǐyào", en: "as long as", vi: "chỉ cần" },
          { w: "先了解", py: "xiān liǎojiě", en: "first understand", vi: "trước tiên tìm hiểu" },
          { w: "偏旁部首", py: "piānpáng bùshǒu", en: "character radicals", vi: "bộ thủ chữ Hán" },
          { w: "的意思", py: "de yìsi", en: "meaning of", vi: "ý nghĩa của" },
          { w: "，", py: "", punct: true },
          { w: "再把生词", py: "zài bǎ shēngcí", en: "then take new words", vi: "sau đó đem từ mới" },
          { w: "放进句子里", py: "fàng jìn jùzi lǐ", en: "put into sentences", vi: "đặt vào trong câu" },
          { w: "使用", py: "shǐyòng", en: "to use", vi: "sử dụng" },
          { w: "，", py: "", punct: true },
          { w: "记忆效率", py: "jìyì xiàolǜ", en: "memory efficiency", vi: "hiệu suất ghi nhớ" },
          { w: "就会大大提高", py: "jiù huì dàdà tígāo", en: "will greatly improve", vi: "sẽ nâng cao đáng kể" },
          { w: "。", py: "", punct: true }
        ]
      }
    ],
    quiz: [
      {
        q: "Theo bài đọc, hai bước giúp nâng cao hiệu suất nhớ chữ Hán là gì?",
        q_en: "According to the passage, what two steps greatly improve character memory efficiency?",
        options: [
          "Hiểu ý nghĩa bộ thủ và đặt từ mới vào câu để sử dụng",
          "Chép đi chép lại mỗi chữ 100 lần mà không cần hiểu nghĩa",
          "Chỉ học Pinyin không cần nhìn mặt chữ",
          "Đọc từ điển từ đầu đến cuối"
        ],
        options_en: [
          "Understand radical meanings first and use new words inside sentences",
          "Copy each character 100 times blindly",
          "Only learn Pinyin without characters",
          "Read a dictionary cover to cover"
        ],
        answer: "Hiểu ý nghĩa bộ thủ và đặt từ mới vào câu để sử dụng",
        answer_en: "Understand radical meanings first and use new words inside sentences",
        explain: "Câu 2: '只要先了解偏旁部首的意思，再把生词放进句子里使用，记忆效率就会大大提高。'",
        explain_en: "Sentence 2 states: '只要先了解偏旁部首的意思，再把生词放进句子里使用，记忆效率就会大大提高。'"
      }
    ]
  },
  {
    id: "ext_rd_hsk5_society",
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "reading",
    hsk_level: 5,
    topic: "Society",
    topicVi: "Xã hội",
    title: "Cashless Payment & Modern Urban Society — 移动支付改变城市生活",
    summary: "Thanh toán di động bằng mã QR đã phổ biến khắp các thành phố Trung Quốc từ trung tâm thương mại đến chợ truyền thống.",
    sourceAttribution: { name: "QChinese Open Reading Corpus", license: "CC BY-SA 4.0", url: "https://q-chinese.vercel.app/#reading" },
    sentences: [
      {
        zh: "在中国各大城市，无论是大型商场还是街边的小菜市场，移动支付都已经普及到了生活的每个角落。",
        py: "Zài Zhōngguó gè dà chéngshì, wúlùn shì dàxíng shāngchǎng háishi jiēbiān de xiǎo càishìchǎng, yídòng zhīfù dōu yǐjīng pǔjí dào le shēnghuó de měi gè jiǎoluò.",
        en: "In major Chinese cities, whether in large malls or street vegetable markets, mobile payment has spread to every corner of life.",
        vi: "Ở các thành phố lớn của Trung Quốc, bất kể là trung tâm thương mại lớn hay chợ rau nhỏ ven đường, thanh toán di động đều đã phổ cập đến từng ngóc ngách đời sống.",
        tokens: [
          { w: "无论", py: "wúlùn", en: "regardless of / whether", vi: "bất luận / bất kể" },
          { w: "移动支付", py: "yídòng zhīfù", en: "mobile payment", vi: "thanh toán di động" },
          { w: "普及", py: "pǔjí", en: "popularize / spread", vi: "phổ cập" },
          { w: "角落", py: "jiǎoluò", en: "corner", vi: "ngóc ngách / góc" },
          { w: "。", py: "", punct: true }
        ]
      },
      {
        zh: "人们出门只需要带一部智能手机，扫一扫二维码就能完成乘车、点餐和购物。",
        py: "Rénmen chūmén zhǐ xūyào dài yí bù zhìnéng shǒujī, sǎo yì sǎo èrwéimǎ jiù néng wánchéng chéngchē, diǎncān hé gòuwù.",
        en: "People going out only need to bring a smartphone; scanning a QR code completes transit rides, ordering food, and shopping.",
        vi: "Mọi người ra ngoài chỉ cần mang theo một chiếc điện thoại thông minh, quét mã QR là có thể hoàn tất việc đi xe, gọi món và mua sắm.",
        tokens: [
          { w: "智能手机", py: "zhìnéng shǒujī", en: "smartphone", vi: "điện thoại thông minh" },
          { w: "二维码", py: "èrwéimǎ", en: "QR code", vi: "mã QR" },
          { w: "完成", py: "wánchéng", en: "complete", vi: "hoàn thành" },
          { w: "购物", py: "gòuwù", en: "shopping", vi: "mua sắm" },
          { w: "。", py: "", punct: true }
        ]
      }
    ],
    quiz: [
      {
        q: "Người dân ở các thành phố Trung Quốc sử dụng công cụ gì để thanh toán khi đi xe, gọi món và mua sắm?",
        q_en: "What tool do residents in Chinese cities use to pay for transit, dining, and shopping?",
        options: [
          "Dùng điện thoại thông minh quét mã QR (扫二维码)",
          "Chỉ dùng tiền xu kim loại",
          "Dùng séc giấy ngân hàng",
          "Phải mang theo sổ tiết kiệm"
        ],
        options_en: [
          "Scanning QR codes with a smartphone (智能手机扫二维码)",
          "Only metal coins",
          "Paper bank checks",
          "Carrying a passbook"
        ],
        answer: "Dùng điện thoại thông minh quét mã QR (扫二维码)",
        answer_en: "Scanning QR codes with a smartphone (智能手机扫二维码)",
        explain: "Câu 2: '人们出门只需要带一部智能手机，扫一扫二维码就能完成乘车、点餐和购物。'",
        explain_en: "Sentence 2 states: '人们出门只需要带一部智能手机，扫一扫二维码就能完成乘车、点餐和购物。'"
      }
    ]
  },
  {
    id: "ext_rd_hsk6_science",
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "reading",
    hsk_level: 6,
    topic: "Science",
    topicVi: "Khoa học",
    title: "Space Exploration & Scientific Spirit — 太空探索与科学创新精神",
    summary: "Bài đọc học thuật HSK 6 bàn về ý nghĩa của việc khám phá vũ trụ và ứng dụng công nghệ hàng không vào đời sống dân sinh.",
    sourceAttribution: { name: "QChinese Open Reading Corpus", license: "CC BY-SA 4.0", url: "https://q-chinese.vercel.app/#reading" },
    sentences: [
      {
        zh: "探索浩瀚宇宙不仅体现了人类对未知世界的好奇心，更推动了通信、气象与新材料领域的跨越式发展。",
        py: "Tànsuǒ hàohàn yǔzhòu bùjǐn tǐxiàn le rénlèi duì wèizhī shìjiè de hàoqíxīn, gèng tuīdòng le tōngxìn, qìxiàng yǔ xīn cáiliào lǐngyù de kuàyuèshì fāzhǎn.",
        en: "Exploring the vast universe not only reflects humanity's curiosity toward the unknown, but also drives leapfrog development in telecommunications, meteorology, and new materials.",
        vi: "Khám phá vũ trụ bao la không những thể hiện trí tò mò của nhân loại trước thế giới chưa biết, mà còn thúc đẩy sự phát triển vượt bậc trong lĩnh vực viễn thông, khí tượng và vật liệu mới.",
        tokens: [
          { w: "探索", py: "tànsuǒ", en: "explore", vi: "khám phá / thám hiểm" },
          { w: "浩瀚宇宙", py: "hàohàn yǔzhòu", en: "vast universe", vi: "vũ trụ bao la" },
          { w: "好奇心", py: "hàoqíxīn", en: "curiosity", vi: "lòng hiếu kỳ / tò mò" },
          { w: "推动", py: "tuīdòng", en: "promote / drive", vi: "thúc đẩy" },
          { w: "跨越式发展", py: "kuàyuèshì fāzhǎn", en: "leapfrog development", vi: "phát triển vượt bậc" },
          { w: "。", py: "", punct: true }
        ]
      },
      {
        zh: "任何一项重大科学突破都并非一蹴而就，而是科研人员日复一日严谨求证的结晶。",
        py: "Rènhé yí xiàng zhòngdà kēxué tūpò dōu bìngfēi yícù-érjiù, érshì kēyán rényuán rìfùyírì yánjǐn qiúzhèng de jiéjīng.",
        en: "No major scientific breakthrough is achieved overnight; rather, it is the crystallization of researchers' rigorous daily verification.",
        vi: "Bất kỳ đột phá khoa học trọng đại nào cũng đều không phải một sớm một chiều mà thành, mà là kết tinh từ sự kiểm chứng nghiêm cẩn ngày qua ngày của các nhà nghiên cứu.",
        tokens: [
          { w: "突破", py: "tūpò", en: "breakthrough", vi: "đột phá" },
          { w: "并非", py: "bìngfēi", en: "by no means / not", vi: "hoàn toàn không phải là" },
          { w: "一蹴而就", py: "yícù-érjiù", en: "succeed at one stroke / overnight", vi: "một bước mà thành / một sớm một chiều" },
          { w: "严谨", py: "yánjǐn", en: "rigorous", vi: "nghiêm cẩn / chặt chẽ" },
          { w: "结晶", py: "jiéjīng", en: "crystallization / fruit", vi: "kết tinh" },
          { w: "。", py: "", punct: true }
        ]
      }
    ],
    quiz: [
      {
        q: "Thành ngữ '一蹴而就 (yícù-érjiù)' trong bài mang ý nghĩa gì?",
        q_en: "What does the idiom '一蹴而就 (yícù-érjiù)' mean in the passage?",
        options: [
          "Thành công ngay trong chốc lát / một sớm một chiều mà không cần tích lũy lâu dài",
          "Kiên trì làm việc suốt nhiều năm",
          "Từ bỏ giữa chừng khi gặp khó khăn",
          "Bay lên vũ trụ bằng tên lửa"
        ],
        options_en: [
          "Achieving success overnight at a single stroke without long accumulation",
          "Working persistently for many years",
          "Giving up halfway",
          "Launching into space"
        ],
        answer: "Thành công ngay trong chốc lát / một sớm một chiều mà không cần tích lũy lâu dài",
        answer_en: "Achieving success overnight at a single stroke without long accumulation",
        explain: "Câu 2 dùng '并非一蹴而就，而是科研人员日复一日严谨求证的结晶' để đối lập giữa thành công tức thời và sự tích lũy bền bỉ.",
        explain_en: "Sentence 2 contrasts '一蹴而就' (overnight success) with '日复一日严谨求证' (day-after-day rigorous verification)."
      }
    ]
  }
];

/* ==========================================================================
   EXTERNAL VIETNAMESE -> CHINESE TRANSLATION WRITING LIBRARY (HSK 1–6)
   Modeled directly on QEnglish "Luyện Dịch Việt – Anh" split-screen workspace!
   contentSource: "EXTERNAL_LIBRARY" — 100% Independent of AI PDF HSK 3.0
   ========================================================================== */
window.QCHINESE_TRANSLATION_LESSONS = [
  {
    id: "tr_hsk1_01",
    num: 1,
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "writing",
    hsk_level: 1,
    mode: "paragraph",
    topic: "Trường học & Học tập",
    title: "Buổi Sáng Đến Trường Học Tiếng Trung",
    grammarFocus: "Trật tự thời gian (今天早上七点) · Động từ 遇到 / 见 · Cùng nhau (一起) + Động từ",
    viText: "Hôm nay tôi đến trường lúc 7 giờ sáng. Tôi gặp bạn của mình ở cổng trường. Chúng tôi cùng nhau vào lớp học và bắt đầu học tiếng Trung.",
    referenceZh: "今天我早上七点到学校。我在学校门口遇到我的朋友。我们一起进教室，开始学习中文。",
    referencePinyin: "Jīntiān wǒ zǎoshang qī diǎn dào xuéxiào. Wǒ zài xuéxiào ménkǒu yùdào wǒ de péngyou. Wǒmen yìqǐ jìn jiàoshì, kāishǐ xuéxí Zhōngwén.",
    acceptedAlternatives: [
      "今天早上七点我到学校。我在校门口见到我的朋友。我们一起走进教室开始学习汉语。",
      "我今天早上七点去学校。我在学校门口见到了朋友。我们一起进教室学习中文。"
    ],
    keyVocab: [
      { hanzi: "早上七点", pinyin: "zǎoshang qī diǎn", vi: "7 giờ sáng", en: "7:00 AM" },
      { hanzi: "学校门口", pinyin: "xuéxiào ménkǒu", vi: "cổng trường", en: "school gate" },
      { hanzi: "遇到 / 见到", pinyin: "yùdào / jiàndào", vi: "gặp / bắt gặp", en: "to meet" },
      { hanzi: "一起", pinyin: "yìqǐ", vi: "cùng nhau", en: "together" },
      { hanzi: "教室", pinyin: "jiàoshì", vi: "lớp học / phòng học", en: "classroom" },
      { hanzi: "开始", pinyin: "kāishǐ", vi: "bắt đầu", en: "to start / begin" }
    ],
    grammarNotes: [
      "Thời gian '早上七点' (7 giờ sáng) BẮT BUỘC đặt trước động từ '到学校' (đến trường), tuyệt đối không đặt ở cuối câu như tiếng Việt.",
      "Địa điểm '在学校门口' (ở cổng trường) phải đặt trước động từ '遇到 / 见到' (gặp).",
      "Phó từ '一起' (cùng nhau) đứng sau chủ ngữ '我们' và trước động từ '进教室'."
    ],
    sentenceBreakdown: [
      {
        vi: "Hôm nay tôi đến trường lúc 7 giờ sáng.",
        zh: "今天我早上七点到学校。",
        py: "Jīntiān wǒ zǎoshang qī diǎn dào xuéxiào.",
        note: "Trạng ngữ thời gian 早上七点 đứng trước động từ 到."
      },
      {
        vi: "Tôi gặp bạn của mình ở cổng trường.",
        zh: "我在学校门口遇到我的朋友。",
        py: "Wǒ zài xuéxiào ménkǒu yùdào wǒ de péngyou.",
        note: "Cụm giới từ địa điểm 在学校门口 đứng trước động từ 遇到 (hoặc 见到)."
      },
      {
        vi: "Chúng tôi cùng nhau vào lớp học và bắt đầu học tiếng Trung.",
        zh: "我们一起进教室，开始学习中文。",
        py: "Wǒmen yìqǐ jìn jiàoshì, kāishǐ xuéxí Zhōngwén.",
        note: "一起 + Động từ 1 (进教室)，Động từ 2 (开始学习中文 / 汉语)."
      }
    ]
  },
  {
    id: "tr_hsk1_02",
    num: 2,
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "writing",
    hsk_level: 1,
    mode: "paragraph",
    topic: "Bản thân & Đời sống",
    title: "Giới Thiệu Bản Thân & Sở Thích",
    grammarFocus: "Động từ hệ từ 是 · Lượng từ 个 · Phó từ chỉ mức độ 很 + Động từ tâm lý 喜欢",
    viText: "Xin chào, tôi tên là Nam và năm nay tôi mười chín tuổi. Tôi là sinh viên năm nhất tại một trường đại học ở Việt Nam. Vào thời gian rảnh, tôi rất thích nghe nhạc và đọc sách tiếng Trung.",
    referenceZh: "你好，我叫南，今年十九岁。我是越南一所大学的一年级学生。有空的时候，我很喜欢听音乐和看中文书。",
    referencePinyin: "Nǐ hǎo, wǒ jiào Nán, jīnnián shíjiǔ suì. Wǒ shì Yuènán yì suǒ dàxué de yī niánjí xuésheng. Yǒukòng de shíhou, wǒ hěn xǐhuan tīng yīnyuè hé kàn Zhōngwén shū.",
    acceptedAlternatives: [
      "大家好，我叫南，我今年十九岁。我是越南的大学生。空闲的时候，我很喜欢听音乐和读汉语书。"
    ],
    keyVocab: [
      { hanzi: "今年", pinyin: "jīnnián", vi: "năm nay", en: "this year" },
      { hanzi: "十九岁", pinyin: "shíjiǔ suì", vi: "19 tuổi", en: "19 years old" },
      { hanzi: "大学生", pinyin: "dàxuéshēng", vi: "sinh viên đại học", en: "university student" },
      { hanzi: "有空的时候", pinyin: "yǒukòng de shíhou", vi: "lúc rảnh rỗi", en: "in free time" },
      { hanzi: "听音乐", pinyin: "tīng yīnyuè", vi: "nghe nhạc", en: "listen to music" }
    ],
    grammarNotes: [
      "Khi nói tuổi tác trong tiếng Trung, không cần dùng động từ 是 (chỉ cần nói: 我今年十九岁).",
      "Trong cụm danh từ có định ngữ ('sinh viên tại một trường đại học ở Việt Nam'), phần định ngữ (越南一所大学的) phải đặt TRƯỚC danh từ trung tâm (学生)."
    ],
    sentenceBreakdown: [
      {
        vi: "Xin chào, tôi tên là Nam và năm nay tôi mười chín tuổi.",
        zh: "你好，我叫南，今年十九岁。",
        py: "Nǐ hǎo, wǒ jiào Nán, jīnnián shíjiǔ suì.",
        note: "Dùng 叫 + Tên và 今年 + Số tuổi + 岁."
      },
      {
        vi: "Tôi là sinh viên năm nhất tại một trường đại học ở Việt Nam.",
        zh: "我是越南一所大学的一年级学生。",
        py: "Wǒ shì Yuènán yì suǒ dàxué de yī niánjí xuésheng.",
        note: "Định ngữ đứng trước 的 + Danh từ chính (学生)."
      },
      {
        vi: "Vào thời gian rảnh, tôi rất thích nghe nhạc và đọc sách tiếng Trung.",
        zh: "有空的时候，我很喜欢听音乐和看中文书。",
        py: "Yǒukòng de shíhou, wǒ hěn xǐhuan tīng yīnyuè hé kàn Zhōngwén shū.",
        note: "……的时候 (khi/vào lúc...) + Chủ ngữ + 很喜欢 + V1 和 V2."
      }
    ]
  },
  {
    id: "tr_hsk1_03",
    num: 3,
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "writing",
    hsk_level: 1,
    mode: "paragraph",
    topic: "Gia đình",
    title: "Gia Đình Của Tôi",
    grammarFocus: "Câu tồn hữu 有 · Lượng từ 口 / 个 · Câu vị ngữ tính từ với 很",
    viText: "Gia đình tôi có bốn người: bố, mẹ, chị gái và tôi. Bố tôi là bác sĩ ở bệnh viện, còn mẹ tôi là giáo viên. Buổi tối cả nhà tôi thường cùng nhau ăn cơm và nói chuyện vui vẻ.",
    referenceZh: "我家有四口人：爸爸、妈妈、姐姐和我。我爸爸在医院做医生，我妈妈是老师。晚上我们全家常常一起吃饭、开心地聊天。",
    referencePinyin: "Wǒ jiā yǒu sì kǒu rén: bàba, māma, jiějie hé wǒ. Wǒ bàba zài yīyuàn zuò yīshēng, wǒ māma shì lǎoshī. Wǎnshang wǒmen quánjiā chángcháng yìqǐ chīfàn, kāixīn de liáotiān.",
    acceptedAlternatives: [
      "我家有四个人：爸爸、妈妈、姐姐和我。爸爸是医院的医生，妈妈是老师。每天晚上我们一家人常常一起吃饭和聊天。"
    ],
    keyVocab: [
      { hanzi: "四口人", pinyin: "sì kǒu rén", vi: "4 nhân khẩu / 4 người trong nhà", en: "four family members" },
      { hanzi: "医院", pinyin: "yīyuàn", vi: "bệnh viện", en: "hospital" },
      { hanzi: "医生", pinyin: "yīshēng", vi: "bác sĩ", en: "doctor" },
      { hanzi: "全家", pinyin: "quánjiā", vi: "cả nhà / toàn gia đình", en: "whole family" },
      { hanzi: "聊天", pinyin: "liáotiān", vi: "trò chuyện / nói chuyện", en: "to chat" }
    ],
    grammarNotes: [
      "Khi nói số người trong gia đình, dùng lượng từ 口 (我家有四口人) hoặc 个 (四个人).",
      "Địa điểm làm việc '在医院' đặt trước động từ hoặc làm định ngữ '医院的医生'."
    ],
    sentenceBreakdown: [
      {
        vi: "Gia đình tôi có bốn người: bố, mẹ, chị gái và tôi.",
        zh: "我家有四口人：爸爸、妈妈、姐姐和我。",
        py: "Wǒ jiā yǒu sì kǒu rén: bàba, māma, jiějie hé wǒ.",
        note: "Dùng dấu chấm phẩy giọt nước (、) để liệt kê các thành viên."
      },
      {
        vi: "Bố tôi là bác sĩ ở bệnh viện, còn mẹ tôi là giáo viên.",
        zh: "我爸爸在医院做医生，我妈妈是老师。",
        py: "Wǒ bàba zài yīyuàn zuò yīshēng, wǒ māma shì lǎoshī.",
        note: "Hoặc viết: 我爸爸是医院的医生。"
      },
      {
        vi: "Buổi tối cả nhà tôi thường cùng nhau ăn cơm và nói chuyện vui vẻ.",
        zh: "晚上我们全家常常一起吃饭、开心地聊天。",
        py: "Wǎnshang wǒmen quánjiā chángcháng yìqǐ chīfàn, kāixīn de liáotiān.",
        note: "常常 + 一起 + Động từ."
      }
    ]
  },
  {
    id: "tr_hsk1_04",
    num: 4,
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "writing",
    hsk_level: 1,
    mode: "sentence",
    topic: "Ẩm thực & Mua sắm",
    title: "Gọi Món Ở Quán Cà Phê",
    grammarFocus: "Động từ năng nguyện 想 / 要 · Lượng từ 杯 / 碗 · Số từ 两 trước lượng từ",
    viText: "Chiều nay tôi đi quán cà phê với bạn. Tôi muốn uống một cốc trà nóng, bạn tôi gọi hai chiếc bánh mì và một cốc cà phê sữa.",
    referenceZh: "今天下午我和朋友去咖啡馆。我想喝一杯热茶，我朋友点了两个面包和一杯牛奶咖啡。",
    referencePinyin: "Jīntiān xiàwǔ wǒ hé péngyou qù kāfēiguǎn. Wǒ xiǎng hē yì bēi rè chá, wǒ péngyou diǎn le liǎng gè miànbāo hé yì bēi niúnǎi kāfēi.",
    acceptedAlternatives: [
      "今天下午我跟朋友一起去咖啡店。我要喝一杯热茶，我的朋友买两个面包和一杯咖啡。"
    ],
    keyVocab: [
      { hanzi: "今天下午", pinyin: "jīntiān xiàwǔ", vi: "chiều hôm nay", en: "this afternoon" },
      { hanzi: "咖啡馆", pinyin: "kāfēiguǎn", vi: "quán cà phê", en: "cafe" },
      { hanzi: "一杯热茶", pinyin: "yì bēi rè chá", vi: "một cốc trà nóng", en: "a cup of hot tea" },
      { hanzi: "两个面包", pinyin: "liǎng gè miànbāo", vi: "hai chiếc bánh mì", en: "two breads/buns" }
    ],
    grammarNotes: [
      "Cấu trúc 'đi đâu với ai': Chủ ngữ + 和/跟 + Người + 去 + Địa điểm (我和朋友去咖啡馆).",
      "Khi đếm số 2 trước lượng từ (两个面包), bắt buộc dùng 两 (liǎng) chứ không dùng 二."
    ],
    sentenceBreakdown: [
      {
        vi: "Chiều nay tôi đi quán cà phê với bạn.",
        zh: "今天下午我和朋友去咖啡馆。",
        py: "Jīntiān xiàwǔ wǒ hé péngyou qù kāfēiguǎn.",
        note: "和朋友 (với bạn) đứng trước động từ 去."
      },
      {
        vi: "Tôi muốn uống một cốc trà nóng, bạn tôi gọi hai chiếc bánh mì và một cốc cà phê sữa.",
        zh: "我想喝一杯热茶，我朋友点了两个面包和一杯牛奶咖啡。",
        py: "Wǒ xiǎng hē yì bēi rè chá, wǒ péngyou diǎn le liǎng gè miànbāo hé yì bēi niúnǎi kāfēi.",
        note: "Chú ý lượng từ 杯 cho đồ uống và 个 cho bánh mì."
      }
    ]
  },
  {
    id: "tr_hsk2_05",
    num: 5,
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "writing",
    hsk_level: 2,
    mode: "paragraph",
    topic: "Kế hoạch cuối tuần",
    title: "Dự Định Cuối Tuần Ở Hiệu Sách",
    grammarFocus: "Lượng từ 本 · Phó từ phủ định 没 vs 不 · Trợ từ ngữ khí 吧",
    viText: "Hôm qua vì công việc khá bận nên tôi đã không đi hiệu sách. Ngày mai là Chủ nhật, tôi dự định sáng sớm sẽ đi mua hai quyển từ điển tiếng Trung rồi uống cà phê cùng bạn học.",
    referenceZh: "昨天因为工作比较忙，所以我没去书店。明天是星期天，我打算早上先去买两本汉语词典，然后和同学一起喝咖啡。",
    referencePinyin: "Zuótiān yīnwèi gōngzuò bǐjiào máng, suǒyǐ wǒ méi qù shūdiàn. Míngtiān shì Xīngqītiān, wǒ dǎsuàn zǎoshang xiān qù mǎi liǎng běn Hànyǔ cídiǎn, ránhòu hé tóngxué yìqǐ hē kāfēi.",
    acceptedAlternatives: [
      "因为昨天工作很忙，我没去书店。明天是周日，我想早上去买两本中文词典，再跟同学喝咖啡。"
    ],
    keyVocab: [
      { hanzi: "因为……所以……", pinyin: "yīnwèi... suǒyǐ...", vi: "bởi vì... cho nên...", en: "because... therefore..." },
      { hanzi: "比较", pinyin: "bǐjiào", vi: "khá / tương đối", en: "relatively / quite" },
      { hanzi: "打算", pinyin: "dǎsuàn", vi: "dự định / tính toán", en: "to plan / intend" },
      { hanzi: "词典", pinyin: "cídiǎn", vi: "từ điển", en: "dictionary" },
      { hanzi: "然后", pinyin: "ránhòu", vi: "sau đó", en: "then / afterwards" }
    ],
    grammarNotes: [
      "Hành động hôm qua đã không diễn ra ('đã không đi hiệu sách') bắt buộc dùng phủ định 没去书店 (không dùng *不去, và không có 了 ở cuối!).",
      "Trình tự hành động nối tiếp dùng: 先……，然后…… (trước tiên..., sau đó...)."
    ],
    sentenceBreakdown: [
      {
        vi: "Hôm qua vì công việc khá bận nên tôi đã không đi hiệu sách.",
        zh: "昨天因为工作比较忙，所以我没去书店。",
        py: "Zuótiān yīnwèi gōngzuò bǐjiào máng, suǒyǐ wǒ méi qù shūdiàn.",
        note: "Dùng 没去 cho quá khứ chưa thực hiện."
      },
      {
        vi: "Ngày mai là Chủ nhật, tôi dự định sáng sớm sẽ đi mua hai quyển từ điển tiếng Trung rồi uống cà phê cùng bạn học.",
        zh: "明天是星期天，我打算早上先去买两本汉语词典，然后和同学一起喝咖啡。",
        py: "Míngtiān shì Xīngqītiān, wǒ dǎsuàn zǎoshang xiān qù mǎi liǎng běn Hànyǔ cídiǎn, ránhòu hé tóngxué yìqǐ hē kāfēi.",
        note: "Lượng từ của 词典 (từ điển) là 本."
      }
    ]
  },
  {
    id: "tr_hsk2_06",
    num: 6,
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "writing",
    hsk_level: 2,
    mode: "paragraph",
    topic: "Giao thông & Đời sống",
    title: "Phương Tiện Đi Học Hàng Ngày",
    grammarFocus: "Cấu trúc 离……很近/远 · Phương tiện 坐 + Xe + 去 · Mất bao lâu (要/需要……分钟)",
    viText: "Nhà tôi cách trường đại học không xa lắm. Mỗi ngày tôi đều đi tàu điện ngầm đến trường, chỉ mất khoảng hai mươi phút. Đi tàu điện ngầm vừa nhanh lại vừa không lo tắc đường.",
    referenceZh: "我家离大学不太远。我每天都坐地铁去学校，只需要二十分钟左右。坐地铁又快又不担心堵车。",
    referencePinyin: "Wǒ jiā lí dàxué bú tài yuǎn. Wǒ měitiān dōu zuò dìtiě qù xuéxiào, zhǐ xūyào èrshí fēnzhōng zuǒyòu. Zuò dìtiě yòu kuài yòu bù dānxīn dǔchē.",
    acceptedAlternatives: [
      "我家离学校不远。每天我都坐地铁上学，大概二十分钟就到了。坐地铁很快，也不会堵车。"
    ],
    keyVocab: [
      { hanzi: "离", pinyin: "lí", vi: "cách (khoảng cách)", en: "away from" },
      { hanzi: "坐地铁", pinyin: "zuò dìtiě", vi: "đi tàu điện ngầm", en: "take the subway" },
      { hanzi: "左右", pinyin: "zuǒyòu", vi: "khoảng / xấp xỉ", en: "around / approximately" },
      { hanzi: "又……又……", pinyin: "yòu... yòu...", vi: "vừa... vừa...", en: "both... and..." },
      { hanzi: "堵车", pinyin: "dǔchē", vi: "tắc đường / kẹt xe", en: "traffic jam" }
    ],
    grammarNotes: [
      "Nói khoảng cách từ A đến B dùng: A + 离 + B + 很近 / 不太远 (Nhà tôi cách trường không xa lắm).",
      "Biểu thị 'khoảng 20 phút' đặt 左右 sau cụm số lượng thời gian: 二十分钟左右."
    ],
    sentenceBreakdown: [
      {
        vi: "Nhà tôi cách trường đại học không xa lắm.",
        zh: "我家离大学不太远。",
        py: "Wǒ jiā lí dàxué bú tài yuǎn.",
        note: "A 离 B + Tính từ khoảng cách."
      },
      {
        vi: "Mỗi ngày tôi đều đi tàu điện ngầm đến trường, chỉ mất khoảng hai mươi phút.",
        zh: "我每天都坐地铁去学校，只需要二十分钟左右。",
        py: "Wǒ měitiān dōu zuò dìtiě qù xuéxiào, zhǐ xūyào èrshí fēnzhōng zuǒyòu.",
        note: "坐 + Phương tiện + 去 + Địa điểm."
      },
      {
        vi: "Đi tàu điện ngầm vừa nhanh lại vừa không lo tắc đường.",
        zh: "坐地铁又快又不担心堵车。",
        py: "Zuò dìtiě yòu kuài yòu bù dānxīn dǔchē.",
        note: "Cấu trúc song hành 又 A 又 B."
      }
    ]
  },
  {
    id: "tr_hsk3_07",
    num: 7,
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "writing",
    hsk_level: 3,
    mode: "paragraph",
    topic: "Học tiếng Trung",
    title: "Kinh Nghiệm Học Chữ Hán & Nói Tiếng Trung",
    grammarFocus: "Liên từ nhượng bộ 虽然……，但是…… · Bổ ngữ trạng thái Động từ + 得 + Tính từ",
    viText: "Tuy chữ Hán lúc mới bắt đầu học có hơi khó một chút, nhưng tôi thấy nó vô cùng thú vị. Bây giờ mỗi ngày tôi đều kiên trì luyện viết ba mươi phút, nên tôi viết chữ Hán ngày càng đẹp.",
    referenceZh: "虽然刚开始学习的时候汉字有一点儿难，但是我觉得它非常有意思。现在我每天都坚持练习写三十分钟，所以我写汉字写得越来越漂亮了。",
    referencePinyin: "Suīrán gāng kāishǐ xuéxí de shíhou Hànzì yǒu yìdiǎnr nán, dànshì wǒ juéde tā fēicháng yǒuyìsi. Xiànzài wǒ měitiān dōu jiānchí liànxí xiě sānshí fēnzhōng, suǒyǐ wǒ xiě Hànzì xiě de yuèláiyuè piàoliang le.",
    acceptedAlternatives: [
      "虽然汉字刚开始学有点儿难，但是我认为很有意思。现在我每天坚持写三十分钟汉字，因此汉字写得越来越好看了。"
    ],
    keyVocab: [
      { hanzi: "虽然……但是……", pinyin: "suīrán... dànshì...", vi: "tuy... nhưng...", en: "although... but..." },
      { hanzi: "有一点儿", pinyin: "yǒu yìdiǎnr", vi: "hơi... một chút (trước tính từ)", en: "a little bit" },
      { hanzi: "有意思", pinyin: "yǒuyìsi", vi: "thú vị", en: "interesting" },
      { hanzi: "坚持", pinyin: "jiānchí", vi: "kiên trì", en: "persist / insist on" },
      { hanzi: "越来越", pinyin: "yuèláiyuè", vi: "ngày càng...", en: "more and more" }
    ],
    grammarNotes: [
      "Khi dùng 虽然 ở vế đầu, vế sau bắt buộc phải có 但是 hoặc 可是.",
      "Động từ có tân ngữ '写汉字' khi kết hợp bổ ngữ trình độ 得 phải lặp lại động từ: 写汉字写得越来越漂亮 (hoặc 汉字写得越来越漂亮)."
    ],
    sentenceBreakdown: [
      {
        vi: "Tuy chữ Hán lúc mới bắt đầu học có hơi khó một chút, nhưng tôi thấy nó vô cùng thú vị.",
        zh: "虽然刚开始学习的时候汉字有一点儿难，但是我觉得它非常有意思。",
        py: "Suīrán gāng kāishǐ xuéxí de shíhou Hànzì yǒu yìdiǎnr nán, dànshì wǒ juéde tā fēicháng yǒuyìsi.",
        note: "有一点儿 + Tính từ (难)."
      },
      {
        vi: "Bây giờ mỗi ngày tôi đều kiên trì luyện viết ba mươi phút, nên tôi viết chữ Hán ngày càng đẹp.",
        zh: "现在我每天都坚持练习写三十分钟，所以我写汉字写得越来越漂亮了。",
        py: "Xiànzài wǒ měitiān dōu jiānchí liànxí xiě sānshí fēnzhōng, suǒyǐ wǒ xiě Hànzì xiě de yuèláiyuè piàoliang le.",
        note: "Bổ ngữ trạng thái: 写汉字写得 + 越来越漂亮."
      }
    ]
  },
  {
    id: "tr_hsk3_08",
    num: 8,
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "writing",
    hsk_level: 3,
    mode: "paragraph",
    topic: "Văn hóa & Đời sống",
    title: "Thói Quen Đọc Sách Trước Khi Đi Ngủ",
    grammarFocus: "Câu chữ 把 · Cấu trúc 一边……一边…… · Bổ ngữ kết quả 完",
    viText: "Mỗi tối sau khi làm xong toàn bộ bài tập, tôi thường tắt điện thoại và đặt nó ở trên bàn. Tôi thích vừa nghe nhạc nhẹ vừa đọc một quyển sách tiếng Trung trước khi đi ngủ.",
    referenceZh: "每天晚上把所有作业做完以后，我常常关掉手机并把它放在桌子上。睡觉以前，我喜欢一边听轻音乐，一边看一本中文书。",
    referencePinyin: "Měitiān wǎnshang bǎ suǒyǒu zuòyè zuò wán yǐhòu, wǒ chángcháng guāndiào shǒujī bìng bǎ tā fàng zài zhuōzi shàng. Shuìjiào yǐqián, wǒ xǐhuan yìbiān tīng qīng yīnyuè, yìbiān kàn yì běn Zhōngwén shū.",
    acceptedAlternatives: [
      "每天晚上做完作业以后，我总是把手机关了放在桌子上。睡觉前，我喜欢一边听音乐一边读中文书。"
    ],
    keyVocab: [
      { hanzi: "做完", pinyin: "zuò wán", vi: "làm xong", en: "finish doing" },
      { hanzi: "放在桌子上", pinyin: "fàng zài zhuōzi shàng", vi: "đặt ở trên bàn", en: "put on the table" },
      { hanzi: "一边……一边……", pinyin: "yìbiān... yìbiān...", vi: "vừa... vừa... (2 hành động song song)", en: "while doing A, doing B" },
      { hanzi: "轻音乐", pinyin: "qīng yīnyuè", vi: "nhạc nhẹ", en: "light music" }
    ],
    grammarNotes: [
      "Câu chữ 把 chỉ sự dịch chuyển vị trí: 把 + Tân ngữ (它/手机) + 放在 + Vị trí (桌子上).",
      "Hai hành động diễn ra đồng thời ('vừa nghe nhạc vừa đọc sách') dùng: 一边 + Động từ 1，一边 + Động từ 2."
    ],
    sentenceBreakdown: [
      {
        vi: "Mỗi tối sau khi làm xong toàn bộ bài tập, tôi thường tắt điện thoại và đặt nó ở trên bàn.",
        zh: "每天晚上把所有作业做完以后，我常常关掉手机并把它放在桌子上。",
        py: "Měitiān wǎnshang bǎ suǒyǒu zuòyè zuò wán yǐhòu, wǒ chángcháng guāndiào shǒujī bìng bǎ tā fàng zài zhuōzi shàng.",
        note: "Sử dụng câu chữ 把 với bổ ngữ kết quả 完 và 在桌子上."
      },
      {
        vi: "Tôi thích vừa nghe nhạc nhẹ vừa đọc một quyển sách tiếng Trung trước khi đi ngủ.",
        zh: "睡觉以前，我喜欢一边听轻音乐，一边看一本中文书。",
        py: "Shuìjiào yǐqián, wǒ xǐhuan yìbiān tīng qīng yīnyuè, yìbiān kàn yì běn Zhōngwén shū.",
        note: "睡觉以前 (trước khi đi ngủ) đặt ở đầu câu."
      }
    ]
  },
  {
    id: "tr_hsk4_09",
    num: 9,
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "writing",
    hsk_level: 4,
    mode: "paragraph",
    topic: "Du lịch & Trải nghiệm",
    title: "Chuyến Du Lịch Bắc Kinh Đáng Nhớ",
    grammarFocus: "Trợ từ trải nghiệm 过 · Cấu trúc 不仅……，而且…… · Ấn tượng sâu sắc (留下深刻印象)",
    viText: "Mùa thu năm ngoái tôi đã từng đi Bắc Kinh du lịch cùng gia đình. Chúng tôi không những đã leo Vạn Lý Trường Thành mà còn thưởng thức món vịt quay Bắc Kinh nổi tiếng. Chuyến đi này đã để lại cho tôi ấn tượng vô cùng sâu sắc.",
    referenceZh: "去年秋天我和家人一起去过北京旅游。我们不仅爬了万里长城，而且还品尝了著名的北京烤鸭。这次旅行给我留下了非常深刻的印象。",
    referencePinyin: "Qùnián qiūtiān wǒ hé jiārén yìqǐ qù guo Běijīng lǚyóu. Wǒmen bùjǐn pá le Wànlǐ Chángchéng, érqiě hái pǐncháng le zhùmíng de Běijīng kǎoyā. Zhè cì lǚxíng gěi wǒ liúxià le fēicháng shēnkè de yìnxiàng.",
    acceptedAlternatives: [
      "去年秋天我跟家人去北京旅游过。我们不但登上了长城，而且吃了有名的北京烤鸭。那次旅行给我留下了很深的印象。"
    ],
    keyVocab: [
      { hanzi: "去年秋天", pinyin: "qùnián qiūtiān", vi: "mùa thu năm ngoái", en: "last autumn" },
      { hanzi: "万里长城", pinyin: "Wànlǐ Chángchéng", vi: "Vạn Lý Trường Thành", en: "the Great Wall" },
      { hanzi: "品尝", pinyin: "pǐncháng", vi: "thưởng thức / nếm thử", en: "to taste / savor" },
      { hanzi: "著名", pinyin: "zhùmíng", vi: "nổi tiếng", en: "famous" },
      { hanzi: "深刻印象", pinyin: "shēnkè yìnxiàng", vi: "ấn tượng sâu sắc", en: "deep impression" }
    ],
    grammarNotes: [
      "Khi hai vế câu có cùng chủ ngữ '我们', chủ ngữ đặt trước 不仅: 我们不仅……，而且还……",
      "Cụm từ cố định HSK 4: 给 + Ai + 留下深刻的印象 (để lại ấn tượng sâu sắc cho ai)."
    ],
    sentenceBreakdown: [
      {
        vi: "Mùa thu năm ngoái tôi đã từng đi Bắc Kinh du lịch cùng gia đình.",
        zh: "去年秋天我和家人一起去过北京旅游。",
        py: "Qùnián qiūtiān wǒ hé jiārén yìqǐ qù guo Běijīng lǚyóu.",
        note: "Dùng 去过 để nhấn mạnh trải nghiệm đã từng đi."
      },
      {
        vi: "Chúng tôi không những đã leo Vạn Lý Trường Thành mà còn thưởng thức món vịt quay Bắc Kinh nổi tiếng.",
        zh: "我们不仅爬了万里长城，而且还品尝了著名的北京烤鸭。",
        py: "Wǒmen bùjǐn pá le Wànlǐ Chángchéng, érqiě hái pǐncháng le zhùmíng de Běijīng kǎoyā.",
        note: "Cấu trúc tăng tiến 不仅……，而且还……"
      },
      {
        vi: "Chuyến đi này đã để lại cho tôi ấn tượng vô cùng sâu sắc.",
        zh: "这次旅行给我留下了非常深刻的印象。",
        py: "Zhè cì lǚxíng gěi wǒ liúxià le fēicháng shēnkè de yìnxiàng.",
        note: "Lượng từ cho chuyến đi là 次 (这次旅行)."
      }
    ]
  },
  {
    id: "tr_hsk4_10",
    num: 10,
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "writing",
    hsk_level: 4,
    mode: "paragraph",
    topic: "Công việc & Sự nghiệp",
    title: "Chuẩn Bị Cho Buổi Phỏng Vấn Xin Việc",
    grammarFocus: "为了……（Mục đích） · 提前 + Động từ · 充满信心 (Tràn đầy tự tin)",
    viText: "Để đạt kết quả tốt trong buổi phỏng vấn ngày mai, tối nay tôi đã chuẩn bị kỹ hồ sơ và tìm hiểu văn hóa của công ty. Dù hơi hồi hộp một chút, nhưng tôi vẫn tràn đầy tự tin vào năng lực chuyên môn của mình.",
    referenceZh: "为了在明天的面试中取得好成绩，今天晚上我认真准备了简历，并了解了这家公司的文化。虽然有一点儿紧张，但是我对自己的专业能力充满信心。",
    referencePinyin: "Wèile zài míngtiān de miànshì zhōng qǔdé hǎo chéngjì, jīntiān wǎnshang wǒ rènzhēn zhǔnbèi le jiǎnlì, bìng liǎojiě le zhè jiā gōngsī de wénhuà. Suīrán yǒu yìdiǎnr jǐnzhāng, dànshì wǒ duì zìjǐ de zhuānyè nénglì chōngmǎn xìnxīn.",
    acceptedAlternatives: [
      "为了明天面试顺利，今晚我仔细准备好了简历，还了解了公司文化。尽管有点儿紧张，我对自己的能力很有信心。"
    ],
    keyVocab: [
      { hanzi: "为了", pinyin: "wèile", vi: "để / vì mục đích", en: "in order to" },
      { hanzi: "取得好成绩", pinyin: "qǔdé hǎo chéngjì", vi: "đạt kết quả tốt", en: "achieve good results" },
      { hanzi: "简历", pinyin: "jiǎnlì", vi: "hồ sơ xin việc / CV", en: "resume / CV" },
      { hanzi: "对……充满信心", pinyin: "duì... chōngmǎn xìnxīn", vi: "tràn đầy tự tin vào...", en: "full of confidence in..." }
    ],
    grammarNotes: [
      "Giới từ chỉ mục đích 为了 đặt ở vế đầu câu, vế sau là hành động chủ ngữ thực hiện.",
      "Cấu trúc 对 + Đối tượng + 充满信心 / 很有信心 (tràn đầy tự tin vào điều gì)."
    ],
    sentenceBreakdown: [
      {
        vi: "Để đạt kết quả tốt trong buổi phỏng vấn ngày mai, tối nay tôi đã chuẩn bị kỹ hồ sơ và tìm hiểu văn hóa của công ty.",
        zh: "为了在明天的面试中取得好成绩，今天晚上我认真准备了简历，并了解了这家公司的文化。",
        py: "Wèile zài míngtiān de miànshì zhōng qǔdé hǎo chéngjì, jīntiān wǎnshang wǒ rènzhēn zhǔnbèi le jiǎnlì, bìng liǎojiě le zhè jiā gōngsī de wénhuà.",
        note: "在……中 (trong...) + Động từ."
      },
      {
        vi: "Dù hơi hồi hộp một chút, nhưng tôi vẫn tràn đầy tự tin vào năng lực chuyên môn của mình.",
        zh: "虽然有一点儿紧张，但是我对自己的专业能力充满信心。",
        py: "Suīrán yǒu yìdiǎnr jǐnzhāng, dànshì wǒ duì zìjǐ de zhuānyè nénglì chōngmǎn xìnxīn.",
        note: "对自己的专业能力充满信心."
      }
    ]
  },
  {
    id: "tr_hsk5_11",
    num: 11,
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "writing",
    hsk_level: 5,
    mode: "paragraph",
    topic: "Công nghệ & Giáo dục",
    title: "Ứng Dụng Trí Tuệ Nhân Tạo Trong Học Ngoại Ngữ",
    grammarFocus: "随着……的发展 · 不仅……而且…… · 提高学习效率",
    viText: "Cùng với sự phát triển nhanh chóng của công nghệ trí tuệ nhân tạo, người học có thể luyện phát âm và dịch thuật mọi lúc mọi nơi. Việc kết hợp công cụ thông minh với sự kiên trì mỗi ngày sẽ giúp nâng cao đáng kể hiệu suất học tập.",
    referenceZh: "随着人工智能技术的快速发展，学习者可以随时随地练习发音和翻译。把智能工具与每天的坚持结合起来，将会大大提高学习效率。",
    referencePinyin: "Suízhe réngōng zhìnéng jìshù de kuàisù fāzhǎn, xuéxízhě kěyǐ suíshí-suídì liànxí fāyīn hé fānyì. Bǎ zhìnéng gōngjù yǔ měitiān de jiānchí jiéhé qǐlái, jiāng huì dàdà tígāo xuéxí xiàolǜ.",
    acceptedAlternatives: [
      "随着AI技术的迅速发展，学生能够随时随地练习口语和翻译。将智能工具和日常坚持结合起来，能明显提高学习效率。"
    ],
    keyVocab: [
      { hanzi: "随着", pinyin: "suízhe", vi: "cùng với (sự biến đổi/phát triển)", en: "along with" },
      { hanzi: "随时随地", pinyin: "suíshí-suídì", vi: "mọi lúc mọi nơi", en: "anytime, anywhere" },
      { hanzi: "把……与……结合起来", pinyin: "bǎ... yǔ... jiéhé qǐlái", vi: "kết hợp A với B", en: "combine A with B" },
      { hanzi: "学习效率", pinyin: "xuéxí xiàolǜ", vi: "hiệu suất học tập", en: "learning efficiency" }
    ],
    grammarNotes: [
      "Cấu trúc mở đầu văn nghị luận HSK 5: 随着 + Danh từ cụm (……的发展) ，Chủ ngữ + Động từ.",
      "Phân biệt 效率 (hiệu suất) đi với động từ 提高 (提高学习效率)."
    ],
    sentenceBreakdown: [
      {
        vi: "Cùng với sự phát triển nhanh chóng của công nghệ trí tuệ nhân tạo, người học có thể luyện phát âm và dịch thuật mọi lúc mọi nơi.",
        zh: "随着人工智能技术的快速发展，学习者可以随时随地练习发音和翻译。",
        py: "Suízhe réngōng zhìnéng jìshù de kuàisù fāzhǎn, xuéxízhě kěyǐ suíshí-suídì liànxí fāyīn hé fānyì.",
        note: "随着……的发展 + Chủ ngữ."
      },
      {
        vi: "Việc kết hợp công cụ thông minh với sự kiên trì mỗi ngày sẽ giúp nâng cao đáng kể hiệu suất học tập.",
        zh: "把智能工具与每天的坚持结合起来，将会大大提高学习效率。",
        py: "Bǎ zhìnéng gōngjù yǔ měitiān de jiānchí jiéhé qǐlái, jiāng huì dàdà tígāo xuéxí xiàolǜ.",
        note: "把 A 与 B 结合起来 làm chủ ngữ mệnh đề."
      }
    ]
  },
  {
    id: "tr_hsk6_12",
    num: 12,
    contentSource: "EXTERNAL_LIBRARY",
    courseType: "external_skill_library",
    skill: "writing",
    hsk_level: 6,
    mode: "paragraph",
    topic: "Học thuật & Tư duy",
    title: "Vận Dụng Ngữ Cảnh Thực Tế Thay Vì Học Vẹt",
    grammarFocus: "与其……，不如…… · 死记硬背 · 举一反三",
    viText: "Trong quá trình học một ngôn ngữ mới, thay vì học vẹt hàng trăm từ vựng rời rạc, chi bằng đặt chúng vào các đoạn văn thực tế để luyện dịch. Chỉ khi hiểu rõ sắc thái ngữ pháp và biết suy rộng ra từ một ví dụ, chúng ta mới có thể diễn đạt tự nhiên như người bản xứ.",
    referenceZh: "在学习一门新语言的过程中，与其死记硬背几百个孤立的词汇，不如把它们放进真实的短文中练习翻译。只有深刻理解语法色彩并学会举一反三，我们才能像母语者一样自然地表达。",
    referencePinyin: "Zài xuéxí yì mén xīn yǔyán de guòchéng zhōng, yǔqí sǐjì-yìngbèi jǐ bǎi gè gūlì de cíhuì, bùrú bǎ tāmen fàng jìn zhēnshí de duǎnwén zhōng liànxí fānyì. Zhǐyǒu shēnkè lǐjiě yǔfǎ sècǎi bìng xuéhuì jǔyī-fǎnsān, wǒmen cái néng xiàng mǔyǔzhě yíyàng zìrán de biǎodá.",
    acceptedAlternatives: [
      "学习新语言时，与其死记硬背孤立的单词，不如将它们放入真实语境中练习翻译。唯有真正掌握语法并举一反三，才能自然流畅地表达。"
    ],
    keyVocab: [
      { hanzi: "一门新语言", pinyin: "yì mén xīn yǔyán", vi: "một ngôn ngữ mới (lượng từ 门)", en: "a new language" },
      { hanzi: "死记硬背", pinyin: "sǐjì-yìngbèi", vi: "học vẹt / nhớ máy móc", en: "rote memorization" },
      { hanzi: "与其……不如……", pinyin: "yǔqí... bùrú...", vi: "thay vì..., chi bằng...", en: "rather than..., better to..." },
      { hanzi: "举一反三", pinyin: "jǔyī-fǎnsān", vi: "học một hiểu ba / suy rộng ra", en: "draw inferences from one instance" }
    ],
    grammarNotes: [
      "Lượng từ chuyên dụng cho môn học hoặc ngôn ngữ là 门 (一门外语 / 一门学科).",
      "Cấu trúc điều kiện cần 只有……，才…… (Chỉ khi..., mới...)."
    ],
    sentenceBreakdown: [
      {
        vi: "Trong quá trình học một ngôn ngữ mới, thay vì học vẹt hàng trăm từ vựng rời rạc, chi bằng đặt chúng vào các đoạn văn thực tế để luyện dịch.",
        zh: "在学习一门新语言的过程中，与其死记硬背几百个孤立的词汇，不如把它们放进真实的短文中练习翻译。",
        py: "Zài xuéxí yì mén xīn yǔyán de guòchéng zhōng, yǔqí sǐjì-yìngbèi jǐ bǎi gè gūlì de cíhuì, bùrú bǎ tāmen fàng jìn zhēnshí de duǎnwén zhōng liànxí fānyì.",
        note: "与其 + Phương án loại bỏ，不如 + Phương án tối ưu."
      },
      {
        vi: "Chỉ khi hiểu rõ sắc thái ngữ pháp và biết suy rộng ra từ một ví dụ, chúng ta mới có thể diễn đạt tự nhiên như người bản xứ.",
        zh: "只有深刻理解语法色彩并学会举一反三，我们才能像母语者一样自然地表达。",
        py: "Zhǐyǒu shēnkè lǐjiě yǔfǎ sècǎi bìng xuéhuì jǔyī-fǎnsān, wǒmen cái néng xiàng mǔyǔzhě yíyàng zìrán de biǎodá.",
        note: "只有……，才…… + 像……一样 (giống như...)."
      }
    ]
  }
];

/* ==========================================================================
   EXTERNAL WRITING STUDIO TASKS (Paragraph & Topic Writing across HSK 1–6)
   Modeled on QEnglish Writing Studio cards (Introduce Yourself, My Family...)
   contentSource: "EXTERNAL_LIBRARY"
   ========================================================================== */
window.QCHINESE_WRITING_TASKS = [
  {
    id: "wt_1",
    contentSource: "EXTERNAL_LIBRARY",
    hsk_level: 1,
    type: "paragraph",
    badge: "PARAGRAPH",
    title: "Introduce Yourself — 自我介绍",
    promptEn: "Write a short paragraph in Simplified Chinese to introduce yourself. Include your name, age, nationality, and what you like to do.",
    prompt: "Viết một đoạn văn ngắn để giới thiệu bản thân bằng tiếng Trung Giản thể. Bao gồm tên, tuổi, quốc tịch và sở thích của bạn.",
    targetWord: "喜欢",
    expected: "大家好！我叫明安，今年十九岁。我是越南大学生。我很喜欢学习中文和听音乐。",
    expectedPinyin: "Dàjiā hǎo! Wǒ jiào Míng'ān, jīnnián shíjiǔ suì. Wǒ shì Yuènán dàxuéshēng. Wǒ hěn xǐhuan xuéxí Zhōngwén hé tīng yīnyuè.",
    expectedEn: "Hello everyone! My name is Minh An, and I am 19 years old. I am a Vietnamese university student. I really like learning Chinese and listening to music.",
    expectedVi: "Chào mọi người! Tôi tên là Minh An, năm nay 19 tuổi. Tôi là sinh viên Việt Nam. Tôi rất thích học tiếng Trung và nghe nhạc.",
    hint: "Mẫu câu gợi ý: 我叫... / 今年...岁 / 我是越南人 / 我很喜欢..."
  },
  {
    id: "wt_2",
    contentSource: "EXTERNAL_LIBRARY",
    hsk_level: 1,
    type: "paragraph",
    badge: "PARAGRAPH",
    title: "My Family — 我的家庭",
    promptEn: "Write about your family. How many people are in your family? What do they do? What do you like to do together?",
    prompt: "Viết về gia đình bạn. Gia đình bạn có bao nhiêu người? Họ làm nghề gì? Gia đình bạn thích làm gì cùng nhau?",
    targetWord: "家",
    expected: "我家有四口人：爸爸、妈妈、姐姐和我。爸爸是医生，妈妈是老师。周末我们常常一起做饭和看电视。",
    expectedPinyin: "Wǒ jiā yǒu sì kǒu rén: bàba, māma, jiějie hé wǒ. Bàba shì yīshēng, māma shì lǎoshī. Zhōumò wǒmen chángcháng yìqǐ zuòfàn hé kàn diànshì.",
    expectedEn: "There are four people in my family: dad, mom, older sister, and me. Dad is a doctor and mom is a teacher. On weekends we often cook and watch TV together.",
    expectedVi: "Nhà tôi có 4 người: bố, mẹ, chị gái và tôi. Bố là bác sĩ, mẹ là giáo viên. Cuối tuần chúng tôi thường cùng nhau nấu ăn và xem tivi.",
    hint: "Mẫu câu gợi ý: 我家有...口人 / 爸爸是... / 我们常常一起..."
  },
  {
    id: "wt_3",
    contentSource: "EXTERNAL_LIBRARY",
    hsk_level: 2,
    type: "paragraph",
    badge: "PARAGRAPH",
    title: "My Daily Routine — 我的一天",
    promptEn: "Describe your typical day. What time do you wake up and go to school? What do you study in the morning, afternoon, and evening?",
    prompt: "Mô tả một ngày bình thường của bạn. Bạn thức dậy lúc mấy giờ? Bạn làm gì vào buổi sáng, buổi chiều và buổi tối?",
    targetWord: "每天",
    expected: "我每天早上六点半起床，七点吃早饭，然后坐地铁去学校上课。下午我在图书馆看中文书，晚上回家练习写汉字。",
    expectedPinyin: "Wǒ měitiān zǎoshang liù diǎn bàn qǐchuáng, qī diǎn chī zǎofàn, ránhòu zuò dìtiě qù xuéxiào shàngkè. Xiàwǔ wǒ zài túshūguǎn kàn Zhōngwén shū, wǎnshang huí jiā liànxí xiě Hànzì.",
    expectedEn: "I get up at 6:30 AM every morning, eat breakfast at 7:00, and then take the subway to school. In the afternoon I read Chinese books in the library, and in the evening I go home to practice writing characters.",
    expectedVi: "Mỗi ngày tôi thức dậy lúc 6 rưỡi sáng, 7 giờ ăn sáng rồi đi tàu điện ngầm đến trường. Buổi chiều tôi đọc sách tiếng Trung ở thư viện, buổi tối về nhà luyện viết chữ Hán.",
    hint: "Chú ý trật tự: Chủ ngữ + Thời gian + 在 Địa điểm + Động từ."
  },
  {
    id: "wt_4",
    contentSource: "EXTERNAL_LIBRARY",
    hsk_level: 3,
    type: "paragraph",
    badge: "ESSAY",
    title: "My Favorite Travel Destination — 我最喜欢的旅行地方",
    promptEn: "Write a paragraph about a city or place you have visited or want to visit in China or Vietnam. Explain why you like it.",
    prompt: "Viết một đoạn văn về một thành phố hoặc địa điểm du lịch mà bạn yêu thích. Giải thích vì sao bạn ấn tượng với nơi đó.",
    targetWord: "虽然",
    expected: "今年夏天我去北京旅行了一个星期。虽然那里的夏天有一点儿热，但是风景非常美丽，北京烤鸭也特别好吃。我希望明年还能再去一次。",
    expectedPinyin: "Jīnnián xiàtiān wǒ qù Běijīng lǚxíng le yí gè xīngqī. Suīrán nàlǐ de xiàtiān yǒu yìdiǎnr rè, dànshì fēngjǐng fēicháng měilì, Běijīng kǎoyā yě tèbié hǎochī. Wǒ xīwàng míngnián hái néng zài qù yí cì.",
    expectedEn: "This summer I traveled to Beijing for a week. Although summer there is a bit hot, the scenery is very beautiful and Peking duck is delicious. I hope I can visit again next year.",
    expectedVi: "Mùa hè năm nay tôi đi du lịch Bắc Kinh một tuần. Tuy mùa hè ở đó hơi nóng một chút nhưng phong cảnh rất đẹp, vịt quay Bắc Kinh cũng đặc biệt ngon. Tôi hy vọng năm sau có thể đi thêm lần nữa.",
    hint: "Khuyến khích sử dụng cấu trúc 虽然……，但是…… và bổ ngữ thời lượng."
  },
  {
    id: "wt_5",
    contentSource: "EXTERNAL_LIBRARY",
    hsk_level: 4,
    type: "paragraph",
    badge: "ESSAY",
    title: "Technology in Language Learning — 科技与外语学习",
    promptEn: "Discuss how technology and AI help students learn Chinese more effectively. Use connectors like 不仅……而且……",
    prompt: "Viết đoạn văn nghị luận ngắn về vai trò của công nghệ và AI trong việc học tiếng Trung hiện đại (khuyến khích dùng 不仅……而且……).",
    targetWord: "不仅",
    expected: "现代科技给外语学习带来了极大的便利。智能软件不仅能帮我们纠正发音，而且能随时批改中文翻译句子，让学习效率大大提高。",
    expectedPinyin: "Xiàndài kējì gěi wàiyǔ xuéxí dàilái le jídà de biànlì. Zhìnéng ruǎnjiàn bùjǐn néng bāng wǒmen jiūzhèng fāyīn, érqiě néng suíshí pīgǎi Zhōngwén fānyì jùzi, ràng xuéxí xiàolǜ dàdà tígāo.",
    expectedEn: "Modern technology brings tremendous convenience to foreign language learning. Smart software not only helps us correct pronunciation, but also grades Chinese translation sentences anytime, greatly improving learning efficiency.",
    expectedVi: "Công nghệ hiện đại mang lại sự tiện lợi to lớn cho việc học ngoại ngữ. Phần mềm thông minh không những giúp chúng ta sửa phát âm mà còn chấm câu dịch tiếng Trung mọi lúc, giúp nâng cao hiệu suất học tập.",
    hint: "Dùng cặp liên từ tăng tiến: 不仅……，而且…… và cụm 提高学习效率."
  }
];
