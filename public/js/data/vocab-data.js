/* -*- coding: utf-8 -*-
 * QChinese – Verified Simplified Chinese (简体中文) Trilingual Vocabulary & Pinyin IME Dataset
 * Strictly Simplified Chinese. Multi-sense contextual meanings in Chinese, English, and Vietnamese.
 */

window.QCHINESE_TOPICS = [
  { id: "all", label: "Tất cả chủ đề", icon: "✦" },
  { id: "greeting", label: "Giao tiếp & Chào hỏi", icon: "👋" },
  { id: "family", label: "Gia đình", icon: "🏠" },
  { id: "school", label: "Trường học & Học tập", icon: "📚" },
  { id: "work", label: "Công việc", icon: "💼" },
  { id: "food", label: "Đồ ăn & Thức uống", icon: "🍜" },
  { id: "shopping", label: "Mua sắm", icon: "🛍️" },
  { id: "travel", label: "Du lịch & Đi lại", icon: "✈️" },
  { id: "time", label: "Thời gian", icon: "🕒" },
  { id: "emotion", label: "Cảm xúc & Tính chất", icon: "💛" },
  { id: "daily", label: "Đời sống hàng ngày", icon: "🌿" }
];

window.QCHINESE_VOCAB = [
  // ================= HSK 1 =================
  {
    id: "v_ni",
    hanzi: "你",
    pinyin: "nǐ",
    pinyin_number: "ni3",
    pinyin_plain: "ni",
    vietnamese_pronunciation_hint: "nỉ (gần đúng – đầu lưỡi chạm nợi trên, xuống thấp rồi nâng nhẹ)",
    part_of_speech: "代词 · Đại từ nhân xưng ngôi thứ 2 (Pronoun)",
    hsk_level: 1,
    topic: "greeting",
    stroke_count: 7,
    meanings: {
      chinese: ["称呼说话对方的代词（单数）。"],
      english: ["you (singular, addressing the person spoken to)"],
      vietnamese: [
        "bạn, cậu (giao tiếp ngang hàng, thân mật)",
        "anh, chị, em (tùy quan hệ giao tiếp thông thường)"
      ]
    },
    senses: [
      {
        pos: "Đại từ (代词)",
        zh: "称呼说话对方的代词。",
        en: "You (singular) — used to address a peer, friend, or younger person.",
        vi: "Bạn, cậu, anh, chị — dùng để xưng hô với người đối diện ở mức bình đẳng hoặc thân mật.",
        context: "Giao tiếp hàng ngày. Lưu ý: Khi nói với người lớn tuổi, cấp trên hoặc khách hàng cần sự kính trọng, hãy dùng 您 (nín) thay vì 你 (nǐ)."
      }
    ],
    confused_with: "Phân biệt với 您 (nín - ngài, ông, bà, quý khách: thể lịch sự có thêm bộ Tâm 心 ở dưới) và 你们 (nǐmen - các bạn, số nhiều).",
    examples: [
      { chinese: "你好！", pinyin: "Nǐ hǎo!", english: "Hello!", vietnamese: "Xin chào!" },
      { chinese: "你好吗？", pinyin: "Nǐ hǎo ma?", english: "How are you?", vietnamese: "Bạn khỏe không?" },
      { chinese: "你是学生。", pinyin: "Nǐ shì xuésheng.", english: "You are a student.", vietnamese: "Bạn là học sinh / sinh viên." }
    ]
  },
  {
    id: "v_hao",
    hanzi: "好",
    pinyin: "hǎo",
    pinyin_number: "hao3",
    pinyin_plain: "hao",
    vietnamese_pronunciation_hint: "hảo (gần đúng – âm h nhẹ từ họng, thanh 3 trầm xuống rồi lên)",
    part_of_speech: "形容词 / 副词 · Tính từ / Phó từ (Adjective / Adverb)",
    hsk_level: 1,
    topic: "greeting",
    stroke_count: 6,
    polyphonic: [
      { pinyin: "hǎo", meaningVi: "tốt, khỏe, hay, được (tính từ - phổ biến nhất)", example: "你好 (nǐ hǎo) – Xin chào" },
      { pinyin: "hào", meaningVi: "thích, hiếu, ham mê (động từ, thanh 4)", example: "爱好 (àihào) – Sở thích" }
    ],
    meanings: {
      chinese: ["优点多，使人满意；身体康健；表示同意或结束。"],
      english: ["good, fine, well", "okay, all right (expressing agreement)", "easy to (before a verb)"],
      vietnamese: [
        "tốt, đẹp, hay, ngon, khỏe (tính từ chỉ chất lượng tích cực)",
        "được, vâng, đồng ý (dùng độc lập để đáp lại)",
        "dễ... (đứng trước động từ: 好吃 ngon/dễ ăn, 好听 dễ nghe/hay)"
      ]
    },
    senses: [
      {
        pos: "Tính từ (形容词)",
        zh: "优点多的，使人满意的；身体健康。",
        en: "Good, fine, healthy.",
        vi: "Tốt, khỏe, ổn.",
        context: "Khi nói 'Tôi khỏe', người Trung Quốc nói 我很好 (Wǒ hěn hǎo), không nói *我是好."
      },
      {
        pos: "Thán từ / Đáp từ",
        zh: "表示赞同或答应。",
        en: "Okay! Sounds good!",
        vi: "Được thôi! Đồng ý!",
        context: "Dùng như '好的 (hǎo de)' hoặc '好！' khi đồng ý lời đề nghị."
      }
    ],
    confused_with: "Đọc là hǎo (thanh 3) khi mang nghĩa 'tốt/khỏe'; đọc là hào (thanh 4) trong từ 爱好 (àihào - sở thích), 好奇 (hàoqí - hiếu kỳ).",
    examples: [
      { chinese: "我很好，谢谢。", pinyin: "Wǒ hěn hǎo, xièxie.", english: "I am doing well, thank you.", vietnamese: "Tôi rất khỏe, cảm ơn." },
      { chinese: "好的，没问题！", pinyin: "Hǎo de, méi wèntí!", english: "Okay, no problem!", vietnamese: "Được nhé, không vấn đề gì!" }
    ]
  },
  {
    id: "v_nin",
    hanzi: "您",
    pinyin: "nín",
    pinyin_number: "nin2",
    pinyin_plain: "nin",
    vietnamese_pronunciation_hint: "nín (gần đúng – thanh 2 cao dần như dấu sắc)",
    part_of_speech: "代词 · Đại từ kính ngữ (Polite Pronoun)",
    hsk_level: 1,
    topic: "greeting",
    stroke_count: 11,
    meanings: {
      chinese: ["“你”的敬称。"],
      english: ["you (polite/respectful singular form)"],
      vietnamese: ["ngài, ông, bà, thầy, cô, quý khách (xưng hô lịch sự, kính trọng)"]
    },
    senses: [
      {
        pos: "Đại từ kính xưng (敬称代词)",
        zh: "对长辈、上级或陌生人的敬称。",
        en: "Polite 'you' used for elders, teachers, superiors, or customers.",
        vi: "Dùng thay cho 你 khi nói chuyện với người lớn tuổi, thầy cô, cấp trên hoặc khách hàng.",
        context: "Cấu tạo rất ý nghĩa: chữ 你 (bạn) đặt trên chữ 心 (trái tim) → đặt người đối diện lên trên trái tim mình."
      }
    ],
    confused_with: "Lưu ý: Tiếng Trung chuẩn không dùng *您们, khi chào nhiều vị khách trang trọng hãy nói 各位好 hoặc 大家好.",
    examples: [
      { chinese: "老师，您好！", pinyin: "Lǎoshī, nín hǎo!", english: "Hello, teacher!", vietnamese: "Em chào thầy/cô ạ!" }
    ]
  },
  {
    id: "v_wo",
    hanzi: "我",
    pinyin: "wǒ",
    pinyin_number: "wo3",
    pinyin_plain: "wo",
    vietnamese_pronunciation_hint: "ủa / guổ (gần đúng – tròn môi đầu âm w rồi mở sang o, thanh 3)",
    part_of_speech: "代词 · Đại từ ngôi thứ nhất (Pronoun)",
    hsk_level: 1,
    topic: "greeting",
    stroke_count: 7,
    meanings: {
      chinese: ["自称，说话人自己。"],
      english: ["I, me"],
      vietnamese: ["tôi, mình, tớ, em, con (người đang nói tự xưng)"]
    },
    senses: [
      {
        pos: "Đại từ (代词)",
        zh: "称自己。",
        en: "I, me (first-person singular pronoun).",
        vi: "Tôi, mình, tớ, con, em — dùng cho cả vị trí chủ ngữ lẫn tân ngữ.",
        context: "Thêm 们 thành 我们 (wǒmen - chúng tôi, chúng ta)."
      }
    ],
    confused_with: "Chú ý nét thứ 5 là nét nghiêng móc dài (斜钩) tạo khung chính của chữ 我, đừng nhầm với chữ 找 (zhǎo - tìm kiếm).",
    examples: [
      { chinese: "我是越南人。", pinyin: "Wǒ shì Yuènán rén.", english: "I am Vietnamese.", vietnamese: "Tôi là người Việt Nam." },
      { chinese: "我学习中文。", pinyin: "Wǒ xuéxí Zhōngwén.", english: "I study Chinese.", vietnamese: "Tôi học tiếng Trung." }
    ]
  },
  {
    id: "v_shi",
    hanzi: "是",
    pinyin: "shì",
    pinyin_number: "shi4",
    pinyin_plain: "shi",
    vietnamese_pronunciation_hint: "sư (gần đúng – uốn cong đầu lưỡi lên vòm miệng cho âm sh, dứt khoát thanh 4)",
    part_of_speech: "动词 · Động từ hệ từ (Copula Verb)",
    hsk_level: 1,
    topic: "greeting",
    stroke_count: 9,
    meanings: {
      chinese: ["表示判断或肯定（联系主语和表语）。"],
      english: ["to be (am, is, are)", "yes, right (affirming)"],
      vietnamese: ["là (nối chủ ngữ với danh từ)", "đúng, phải, vâng (khẳng định)"]
    },
    senses: [
      {
        pos: "Động từ (动词)",
        zh: "连接主语与名词性宾语，表示判断。",
        en: "To be (links a subject to a noun phrase).",
        vi: "Là — dùng để giới thiệu tên tuổi, nghề nghiệp, quốc tịch, danh từ.",
        context: "QUAN TRỌNG: Không dùng 是 trước tính từ đơn thuần (không nói *我是累, phải nói 我很累)."
      }
    ],
    confused_with: "Phủ định của 是 là 不是 (bú shì - biến điệu của 不 thành thanh 2 trước thanh 4!).",
    examples: [
      { chinese: "我是老师，他是学生。", pinyin: "Wǒ shì lǎoshī, tā shì xuésheng.", english: "I am a teacher, and he is a student.", vietnamese: "Tôi là giáo viên, anh ấy là sinh viên." }
    ]
  },
  {
    id: "v_xuesheng",
    hanzi: "学生",
    pinyin: "xuésheng",
    pinyin_number: "xue2sheng5",
    pinyin_plain: "xuesheng",
    vietnamese_pronunciation_hint: "xuế-sơng (gần đúng – âm x mặt lưỡi kết hợp tròn môi üe, âm sheng thanh nhẹ ngắn)",
    part_of_speech: "名词 · Danh từ (Noun)",
    hsk_level: 1,
    topic: "school",
    stroke_count: 13,
    meanings: {
      chinese: ["在学校读书的人；向老师学习的人。"],
      english: ["student, pupil"],
      vietnamese: ["học sinh, sinh viên, học trò"]
    },
    senses: [
      {
        pos: "Danh từ (名词)",
        zh: "在学校接受教育的人。",
        en: "Student or pupil (general term for elementary through university).",
        vi: "Học sinh hoặc sinh viên nói chung. Muốn nói rõ cấp bậc: 小学生 (học sinh tiểu học), 大学生 (sinh viên đại học).",
        context: "Chữ 生 khi ghép trong 学生 thường đọc thanh nhẹ (xuésheng)."
      }
    ],
    confused_with: "Chữ 学 Giản thể chỉ có 8 nét (phần trên là ⺍ ba chấm + 冖, phần dưới là 子), không viết phần đầu phức tạp của chữ Phồn thể.",
    examples: [
      { chinese: "她是我的学生。", pinyin: "Tā shì wǒ de xuésheng.", english: "She is my student.", vietnamese: "Cô ấy là học sinh của tôi." },
      { chinese: "我们都是大学生。", pinyin: "Wǒmen dōu shì dàxuéshēng.", english: "We are all university students.", vietnamese: "Chúng tôi đều là sinh viên đại học." }
    ]
  },
  {
    id: "v_laoshi",
    hanzi: "老师",
    pinyin: "lǎoshī",
    pinyin_number: "lao3shi1",
    pinyin_plain: "laoshi",
    vietnamese_pronunciation_hint: "lảo-sư (gần đúng – shī uốn lưỡi cao ngang thanh 1)",
    part_of_speech: "名词 · Danh từ (Noun)",
    hsk_level: 1,
    topic: "school",
    stroke_count: 12,
    meanings: {
      chinese: ["传授文化、技术的人，尊称教师。"],
      english: ["teacher, instructor"],
      vietnamese: ["giáo viên, thầy giáo, cô giáo"]
    },
    senses: [
      {
        pos: "Danh từ (名词)",
        zh: "在学校或培训机构教书育人的人。",
        en: "Teacher, mentor (gender-neutral).",
        vi: "Thầy giáo hoặc cô giáo (dùng chung cho cả nam và nữ). Có thể đặt Họ trước 老师: 王老师 (Thầy/Cô Vương).",
        context: "Không đặt 老师 trước tên riêng, mà đặt SAU họ (Họ + 老师)."
      }
    ],
    confused_with: "Chữ 师 Giản thể bên trái là 丨 + 丿 (2 nét), bên phải là 币.",
    examples: [
      { chinese: "王老师教我们中文。", pinyin: "Wáng lǎoshī jiāo wǒmen Zhōngwén.", english: "Teacher Wang teaches us Chinese.", vietnamese: "Thầy/Cô Vương dạy chúng tôi tiếng Trung." }
    ]
  },
  {
    id: "v_xihuan",
    hanzi: "喜欢",
    pinyin: "xǐhuan",
    pinyin_number: "xi3huan5",
    pinyin_plain: "xihuan",
    vietnamese_pronunciation_hint: "xỉ-hoan (gần đúng – xỉ thanh 3, hoan đọc nhẹ ngắn)",
    part_of_speech: "动词 · Động từ tâm lý (Verb)",
    hsk_level: 1,
    topic: "emotion",
    stroke_count: 18,
    meanings: {
      chinese: ["表示对人或事物有好感或产生兴趣。"],
      english: ["to like, to be fond of, to enjoy"],
      vietnamese: ["thích, yêu thích, có cảm tình với ai hoặc điều gì đó"]
    },
    senses: [
      {
        pos: "Động từ (动词)",
        zh: "对人或事物有好感、感兴趣。",
        en: "To like or enjoy someone, something, or doing an activity.",
        vi: "Thích ai đó, món đồ nào đó, hoặc thích làm việc gì (喜欢 + danh từ / động từ).",
        context: "Có thể kết hợp với phó từ mức độ: 很喜欢 (rất thích), 最喜欢 (thích nhất), 不喜欢 (không thích)."
      }
    ],
    confused_with: "Chữ 欢 Giản thể bên trái là 又 (2 nét), bên phải là 欠 (4 nét), tổng chỉ 6 nét — rất gọn dễ nhớ!",
    examples: [
      { chinese: "我喜欢学习中文。", pinyin: "Wǒ xǐhuan xuéxí Zhōngwén.", english: "I like learning Chinese.", vietnamese: "Tôi thích học tiếng Trung." },
      { chinese: "你喜欢喝茶还是喝咖啡？", pinyin: "Nǐ xǐhuan hē chá háishì hē kāfēi?", english: "Do you like drinking tea or coffee?", vietnamese: "Bạn thích uống trà hay uống cà phê?" }
    ]
  },
  {
    id: "v_xiexie",
    hanzi: "谢谢",
    pinyin: "xièxie",
    pinyin_number: "xie4xie5",
    pinyin_plain: "xiexie",
    vietnamese_pronunciation_hint: "xiê-xiê (gần đúng – âm đầu dứt khoát thanh 4, âm sau nhẹ ngắn)",
    part_of_speech: "动词 · Động từ giao tiếp (Verb / Expression)",
    hsk_level: 1,
    topic: "greeting",
    stroke_count: 24,
    meanings: {
      chinese: ["对别人的好意或帮助表示感谢。"],
      english: ["thank you, thanks"],
      vietnamese: ["cảm ơn"]
    },
    senses: [
      {
        pos: "Động từ (动词)",
        zh: "表达感激之情。",
        en: "To thank; thank you.",
        vi: "Cảm ơn. Đáp lại lời cảm ơn bằng 不客气 (Bú kèqi - Đừng khách sáo) hoặc 不用谢 (Bú yòng xiè).",
        context: "Chữ 谢 Giản thể dùng bộ Ngôn giản thể 讠 ở bên trái."
      }
    ],
    confused_with: "",
    examples: [
      { chinese: "谢谢你的帮助！", pinyin: "Xièxie nǐ de bāngzhù!", english: "Thank you for your help!", vietnamese: "Cảm ơn sự giúp đỡ của bạn!" }
    ]
  },
  {
    id: "v_zaijian",
    hanzi: "再见",
    pinyin: "zàijiàn",
    pinyin_number: "zai4jian4",
    pinyin_plain: "zaijian",
    vietnamese_pronunciation_hint: "chài-chiên (gần đúng – z đầu lưỡi chạm răng không bật hơi, cả hai âm thanh 4)",
    part_of_speech: "动词 · Động từ / Lời chào (Verb / Expression)",
    hsk_level: 1,
    topic: "greeting",
    stroke_count: 10,
    meanings: {
      chinese: ["分别时说的客套话，意思是希望以后再见面。"],
      english: ["goodbye, see you again"],
      vietnamese: ["tạm biệt, hẹn gặp lại"]
    },
    senses: [
      {
        pos: "Lời chào tạm biệt",
        zh: "道别用语（再：又一次；见：见面）。",
        en: "Goodbye (literally: 'again meet').",
        vi: "Tạm biệt (nghĩa gốc từng chữ: 再 = lại lần nữa, 见 = gặp).",
        context: "Chữ 见 Giản thể chỉ có 4 nét (冂 + 丿 + 乚)."
      }
    ],
    confused_with: "Không nói *再见你; muốn nói 'Hẹn gặp lại ngày mai' hãy nói 明天见 (Míngtiān jiàn).",
    examples: [
      { chinese: "老师再见，明天见！", pinyin: "Lǎoshī zàijiàn, míngtiān jiàn!", english: "Goodbye teacher, see you tomorrow!", vietnamese: "Tạm biệt thầy/cô, hẹn gặp lại ngày mai!" }
    ]
  },
  {
    id: "v_baba",
    hanzi: "爸爸",
    pinyin: "bàba",
    pinyin_number: "ba4ba5",
    pinyin_plain: "baba",
    vietnamese_pronunciation_hint: "pa-pa (gần đúng – âm b tiếng Trung là âm môi vô thanh giống chữ p tiếng Việt không bật hơi)",
    part_of_speech: "名词 · Danh từ (Noun)",
    hsk_level: 1,
    topic: "family",
    stroke_count: 16,
    meanings: {
      chinese: ["对父亲的口语称呼。"],
      english: ["dad, father"],
      vietnamese: ["bố, ba, cha"]
    },
    senses: [
      {
        pos: "Danh từ (名词)",
        zh: "父亲的亲切称呼。",
        en: "Dad, father (informal/spoken).",
        vi: "Bố, ba (cách gọi thân mật hàng ngày; văn viết trang trọng dùng 父亲 fùqīn).",
        context: "Âm thứ hai đọc thanh nhẹ (bàba)."
      }
    ],
    confused_with: "Lưu ý phát âm: 'b' trong Pinyin không rung dây thanh như 'b' tiếng Việt mà phát giống 'p' nhẹ không bật hơi.",
    examples: [
      { chinese: "我爸爸是医生。", pinyin: "Wǒ bàba shì yīshēng.", english: "My dad is a doctor.", vietnamese: "Bố tôi là bác sĩ." }
    ]
  },
  {
    id: "v_mama",
    hanzi: "妈妈",
    pinyin: "māma",
    pinyin_number: "ma1ma5",
    pinyin_plain: "mama",
    vietnamese_pronunciation_hint: "ma-ma (gần đúng – âm đầu cao ngang thanh 1, âm sau nhẹ ngắn)",
    part_of_speech: "名词 · Danh từ (Noun)",
    hsk_level: 1,
    topic: "family",
    stroke_count: 12,
    meanings: {
      chinese: ["对母亲的口语称呼。"],
      english: ["mom, mother"],
      vietnamese: ["mẹ, má"]
    },
    senses: [
      {
        pos: "Danh từ (名词)",
        zh: "母亲的亲切称呼。",
        en: "Mom, mother.",
        vi: "Mẹ, má. Cấu tạo chữ 妈 gồm bộ Nữ 女 (ý nghĩa phụ nữ) + chữ Mã 马 Giản thể (gợi âm đọc ma).",
        context: "Chữ hình thanh điển hình nhất để người mới hiểu quy tắc ghép Bộ ý + Bộ âm!"
      }
    ],
    confused_with: "Phân biệt kỹ thanh điệu: 妈 (mā - mẹ, thanh 1) vs 马 (mǎ - con ngựa, thanh 3) vs 骂 (mà - mắng, thanh 4) vs 吗 (ma - trợ từ hỏi, thanh nhẹ).",
    examples: [
      { chinese: "妈妈做的菜很好吃。", pinyin: "Māma zuò de cài hěn hǎochī.", english: "The dishes Mom cooks are delicious.", vietnamese: "Món ăn mẹ nấu rất ngon." }
    ]
  },
  {
    id: "v_jia",
    hanzi: "家",
    pinyin: "jiā",
    pinyin_number: "jia1",
    pinyin_plain: "jia",
    vietnamese_pronunciation_hint: "chia (gần đúng – mặt lưỡi chạm vòm miệng, cao ngang thanh 1)",
    part_of_speech: "名词 / 量词 · Danh từ / Lượng từ (Noun / Classifier)",
    hsk_level: 1,
    topic: "family",
    stroke_count: 10,
    meanings: {
      chinese: ["家庭；住所；用于计算企业、商店、医院、饭店等的量词。"],
      english: ["home, house", "family", "measure word for companies, shops, restaurants, hospitals"],
      vietnamese: [
        "nhà, ngôi nhà, tổ ấm (nơi ở)",
        "gia đình",
        "lượng từ cho công ty, cửa hàng, nhà hàng, bệnh viện (一家公司 - một công ty)"
      ]
    },
    senses: [
      {
        pos: "Danh từ (名词)",
        zh: "家庭或居住的地方。",
        en: "Family or home.",
        vi: "Gia đình hoặc nhà ở (我家: nhà tôi / gia đình tôi; 回家: về nhà).",
        context: "Rất phổ biến trong giao tiếp."
      },
      {
        pos: "Lượng từ (量词)",
        zh: "用于商店、公司、医院、饭馆等机构。",
        en: "Measure word for businesses and establishments.",
        vi: "Dùng đếm nhà hàng, công ty, bệnh viện: 一家饭馆 (một nhà hàng).",
        context: "Nghĩa mở rộng cực kỳ hay gặp từ HSK 2 trở lên."
      }
    ],
    confused_with: "",
    examples: [
      { chinese: "我家有四口人。", pinyin: "Wǒ jiā yǒu sì kǒu rén.", english: "There are four people in my family.", vietnamese: "Gia đình tôi có bốn người." },
      { chinese: "晚上七点我回家。", pinyin: "Wǎnshang qī diǎn wǒ huí jiā.", english: "I go home at 7 PM.", vietnamese: "7 giờ tối tôi về nhà." }
    ]
  },
  {
    id: "v_chi",
    hanzi: "吃",
    pinyin: "chī",
    pinyin_number: "chi1",
    pinyin_plain: "chi",
    vietnamese_pronunciation_hint: "trư + bật hơi (gần đúng – cong lưỡi ch và bật luồng hơi ra, cao ngang thanh 1)",
    part_of_speech: "动词 · Động từ (Verb)",
    hsk_level: 1,
    topic: "food",
    stroke_count: 6,
    meanings: {
      chinese: ["把食物放进嘴里嚼咽下去。"],
      english: ["to eat, to have (a meal/medicine)"],
      vietnamese: ["ăn", "uống (dùng riêng với thuốc: 吃药 - uống thuốc)"]
    },
    senses: [
      {
        pos: "Động từ (动词)",
        zh: "进食。",
        en: "To eat food or meals.",
        vi: "Ăn (吃饭 ăn cơm, 吃面条 ăn mì, 吃水果 ăn trái cây).",
        context: "Có bộ Khẩu 口 (cái miệng) bên trái."
      },
      {
        pos: "Cách dùng đặc biệt",
        zh: "服用（药物）。",
        en: "To take medicine (吃药).",
        vi: "Trong tiếng Trung, 'uống thuốc' nói là 吃药 (chī yào) chứ thường không nói 喝药 (trừ thuốc sắc dạng nước).",
        context: "Điểm khác biệt thú vị giữa tư duy từ vựng Trung – Việt!"
      }
    ],
    confused_with: "",
    examples: [
      { chinese: "你想吃什么？", pinyin: "Nǐ xiǎng chī shénme?", english: "What would you like to eat?", vietnamese: "Bạn muốn ăn gì?" }
    ]
  },
  {
    id: "v_he",
    hanzi: "喝",
    pinyin: "hē",
    pinyin_number: "he1",
    pinyin_plain: "he",
    vietnamese_pronunciation_hint: "hưa (gần đúng – âm e sau g/k/h đọc gần 'ưa', thanh 1)",
    part_of_speech: "动词 · Động từ (Verb)",
    hsk_level: 1,
    topic: "food",
    stroke_count: 12,
    meanings: {
      chinese: ["把液体咽下去。"],
      english: ["to drink"],
      vietnamese: ["uống (nước, trà, cà phê, canh/súp)"]
    },
    senses: [
      {
        pos: "Động từ (动词)",
        zh: "饮用液体或汤类。",
        en: "To drink liquids or soup.",
        vi: "Uống chất lỏng (喝水 uống nước, 喝茶 uống trà) và dùng cho cả canh/súp: 喝汤 (hē tāng - ăn/húp canh).",
        context: "Chú ý: Tiếng Việt nói 'ăn canh', tiếng Trung nói '喝汤' (hē tāng)."
      }
    ],
    confused_with: "Đừng nhầm mặt chữ 喝 (hē - uống, có bộ Khẩu 口) với 渴 (kě - khát nước, có bộ Thủy 氵 3 chấm nước!).",
    examples: [
      { chinese: "请喝一杯热茶。", pinyin: "Qǐng hē yì bēi rè chá.", english: "Please have a cup of hot tea.", vietnamese: "Mời uống một tách trà nóng." }
    ]
  },
  {
    id: "v_mifan",
    hanzi: "米饭",
    pinyin: "mǐfàn",
    pinyin_number: "mi3fan4",
    pinyin_plain: "mifan",
    vietnamese_pronunciation_hint: "mỉ-phan (gần đúng – mỉ thanh 3, phan âm môi răng f thanh 4)",
    part_of_speech: "名词 · Danh từ (Noun)",
    hsk_level: 1,
    topic: "food",
    stroke_count: 13,
    meanings: {
      chinese: ["用大米煮成的饭。"],
      english: ["cooked rice"],
      vietnamese: ["cơm (gạo đã nấu chín)"]
    },
    senses: [
      {
        pos: "Danh từ (名词)",
        zh: "煮熟的大米。",
        en: "Cooked white rice.",
        vi: "Cơm trắng đã nấu chín (còn hạt gạo sống gọi là 大米 dàmǐ). Chữ 饭 Giản thể dùng bộ Thực giản thể 饣.",
        context: "Khi nói 'ăn bữa cơm / dùng bữa' nói chung thì dùng 吃饭 (chīfàn)."
      }
    ],
    confused_with: "",
    examples: [
      { chinese: "我要一碗米饭。", pinyin: "Wǒ yào yì wǎn mǐfàn.", english: "I would like a bowl of rice.", vietnamese: "Cho tôi một bát cơm." }
    ]
  },
  {
    id: "v_yue",
    hanzi: "月",
    pinyin: "yuè",
    pinyin_number: "yue4",
    pinyin_plain: "yue",
    vietnamese_pronunciation_hint: "duê (gần đúng – tròn môi ü rồi lướt sang ê, dứt khoát thanh 4)",
    part_of_speech: "名词 · Danh từ (Noun)",
    hsk_level: 1,
    topic: "time",
    stroke_count: 4,
    meanings: {
      chinese: ["月球（月亮）；计时的单位，一年分为十二个月。"],
      english: ["month", "moon"],
      vietnamese: ["tháng (đơn vị thời gian)", "mặt trăng (trong từ 月亮 yuèliang)"]
    },
    senses: [
      {
        pos: "Danh từ chỉ thời gian",
        zh: "一年十二个月之一。",
        en: "Month of the year.",
        vi: "Tên tháng cực dễ: Số 1–12 + 月 (一月 tháng 1, 十月 tháng 10); còn 'một tháng' (khoảng thời gian) phải có lượng từ 个: 一个月 (yí gè yuè).",
        context: "Phân biệt rõ: 一月 (Tháng Một) ≠ 一个月 (một tháng trời)!"
      }
    ],
    confused_with: "Không quên lượng từ 个 khi nói số lượng tháng: 三个月 (3 tháng), không nói 三月 (đó là Tháng Ba).",
    examples: [
      { chinese: "今天是十一月八号。", pinyin: "Jīntiān shì shíyī yuè bā hào.", english: "Today is November 8th.", vietnamese: "Hôm nay là ngày 8 tháng 11." },
      { chinese: "我学习中文一个月了。", pinyin: "Wǒ xuéxí Zhōngwén yí gè yuè le.", english: "I have studied Chinese for one month.", vietnamese: "Tôi đã học tiếng Trung được một tháng rồi." }
    ]
  },
  {
    id: "v_jintian",
    hanzi: "今天",
    pinyin: "jīntiān",
    pinyin_number: "jin1tian1",
    pinyin_plain: "jintian",
    vietnamese_pronunciation_hint: "chin-thiên (gần đúng – t bật hơi rõ, cả 2 âm cao ngang thanh 1)",
    part_of_speech: "名词 · Danh từ thời gian (Time Noun)",
    hsk_level: 1,
    topic: "time",
    stroke_count: 8,
    meanings: {
      chinese: ["说话时的这一天；现在。"],
      english: ["today", "nowadays, the present"],
      vietnamese: ["hôm nay", "ngày nay"]
    },
    senses: [
      {
        pos: "Danh từ thời gian",
        zh: "说话当日。",
        en: "Today.",
        vi: "Hôm nay. Trong câu tiếng Trung, 今天 luôn đứng đầu câu hoặc ngay sau chủ ngữ (trước động từ), không đặt cuối câu như tiếng Việt.",
        context: "Bộ 3 từ thời gian cơ bản: 昨天 (hôm qua) – 今天 (hôm nay) – 明天 (ngày mai)."
      }
    ],
    confused_with: "Sai: *我去学校今天 → Đúng: 我今天去学校 hoặc 今天我去学校.",
    examples: [
      { chinese: "今天天气很好。", pinyin: "Jīntiān tiānqì hěn hǎo.", english: "The weather is great today.", vietnamese: "Hôm nay thời tiết rất đẹp." }
    ]
  },
  {
    id: "v_mai",
    hanzi: "买",
    pinyin: "mǎi",
    pinyin_number: "mai3",
    pinyin_plain: "mai",
    vietnamese_pronunciation_hint: "mải (gần đúng – thanh 3 trầm xuống rồi nâng nhẹ)",
    part_of_speech: "动词 · Động từ (Verb)",
    hsk_level: 1,
    topic: "shopping",
    stroke_count: 6,
    meanings: {
      chinese: ["拿钱换东西。"],
      english: ["to buy, to purchase"],
      vietnamese: ["mua, sắm"]
    },
    senses: [
      {
        pos: "Động từ (动词)",
        zh: "用钱购入物品。",
        en: "To buy.",
        vi: "Mua hàng hóa (买东西 mua đồ, 买水果 mua hoa quả, 买票 mua vé).",
        context: "Chữ Giản thể 买 chỉ có 6 nét (乛 + 头)."
      }
    ],
    confused_with: "CẶP TỪ CỰC DỄ NHẦM: 买 (mǎi - thanh 3, không có chữ 十 trên đầu = MUA) vs 卖 (mài - thanh 4, có thêm chữ 十 trên đầu = BÁN)!",
    examples: [
      { chinese: "妈妈去商店买水果。", pinyin: "Māma qù shāngdiàn mǎi shuǐguǒ.", english: "Mom goes to the store to buy fruit.", vietnamese: "Mẹ đi cửa hàng mua trái cây." }
    ]
  },
  {
    id: "v_zhongwen",
    hanzi: "中文",
    pinyin: "Zhōngwén",
    pinyin_number: "zhong1wen2",
    pinyin_plain: "zhongwen",
    vietnamese_pronunciation_hint: "trung-uấn (gần đúng – zh cong lưỡi không bật hơi thanh 1, wén thanh 2)",
    part_of_speech: "名词 · Danh từ (Noun)",
    hsk_level: 1,
    topic: "school",
    stroke_count: 8,
    meanings: {
      chinese: ["中国的语言和文字（特指汉语和汉字）。"],
      english: ["Chinese language (both spoken and written)"],
      vietnamese: ["tiếng Trung, Hoa ngữ (gồm cả ngôn ngữ nói và chữ viết)"]
    },
    senses: [
      {
        pos: "Danh từ (名词)",
        zh: "中国语言文字。",
        en: "The Chinese language.",
        vi: "Tiếng Trung nói chung (cả nghe nói lẫn đọc viết).",
        context: "Phân biệt nhẹ: 汉语 (Hànyǔ) nhấn mạnh ngôn ngữ nói của dân tộc Hán; 中文 (Zhōngwén) bao hàm cả chữ viết và khẩu ngữ tự nhiên."
      }
    ],
    confused_with: "",
    examples: [
      { chinese: "我会说一点儿中文。", pinyin: "Wǒ huì shuō yìdiǎnr Zhōngwén.", english: "I can speak a little Chinese.", vietnamese: "Tôi biết nói một chút tiếng Trung." }
    ]
  },
  {
    id: "v_kan",
    hanzi: "看",
    pinyin: "kàn",
    pinyin_number: "kan4",
    pinyin_plain: "kan",
    vietnamese_pronunciation_hint: "khàn (gần đúng – âm k bật hơi như kh, hạ mạnh thanh 4)",
    part_of_speech: "动词 · Động từ (Verb)",
    hsk_level: 1,
    topic: "daily",
    stroke_count: 9,
    polyphonic: [
      { pinyin: "kàn", meaningVi: "nhìn, xem, đọc, thăm, khám bệnh (phổ biến)", example: "看书 (kàn shū) – đọc sách" },
      { pinyin: "kān", meaningVi: "trông coi, giữ gìn (thanh 1)", example: "看门 (kān mén) – trông cửa" }
    ],
    meanings: {
      chinese: ["视线接触人或物；阅读；探望；诊治；认为。"],
      english: ["to look, to watch", "to read (silently)", "to visit (someone) / see (a doctor)", "to think / consider"],
      vietnamese: [
        "nhìn, xem (看电影 xem phim)",
        "đọc thầm bằng mắt (看书 đọc sách)",
        "thăm hỏi / đi khám (看朋友 thăm bạn, 看医生 khám bác sĩ)",
        "xem xét, cho rằng (我看... theo tôi thấy...)"
      ]
    },
    senses: [
      {
        pos: "Động từ đa nghĩa (多义动词)",
        zh: "观看；阅读。",
        en: "To watch or read.",
        vi: "Xem tivi/phim (看电视) hoặc đọc sách báo bằng mắt (看书 — khác 读书 là đọc thành tiếng hoặc đi học).",
        context: "Cấu tạo chữ cực kỳ sinh động: Bên trên là 手 (bàn tay biến thể 龵) che lên trên 目 (đôi mắt) để nhìn ra xa!"
      },
      {
        pos: "Động từ giao tiếp",
        zh: "探望；找医生治病。",
        en: "To visit someone or see a doctor.",
        vi: "Thăm ai đó (去看爷爷 đi thăm ông) hoặc đi khám bệnh (看病 / 看医生).",
        context: "Không dịch máy móc là 'nhìn bác sĩ' mà là 'đi khám bác sĩ'!"
      }
    ],
    confused_with: "看 nhấn mạnh hành động chủ động nhìn; 看见 (kànjiàn) nhấn mạnh kết quả 'nhìn thấy'.",
    examples: [
      { chinese: "我晚上喜欢在家看书。", pinyin: "Wǒ wǎnshang xǐhuan zài jiā kàn shū.", english: "I like reading books at home in the evening.", vietnamese: "Buổi tối tôi thích đọc sách ở nhà." },
      { chinese: "周末我去医院看朋友。", pinyin: "Zhōumò wǒ qù yīyuàn kàn péngyou.", english: "On the weekend I go to the hospital to visit my friend.", vietnamese: "Cuối tuần tôi đến bệnh viện thăm bạn." }
    ]
  },

  // ================= HSK 2 =================
  {
    id: "v_shijian",
    hanzi: "时间",
    pinyin: "shíjiān",
    pinyin_number: "shi2jian1",
    pinyin_plain: "shijian",
    vietnamese_pronunciation_hint: "sứ-chiên (gần đúng – shí cong lưỡi thanh 2, jiān thanh 1)",
    part_of_speech: "名词 · Danh từ (Noun)",
    hsk_level: 2,
    topic: "time",
    stroke_count: 14,
    meanings: {
      chinese: ["物质存在的一种客观形式，有起点和终点的一段工夫。"],
      english: ["time, period of time"],
      vietnamese: ["thời gian, thì giờ"]
    },
    senses: [
      {
        pos: "Danh từ (名词)",
        zh: "泛指时间或空闲工夫。",
        en: "Time in general or available free time.",
        vi: "Thời gian nói chung hoặc thời gian rảnh (有时间 có thời gian, 没时间 không có thời gian).",
        context: "Chữ 时 (bộ Nhật 日 + 寸) và 间 (bộ Môn 门 + 日) đều dùng dạng Giản thể rất gọn."
      }
    ],
    confused_with: "Phân biệt 时间 (khoảng thời gian/thì giờ nói chung) và 时候 (shíhou - lúc, khi: 吃饭的时候 lúc ăn cơm).",
    examples: [
      { chinese: "你明天下午有时间吗？", pinyin: "Nǐ míngtiān xiàwǔ yǒu shíjiān ma?", english: "Do you have time tomorrow afternoon?", vietnamese: "Chiều mai bạn có thời gian rảnh không?" }
    ]
  },
  {
    id: "v_gongzuo",
    hanzi: "工作",
    pinyin: "gōngzuò",
    pinyin_number: "gong1zuo4",
    pinyin_plain: "gongzuo",
    vietnamese_pronunciation_hint: "cung-chuô (gần đúng – g đọc như c không bật hơi, zuò đầu lưỡi thanh 4)",
    part_of_speech: "动词 / 名词 · Động từ / Danh từ (Verb / Noun)",
    hsk_level: 2,
    topic: "work",
    stroke_count: 10,
    meanings: {
      chinese: ["从事体力或脑力劳动；职业、业务任务。"],
      english: ["to work (verb)", "job, work, profession (noun)"],
      vietnamese: ["làm việc (động từ)", "công việc, nghề nghiệp (danh từ)"]
    },
    senses: [
      {
        pos: "Động từ (动词)",
        zh: "从事劳动。",
        en: "To work.",
        vi: "Làm việc (在公司工作 làm việc ở công ty). Lưu ý 工作 là động từ nội động, không mang tân ngữ trực tiếp phía sau.",
        context: ""
      },
      {
        pos: "Danh từ (名词)",
        zh: "职业或岗位。",
        en: "Job, employment.",
        vi: "Công việc (找工作 tìm việc, 一份好工作 một công việc tốt — dùng lượng từ 份 fèn).",
        context: ""
      }
    ],
    confused_with: "",
    examples: [
      { chinese: "我姐姐在银行工作。", pinyin: "Wǒ jiějie zài yínháng gōngzuò.", english: "My older sister works at a bank.", vietnamese: "Chị gái tôi làm việc ở ngân hàng." },
      { chinese: "我很喜欢现在的工作。", pinyin: "Wǒ hěn xǐhuan xiànzài de gōngzuò.", english: "I really like my current job.", vietnamese: "Tôi rất thích công việc hiện tại." }
    ]
  },
  {
    id: "v_lvyou",
    hanzi: "旅游",
    pinyin: "lǚyóu",
    pinyin_number: "lv3you2",
    pinyin_plain: "lvyou",
    vietnamese_pronunciation_hint: "lủy-dấu (gần đúng – âm ü tròn môi huýt sáo cho lǚ thanh 3, yóu thanh 2)",
    part_of_speech: "动词 · Động từ (Verb)",
    hsk_level: 2,
    topic: "travel",
    stroke_count: 22,
    meanings: {
      chinese: ["外出游览、观光。"],
      english: ["to travel, to go sightseeing, tourism"],
      vietnamese: ["đi du lịch, tham quan"]
    },
    senses: [
      {
        pos: "Động từ (动词)",
        zh: "去外地游玩观光。",
        en: "To travel for leisure/sightseeing.",
        vi: "Đi du lịch nghỉ ngơi, ngắm cảnh (khác 旅行 lǚxíng nhấn mạnh hành trình đi xa).",
        context: "Khi gõ Pinyin trên bàn phím cho âm lǚ, ta gõ 'lv' (chữ v đại diện cho ü) → hệ thống gợi ý 旅游 ngay!"
      }
    ],
    confused_with: "",
    examples: [
      { chinese: "今年夏天我想去中国旅游。", pinyin: "Jīnnián xiàtiān wǒ xiǎng qù Zhōngguó lǚyóu.", english: "This summer I want to travel to China.", vietnamese: "Mùa hè năm nay tôi muốn đi du lịch Trung Quốc." }
    ]
  },
  {
    id: "v_juede",
    hanzi: "觉得",
    pinyin: "juéde",
    pinyin_number: "jue2de5",
    pinyin_plain: "juede",
    vietnamese_pronunciation_hint: "chuế-tơ (gần đúng – jué tròn môi thanh 2, de thanh nhẹ)",
    part_of_speech: "动词 · Động từ (Verb)",
    hsk_level: 2,
    topic: "emotion",
    stroke_count: 20,
    polyphonic: [
      { pinyin: "jué", meaningVi: "cảm thấy, giác (trong 觉得 juéde, 感觉 gǎnjué)", example: "我觉得很好 (Wǒ juéde hěn hǎo)" },
      { pinyin: "jiào", meaningVi: "giấc ngủ (trong 睡觉 shuìjiào - đi ngủ)", example: "晚上十一点睡觉 (đi ngủ lúc 11h tối)" }
    ],
    meanings: {
      chinese: ["产生某种感觉；认为（语气较委婉）。"],
      english: ["to feel (physically or emotionally)", "to think, to find (in one's opinion)"],
      vietnamese: [
        "cảm thấy (cảm giác cơ thể/tâm trạng: 觉得有点儿累 thấy hơi mệt)",
        "thấy rằng, cho rằng (nêu ý kiến cá nhân nhẹ nhàng: 我觉得汉字很有意思)"
      ]
    },
    senses: [
      {
        pos: "Động từ chỉ cảm giác",
        zh: "身体或心理有某种感受。",
        en: "To feel tired, cold, hungry, etc.",
        vi: "Cảm thấy mệt, lạnh, vui...",
        context: ""
      },
      {
        pos: "Động từ nêu quan điểm",
        zh: "表达个人看法。",
        en: "To think / reckon.",
        vi: "Cho rằng, thấy rằng (lịch sự, mềm mại hơn 认为).",
        context: "Chữ 觉 là chữ ĐA ÂM (多音字): đọc jué trong 觉得 (cảm thấy), nhưng đọc jiào trong 睡觉 (shuìjiào - ngủ)!"
      }
    ],
    confused_with: "",
    examples: [
      { chinese: "我觉得越南咖啡非常好喝。", pinyin: "Wǒ juéde Yuènán kāfēi fēicháng hǎohē.", english: "I think Vietnamese coffee tastes wonderful.", vietnamese: "Tôi thấy cà phê Việt Nam cực kỳ ngon." }
    ]
  },
  {
    id: "v_pianyi",
    hanzi: "便宜",
    pinyin: "piányi",
    pinyin_number: "pian2yi5",
    pinyin_plain: "pianyi",
    vietnamese_pronunciation_hint: "phiến-di (gần đúng – p bật hơi mạnh thanh 2, yi thanh nhẹ)",
    part_of_speech: "形容词 · Tính từ (Adjective)",
    hsk_level: 2,
    topic: "shopping",
    stroke_count: 17,
    polyphonic: [
      { pinyin: "piányi", meaningVi: "rẻ (giá cả phải chăng)", example: "这件衣服很便宜。" },
      { pinyin: "biàn", meaningVi: "thuận tiện (khi chữ 便 đi trong 方便 fāngbiàn)", example: "坐地铁很方便。" }
    ],
    meanings: {
      chinese: ["价钱低。"],
      english: ["cheap, inexpensive"],
      vietnamese: ["rẻ, giá mềm"]
    },
    senses: [
      {
        pos: "Tính từ (形容词)",
        zh: "价格低廉。",
        en: "Inexpensive, affordable.",
        vi: "Giá rẻ (trái nghĩa với 贵 guì - đắt).",
        context: "Cực kỳ chú ý chữ đa âm 便: đọc là pián trong 便宜 (rẻ), nhưng đọc là biàn trong 方便 (fāngbiàn - thuận tiện)!"
      }
    ],
    confused_with: "Lỗi người mới cực hay mắc: đọc nhầm 便宜 thành *biànyí — nhớ đọc đúng là piányi nhé!",
    examples: [
      { chinese: "这家商店的水果又新鲜又便宜。", pinyin: "Zhè jiā shāngdiàn de shuǐguǒ yòu xīnxiān yòu piányi.", english: "The fruit at this shop is both fresh and cheap.", vietnamese: "Hoa quả ở cửa hàng này vừa tươi vừa rẻ." }
    ]
  },

  // ================= HSK 3 =================
  {
    id: "v_huanjing",
    hanzi: "环境",
    pinyin: "huánjìng",
    pinyin_number: "huan2jing4",
    pinyin_plain: "huanjing",
    vietnamese_pronunciation_hint: "hoán-ching (gần đúng – huán thanh 2, jìng thanh 4)",
    part_of_speech: "名词 · Danh từ (Noun)",
    hsk_level: 3,
    topic: "daily",
    stroke_count: 22,
    meanings: {
      chinese: ["周围的地方和条件；自然环境或社会条件。"],
      english: ["environment, surroundings, ambiance"],
      vietnamese: ["môi trường (tự nhiên, học tập, làm việc)", "không gian xung quanh"]
    },
    senses: [
      {
        pos: "Danh từ (名词)",
        zh: "周围的自然或生活工作条件。",
        en: "Natural environment or living/working surroundings.",
        vi: "Môi trường tự nhiên (保护环境 bảo vệ môi trường) hoặc không gian quán xá, nơi ở (这里环境很安静 không gian ở đây rất yên tĩnh).",
        context: ""
      }
    ],
    confused_with: "",
    examples: [
      { chinese: "我们学校的语言学习环境很好。", pinyin: "Wǒmen xuéxiào de yǔyán xuéxí huánjìng hěn hǎo.", english: "Our school's language learning environment is very good.", vietnamese: "Môi trường học ngoại ngữ ở trường chúng tôi rất tốt." }
    ]
  },
  {
    id: "v_xiguan",
    hanzi: "习惯",
    pinyin: "xíguàn",
    pinyin_number: "xi2guan4",
    pinyin_plain: "xiguan",
    vietnamese_pronunciation_hint: "xí-quan (gần đúng – xí thanh 2, guàn thanh 4)",
    part_of_speech: "动词 / 名词 · Động từ / Danh từ (Verb / Noun)",
    hsk_level: 3,
    topic: "daily",
    stroke_count: 14,
    meanings: {
      chinese: ["适应新的情况；长期养成的不易改变的行为。"],
      english: ["to be used to, to get accustomed to (verb)", "habit, custom (noun)"],
      vietnamese: ["quen với, thích nghi với (động từ)", "thói quen, tập quán (danh từ)"]
    },
    senses: [
      {
        pos: "Danh từ (名词)",
        zh: "长期形成的行为方式。",
        en: "Habit.",
        vi: "Thói quen (好习惯 thói quen tốt).",
        context: ""
      },
      {
        pos: "Động từ (动词)",
        zh: "对某种环境或做法感到适应。",
        en: "To get used to.",
        vi: "Quen với điều gì (我已经习惯早起了 - Tôi đã quen dậy sớm rồi).",
        context: "Chữ 习 Giản thể chỉ có 3 nét!"
      }
    ],
    confused_with: "",
    examples: [
      { chinese: "每天复习生词是一个好习惯。", pinyin: "Měitiān fùxí shēngcí shì yí gè hǎo xíguàn.", english: "Reviewing new words every day is a good habit.", vietnamese: "Mỗi ngày ôn tập từ mới là một thói quen tốt." }
    ]
  },
  {
    id: "v_guanxi",
    hanzi: "关系",
    pinyin: "guānxi",
    pinyin_number: "guan1xi5",
    pinyin_plain: "guanxi",
    vietnamese_pronunciation_hint: "quan-xi (gần đúng – guān cao ngang thanh 1, xi thanh nhẹ)",
    part_of_speech: "名词 · Danh từ (Noun)",
    hsk_level: 3,
    topic: "greeting",
    stroke_count: 13,
    meanings: {
      chinese: ["事物之间相互作用、相互影响的状态；人和人之间的联系。"],
      english: ["relationship, connection", "relevance, bearing (as in 没关系 'it doesn't matter')"],
      vietnamese: ["mối quan hệ (giữa người với người hoặc sự việc)", "sự liên quan (没关系 - không sao đâu)"]
    },
    senses: [
      {
        pos: "Danh từ (名词)",
        zh: "人与人或事物之间的联系。",
        en: "Relationship or connection.",
        vi: "Quan hệ bạn bè, đồng nghiệp, nhân quả (他们的关系很好).",
        context: "Khi người khác nói 对不起 (Xin lỗi), câu đáp tự nhiên nhất là 没关系 (Méi guānxi - Không sao đâu)."
      }
    ],
    confused_with: "",
    examples: [
      { chinese: "健康和饮食习惯有很大的关系。", pinyin: "Jiànkāng hé yǐnshí xíguàn yǒu hěn dà de guānxi.", english: "Health has a strong connection with eating habits.", vietnamese: "Sức khỏe có mối liên hệ rất lớn với thói quen ăn uống." }
    ]
  },

  // ================= HSK 4 =================
  {
    id: "v_jianchi",
    hanzi: "坚持",
    pinyin: "jiānchí",
    pinyin_number: "jian1chi2",
    pinyin_plain: "jianchi",
    vietnamese_pronunciation_hint: "chiên-trứ (gần đúng – chí cong lưỡi bật hơi thanh 2)",
    part_of_speech: "动词 · Động từ (Verb)",
    hsk_level: 4,
    topic: "school",
    stroke_count: 16,
    meanings: {
      chinese: ["坚决保持、维护或进行下去，不松懈。"],
      english: ["to persist in, to persevere, to insist on"],
      vietnamese: ["kiên trì, bền bỉ theo đuổi", "khăng khăng giữ vững (quan điểm)"]
    },
    senses: [
      {
        pos: "Động từ (动词)",
        zh: "不放弃地继续做某事。",
        en: "To persevere in doing something consistently.",
        vi: "Kiên trì thực hiện đến cùng (坚持学习中文 kiên trì học tiếng Trung, 坚持锻炼 kiên trì tập luyện).",
        context: "Từ vựng truyền động lực cực hay dùng trong bài viết và giao tiếp HSK 4."
      }
    ],
    confused_with: "",
    examples: [
      { chinese: "只要每天坚持练习，你的中文一定会越来越好。", pinyin: "Zhǐyào měitiān jiānchí liànxí, nǐ de Zhōngwén yídìng huì yuèláiyuè hǎo.", english: "As long as you keep practicing every day, your Chinese will surely get better and better.", vietnamese: "Chỉ cần mỗi ngày kiên trì luyện tập, tiếng Trung của bạn nhất định sẽ ngày càng giỏi hơn." }
    ]
  },
  {
    id: "v_jiaoliu",
    hanzi: "交流",
    pinyin: "jiāoliú",
    pinyin_number: "jiao1liu2",
    pinyin_plain: "jiaoliu",
    vietnamese_pronunciation_hint: "chiao-liếu (gần đúng – jiāo thanh 1, liú thanh 2)",
    part_of_speech: "动词 / 名词 · Động từ / Danh từ (Verb / Noun)",
    hsk_level: 4,
    topic: "work",
    stroke_count: 16,
    meanings: {
      chinese: ["彼此把自己的东西给对方；交换思想、经验、文化等。"],
      english: ["to communicate, to exchange (ideas/culture)", "communication, exchange"],
      vietnamese: ["giao lưu, trao đổi (ý kiến, văn hóa)", "giao tiếp"]
    },
    senses: [
      {
        pos: "Động từ (动词)",
        zh: "互相沟通思想、经验或语言。",
        en: "To communicate or exchange ideas.",
        vi: "Giao tiếp, trao đổi kinh nghiệm (用中文交流 giao tiếp bằng tiếng Trung; 文化交流 giao lưu văn hóa).",
        context: "Cấu trúc thường gặp: 跟/和 + Ai đó + 交流."
      }
    ],
    confused_with: "",
    examples: [
      { chinese: "我希望能用中文流利地跟中国人交流。", pinyin: "Wǒ xīwàng néng yòng Zhōngwén liúlì de gēn Zhōngguórén jiāoliú.", english: "I hope to communicate fluently with Chinese people in Chinese.", vietnamese: "Tôi hy vọng có thể dùng tiếng Trung giao tiếp trôi chảy với người Trung Quốc." }
    ]
  },

  // ================= HSK 5 =================
  {
    id: "v_xiaolv",
    hanzi: "效率",
    pinyin: "xiàolǜ",
    pinyin_number: "xiao4lv4",
    pinyin_plain: "xiaolv",
    vietnamese_pronunciation_hint: "xiao-luy (gần đúng – lǜ âm tròn môi ü thanh 4)",
    part_of_speech: "名词 · Danh từ (Noun)",
    hsk_level: 5,
    topic: "work",
    stroke_count: 21,
    meanings: {
      chinese: ["单位时间内完成的工作量。"],
      english: ["efficiency, productivity"],
      vietnamese: ["hiệu suất (học tập, công việc)"]
    },
    senses: [
      {
        pos: "Danh từ (名词)",
        zh: "工作或学习的成效与速度比率。",
        en: "Work or study efficiency.",
        vi: "Hiệu suất. Cụm cố định hay dùng: 提高效率 (tí gāo xiàolǜ - nâng cao hiệu suất).",
        context: "Phân biệt với 效果 (xiàoguǒ - hiệu quả/kết quả đạt được)."
      }
    ],
    confused_with: "效率 (hiệu suất — nhanh/nhiều trên một đơn vị thời gian) ≠ 效果 (hiệu quả — tác dụng/kết quả tốt hay xấu).",
    examples: [
      { chinese: "制定合理的计划可以大大提高学习效率。", pinyin: "Zhìdìng hélǐ de jìhuà kěyǐ dàdà tígāo xuéxí xiàolǜ.", english: "Making a reasonable plan can greatly improve study efficiency.", vietnamese: "Xây dựng kế hoạch hợp lý có thể nâng cao đáng kể hiệu suất học tập." }
    ]
  },
  {
    id: "v_bawo",
    hanzi: "把握",
    pinyin: "bǎwò",
    pinyin_number: "ba3wo4",
    pinyin_plain: "bawo",
    vietnamese_pronunciation_hint: "pả-uô (gần đúng – bǎ thanh 3, wò thanh 4)",
    part_of_speech: "动词 / 名词 · Động từ / Danh từ (Verb / Noun)",
    hsk_level: 5,
    topic: "work",
    stroke_count: 19,
    meanings: {
      chinese: ["抓住（机会、方向）；成功的可靠性或信心。"],
      english: ["to seize, to grasp (an opportunity) [verb]", "certainty, assurance, confidence [noun]"],
      vietnamese: [
        "nắm bắt (cơ hội, phương hướng) [động từ]",
        "sự chắc chắn, phần nắm chắc thành công (有把握 - nắm chắc) [danh từ]"
      ]
    },
    senses: [
      {
        pos: "Động từ (动词)",
        zh: "抓住抽象事物（机会、原则、时间）。",
        en: "To seize or grasp (e.g., 把握机会 seize an opportunity).",
        vi: "Nắm bắt cơ hội, thời cơ.",
        context: ""
      },
      {
        pos: "Danh từ (名词)",
        zh: "对成功的信心。",
        en: "Confidence of success.",
        vi: "Sự tự tin nắm chắc kết quả: 通过考试我有把握 (Tôi nắm chắc phần đậu kỳ thi).",
        context: ""
      }
    ],
    confused_with: "",
    examples: [
      { chinese: "我们要学会把握每一次锻炼口语的机会。", pinyin: "Wǒmen yào xuéhuì bǎwò měi yí cì duànliàn kǒuyǔ de jīhuì.", english: "We should learn to seize every opportunity to practice spoken Chinese.", vietnamese: "Chúng ta cần học cách nắm bắt mỗi cơ hội rèn luyện khẩu ngữ." }
    ]
  },

  // ================= HSK 6 =================
  {
    id: "v_qianyimohua",
    hanzi: "潜移默化",
    pinyin: "qiányímòhuà",
    pinyin_number: "qian2yi2mo4hua4",
    pinyin_plain: "qianyimohua",
    vietnamese_pronunciation_hint: "chiến-dí-mô-hoa (gần đúng – thành ngữ 4 chữ HSK 6)",
    part_of_speech: "成语 · Thành ngữ (Four-character Idiom)",
    hsk_level: 6,
    topic: "school",
    stroke_count: 46,
    meanings: {
      chinese: ["指人的思想或性格不知不觉受到感染、影响而发生了变化。"],
      english: ["to influence unobtrusively and imperceptibly over time"],
      vietnamese: ["mưa dầm thấm lâu, tác động âm thầm và tự nhiên làm thay đổi nhận thức/thói quen"]
    },
    senses: [
      {
        pos: "Thành ngữ (成语)",
        zh: "不知不觉中受到积极影响而改变。",
        en: "Subtle, gradual influence on character or language sense.",
        vi: "Ảnh hưởng thấm dần một cách tự nhiên không nhận ra (thường dùng cho môi trường văn hóa, giáo dục, rèn luyện ngôn ngữ).",
        context: "Thường làm vị ngữ hoặc định ngữ (+ 的影响)."
      }
    ],
    confused_with: "",
    examples: [
      { chinese: "每天听标准的中文广播，会对你的语感产生潜移默化的影响。", pinyin: "Měitiān tīng biāozhǔn de Zhōngwén guǎngbō, huì duì nǐ de yǔgǎn chǎnshēng qiányímòhuà de yǐngxiǎng.", english: "Listening to standard Chinese broadcasts daily will subtly shape your language intuition over time.", vietnamese: "Nghe phát thanh tiếng Trung chuẩn mỗi ngày sẽ tạo ra ảnh hưởng mưa dầm thấm lâu đối với cảm quan ngôn ngữ của bạn." }
    ]
  },
  {
    id: "v_juyifansan",
    hanzi: "举一反三",
    pinyin: "jǔyīfǎnsān",
    pinyin_number: "ju3yi1fan3san1",
    pinyin_plain: "juyifansan",
    pinyin_alt: "juyifansan",
    vietnamese_pronunciation_hint: "chủy-y-phản-san (gần đúng – học một hiểu ba / suy rộng ra)",
    part_of_speech: "成语 · Thành ngữ (Four-character Idiom)",
    hsk_level: 6,
    topic: "school",
    stroke_count: 17,
    meanings: {
      chinese: ["从一件事情类推而知道其他许多事情。"],
      english: ["to draw inferences about other cases from one instance; learn by analogy"],
      vietnamese: ["học một biết mười (nghĩa gốc: nêu một góc suy ra ba góc còn lại)"]
    },
    senses: [
      {
        pos: "Thành ngữ (成语)",
        zh: "善于类推，触类旁通。",
        en: "To extrapolate and master many cases from understanding one core rule.",
        vi: "Hiểu bản chất một ví dụ để tự suy luận, vận dụng sang nhiều trường hợp tương tự.",
        context: "Xuất phát từ Luận Ngữ, cực kỳ phổ biến khi nói về phương pháp học tập thông minh."
      }
    ],
    confused_with: "",
    examples: [
      { chinese: "学习语法不能死记硬背，要学会举一反三。", pinyin: "Xuéxí yǔfǎ bù néng sǐjìyìngbèi, yào xuéhuì jǔyīfǎnsān.", english: "When learning grammar, don't memorize mechanically; learn to apply principles by analogy.", vietnamese: "Học ngữ pháp không thể học vẹt máy móc, mà phải biết học một hiểu mười." }
    ]
  }
];

