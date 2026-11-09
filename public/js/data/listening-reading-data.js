/* -*- coding: utf-8 -*-
 * QChinese – HSK 1–6 Roadmap, 7-Skill Placement Test, Listening Dialogues, Reading Passages & Writing Prompts
 * Strictly Simplified Chinese (简体中文).
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

/* 6.3. Listening Module Dataset (Dialogues + Sentences + Exercises) */
window.QCHINESE_LISTENING = [
  {
    id: "lis_greeting_1",
    hsk_level: 1,
    category: "Hội thoại cơ bản",
    title: "Bài 1: Làm quen bạn mới ở lớp tiếng Trung",
    summary: "Luyện nghe lời chào hỏi, hỏi tên, quốc tịch và nghề nghiệp với tốc độ rõ ràng.",
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
    hsk_level: 1,
    category: "Đời sống & Ẩm thực",
    title: "Bài 2: Gọi món ăn trưa tại quán ăn",
    summary: "Luyện nghe từ vựng món ăn, đồ uống, lượng từ 碗 (bát), 杯 (cốc) và giá tiền.",
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
    hsk_level: 2,
    category: "Kế hoạch cuối tuần",
    title: "Bài 3: Rủ bạn đi hiệu sách và uống cà phê (HSK 2)",
    summary: "Luyện nghe mốc thời gian, mục đích chuyến đi và cách hẹn gặp.",
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
  }
];

/* 6.5. Reading Module Dataset (Tokenized Simplified Chinese Passages + Comprehension Quiz) */
window.QCHINESE_READING = [
  {
    id: "read_hsk1_day",
    hsk_level: 1,
    title: "Một ngày học tiếng Trung của tôi (我的一天)",
    summary: "Bài đọc sơ cấp HSK 1 giúp làm quen cách giới thiệu bản thân, thời gian biểu và sở thích học chữ Hán.",
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
        q: "Buổi sáng lúc 8 giờ, Minh An làm gì ở nhà?",
        options: ["Nghe audio và đọc Pinyin", "Đi siêu thị mua hoa quả", "Xem phim truyền hình", "Đi uống cà phê với bạn"],
        answer: "Nghe audio và đọc Pinyin"
      },
      {
        q: "Mỗi buổi tối Minh An luyện viết bao nhiêu chữ Hán mới?",
        options: ["5 chữ Hán mới", "15 chữ Hán mới", "20 chữ Hán mới", "Không luyện viết"],
        answer: "5 chữ Hán mới"
      }
    ]
  },
  {
    id: "read_hsk2_coffee",
    hsk_level: 2,
    title: "Văn hóa trà và cà phê (茶与咖啡)",
    summary: "Bài đọc HSK 2–3 giúp rèn từ vựng đồ uống, sở thích gia đình và liên từ nhượng bộ.",
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
        options: ["Vì ông thấy uống trà tốt cho sức khỏe", "Vì nhà hết cà phê", "Vì trà rẻ hơn sữa", "Vì trời mùa đông lạnh"],
        answer: "Vì ông thấy uống trà tốt cho sức khỏe"
      },
      {
        q: "Người viết và chị gái thích uống thức uống nào?",
        options: ["Cà phê đá Việt Nam", "Trà xanh không đường", "Nước ép táo", "Sữa nóng"],
        answer: "Cà phê đá Việt Nam"
      }
    ]
  },
  {
    id: "read_hsk4_method",
    hsk_level: 4,
    title: "Bí quyết nhớ chữ Hán lâu dài (怎样记住汉字)",
    summary: "Bài đọc trung cấp HSK 4 giải thích phương pháp học bộ thủ và đặt từ vào ngữ cảnh.",
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
        options: [
          "Hiểu ý nghĩa bộ thủ và đặt từ mới vào câu để sử dụng",
          "Chép đi chép lại mỗi chữ 100 lần mà không cần hiểu nghĩa",
          "Chỉ học Pinyin không cần nhìn mặt chữ",
          "Đọc từ điển từ đầu đến cuối"
        ],
        answer: "Hiểu ý nghĩa bộ thủ và đặt từ mới vào câu để sử dụng"
      }
    ]
  }
];

