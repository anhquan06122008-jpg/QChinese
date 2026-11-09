/* -*- coding: utf-8 -*-
 * QChinese – Grammar Curriculum Dataset (HSK 1 – HSK 6, Simplified Chinese 简体中文)
 * Section 6.2: Formula, Vietnamese & English explanations, Trilingual examples, Common mistakes, and 4 interactive exercise types.
 */

window.QCHINESE_GRAMMAR = [
  {
    id: "g_shi",
    hsk_level: 1,
    title: "Câu chữ 是 (shì) – Khẳng định & Phủ định danh tính",
    formula: "Chủ ngữ + 是 / 不是 + Danh từ (Tân ngữ)",
    explainVi: "Động từ hệ từ 是 (shì - là) dùng để nối chủ ngữ với danh từ chỉ tên gọi, nghề nghiệp, quốc tịch hoặc mối quan hệ. Thể phủ định là 不是 (bú shì – không phải là; chú ý 不 biến điệu thành thanh 2 trước 是).",
    explainEn: "The copula verb 是 (shì - to be) connects a subject with a noun or noun phrase indicating identity, profession, or nationality. Negated with 不是 (bú shì).",
    commonMistakes: "LỖI KINH ĐIỂN CỦA NGƯỜI VIỆT: Không dùng 是 trước tính từ! Ví dụ 'Tôi khỏe' phải nói 我很好 (Wǒ hěn hǎo), TUYỆT ĐỐI không nói *我是好.",
    examples: [
      { chinese: "我是学生。", pinyin: "Wǒ shì xuésheng.", english: "I am a student.", vietnamese: "Tôi là học sinh / sinh viên." },
      { chinese: "他不是老师，他是医生。", pinyin: "Tā bú shì lǎoshī, tā shì yīshēng.", english: "He is not a teacher; he is a doctor.", vietnamese: "Anh ấy không phải là giáo viên, anh ấy là bác sĩ." }
    ],
    exercises: {
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
      freeWritePrompt: "Hãy tự viết 1 câu giới thiệu bạn là người nước nào hoặc nghề nghiệp của bạn bằng cấu trúc 是 / 不是 (ví dụ dùng chữ 是)."
    }
  },
  {
    id: "g_hen_adj",
    hsk_level: 1,
    title: "Câu vị ngữ tính từ với 很 (hěn)",
    formula: "Chủ ngữ + 很 / 不 + Tính từ",
    explainVi: "Trong tiếng Trung, tính từ có thể trực tiếp làm vị ngữ mà KHÔNG cần động từ 是. Ở câu trần thuật khẳng định đơn giản, người bản xứ thường thêm phó từ 很 (hěn) trước tính từ để câu cân bằng nhịp điệu (lúc này 很 đôi khi chỉ đóng vai trò nối mềm câu chứ không nhấn mạnh quá mức 'rất'). Phủ định dùng 不 + Tính từ (bỏ 很).",
    explainEn: "Adjectives function directly as predicates in Chinese without 是. In simple affirmative statements, 很 (hěn) is typically placed before the adjective for natural rhythm.",
    commonMistakes: "1) Thêm nhầm 是 trước tính từ (*中文是难 → sửa thành 中文很难). 2) Khi phủ định quên bỏ 很 (nói 'không bận' là 不忙, còn 很不忙 nghĩa là 'rất rảnh/không bận chút nào').",
    examples: [
      { chinese: "今天天气很好。", pinyin: "Jīntiān tiānqì hěn hǎo.", english: "The weather is nice today.", vietnamese: "Hôm nay thời tiết rất đẹp." },
      { chinese: "汉字不难，很有意思。", pinyin: "Hànzì bù nán, hěn yǒuyìsi.", english: "Chinese characters are not hard; they are very interesting.", vietnamese: "Chữ Hán không khó, rất thú vị." }
    ],
    exercises: {
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
      freeWritePrompt: "Hãy viết 1 câu miêu tả đồ ăn, thời tiết hoặc việc học tiếng Trung sử dụng 很 + Tính từ."
    }
  },
  {
    id: "g_time_place_order",
    hsk_level: 1,
    title: "Trật tự vàng: Chủ ngữ + Thời gian + Ở Địa điểm + Hành động",
    formula: "Chủ ngữ + [Thời gian] + [在 + Địa điểm] + Động từ + Tân ngữ",
    explainVi: "Đây là khác biệt LỚN NHẤT giữa tiếng Việt và tiếng Trung! Tiếng Việt nói: 'Tôi học tiếng Trung ở trường vào hôm nay' (Thời gian & Địa điểm ở cuối). Tiếng Trung BẮT BUỘC đưa Thời gian và Cụm địa điểm (在 + nơi chốn) lên TRƯỚC động từ chính!",
    explainEn: "In Chinese, time expressions and location phrases (在 + place) MUST precede the main action verb: Subject + Time + 在 Place + Verb + Object.",
    commonMistakes: "Đặt '今天' hoặc '在学校 / 在家' ra cuối câu theo thói quen tiếng Việt (*我学习中文在学校今天 → Sửa đúng: 我今天在学校学习中文).",
    examples: [
      { chinese: "我每天在家学习中文。", pinyin: "Wǒ měitiān zài jiā xuéxí Zhōngwén.", english: "I study Chinese at home every day.", vietnamese: "Mỗi ngày tôi học tiếng Trung ở nhà." },
      { chinese: "明天上午我们在咖啡馆见面。", pinyin: "Míngtiān shàngwǔ wǒmen zài kāfēiguǎn jiànmiàn.", english: "Tomorrow morning we will meet at the cafe.", vietnamese: "Sáng mai chúng mình gặp nhau ở quán cà phê nhé." }
    ],
    exercises: {
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
      freeWritePrompt: "Hãy viết 1 câu nói rõ bạn làm việc gì, vào lúc nào và ở đâu theo đúng công thức: Chủ ngữ + Thời gian + 在 Địa điểm + Động từ."
    }
  },
  {
    id: "g_bu_vs_mei",
    hsk_level: 2,
    title: "Phân biệt phủ định 不 (bù) và 没 / 没有 (méi / méiyǒu)",
    formula: "不 + Động từ hiện tại/tương lai/ý chí/tính từ  |  没(有) + 有 / Hành động đã xảy ra",
    explainVi: "1) Động từ 有 (có) LUÔN phủ định bằng 没 → 没有 (không có), không bao giờ dùng *不有. 2) Với hành động thường: 不 phủ định thói quen hiện tại, tương lai hoặc ý muốn chủ quan ('không muốn làm'); 没 / 没有 phủ định sự việc trong quá khứ hoặc kết quả khách quan ('chưa / đã không làm', và khi đã có 没 thì bỏ 了 cuối câu!).",
    explainEn: "Use 不 for habitual, future, volitional actions, and adjectives (and 是). Use 没(有) strictly for negating 有 ('to have') and for actions that did not happen in the past.",
    commonMistakes: "1) Nói *我不有钱 (sai) → phải nói 我没有钱. 2) Giữ cả 没 lẫn 了 trong cùng câu (*我没去了 → sửa thành 我没去).",
    examples: [
      { chinese: "我今天没有时间，明天不去商店。", pinyin: "Wǒ jīntiān méiyǒu shíjiān, míngtiān bú qù shāngdiàn.", english: "I don't have time today, and tomorrow I won't go to the store.", vietnamese: "Hôm nay tôi không có thời gian, ngày mai không đi cửa hàng." },
      { chinese: "昨天晚上我没看电影。", pinyin: "Zuótiān wǎnshang wǒ méi kàn diànyǐng.", english: "Last night I didn't watch a movie.", vietnamese: "Tối hôm qua tôi đã không xem phim." }
    ],
    exercises: {
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
      freeWritePrompt: "Hãy đặt 1 câu sử dụng 没有 (không có...) hoặc 没 + Động từ (hôm qua/sáng nay chưa làm gì)."
    }
  },
  {
    id: "g_suiran_danshi",
    hsk_level: 3,
    title: "Cặp liên từ nhượng bộ 虽然……，但是…… (Tuy..., nhưng...)",
    formula: "虽然 + Mệnh đề A，但是 / 可是 + Mệnh đề B",
    explainVi: "Khác với tiếng Anh (không được dùng cả Although và But trong cùng một câu), tiếng Trung BẮT BUỘC dùng cả cặp 虽然……，但是…… để nối vế nhượng bộ và vế chuyển ý!",
    explainEn: "Unlike English ('although' cannot pair with 'but'), Chinese naturally pairs 虽然 (although) in the first clause with 但是 (but/however) in the second clause.",
    commonMistakes: "Bỏ mất 但是 ở vế sau do ảnh hưởng của tiếng Anh! Trong tiếng Trung, đã mở đầu bằng 虽然 thì vế hai rất cần 但是 hoặc 可是.",
    examples: [
      { chinese: "虽然汉字有点儿难，但是很有意思。", pinyin: "Suīrán Hànzì yǒudiǎnr nán, dànshì hěn yǒuyìsi.", english: "Although Chinese characters are a bit hard, they are very interesting.", vietnamese: "Tuy chữ Hán hơi khó một chút, nhưng rất thú vị." }
    ],
    exercises: {
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
      freeWritePrompt: "Hãy viết 1 câu với cặp 虽然……，但是…… nói về việc học tiếng Trung hoặc cuộc sống của bạn."
    }
  },
  {
    id: "g_ba_sentence",
    hsk_level: 4,
    title: "Câu chữ 把 (bǎ) – Tác động làm thay đổi vị trí / trạng thái sự vật",
    formula: "Chủ ngữ + 把 + Tân ngữ xác định + Động từ + Thành phần khác (了 / 在… / 到… / 完)",
    explainVi: "Câu chữ 把 đưa tân ngữ xác định lên trước động từ để nhấn mạnh chủ ngữ xử lý, tác động làm tân ngữ thay đổi vị trí hoặc trạng thái. Động từ trong câu chữ 把 KHÔNG ĐƯỢC đứng trơ trọi một mình mà phải có bổ ngữ kết quả, bổ ngữ xu hướng, 在 + nơi chốn, hoặc 了!",
    explainEn: "The 把 construction fronts a definite object before the verb to show how an action disposes of, moves, or changes that object. The verb MUST take a complement or particle.",
    commonMistakes: "1) Để động từ trơ trọi ở cuối câu (*我把作业做 → phải có kết quả: 我把作业做完了). 2) Đặt phó từ phủ định 没 / 不 sai chỗ (phải đặt TRƯỚC 把: 我没把书忘在家里).",
    examples: [
      { chinese: "请把生词写在本子上。", pinyin: "Qǐng bǎ shēngcí xiě zài běnzi shàng.", english: "Please write the new words down in the notebook.", vietnamese: "Xin hãy viết từ mới vào trong vở." },
      { chinese: "我已经把今天的课文读完了。", pinyin: "Wǒ yǐjīng bǎ jīntiān de kèwén dú wán le.", english: "I have already finished reading today's text.", vietnamese: "Tôi đã đọc xong bài khóa hôm nay rồi." }
    ],
    exercises: {
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
          "他没把那本书看。"
        ],
        answer: "他把那本书看完了。",
        explain: "Trong câu chữ 把, sau động từ 看 bắt buộc phải có thành phần bổ sung kết quả (完了)."
      },
      freeWritePrompt: "Hãy viết 1 câu chữ 把 (ví dụ: cất sách lên bàn, uống hết cốc cà phê, hoặc làm xong bài tập)."
    }
  },
  {
    id: "g_bujin_erqie",
    hsk_level: 5,
    title: "Cấu trúc tăng tiến 不仅……，而且…… (Không những..., mà còn...)",
    formula: "Chủ ngữ + 不仅 + Vế 1，而且 + (还 / 也) + Vế 2",
    explainVi: "Dùng để diễn đạt quan hệ tăng tiến sâu sắc hơn ở vế thứ hai. Nếu hai vế CÙNG một chủ ngữ, chủ ngữ đặt TRƯỚC 不仅; nếu hai vế KHÁC chủ ngữ, 不仅 đặt ở đầu câu trước chủ ngữ 1.",
    explainEn: "Expresses progressive addition ('not only..., but also...'). Place the subject before 不仅 when both clauses share the same subject.",
    commonMistakes: "Đặt sai vị trí chủ ngữ khi hai vế cùng nói về 1 người, hoặc quên phó từ 还 / 也 hỗ trợ độ mượt ở vế sau.",
    examples: [
      { chinese: "她不仅会说流利的中文，而且汉字也写得非常漂亮。", pinyin: "Tā bùjǐn huì shuō liúlì de Zhōngwén, érqiě Hànzì yě xiě de fēicháng piàoliang.", english: "She can not only speak fluent Chinese, but also writes Chinese characters beautifully.", vietnamese: "Cô ấy không những nói tiếng Trung lưu loát mà chữ Hán cũng viết vô cùng đẹp." }
    ],
    exercises: {
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
      freeWritePrompt: "Hãy viết 1 câu dùng 不仅……，而且…… để khen một người bạn, một thành phố hoặc lợi ích của việc học tiếng Trung."
    }
  },
  {
    id: "g_yuqi_buru",
    hsk_level: 6,
    title: "Cấu trúc so sánh chọn lựa học thuật 与其……，不如…… (Thà rằng..., chi bằng...)",
    formula: "与其 + Phương án A（kém hơn），不如 + Phương án B（tốt hơn）",
    explainVi: "Cấu trúc nâng cao HSK 6 dùng khi cân nhắc hai lựa chọn: bác bỏ phương án A (kém hiệu quả) để khẳng định lựa chọn B là tối ưu hơn ('Thay vì làm A, chi bằng làm B').",
    explainEn: "Advanced HSK 6 comparative choice structure ('Rather than doing A, it would be better to do B'), weighing two options and choosing B.",
    commonMistakes: "Đảo ngược vị trí phương án tốt/xấu! Hãy nhớ: sau 与其 là điều KHÔNG nên làm, sau 不如 mới là điều NÊN chọn.",
    examples: [
      { chinese: "与其死记硬背几百个孤立的生词，不如结合真实的语境来运用它们。", pinyin: "Yǔqí sǐjìyìngbèi jǐ bǎi gè gūlì de shēngcí, bùrú jiéhé zhēnshí de yǔjìng lái yùnyòng tāmen.", english: "Rather than rote-memorizing hundreds of isolated words, it is better to apply them in authentic contexts.", vietnamese: "Thay vì học vẹt hàng trăm từ mới rời rạc, chi bằng kết hợp ngữ cảnh thực tế để vận dụng chúng." }
    ],
    exercises: {
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
      freeWritePrompt: "Hãy viết 1 câu nghị luận ngắn sử dụng cấu trúc 与其……，不如…… chia sẻ kinh nghiệm học tập hoặc làm việc."
    }
  }
];