/* Extra high-frequency Simplified Chinese words for the Smart Pinyin-to-Hanzi Live Suggestion Bar (IME)
 * Ensures typing ANY common Pinyin immediately suggests Simplified Chinese characters + tones + Vietnamese gloss!
 */
window.PINYIN_IME_EXTRAS = [
  { hanzi: "他", pinyin: "tā", plain: "ta", vi: "anh ấy, ông ấy" },
  { hanzi: "她", pinyin: "tā", plain: "ta", vi: "cô ấy, bà ấy" },
  { hanzi: "它", pinyin: "tā", plain: "ta", vi: "nó (đồ vật/con vật)" },
  { hanzi: "们", pinyin: "men", plain: "men", vi: "các, chúng (số nhiều)" },
  { hanzi: "我们", pinyin: "wǒmen", plain: "women", vi: "chúng tôi, chúng ta" },
  { hanzi: "你们", pinyin: "nǐmen", plain: "nimen", vi: "các bạn" },
  { hanzi: "他们", pinyin: "tāmen", plain: "tamen", vi: "họ, bọn họ" },
  { hanzi: "不", pinyin: "bù", plain: "bu", vi: "không" },
  { hanzi: "不是", pinyin: "bú shì", plain: "bushi", vi: "không phải" },
  { hanzi: "没", pinyin: "méi", plain: "mei", vi: "chưa, không (đi với 有)" },
  { hanzi: "没有", pinyin: "méiyǒu", plain: "meiyou", vi: "không có, chưa" },
  { hanzi: "有", pinyin: "yǒu", plain: "you", vi: "có" },
  { hanzi: "很", pinyin: "hěn", plain: "hen", vi: "rất" },
  { hanzi: "也", pinyin: "yě", plain: "ye", vi: "cũng" },
  { hanzi: "都", pinyin: "dōu", plain: "dou", vi: "đều" },
  { hanzi: "的", pinyin: "de", plain: "de", vi: "của (trợ từ sở hữu)" },
  { hanzi: "吗", pinyin: "ma", plain: "ma", vi: "không? (trợ từ nghi vấn)" },
  { hanzi: "呢", pinyin: "ne", plain: "ne", vi: "thế, còn... thì sao?" },
  { hanzi: "了", pinyin: "le", plain: "le", vi: "rồi (trợ từ hoàn thành)" },
  { hanzi: "在", pinyin: "zài", plain: "zai", vi: "ở tại / đang" },
  { hanzi: "去", pinyin: "qù", plain: "qu", vi: "đi" },
  { hanzi: "来", pinyin: "lái", plain: "lai", vi: "đến" },
  { hanzi: "回", pinyin: "huí", plain: "hui", vi: "trở về" },
  { hanzi: "会", pinyin: "huì", plain: "hui", vi: "biết (kỹ năng), sẽ" },
  { hanzi: "能", pinyin: "néng", plain: "neng", vi: "có thể" },
  { hanzi: "可以", pinyin: "kěyǐ", plain: "keyi", vi: "có thể, được phép" },
  { hanzi: "想", pinyin: "xiǎng", plain: "xiang", vi: "muốn, nhớ, nghĩ" },
  { hanzi: "要", pinyin: "yào", plain: "yao", vi: "cần, muốn, sắp" },
  { hanzi: "做", pinyin: "zuò", plain: "zuo", vi: "làm" },
  { hanzi: "坐", pinyin: "zuò", plain: "zuo", vi: "ngồi, đi bằng (xe/tàu)" },
  { hanzi: "住", pinyin: "zhù", plain: "zhu", vi: "sống, ở" },
  { hanzi: "叫", pinyin: "jiào", plain: "jiao", vi: "tên là, gọi" },
  { hanzi: "名字", pinyin: "míngzi", plain: "mingzi", vi: "tên" },
  { hanzi: "什么", pinyin: "shénme", plain: "shenme", vi: "cái gì" },
  { hanzi: "谁", pinyin: "shéi", plain: "shei", vi: "ai" },
  { hanzi: "哪", pinyin: "nǎ", plain: "na", vi: "nào" },
  { hanzi: "哪里", pinyin: "nǎlǐ", plain: "nali", vi: "ở đâu" },
  { hanzi: "那", pinyin: "nà", plain: "na", vi: "kia, đó" },
  { hanzi: "这", pinyin: "zhè", plain: "zhe", vi: "này, đây" },
  { hanzi: "怎么", pinyin: "zěnme", plain: "zenme", vi: "như thế nào" },
  { hanzi: "怎么样", pinyin: "zěnmeyàng", plain: "zenmeyang", vi: "ra sao, thế nào" },
  { hanzi: "多少", pinyin: "duōshao", plain: "duoshao", vi: "bao nhiêu" },
  { hanzi: "几", pinyin: "jǐ", plain: "ji", vi: "mấy" },
  { hanzi: "一", pinyin: "yī", plain: "yi", vi: "một (1)" },
  { hanzi: "二", pinyin: "èr", plain: "er", vi: "hai (số 2)" },
  { hanzi: "两", pinyin: "liǎng", plain: "liang", vi: "hai (đi với lượng từ)" },
  { hanzi: "三", pinyin: "sān", plain: "san", vi: "ba (3)" },
  { hanzi: "四", pinyin: "sì", plain: "si", vi: "bốn (4)" },
  { hanzi: "五", pinyin: "wǔ", plain: "wu", vi: "năm (5)" },
  { hanzi: "六", pinyin: "liù", plain: "liu", vi: "sáu (6)" },
  { hanzi: "七", pinyin: "qī", plain: "qi", vi: "bảy (7)" },
  { hanzi: "八", pinyin: "bā", plain: "ba", vi: "tám (8)" },
  { hanzi: "九", pinyin: "jiǔ", plain: "jiu", vi: "chín (9)" },
  { hanzi: "十", pinyin: "shí", plain: "shi", vi: "mười (10)" },
  { hanzi: "个", pinyin: "gè", plain: "ge", vi: "cái, người (lượng từ)" },
  { hanzi: "口", pinyin: "kǒu", plain: "kou", vi: "miệng / nhân khẩu" },
  { hanzi: "本", pinyin: "běn", plain: "ben", vi: "quyển, cuốn (sách)" },
  { hanzi: "杯", pinyin: "bēi", plain: "bei", vi: "cốc, ly" },
  { hanzi: "碗", pinyin: "wǎn", plain: "wan", vi: "bát, tô" },
  { hanzi: "岁", pinyin: "suì", plain: "sui", vi: "tuổi" },
  { hanzi: "钱", pinyin: "qián", plain: "qian", vi: "tiền" },
  { hanzi: "块", pinyin: "kuài", plain: "kuai", vi: "đồng, tệ" },
  { hanzi: "人", pinyin: "rén", plain: "ren", vi: "người" },
  { hanzi: "中国", pinyin: "Zhōngguó", plain: "zhongguo", vi: "Trung Quốc" },
  { hanzi: "越南", pinyin: "Yuènán", plain: "yuenan", vi: "Việt Nam" },
  { hanzi: "越南人", pinyin: "Yuènán rén", plain: "yuenanren", vi: "người Việt Nam" },
  { hanzi: "北京", pinyin: "Běijīng", plain: "beijing", vi: "Bắc Kinh" },
  { hanzi: "河内", pinyin: "Hénèi", plain: "henei", vi: "Hà Nội" },
  { hanzi: "胡志明市", pinyin: "Húzhìmíng Shì", plain: "huzhimingshi", vi: "TP. Hồ Chí Minh" },
  { hanzi: "汉语", pinyin: "Hànyǔ", plain: "hanyu", vi: "tiếng Hán" },
  { hanzi: "汉字", pinyin: "Hànzì", plain: "hanzi", vi: "chữ Hán" },
  { hanzi: "学习", pinyin: "xuéxí", plain: "xuexi", vi: "học tập, học" },
  { hanzi: "学校", pinyin: "xuéxiào", plain: "xuexiao", vi: "trường học" },
  { hanzi: "大学", pinyin: "dàxué", plain: "daxue", vi: "đại học" },
  { hanzi: "大学生", pinyin: "dàxuéshēng", plain: "daxuesheng", vi: "sinh viên đại học" },
  { hanzi: "书", pinyin: "shū", plain: "shu", vi: "sách" },
  { hanzi: "听", pinyin: "tīng", plain: "ting", vi: "nghe" },
  { hanzi: "说", pinyin: "shuō", plain: "shuo", vi: "nói" },
  { hanzi: "读", pinyin: "dú", plain: "du", vi: "đọc" },
  { hanzi: "写", pinyin: "xiě", plain: "xie", vi: "viết" },
  { hanzi: "朋友", pinyin: "péngyou", plain: "pengyou", vi: "bạn bè" },
  { hanzi: "哥哥", pinyin: "gēge", plain: "gege", vi: "anh trai" },
  { hanzi: "姐姐", pinyin: "jiějie", plain: "jiejie", vi: "chị gái" },
  { hanzi: "弟弟", pinyin: "dìdi", plain: "didi", vi: "em trai" },
  { hanzi: "妹妹", pinyin: "mèimei", plain: "meimei", vi: "em gái" },
  { hanzi: "医生", pinyin: "yīshēng", plain: "yisheng", vi: "bác sĩ" },
  { hanzi: "医院", pinyin: "yīyuàn", plain: "yiyuan", vi: "bệnh viện" },
  { hanzi: "公司", pinyin: "gōngsī", plain: "gongsi", vi: "công ty" },
  { hanzi: "商店", pinyin: "shāngdiàn", plain: "shangdian", vi: "cửa hàng" },
  { hanzi: "饭馆", pinyin: "fànguǎn", plain: "fanguan", vi: "quán ăn, nhà hàng" },
  { hanzi: "水", pinyin: "shuǐ", plain: "shui", vi: "nước" },
  { hanzi: "茶", pinyin: "chá", plain: "cha", vi: "trà" },
  { hanzi: "咖啡", pinyin: "kāfēi", plain: "kafei", vi: "cà phê" },
  { hanzi: "牛奶", pinyin: "niúnǎi", plain: "niunai", vi: "sữa bò" },
  { hanzi: "面条", pinyin: "miàntiáo", plain: "miantiao", vi: "mì sợi" },
  { hanzi: "牛肉", pinyin: "niúròu", plain: "niurou", vi: "thịt bò" },
  { hanzi: "水果", pinyin: "shuǐguǒ", plain: "shuiguo", vi: "trái cây, hoa quả" },
  { hanzi: "苹果", pinyin: "píngguǒ", plain: "pingguo", vi: "quả táo" },
  { hanzi: "菜", pinyin: "cài", plain: "cai", vi: "món ăn, rau" },
  { hanzi: "好吃", pinyin: "hǎochī", plain: "haochi", vi: "ngon (đồ ăn)" },
  { hanzi: "好喝", pinyin: "hǎohē", plain: "haohe", vi: "ngon (đồ uống)" },
  { hanzi: "昨天", pinyin: "zuótiān", plain: "zuotian", vi: "hôm qua" },
  { hanzi: "明天", pinyin: "míngtiān", plain: "mingtian", vi: "ngày mai" },
  { hanzi: "现在", pinyin: "xiànzài", plain: "xianzai", vi: "bây giờ, hiện tại" },
  { hanzi: "每天", pinyin: "měitiān", plain: "meitian", vi: "mỗi ngày" },
  { hanzi: "早上", pinyin: "zǎoshang", plain: "zaoshang", vi: "buổi sáng" },
  { hanzi: "上午", pinyin: "shàngwǔ", plain: "shangwu", vi: "buổi sáng (trước trưa)" },
  { hanzi: "中午", pinyin: "zhōngwǔ", plain: "zhongwu", vi: "buổi trưa" },
  { hanzi: "下午", pinyin: "xiàwǔ", plain: "xiawu", vi: "buổi chiều" },
  { hanzi: "晚上", pinyin: "wǎnshang", plain: "wanshang", vi: "buổi tối" },
  { hanzi: "周末", pinyin: "zhōumò", plain: "zhoumo", vi: "cuối tuần" },
  { hanzi: "年", pinyin: "nián", plain: "nian", vi: "năm" },
  { hanzi: "号", pinyin: "hào", plain: "hao", vi: "ngày (văn nói) / số" },
  { hanzi: "星期", pinyin: "xīngqī", plain: "xingqi", vi: "tuần / thứ" },
  { hanzi: "点", pinyin: "diǎn", plain: "dian", vi: "giờ / chút" },
  { hanzi: "分钟", pinyin: "fēnzhōng", plain: "fenzhong", vi: "phút" },
  { hanzi: "天气", pinyin: "tiānqì", plain: "tianqi", vi: "thời tiết" },
  { hanzi: "热", pinyin: "rè", plain: "re", vi: "nóng" },
  { hanzi: "冷", pinyin: "lěng", plain: "leng", vi: "lạnh" },
  { hanzi: "高兴", pinyin: "gāoxìng", plain: "gaoxing", vi: "vui mừng" },
  { hanzi: "快乐", pinyin: "kuàilè", plain: "kuaile", vi: "vui vẻ, hạnh phúc" },
  { hanzi: "累", pinyin: "lèi", plain: "lei", vi: "mệt" },
  { hanzi: "忙", pinyin: "máng", plain: "mang", vi: "bận rộn" },
  { hanzi: "难", pinyin: "nán", plain: "nan", vi: "khó" },
  { hanzi: "有意思", pinyin: "yǒuyìsi", plain: "youyisi", vi: "thú vị" },
  { hanzi: "漂亮", pinyin: "piàoliang", plain: "piaoliang", vi: "xinh đẹp" },
  { hanzi: "大", pinyin: "dà", plain: "da", vi: "to, lớn" },
  { hanzi: "小", pinyin: "xiǎo", plain: "xiao", vi: "nhỏ, bé" },
  { hanzi: "多", pinyin: "duō", plain: "duo", vi: "nhiều" },
  { hanzi: "少", pinyin: "shǎo", plain: "shao", vi: "ít" },
  { hanzi: "贵", pinyin: "guì", plain: "gui", vi: "đắt, quý" },
  { hanzi: "卖", pinyin: "mài", plain: "mai", vi: "bán" },
  { hanzi: "东西", pinyin: "dōngxi", plain: "dongxi", vi: "đồ đạc, thứ" },
  { hanzi: "衣服", pinyin: "yīfu", plain: "yifu", vi: "quần áo" },
  { hanzi: "车", pinyin: "chē", plain: "che", vi: "xe" },
  { hanzi: "地铁", pinyin: "dìtiě", plain: "ditie", vi: "tàu điện ngầm" },
  { hanzi: "飞机", pinyin: "fēijī", plain: "feiji", vi: "máy bay" },
  { hanzi: "请问", pinyin: "qǐngwèn", plain: "qingwen", vi: "xin hỏi" },
  { hanzi: "请", pinyin: "qǐng", plain: "qing", vi: "mời, xin" },
  { hanzi: "对不起", pinyin: "duìbuqǐ", plain: "duibuqi", vi: "xin lỗi" },
  { hanzi: "没关系", pinyin: "méi guānxi", plain: "meiguanxi", vi: "không sao đâu" },
  { hanzi: "不客气", pinyin: "bú kèqi", plain: "bukeqi", vi: "đừng khách sáo" },
  { hanzi: "认识", pinyin: "rènshi", plain: "renshi", vi: "quen biết" },
  { hanzi: "帮助", pinyin: "bāngzhù", plain: "bangzhu", vi: "giúp đỡ" },
  { hanzi: "因为", pinyin: "yīnwèi", plain: "yinwei", vi: "bởi vì" },
  { hanzi: "所以", pinyin: "suǒyǐ", plain: "suoyi", vi: "cho nên" },
  { hanzi: "虽然", pinyin: "suīrán", plain: "suiran", vi: "tuy rằng" },
  { hanzi: "但是", pinyin: "dànshì", plain: "danshi", vi: "nhưng mà" },
  { hanzi: "如果", pinyin: "rúguǒ", plain: "ruguo", vi: "nếu như" },
  { hanzi: "一起", pinyin: "yìqǐ", plain: "yiqi", vi: "cùng nhau" },
  { hanzi: "非常", pinyin: "fēicháng", plain: "feichang", vi: "vô cùng, rất" },
  { hanzi: "已经", pinyin: "yǐjīng", plain: "yijing", vi: "đã... rồi" },
  { hanzi: "睡觉", pinyin: "shuìjiào", plain: "shuijiao", vi: "đi ngủ" },
  { hanzi: "起床", pinyin: "qǐchuáng", plain: "qichuang", vi: "thức dậy" },
  { hanzi: "运动", pinyin: "yùndòng", plain: "yundong", vi: "tập thể thao" },
  { hanzi: "电影", pinyin: "diànyǐng", plain: "dianying", vi: "phim điện ảnh" },
  { hanzi: "音乐", pinyin: "yīnyuè", plain: "yinyue", vi: "âm nhạc" },
  { hanzi: "你好", pinyin: "nǐ hǎo", plain: "nihao", vi: "xin chào" }
];