/* 6.6B. Sentence & Paragraph Writing Tasks */
window.QCHINESE_WRITING_TASKS = [
  {
    id: "wt_1",
    hsk_level: 1,
    type: "translate",
    badge: "Dịch Việt → Trung (HSK 1)",
    prompt: "Hãy dịch câu sau sang tiếng Trung Giản thể: 'Tôi là người Việt Nam, tôi rất thích học tiếng Trung.'",
    targetWord: "喜欢",
    expected: "我是越南人，我很喜欢学习中文。",
    expectedPinyin: "Wǒ shì Yuènán rén, wǒ hěn xǐhuan xuéxí Zhōngwén.",
    expectedEn: "I am Vietnamese, and I really like learning Chinese.",
    expectedVi: "Tôi là người Việt Nam, tôi rất thích học tiếng Trung.",
    hint: "Gợi ý: 我是越南人 + 我很喜欢 + 学习中文 (gõ Pinyin vào ô bên dưới sẽ hiện thanh gợi ý chữ Hán!)."
  },
  {
    id: "wt_2",
    hsk_level: 1,
    type: "new_word",
    badge: "Đặt câu với từ mới (HSK 1)",
    prompt: "Hãy tự đặt một câu hoàn chỉnh có sử dụng từ '学生 (xuésheng – học sinh/sinh viên)' hoặc '老师 (lǎoshī – giáo viên)'.",
    targetWord: "",
    expected: "王老师是我们的中文老师，我们都是她的学生。",
    expectedPinyin: "Wáng lǎoshī shì wǒmen de Zhōngwén lǎoshī, wǒmen dōu shì tā de xuésheng.",
    expectedEn: "Teacher Wang is our Chinese teacher, and we are all her students.",
    expectedVi: "Cô Vương là giáo viên tiếng Trung của chúng tôi, chúng tôi đều là học sinh của cô.",
    hint: "Ví dụ đơn giản: 我是大学生。(Wǒ shì dàxuéshēng.)"
  },
  {
    id: "wt_3",
    hsk_level: 1,
    type: "translate",
    badge: "Luyện trật tự thời gian & địa điểm (HSK 1)",
    prompt: "Dịch sang tiếng Trung Giản thể (chú ý vị trí Thời gian & Địa điểm!): 'Hôm nay tôi đọc sách ở nhà.'",
    targetWord: "看书",
    expected: "我今天在家看书。",
    expectedPinyin: "Wǒ jīntiān zài jiā kàn shū.",
    expectedEn: "Today I read books at home.",
    expectedVi: "Hôm nay tôi đọc sách ở nhà.",
    hint: "Nhớ công thức: Chủ ngữ (我) + Thời gian (今天) + 在 Địa điểm (在家) + Động từ (看书)."
  },
  {
    id: "wt_4",
    hsk_level: 2,
    type: "paragraph",
    badge: "Viết đoạn văn ngắn (HSK 1–2)",
    prompt: "Viết đoạn văn ngắn (2–4 câu) giới thiệu tên của bạn, gia đình bạn có mấy người, và bạn thích ăn/uống món gì.",
    targetWord: "家",
    expected: "你好！我叫明安。我家有四口人：爸爸、妈妈、姐姐和我。我很喜欢喝越南咖啡。",
    expectedPinyin: "Nǐ hǎo! Wǒ jiào Míng'ān. Wǒ jiā yǒu sì kǒu rén: bàba, māma, jiějie hé wǒ. Wǒ hěn xǐhuan hē Yuènán kāfēi.",
    expectedEn: "Hello! My name is Minh An. There are four people in my family: dad, mom, older sister, and me. I really like drinking Vietnamese coffee.",
    expectedVi: "Xin chào! Tôi tên là Minh An. Nhà tôi có 4 người: bố, mẹ, chị gái và tôi. Tôi rất thích uống cà phê Việt Nam.",
    hint: "Dùng các mẫu câu: 我叫... / 我家有...口人 / 我喜欢吃/喝..."
  },
  {
    id: "wt_5",
    hsk_level: 3,
    type: "paragraph",
    badge: "Viết theo chủ đề HSK 3–4",
    prompt: "Viết 2–3 câu chia sẻ cảm nhận của bạn về việc học chữ Hán Giản thể (khuyến khích dùng cấu trúc 虽然……，但是……).",
    targetWord: "虽然",
    expected: "虽然汉字刚开始看起来有点儿难，但是每天坚持练习以后，我觉得写汉字非常有意思。",
    expectedPinyin: "Suīrán Hànzì gāng kāishǐ kàn qǐlái yǒudiǎnr nán, dànshì měitiān jiānchí liànxí yǐhòu, wǒ juéde xiě Hànzì fēicháng yǒuyìsi.",
    expectedEn: "Although Chinese characters look a bit hard at first, after practicing consistently every day, I find writing characters very interesting.",
    expectedVi: "Tuy chữ Hán lúc mới bắt đầu nhìn hơi khó, nhưng sau khi kiên trì luyện tập mỗi ngày, tôi thấy viết chữ Hán vô cùng thú vị.",
    hint: "Dùng cặp liên từ: 虽然……，但是……"
  }
];
