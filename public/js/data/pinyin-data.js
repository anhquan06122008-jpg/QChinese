/* -*- coding: utf-8 -*-
 * QChinese – Complete Pinyin, Articulation, 4 Tones, Neutral Tone & Tone Sandhi Dataset (PHẦN 5)
 * Designed specifically for Vietnamese beginners starting from zero.
 */

window.QCHINESE_PINYIN = {
  initials: [
    // Âm hai môi & môi răng
    { symbol: "b", group: "Âm hai môi & môi răng", readAudio: "波", readPy: "bō", mouth: "Khép hai môi rồi mở nhanh, KHÔNG bật hơi, dây thanh không rung.", howVi: "Nghe gần giống chữ 'p' nhẹ trong tiếng Việt (như 'pin'), tuyệt đối không đọc rung thành 'bò'!", example: { hz: "爸爸", py: "bàba", vi: "bố" } },
    { symbol: "p", group: "Âm hai môi & môi răng", readAudio: "坡", readPy: "pō", mouth: "Khép hai môi rồi BẬT MẠNH luồng hơi ra ngoài (đặt tờ giấy trước miệng giấy phải bay!).", howVi: "Giống 'p' nhưng bật hơi mạnh (gần 'ph' bật môi, không chạm răng vào môi như 'ph' tiếng Việt).", example: { hz: "朋友", py: "péngyou", vi: "bạn bè" } },
    { symbol: "m", group: "Âm hai môi & môi răng", readAudio: "摸", readPy: "mō", mouth: "Khép hai môi, luồng hơi thoát qua khoang mũi.", howVi: "Giống âm 'm' tiếng Việt, rất dễ đọc!", example: { hz: "妈妈", py: "māma", vi: "mẹ" } },
    { symbol: "f", group: "Âm hai môi & môi răng", readAudio: "佛", readPy: "fó", mouth: "Răng cửa hàm trên chạm nhẹ môi dưới, đẩy hơi ma sát ra.", howVi: "Giống âm 'ph' trong tiếng Việt ('phở').", example: { hz: "米饭", py: "mǐfàn", vi: "cơm" } },

    // Âm đầu lưỡi giữa
    { symbol: "d", group: "Âm đầu lưỡi giữa", readAudio: "得", readPy: "dé", mouth: "Đầu lưỡi chạm mặt sau lợi hàm trên rồi hạ xuống, KHÔNG bật hơi.", howVi: "Đọc giống chữ 't' tiếng Việt ('ta'), KHÔNG đọc thành 'đ'!", example: { hz: "大", py: "dà", vi: "to, lớn" } },
    { symbol: "t", group: "Âm đầu lưỡi giữa", readAudio: "特", readPy: "tè", mouth: "Đầu lưỡi chạm lợi trên rồi BẬT MẠNH hơi ra.", howVi: "Giống âm 'th' trong tiếng Việt ('tha') kèm luồng hơi mạnh.", example: { hz: "他", py: "tā", vi: "anh ấy" } },
    { symbol: "n", group: "Âm đầu lưỡi giữa", readAudio: "呢", readPy: "ne", mouth: "Đầu lưỡi chạm lợi trên, hơi thoát qua mũi.", howVi: "Giống âm 'n' trong tiếng Việt.", example: { hz: "你", py: "nǐ", vi: "bạn" } },
    { symbol: "l", group: "Âm đầu lưỡi giữa", readAudio: "勒", readPy: "lè", mouth: "Đầu lưỡi chạm lợi trên, hơi thoát ra hai bên lưỡi.", howVi: "Giống âm 'l' trong tiếng Việt ('la').", example: { hz: "老师", py: "lǎoshī", vi: "giáo viên" } },

    // Âm gốc lưỡi
    { symbol: "g", group: "Âm gốc lưỡi", readAudio: "哥", readPy: "gē", mouth: "Gốc lưỡi nâng lên chạm ngạc mềm rồi buông ra, KHÔNG bật hơi.", howVi: "Đọc giống chữ 'c / k' tiếng Việt ('ca'), không gằn cổ như 'g' tiếng Việt.", example: { hz: "哥哥", py: "gēge", vi: "anh trai" } },
    { symbol: "k", group: "Âm gốc lưỡi", readAudio: "科", readPy: "kē", mouth: "Gốc lưỡi chạm ngạc mềm rồi BẬT HƠI MẠNH từ cổ họng ra.", howVi: "Gần giống 'kh' tiếng Việt nhưng có độ bật hơi dứt khoát.", example: { hz: "看", py: "kàn", vi: "nhìn, đọc" } },
    { symbol: "h", group: "Âm gốc lưỡi", readAudio: "喝", readPy: "hē", mouth: "Gốc lưỡi nâng gần ngạc mềm tạo khe ma sát nhẹ.", howVi: "Giữa chữ 'h' và 'kh' nhẹ trong tiếng Việt.", example: { hz: "好", py: "hǎo", vi: "tốt, khỏe" } },

    // Âm mặt lưỡi (j, q, x)
    { symbol: "j", group: "Âm mặt lưỡi (cực quan trọng)", readAudio: "基", readPy: "jī", mouth: "Đầu lưỡi hạ xuống chạm mặt sau răng DƯỚI, mặt lưỡi nâng sát vòm cứng, KHÔNG bật hơi.", howVi: "Gần giống 'ch' nhẹ tiếng Việt nhưng môi kéo dẹt sang hai bên.", example: { hz: "家", py: "jiā", vi: "nhà, gia đình" } },
    { symbol: "q", group: "Âm mặt lưỡi (cực quan trọng)", readAudio: "欺", readPy: "qī", mouth: "Vị trí lưỡi y hệt 'j' (đầu lưỡi chạm răng dưới), nhưng BẬT MẠNH luồng hơi ra!", howVi: "Đặt tay trước miệng phải thấy luồng gió mát bật ra từ kẽ mặt lưỡi.", example: { hz: "请", py: "qǐng", vi: "xin, mời" } },
    { symbol: "x", group: "Âm mặt lưỡi (cực quan trọng)", readAudio: "希", readPy: "xī", mouth: "Đầu lưỡi chạm sau răng dưới, mặt lưỡi nâng lên để hơi xì êm qua khe hẹp.", howVi: "Giống âm 'x' nhẹ nhàng trong tiếng Việt ('xa'), khóe miệng hơi mỉm cười.", example: { hz: "喜欢", py: "xǐhuan", vi: "thích" } },

    // Âm đầu lưỡi trước (z, c, s - lưỡi thẳng)
    { symbol: "z", group: "Âm đầu lưỡi trước (thẳng lưỡi)", readAudio: "资", readPy: "zī", mouth: "Đầu lưỡi chạm thẳng vào mặt sau răng cửa trên rồi hé nhẹ, KHÔNG bật hơi.", howVi: "Nghe giữa 'ch' và 'd/gi' đầu lưỡi thẳng, dứt khoát không bật hơi.", example: { hz: "再见", py: "zàijiàn", vi: "tạm biệt" } },
    { symbol: "c", group: "Âm đầu lưỡi trước (thẳng lưỡi)", readAudio: "雌", readPy: "cī", mouth: "Đầu lưỡi thẳng chạm sau răng cửa trên rồi BẬT MẠNH hơi xì ra!", howVi: "Âm bật hơi của 'z' (nghe như 'ts' bật gió mạnh qua kẽ răng).", example: { hz: "菜", py: "cài", vi: "món ăn, rau" } },
    { symbol: "s", group: "Âm đầu lưỡi trước (thẳng lưỡi)", readAudio: "思", readPy: "sī", mouth: "Đầu lưỡi tiến gần răng cửa, lưỡi THẲNG (không cong lưỡi!).", howVi: "Giống chữ 'x' sắc nét đầu lưỡi thẳng.", example: { hz: "三", py: "sān", vi: "số ba (3)" } },

    // Âm đầu lưỡi sau (zh, ch, sh, r - uốn cong lưỡi)
    { symbol: "zh", group: "Âm đầu lưỡi sau (cong lưỡi)", readAudio: "知", readPy: "zhī", mouth: "Uốn CONG đầu lưỡi chạm lên ngạc cứng phía trên, KHÔNG bật hơi.", howVi: "Giống chữ 'tr' miền Trung/Nam (cong lưỡi rõ rệt, không bật hơi).", example: { hz: "中文", py: "Zhōngwén", vi: "tiếng Trung" } },
    { symbol: "ch", group: "Âm đầu lưỡi sau (cong lưỡi)", readAudio: "吃", readPy: "chī", mouth: "Uốn CONG đầu lưỡi y hệt 'zh', nhưng BẬT HƠI MẠNH ra ngoài!", howVi: "Vừa cong lưỡi như 'tr' vừa bật mạnh luồng hơi ra.", example: { hz: "吃", py: "chī", vi: "ăn" } },
    { symbol: "sh", group: "Âm đầu lưỡi sau (cong lưỡi)", readAudio: "诗", readPy: "shī", mouth: "Uốn cong đầu lưỡi gần ngạc cứng để hơi ma sát thoát ra.", howVi: "Giống chữ 's' cong lưỡi chuẩn ('sông, sao').", example: { hz: "是", py: "shì", vi: "là" } },
    { symbol: "r", group: "Âm đầu lưỡi sau (cong lưỡi)", readAudio: "日", readPy: "rì", mouth: "Uốn cong đầu lưỡi gần ngạc cứng, rung dây thanh nhẹ, KHÔNG rung đầu lưỡi.", howVi: "Giống âm 'r' mềm mượt (không rung lộc cộc đầu lưỡi).", example: { hz: "人", py: "rén", vi: "người" } },

    // Bán nguyên âm dẫn đầu
    { symbol: "y", group: "Thanh mẫu quy ước (dẫn đầu i / ü)", readAudio: "衣", readPy: "yī", mouth: "Đứng đầu âm tiết thay cho 'i' (yi) hoặc 'ü' (yu - bỏ 2 dấu chấm).", howVi: "Đọc như 'i / d' nhẹ; riêng 'yu' đọc tròn môi âm ü ('duy').", example: { hz: "月", py: "yuè", vi: "tháng, trăng" } },
    { symbol: "w", group: "Thanh mẫu quy ước (dẫn đầu u)", readAudio: "乌", readPy: "wū", mouth: "Chụm tròn hai môi như âm 'u' rồi lướt sang nguyên âm sau.", howVi: "Đọc như 'u / qu' nhẹ tròn môi.", example: { hz: "我", py: "wǒ", vi: "tôi" } }
  ],

  finals: {
    single: [
      { symbol: "a", readAudio: "啊", readPy: "ā", mouth: "Miệng mở rộng tự nhiên, lưỡi đặt thấp.", howVi: "Giống âm 'a' tiếng Việt.", example: { hz: "爸", py: "bà", vi: "bố" } },
      { symbol: "o", readAudio: "喔", readPy: "ō", mouth: "Môi hơi tròn, khi đi sau b, p, m, f có lướt nhẹ âm u (uô).", howVi: "bō đọc gần 'puô', mō đọc gần 'muô'.", example: { hz: "我", py: "wǒ", vi: "tôi" } },
      { symbol: "e", readAudio: "鹅", readPy: "é", mouth: "Miệng hé vừa, khóe miệng hơi dẹt sang ngang.", howVi: "Đọc giữa 'ơ' và 'ưa' (hē → hưa; dé → tứa).", example: { hz: "喝", py: "hē", vi: "uống" } },
      { symbol: "i", readAudio: "衣", readPy: "yī", mouth: "Hai hàm răng gần nhau, khóe miệng kéo dẹt. LƯU Ý: Sau z, c, s, zh, ch, sh, r thì 'i' đọc thành âm 'ư'!", howVi: "Sau b,p,m,d,t,n,l,j,q,x đọc là 'i'; sau z,c,s,zh,ch,sh,r đọc là 'ư' (shì → sư, chī → trư).", example: { hz: "你", py: "nǐ", vi: "bạn" } },
      { symbol: "u", readAudio: "乌", readPy: "wū", mouth: "Hai môi chụm tròn nhô nhẹ ra trước.", howVi: "Giống âm 'u' tiếng Việt.", example: { hz: "书", py: "shū", vi: "sách" } },
      { symbol: "ü", readAudio: "迂", readPy: "yū", mouth: "Phát âm 'i' nhưng giữ hai môi TRÒN NHỎ như đang huýt sáo và giữ nguyên môi không cử động!", howVi: "Gần âm 'uy' tiếng Việt nhưng môi giữ cố định tròn từ đầu đến cuối. Trên bàn phím gõ bằng phím 'v' (nǚ → nv, lǚ → lv).", example: { hz: "女", py: "nǚ", vi: "nữ, phụ nữ" } }
    ],
    compound: [
      { symbol: "ai", readAudio: "爱", readPy: "ài", mouth: "Mở rộng 'a' lướt nhanh sang 'i'.", howVi: "Giống 'ai' tiếng Việt.", example: { hz: "买", py: "mǎi", vi: "mua" } },
      { symbol: "ei", readAudio: "杯", readPy: "bēi", mouth: "Từ 'ê' lướt sang 'i'.", howVi: "Đọc giống 'ây' tiếng Việt (bēi → pây).", example: { hz: "杯", py: "bēi", vi: "cốc, ly" } },
      { symbol: "ao", readAudio: "好", readPy: "hǎo", mouth: "Từ 'a' lướt sang 'u/o' tròn môi.", howVi: "Giống 'ao' tiếng Việt.", example: { hz: "好", py: "hǎo", vi: "tốt" } },
      { symbol: "ou", readAudio: "口", readPy: "kǒu", mouth: "Từ 'ô' lướt sang 'u'.", howVi: "Đọc giống 'âu' tiếng Việt (kǒu → khẩu, dōu → tâu).", example: { hz: "口", py: "kǒu", vi: "miệng" } },
      { symbol: "ia", readAudio: "家", readPy: "jiā", mouth: "Lướt nhanh từ 'i' sang 'a' mở rộng.", howVi: "Gần 'ia / ya' (jiā → chia).", example: { hz: "家", py: "jiā", vi: "nhà" } },
      { symbol: "ie", readAudio: "谢", readPy: "xiè", mouth: "Từ 'i' lướt sang 'ê'.", howVi: "Đọc như 'iê' (xiè → xiê).", example: { hz: "谢谢", py: "xièxie", vi: "cảm ơn" } },
      { symbol: "ua", readAudio: "花", readPy: "huā", mouth: "Tròn môi 'u' mở rộng sang 'a'.", howVi: "Đọc như 'oa' (huā → hoa).", example: { hz: "欢", py: "huān", vi: "hoan (trong 喜欢)" } },
      { symbol: "uo", readAudio: "国", readPy: "guó", mouth: "Từ 'u' lướt sang 'ô'.", howVi: "Đọc như 'uô' (guó → cuố, shuō → suô).", example: { hz: "国", py: "guó", vi: "quốc gia" } },
      { symbol: "üe", readAudio: "学", readPy: "xué", mouth: "Tròn môi 'ü' lướt sang 'ê'. Đi với j, q, x, y viết bỏ 2 chấm thành jue, que, xue, yue!", howVi: "Đọc tròn môi 'uyê' (xué → xuế, yuè → duê).", example: { hz: "学", py: "xué", vi: "học" } },
      { symbol: "iao", readAudio: "叫", readPy: "jiào", mouth: "Kết hợp i + ao.", howVi: "Đọc như 'i-ao' nhanh (jiào → chiao).", example: { hz: "叫", py: "jiào", vi: "tên là" } },
      { symbol: "iu (iou)", readAudio: "六", readPy: "liù", mouth: "Viết tắt của 'iou': lướt từ i qua ô sang u.", howVi: "Đọc như 'iêu / iu' (liù → liêu, jiǔ → chiểu).", example: { hz: "六", py: "liù", vi: "số 6" } },
      { symbol: "uai", readAudio: "块", readPy: "kuài", mouth: "Kết hợp u + ai.", howVi: "Đọc như 'oai' (kuài → khoai).", example: { hz: "块", py: "kuài", vi: "đồng, tệ" } },
      { symbol: "ui (uei)", readAudio: "水", readPy: "shuǐ", mouth: "Viết tắt của 'uei': tròn môi u lướt qua ê sang i.", howVi: "Đọc như 'uây' (shuǐ → suẩy, huì → khuây/huây).", example: { hz: "水", py: "shuǐ", vi: "nước" } }
    ],
    nasal: [
      { symbol: "an", readAudio: "看", readPy: "kàn", mouth: "Âm mũi trước: kết thúc đầu lưỡi chạm lợi trên (-n).", howVi: "Giống 'an' tiếng Việt.", example: { hz: "看", py: "kàn", vi: "nhìn, đọc" } },
      { symbol: "en", readAudio: "人", readPy: "rén", mouth: "Âm mũi trước: 'ơ' + đầu lưỡi chạm lợi trên (-n).", howVi: "Đọc giống 'ân' tiếng Việt (rén → rấn, hěn → khẩn).", example: { hz: "人", py: "rén", vi: "người" } },
      { symbol: "in", readAudio: "您", readPy: "nín", mouth: "Âm 'i' kết thúc mũi trước (-n).", howVi: "Giống 'in' tiếng Việt.", example: { hz: "您", py: "nín", vi: "ngài (lịch sự)" } },
      { symbol: "ian", readAudio: "天", readPy: "tiān", mouth: "LƯU Ý: 'ian' KHÔNG đọc là i-an mà nguyên âm giữa chuyển nhẹ sang 'ê' (-iên)!", howVi: "Đọc giống 'iên' tiếng Việt (tiān → thiên, jiàn → chiên, miàn → miên).", example: { hz: "今天", py: "jīntiān", vi: "hôm nay" } },
      { symbol: "uan", readAudio: "欢", readPy: "huān", mouth: "u + an (riêng sau j, q, x, y thì juan/quan/xuan/yuan thực chất là üan!).", howVi: "Đọc là 'oan' (huān → hoan); sau j/q/x/y đọc tròn môi 'uyên'.", example: { hz: "喜欢", py: "xǐhuan", vi: "thích" } },
      { symbol: "un (uen)", readAudio: "春", readPy: "chūn", mouth: "Viết tắt của 'uen': tròn môi u lướt qua ơ đến mũi trước -n.", howVi: "Đọc như 'uân' (chūn → truân, wèn → uấn).", example: { hz: "春天", py: "chūntiān", vi: "mùa xuân" } },
      { symbol: "üan", readAudio: "远", readPy: "yuǎn", mouth: "Tròn môi ü + an (đi với j,q,x,y viết thành juan, quan, xuan, yuan).", howVi: "Đọc tròn môi 'uyên' (yuǎn → duyển).", example: { hz: "远", py: "yuǎn", vi: "xa" } },
      { symbol: "ün", readAudio: "云", readPy: "yún", mouth: "Tròn môi ü + âm mũi -n (đi với j,q,x,y viết thành jun, qun, xun, yun).", howVi: "Đọc như 'uyn' tròn môi.", example: { hz: "运动", py: "yùndòng", vi: "vận động" } },
      { symbol: "ang", readAudio: "忙", readPy: "máng", mouth: "Âm mũi sau: mở rộng miệng, gốc lưỡi chạm ngạc mềm (-ng vang sâu).", howVi: "Giống 'ang' vang mở (không ngậm môi cuối âm như tiếng Việt!).", example: { hz: "忙", py: "máng", vi: "bận rộn" } },
      { symbol: "eng", readAudio: "生", readPy: "shēng", mouth: "Âm mũi sau: 'ơ' + vang mũi sau (-ng).", howVi: "Đọc giống 'âng / ơng' mở miệng (shēng → sơng, péng → phấng).", example: { hz: "学生", py: "xuésheng", vi: "học sinh" } },
      { symbol: "ing", readAudio: "听", readPy: "tīng", mouth: "Âm 'i' + vang mũi sau (-ng).", howVi: "Giống 'inh / iêng' vang mũi (tīng → thiêng/thinh).", example: { hz: "听", py: "tīng", vi: "nghe" } },
      { symbol: "ong", readAudio: "中", readPy: "zhōng", mouth: "Tròn môi 'u/ô' + vang mũi sau (-ng), KHÔNG phồng hai má!", howVi: "Đọc như 'ung' mở khoang mũi (zhōng → trung, gōng → cung).", example: { hz: "中文", py: "Zhōngwén", vi: "tiếng Trung" } },
      { symbol: "iang", readAudio: "想", readPy: "xiǎng", mouth: "i + ang vang mũi sau.", howVi: "Đọc như 'iang' (xiǎng → xẻng/xiang).", example: { hz: "想", py: "xiǎng", vi: "muốn, nhớ" } },
      { symbol: "uang", readAudio: "床", readPy: "chuáng", mouth: "u + ang vang mũi sau.", howVi: "Đọc như 'oang'.", example: { hz: "起床", py: "qǐchuáng", vi: "thức dậy" } },
      { symbol: "ueng", readAudio: "翁", readPy: "wēng", mouth: "Đứng độc lập viết là 'weng': tròn môi u + eng vang mũi sau.", howVi: "Đọc như 'uâng'.", example: { hz: "老翁", py: "lǎowēng", vi: "ông lão" } },
      { symbol: "iong", readAudio: "兄", readPy: "xiōng", mouth: "i/ü + ong vang mũi sau.", howVi: "Đọc như 'iung'.", example: { hz: "兄弟", py: "xiōngdì", vi: "anh em" } },
      { symbol: "er", readAudio: "二", readPy: "èr", mouth: "Phát âm 'ơ' đồng thời uốn cong đầu lưỡi lên giữa vòm miệng.", howVi: "Âm uốn lưỡi đặc trưng tiếng Phổ thông Bắc Kinh (èr - số 2; 一点儿 yìdiǎnr - một chút).", example: { hz: "二", py: "èr", vi: "số hai (2)" } }
    ]
  },

  combinerGrid: [
    { initial: "b", combos: { a: { py: "bā", hz: "八", vi: "số 8" }, o: { py: "bō", hz: "波", vi: "sóng" }, i: { py: "bǐ", hz: "笔", vi: "bút" }, u: { py: "bù", hz: "不", vi: "không" }, ai: { py: "bái", hz: "白", vi: "trắng" }, ei: { py: "bēi", hz: "杯", vi: "cốc" }, ao: { py: "bāo", hz: "包", vi: "túi/bánh bao" }, an: { py: "bān", hz: "班", vi: "lớp học" }, en: { py: "běn", hz: "本", vi: "quyển" }, ang: { py: "bāng", hz: "帮", vi: "giúp" } } },
    { initial: "m", combos: { a: { py: "mā", hz: "妈", vi: "mẹ" }, o: { py: "mō", hz: "摸", vi: "chạm" }, i: { py: "mǐ", hz: "米", vi: "gạo" }, u: { py: "mù", hz: "木", vi: "gỗ/cây" }, ai: { py: "mǎi", hz: "买", vi: "mua" }, ei: { py: "méi", hz: "没", vi: "không có" }, ao: { py: "māo", hz: "猫", vi: "con mèo" }, an: { py: "màn", hz: "慢", vi: "chậm" }, en: { py: "men", hz: "们", vi: "các (số nhiều)" }, ang: { py: "máng", hz: "忙", vi: "bận" } } },
    { initial: "n", combos: { a: { py: "nǎ", hz: "哪", vi: "nào" }, e: { py: "ne", hz: "呢", vi: "thì sao?" }, i: { py: "nǐ", hz: "你", vi: "bạn" }, u: { py: "nǔ", hz: "努", vi: "nỗ lực" }, "ü": { py: "nǚ", hz: "女", vi: "nữ" }, ai: { py: "nǎi", hz: "奶", vi: "sữa" }, an: { py: "nán", hz: "难", vi: "khó" }, in: { py: "nín", hz: "您", vi: "ngài" }, ian: { py: "nián", hz: "年", vi: "năm" }, eng: { py: "néng", hz: "能", vi: "có thể" } } },
    { initial: "h", combos: { a: { py: "hā", hz: "哈", vi: "ha ha" }, e: { py: "hē", hz: "喝", vi: "uống" }, u: { py: "hú", hz: "湖", vi: "hồ" }, ai: { py: "hái", hz: "还", vi: "vẫn còn" }, ao: { py: "hǎo", hz: "好", vi: "tốt" }, an: { py: "Hàn", hz: "汉", vi: "Hán" }, en: { py: "hěn", hz: "很", vi: "rất" }, ua: { py: "huà", hz: "话", vi: "lời nói" }, uan: { py: "huān", hz: "欢", vi: "vui/thích" }, ui: { py: "huì", hz: "会", vi: "biết" } } },
    { initial: "x", combos: { i: { py: "xǐ", hz: "喜", vi: "vui/thích" }, "ü": { py: "xū", hz: "需", vi: "cần (viết xu)" }, ia: { py: "xià", hz: "下", vi: "dưới/chiều" }, ie: { py: "xiě", hz: "写", vi: "viết" }, "üe": { py: "xué", hz: "学", vi: "học (viết xue)" }, iao: { py: "xiǎo", hz: "小", vi: "nhỏ" }, iu: { py: "xiū", hz: "休", vi: "nghỉ ngơi" }, ian: { py: "xiàn", hz: "现", vi: "hiện tại" }, iang: { py: "xiǎng", hz: "想", vi: "muốn/nhớ" }, ing: { py: "xīng", hz: "星", vi: "ngôi sao" } } },
    { initial: "zh", combos: { a: { py: "zhā", hz: "扎", vi: "đâm/buộc" }, e: { py: "zhè", hz: "这", vi: "này, đây" }, i: { py: "zhī", hz: "知", vi: "biết (đọc trư)" }, u: { py: "zhù", hz: "住", vi: "sống, ở" }, ao: { py: "zhǎo", hz: "找", vi: "tìm" }, ou: { py: "zhōu", hz: "周", vi: "tuần" }, an: { py: "zhàn", hz: "站", vi: "trạm, ga" }, en: { py: "zhēn", hz: "真", vi: "thật" }, uo: { py: "zhuō", hz: "桌", vi: "cái bàn" }, ong: { py: "zhōng", hz: "中", vi: "ở giữa" } } }
  ],

  tones: [
    {
      tone: 1,
      name: "Thanh 1 (Âm bình – 阴平)",
      symbol: "ā",
      pitch: "55 (Cao và ngang đều)",
      svgPath: "M 15 28 L 165 28",
      desc: "Giọng cao, phẳng và ngân đều từ đầu đến cuối, không lên không xuống.",
      tipVi: "Cao hơn thanh ngang tiếng Việt một chút, giữ hơi đều đặn như nốt nhạc ngân ngang.",
      examples: [
        { py: "mā", hz: "妈", vi: "mẹ" },
        { py: "gāo", hz: "高", vi: "cao" },
        { py: "shū", hz: "书", vi: "sách" }
      ]
    },
    {
      tone: 2,
      name: "Thanh 2 (Dương bình – 阳平)",
      symbol: "á",
      pitch: "35 (Đi lên từ trung bình lên cao)",
      svgPath: "M 15 68 L 165 22",
      desc: "Giọng bắt đầu ở mức vừa rồi vút cao lên rõ rệt (như giọng ngạc nhiên hỏi 'Hả?').",
      tipVi: "Gần giống dấu sắc tiếng Việt nhưng có độ vút từ tầm trung lên cao mượt mà.",
      examples: [
        { py: "má", hz: "麻", vi: "cây gai / tê" },
        { py: "rén", hz: "人", vi: "con người" },
        { py: "xué", hz: "学", vi: "học" }
      ]
    },
    {
      tone: 3,
      name: "Thanh 3 (Thượng thanh – 上声)",
      symbol: "ǎ",
      pitch: "214 (Hạ xuống thấp rồi đi lên khi đọc từ đơn)",
      svgPath: "M 15 55 Q 75 95 165 36",
      desc: "Khi đọc từ đơn lẻ: hạ giọng trầm xuống đáy (2→1) rồi nâng lên mức 4. Khi đứng trước thanh 1, 2, 4: chỉ đọc nửa đầu trầm thấp (21 - bán thượng thanh)!",
      tipVi: "Đừng đọc giống hệt dấu hỏi tiếng Việt! Điểm cốt lõi của thanh 3 là ĐỘ TRẦM THẤP ở đáy họng.",
      examples: [
        { py: "mǎ", hz: "马", vi: "con ngựa" },
        { py: "nǐ", hz: "你", vi: "bạn" },
        { py: "hǎo", hz: "好", vi: "tốt, khỏe" }
      ]
    },
    {
      tone: 4,
      name: "Thanh 4 (Khứ thanh – 去声)",
      symbol: "à",
      pitch: "51 (Đi xuống mạnh và dứt khoát)",
      svgPath: "M 15 20 L 165 88",
      desc: "Bắt đầu từ điểm rất cao (5) rồi lao nhanh, mạnh, dứt khoát xuống điểm thấp nhất (1).",
      tipVi: "KHÔNG đọc rề rà như dấu huyền tiếng Việt! Hãy phát âm cao và chém dứt khoát xuống như khẩu lệnh 'Đi!'.",
      examples: [
        { py: "mà", hz: "骂", vi: "mắng" },
        { py: "shì", hz: "是", vi: "là" },
        { py: "qù", hz: "去", vi: "đi" }
      ]
    },
    {
      tone: 5,
      name: "Thanh nhẹ (Khinh thanh – 轻声)",
      symbol: "a (không dấu)",
      pitch: "Ngắn, nhẹ, phụ thuộc âm đứng trước",
      svgPath: "M 55 54 A 6 6 0 1 1 67 54 A 6 6 0 1 1 55 54",
      desc: "Không mang dấu thanh điệu. Đọc rất NGẮN và NHẸ bằng khoảng nửa độ dài âm bình thường.",
      tipVi: "Xuất hiện ở trợ từ (吗 ma, 呢 ne, 的 de, 了 le) hoặc âm lặp gia đình (妈妈 māma, 爸爸 bàba, 喜欢 xǐhuan).",
      examples: [
        { py: "ma", hz: "吗", vi: "không? (trợ từ hỏi)" },
        { py: "māma", hz: "妈妈", vi: "mẹ" },
        { py: "xièxie", hz: "谢谢", vi: "cảm ơn" }
      ]
    }
  ],

  sandhiRules: [
    {
      title: "1. Biến điệu hai Thanh 3 đi liền nhau (3 + 3 → 2 + 3)",
      formula: "Thanh 3 + Thanh 3  ➔  Đọc thành Thanh 2 + Thanh 3 (nhưng chữ viết Pinyin VẪN GIỮ dấu Thanh 3!)",
      explanation: "Khi hai âm tiết mang Thanh 3 đứng cạnh nhau, âm thứ nhất tự động đọc nâng lên thành Thanh 2 để không bị nghẹn giọng.",
      examples: [
        { hz: "你好", written: "nǐ hǎo", spoken: "ní hǎo", vi: "Xin chào" },
        { hz: "可以", written: "kěyǐ", spoken: "kéyǐ", vi: "Có thể" },
        { hz: "很冷", written: "hěn lěng", spoken: "hén lěng", vi: "Rất lạnh" }
      ]
    },
    {
      title: "2. Quy tắc biến điệu của chữ 不 (bù – không)",
      formula: "不 + Thanh 4  ➔  Đọc thành bú (Thanh 2) + Thanh 4",
      explanation: "Bình thường 不 đọc là bù (Thanh 4). Nhưng khi đứng ngay trước một từ Thanh 4 khác, nó biến thành bú (Thanh 2) cho mềm mại.",
      examples: [
        { hz: "不是", written: "bú shì", spoken: "bú shì", vi: "Không phải (shì là thanh 4)" },
        { hz: "不去", written: "bú qù", spoken: "bú qù", vi: "Không đi (qù là thanh 4)" },
        { hz: "不客气", written: "bú kèqi", spoken: "bú kèqi", vi: "Đừng khách sáo" },
        { hz: "不好", written: "bù hǎo", spoken: "bù hǎo", vi: "Không tốt (trước thanh 1, 2, 3 giữ nguyên bù)" }
      ]
    },
    {
      title: "3. Quy tắc biến điệu của chữ 一 (yī – một)",
      formula: "Đếm số thứ tự: yī (Thanh 1) | Trước Thanh 4: yí (Thanh 2) | Trước Thanh 1, 2, 3: yì (Thanh 4)",
      explanation: "Chữ 一 linh hoạt đổi thanh điệu khi đi kèm lượng từ/danh từ theo sau.",
      examples: [
        { hz: "第一", written: "dì-yī", spoken: "dì-yī", vi: "Thứ nhất (số thứ tự → giữ thanh 1)" },
        { hz: "一个", written: "yí gè", spoken: "yí gè", vi: "Một cái (trước thanh 4 → đọc thanh 2)" },
        { hz: "一杯茶", written: "yì bēi chá", spoken: "yì bēi chá", vi: "Một cốc trà (trước thanh 1 → đọc thanh 4)" },
        { hz: "一本书", written: "yì běn shū", spoken: "yì běn shū", vi: "Một quyển sách (trước thanh 3 → đọc thanh 4)" }
      ]
    },
    {
      title: "4. Quy tắc viết lược 2 dấu chấm trên âm ü (j, q, x, y + ü)",
      formula: "j / q / x / y + ü  ➔  Viết là ju, qu, xu, yu (vẫn ĐỌC TRÒN MÔI âm ü!)",
      explanation: "Vì j, q, x không bao giờ ghép với âm 'u' thường, nên khi viết Pinyin người ta bỏ 2 dấu chấm trên đầu cho gọn, nhưng người học BẮT BUỘC phải đọc tròn môi ü.",
      examples: [
        { hz: "去", written: "qù", spoken: "qǜ (tròn môi)", vi: "Đi" },
        { hz: "学", written: "xué", spoken: "xüé (tròn môi)", vi: "Học" },
        { hz: "月", written: "yuè", spoken: "yüè (tròn môi)", vi: "Tháng / Mặt trăng" }
      ]
    }
  ],

  quadSets: [
    {
      base: "ma",
      items: [
        { tone: 1, py: "mā", hz: "妈", vi: "mẹ" },
        { tone: 2, py: "má", hz: "麻", vi: "tê / cây gai" },
        { tone: 3, py: "mǎ", hz: "马", vi: "con ngựa" },
        { tone: 4, py: "mà", hz: "骂", vi: "mắng" }
      ]
    },
    {
      base: "ba",
      items: [
        { tone: 1, py: "bā", hz: "八", vi: "số 8" },
        { tone: 2, py: "bá", hz: "拔", vi: "nhổ lên" },
        { tone: 3, py: "bǎ", hz: "把", vi: "cầm, nắm" },
        { tone: 4, py: "bà", hz: "爸", vi: "bố" }
      ]
    },
    {
      base: "shi",
      items: [
        { tone: 1, py: "shī", hz: "师", vi: "thầy (老师)" },
        { tone: 2, py: "shí", hz: "十", vi: "mười (10)" },
        { tone: 3, py: "shǐ", hz: "使", vi: "khiến cho, dùng" },
        { tone: 4, py: "shì", hz: "是", vi: "là" }
      ]
    },
    {
      base: "mai / man",
      items: [
        { tone: 1, py: "mān", hz: "颟", vi: "lơ đễnh" },
        { tone: 2, py: "mán", hz: "瞒", vi: "giấu giếm" },
        { tone: 3, py: "mǎi", hz: "买", vi: "MUA (thanh 3)" },
        { tone: 4, py: "mài", hz: "卖", vi: "BÁN (thanh 4)" }
      ]
    },
    {
      base: "tang",
      items: [
        { tone: 1, py: "tāng", hz: "汤", vi: "canh, súp" },
        { tone: 2, py: "táng", hz: "糖", vi: "đường, kẹo" },
        { tone: 3, py: "tǎng", hz: "躺", vi: "nằm nghỉ" },
        { tone: 4, py: "tàng", hz: "烫", vi: "nóng bỏng" }
      ]
    }
  ],

  listeningDrills: [
    { id: "pd1", audioText: "妈", correctPy: "mā", correctTone: 1, options: ["mā (Thanh 1)", "má (Thanh 2)", "mǎ (Thanh 3)", "mà (Thanh 4)"], hint: "Âm cao ngang và đều – 妈 (mẹ)." },
    { id: "pd2", audioText: "马", correctPy: "mǎ", correctTone: 3, options: ["mā (Thanh 1)", "má (Thanh 2)", "mǎ (Thanh 3)", "mà (Thanh 4)"], hint: "Giọng trầm xuống thấp rồi nâng lên – 马 (con ngựa)." },
    { id: "pd3", audioText: "买", correctPy: "mǎi", correctTone: 3, options: ["māi (Thanh 1)", "mái (Thanh 2)", "mǎi (Thanh 3 - mua)", "mài (Thanh 4 - bán)"], hint: "Thanh 3 trầm xuống – 买 (mua), phân biệt với 卖 (mài - bán)!" },
    { id: "pd4", audioText: "卖", correctPy: "mài", correctTone: 4, options: ["māi (Thanh 1)", "mái (Thanh 2)", "mǎi (Thanh 3 - mua)", "mài (Thanh 4 - bán)"], hint: "Hạ giọng mạnh và dứt khoát từ cao xuống thấp – 卖 (bán)." },
    { id: "pd5", audioText: "十", correctPy: "shí", correctTone: 2, options: ["shī (Thanh 1)", "shí (Thanh 2 - số 10)", "shǐ (Thanh 3)", "shì (Thanh 4 - là)"], hint: "Giọng đi lên rõ rệt từ trung lên cao – 十 (số 10)." },
    { id: "pd6", audioText: "是", correctPy: "shì", correctTone: 4, options: ["shī (Thanh 1)", "shí (Thanh 2 - số 10)", "shǐ (Thanh 3)", "shì (Thanh 4 - là)"], hint: "Dứt khoát đi xuống – 是 (là)." },
    { id: "pd7", audioText: "学", correctPy: "xué", correctTone: 2, options: ["xuē (Thanh 1)", "xué (Thanh 2 - học)", "xuě (Thanh 3 - tuyết)", "xuè (Thanh 4)"], hint: "Tròn môi üe và vút lên Thanh 2 – 学 (học)." },
    { id: "pd8", audioText: "喝", correctPy: "hē", correctTone: 1, options: ["hē (Thanh 1 - uống)", "hé (Thanh 2 - và)", "hě (Thanh 3)", "hè (Thanh 4)"], hint: "Cao ngang đều Thanh 1 – 喝 (uống), khác với 和 (hé - và, Thanh 2)." }
  ],

  wholeSyllables: [
    { symbol: "zhi", readAudio: "知", readPy: "zhī", note: "Đọc liền, uốn cong lưỡi, KHÔNG đánh vần thành 'i' (nghe gần 'trư' không bật hơi).", example: "知道 (zhīdào - biết)" },
    { symbol: "chi", readAudio: "吃", readPy: "chī", note: "Đọc liền, uốn cong lưỡi + BẬT HƠI mạnh (nghe gần 'trư' bật hơi).", example: "吃饭 (chīfàn - ăn cơm)" },
    { symbol: "shi", readAudio: "诗", readPy: "shī", note: "Đọc liền, uốn cong lưỡi ma sát (nghe gần 'sư' cong lưỡi).", example: "老师 (lǎoshī - giáo viên)" },
    { symbol: "ri", readAudio: "日", readPy: "rì", note: "Đọc liền, uốn cong lưỡi rung thanh nhẹ (không rung đầu lưỡi).", example: "生日 (shēngrì - sinh nhật)" },
    { symbol: "zi", readAudio: "资", readPy: "zī", note: "Đầu lưỡi THẲNG chạm sau răng trên, không bật hơi (nghe gần 'chư/dư' thẳng lưỡi).", example: "汉字 (hànzì - chữ Hán)" },
    { symbol: "ci", readAudio: "雌", readPy: "cī", note: "Đầu lưỡi THẲNG + BẬT HƠI xì mạnh qua kẽ răng.", example: "词语 (cíyǔ - từ ngữ)" },
    { symbol: "si", readAudio: "思", readPy: "sī", note: "Đầu lưỡi THẲNG, xì hơi sắc nét (không cong lưỡi!).", example: "意思 (yìsi - ý nghĩa)" },
    { symbol: "yi", readAudio: "衣", readPy: "yī", note: "Đọc trực tiếp như 'i' dài, sạch âm.", example: "医生 (yīshēng - bác sĩ)" },
    { symbol: "wu", readAudio: "乌", readPy: "wū", note: "Đọc trực tiếp như 'u' tròn môi.", example: "上午 (shàngwǔ - buổi sáng)" },
    { symbol: "yu", readAudio: "迂", readPy: "yū", note: "Đọc tròn môi âm 'ü' (giữ nguyên môi tròn từ đầu đến cuối).", example: "下雨 (xiàyǔ - trời mưa)" },
    { symbol: "ye", readAudio: "耶", readPy: "yē", note: "Đọc như 'iê'.", example: "也 (yě - cũng)" },
    { symbol: "yue", readAudio: "约", readPy: "yuē", note: "Đọc tròn môi 'üyê'.", example: "月 (yuè - tháng/trăng)" },
    { symbol: "yuan", readAudio: "冤", readPy: "yuān", note: "Đọc tròn môi 'üyên'.", example: "远 (yuǎn - xa)" },
    { symbol: "yin", readAudio: "音", readPy: "yīn", note: "Đọc như 'in' mũi trước.", example: "音乐 (yīnyuè - âm nhạc)" },
    { symbol: "yun", readAudio: "晕", readPy: "yūn", note: "Đọc tròn môi 'uyn' mũi trước.", example: "运动 (yùndòng - vận động)" },
    { symbol: "ying", readAudio: "英", readPy: "yīng", note: "Đọc như 'iêng/inh' vang mũi sau (-ng).", example: "英语 (Yīngyǔ - tiếng Anh)" }
  ],

  contrastGroups: [
    {
      id: "aspirated",
      title: "1. Âm KHÔNG bật hơi vs BẬT HƠI (Quan trọng nhất với người Việt!)",
      warning: "LƯU Ý NGỮ ÂM QUAN TRỌNG: Trong tiếng Trung, b/d/g là phụ âm VÔ THANH KHÔNG BẬT HƠI — KHÔNG giống b/đ/g (hữu thanh) của tiếng Việt! Còn p/t/k là phụ âm VÔ THANH BẬT HƠI MẠNH. Mẹo kiểm tra: Đặt tờ giấy mỏng trước miệng — đọc b/d/g giấy đứng yên, đọc p/t/k giấy phải bay rõ rệt!",
      pairs: [
        {
          key: "b/p",
          a: "b", b: "p",
          artA: "bilabial", artB: "bilabial_asp",
          explain: "b (vô thanh, không bật hơi — gần 'p' nhẹ không hơi) vs p (bật luồng hơi mạnh từ hai môi — giấy trước miệng bay mạnh!).",
          syllables: [
            { a: { hz: "八", py: "bā", vi: "số 8" }, b: { hz: "趴", py: "pā", vi: "nằm sấp" } },
            { a: { hz: "白", py: "bái", vi: "trắng" }, b: { hz: "排", py: "pái", vi: "xếp hàng" } },
            { a: { hz: "杯", py: "bēi", vi: "cái cốc" }, b: { hz: "陪", py: "péi", vi: "đi cùng" } }
          ],
          words: [
            { a: { hz: "爸爸", py: "bàba", vi: "bố" }, b: { hz: "害怕", py: "hàipà", vi: "sợ hãi" } },
            { a: { hz: "面包", py: "miànbāo", vi: "bánh mì" }, b: { hz: "跑步", py: "pǎobù", vi: "chạy bộ" } }
          ],
          sentences: [
            { a: { hz: "我买了一个杯子。", py: "Wǒ mǎi le yí gè bēizi.", vi: "Tôi mua một cái cốc." }, b: { hz: "我喜欢跑步。", py: "Wǒ xǐhuan pǎobù.", vi: "Tôi thích chạy bộ." } }
          ]
        },
        {
          key: "d/t",
          a: "d", b: "t",
          artA: "alveolar", artB: "alveolar_asp",
          explain: "d (đầu lưỡi chạm lợi trên, KHÔNG bật hơi — gần 't' tiếng Việt, không phải 'đ') vs t (cùng vị trí nhưng BẬT HƠI mạnh như 'th' bật gió).",
          syllables: [
            { a: { hz: "大", py: "dà", vi: "to, lớn" }, b: { hz: "踏", py: "tà", vi: "giẫm, bước" } },
            { a: { hz: "多", py: "duō", vi: "nhiều" }, b: { hz: "拖", py: "tuō", vi: "kéo, trì hoãn" } },
            { a: { hz: "读", py: "dú", vi: "đọc" }, b: { hz: "图", py: "tú", vi: "hình, bản đồ" } }
          ],
          words: [
            { a: { hz: "大家", py: "dàjiā", vi: "mọi người" }, b: { hz: "他们", py: "tāmen", vi: "họ" } },
            { a: { hz: "地图", py: "dìtú", vi: "bản đồ" }, b: { hz: "天气", py: "tiānqì", vi: "thời tiết" } }
          ],
          sentences: [
            { a: { hz: "这个苹果很大。", py: "Zhège píngguǒ hěn dà.", vi: "Quả táo này rất to." }, b: { hz: "今天天气太好了。", py: "Jīntiān tiānqì tài hǎo le.", vi: "Hôm nay thời tiết quá đẹp." } }
          ]
        },
        {
          key: "g/k",
          a: "g", b: "k",
          artA: "velar", artB: "velar_asp",
          explain: "g (gốc lưỡi chạm ngạc mềm, KHÔNG bật hơi — giống 'c/k' nhẹ tiếng Việt) vs k (BẬT HƠI mạnh từ cổ họng).",
          syllables: [
            { a: { hz: "哥", py: "gē", vi: "anh trai" }, b: { hz: "科", py: "kē", vi: "khoa, môn" } },
            { a: { hz: "高", py: "gāo", vi: "cao" }, b: { hz: "考", py: "kǎo", vi: "thi" } },
            { a: { hz: "狗", py: "gǒu", vi: "con chó" }, b: { hz: "口", py: "kǒu", vi: "miệng" } }
          ],
          words: [
            { a: { hz: "哥哥", py: "gēge", vi: "anh trai" }, b: { hz: "咖啡", py: "kāfēi", vi: "cà phê" } },
            { a: { hz: "高兴", py: "gāoxìng", vi: "vui vẻ" }, b: { hz: "考试", py: "kǎoshì", vi: "kỳ thi" } }
          ],
          sentences: [
            { a: { hz: "我哥哥很高。", py: "Wǒ gēge hěn gāo.", vi: "Anh trai tôi rất cao." }, b: { hz: "我明天有考试。", py: "Wǒ míngtiān yǒu kǎoshì.", vi: "Ngày mai tôi có kỳ thi." } }
          ]
        },
        {
          key: "j/q",
          a: "j", b: "q",
          artA: "palatal", artB: "palatal_asp",
          explain: "j và q có vị trí lưỡi y hệt (đầu lưỡi chạm răng dưới, mặt lưỡi nâng lên) — khác nhau ở luồng hơi: j không bật hơi, q bật hơi gió rõ rệt!",
          syllables: [
            { a: { hz: "家", py: "jiā", vi: "nhà" }, b: { hz: "掐", py: "qiā", vi: "bóp, ngắt" } },
            { a: { hz: "几", py: "jǐ", vi: "mấy" }, b: { hz: "起", py: "qǐ", vi: "dậy, lên" } },
            { a: { hz: "见", py: "jiàn", vi: "gặp" }, b: { hz: "千", py: "qiān", vi: "nghìn" } }
          ],
          words: [
            { a: { hz: "今天", py: "jīntiān", vi: "hôm nay" }, b: { hz: "起床", py: "qǐchuáng", vi: "thức dậy" } },
            { a: { hz: "姐姐", py: "jiějie", vi: "chị gái" }, b: { hz: "去年", py: "qùnián", vi: "năm ngoái" } }
          ],
          sentences: [
            { a: { hz: "我在家看书。", py: "Wǒ zài jiā kànshū.", vi: "Tôi đọc sách ở nhà." }, b: { hz: "请进，请坐！", py: "Qǐng jìn, qǐng zuò!", vi: "Mời vào, mời ngồi!" } }
          ]
        },
        {
          key: "zh/ch",
          a: "zh", b: "ch",
          artA: "retroflex", artB: "retroflex_asp",
          explain: "Cả hai đều UỐN CONG ĐẦU LƯỠI lên ngạc cứng: zh không bật hơi, ch bật hơi mạnh ra ngoài.",
          syllables: [
            { a: { hz: "知", py: "zhī", vi: "biết" }, b: { hz: "吃", py: "chī", vi: "ăn" } },
            { a: { hz: "找", py: "zhǎo", vi: "tìm" }, b: { hz: "炒", py: "chǎo", vi: "xào" } },
            { a: { hz: "中", py: "zhōng", vi: "giữa" }, b: { hz: "冲", py: "chōng", vi: "xông, pha" } }
          ],
          words: [
            { a: { hz: "中国", py: "Zhōngguó", vi: "Trung Quốc" }, b: { hz: "吃饭", py: "chīfàn", vi: "ăn cơm" } },
            { a: { hz: "知道", py: "zhīdào", vi: "biết" }, b: { hz: "唱歌", py: "chànggē", vi: "hát" } }
          ],
          sentences: [
            { a: { hz: "我知道他的名字。", py: "Wǒ zhīdào tā de míngzi.", vi: "Tôi biết tên anh ấy." }, b: { hz: "我喜欢吃中国菜。", py: "Wǒ xǐhuan chī Zhōngguó cài.", vi: "Tôi thích ăn món Trung Quốc." } }
          ]
        },
        {
          key: "z/c",
          a: "z", b: "c",
          artA: "dental", artB: "dental_asp",
          explain: "Cả hai đều để LƯỠI THẲNG chạm mặt sau răng trên: z không bật hơi, c bật hơi xì mạnh qua kẽ răng.",
          syllables: [
            { a: { hz: "资", py: "zī", vi: "tư liệu" }, b: { hz: "雌", py: "cī", vi: "giống cái" } },
            { a: { hz: "在", py: "zài", vi: "ở, tại" }, b: { hz: "菜", py: "cài", vi: "món ăn/rau" } },
            { a: { hz: "早", py: "zǎo", vi: "sớm" }, b: { hz: "草", py: "cǎo", vi: "cỏ" } }
          ],
          words: [
            { a: { hz: "再见", py: "zàijiàn", vi: "tạm biệt" }, b: { hz: "菜单", py: "càidān", vi: "thực đơn" } },
            { a: { hz: "早上", py: "zǎoshang", vi: "buổi sáng" }, b: { hz: "超市", py: "chāoshì", vi: "siêu thị" } }
          ],
          sentences: [
            { a: { hz: "早上好！", py: "Zǎoshang hǎo!", vi: "Chào buổi sáng!" }, b: { hz: "这个菜很好吃。", py: "Zhège cài hěn hǎochī.", vi: "Món này rất ngon." } }
          ]
        }
      ]
    },
    {
      id: "retroflex",
      title: "2. Âm CONG LƯỠI (zh, ch, sh, r) vs THẲNG LƯỠI (z, c, s, l)",
      warning: "Người Việt miền Bắc thường đọc trộn zh/z, ch/c, sh/s. Hãy tập quan sát đầu lưỡi: nhóm zh/ch/sh/r đầu lưỡi UỐN NGƯỢC LÊN ngạc cứng (âm trầm, dày); nhóm z/c/s đầu lưỡi THẲNG sát răng cửa (âm sắc, mảnh).",
      pairs: [
        {
          key: "zh/z",
          a: "zh", b: "z",
          artA: "retroflex", artB: "dental",
          explain: "zh (uốn cong đầu lưỡi lên trên, âm dày) vs z (đầu lưỡi thẳng chạm sau răng trên, âm sắc mảnh). Cả hai đều không bật hơi.",
          syllables: [
            { a: { hz: "知", py: "zhī", vi: "biết" }, b: { hz: "资", py: "zī", vi: "vốn/tư liệu" } },
            { a: { hz: "找", py: "zhǎo", vi: "tìm" }, b: { hz: "早", py: "zǎo", vi: "sớm" } },
            { a: { hz: "住", py: "zhù", vi: "ở, sống" }, b: { hz: "租", py: "zū", vi: "thuê" } }
          ],
          words: [
            { a: { hz: "知道", py: "zhīdào", vi: "biết" }, b: { hz: "自己", py: "zìjǐ", vi: "bản thân" } },
            { a: { hz: "准备", py: "zhǔnbèi", vi: "chuẩn bị" }, b: { hz: "早上", py: "zǎoshang", vi: "buổi sáng" } }
          ],
          sentences: [
            { a: { hz: "我住在学校附近。", py: "Wǒ zhù zài xuéxiào fùjìn.", vi: "Tôi sống gần trường." }, b: { hz: "我每天早上七点起床。", py: "Wǒ měitiān zǎoshang qī diǎn qǐchuáng.", vi: "Mỗi sáng 7 giờ tôi thức dậy." } }
          ]
        },
        {
          key: "ch/c",
          a: "ch", b: "c",
          artA: "retroflex_asp", artB: "dental_asp",
          explain: "Cả hai đều BẬT HƠI mạnh, nhưng ch uốn cong đầu lưỡi (trầm, dày) còn c thẳng đầu lưỡi sát răng (bật gió 'ts' sắc).",
          syllables: [
            { a: { hz: "吃", py: "chī", vi: "ăn" }, b: { hz: "次", py: "cì", vi: "lần" } },
            { a: { hz: "茶", py: "chá", vi: "trà" }, b: { hz: "擦", py: "cā", vi: "lau, chùi" } },
            { a: { hz: "长", py: "cháng", vi: "dài" }, b: { hz: "藏", py: "cáng", vi: "giấu" } }
          ],
          words: [
            { a: { hz: "喝茶", py: "hē chá", vi: "uống trà" }, b: { hz: "一次", py: "yí cì", vi: "một lần" } },
            { a: { hz: "出发", py: "chūfā", vi: "xuất phát" }, b: { hz: "聪明", py: "cōngming", vi: "thông minh" } }
          ],
          sentences: [
            { a: { hz: "我想喝一杯茶。", py: "Wǒ xiǎng hē yì bēi chá.", vi: "Tôi muốn uống một tách trà." }, b: { hz: "这是我第一次来中国。", py: "Zhè shì wǒ dì yī cì lái Zhōngguó.", vi: "Đây là lần đầu tôi đến Trung Quốc." } }
          ]
        },
        {
          key: "sh/s",
          a: "sh", b: "s",
          artA: "retroflex", artB: "dental",
          explain: "sh (uốn cong đầu lưỡi, luồng hơi xì trầm dày) vs s (thẳng lưỡi sát răng, âm 'x' sắc nét).",
          syllables: [
            { a: { hz: "十", py: "shí", vi: "số 10" }, b: { hz: "四", py: "sì", vi: "số 4" } },
            { a: { hz: "山", py: "shān", vi: "núi" }, b: { hz: "三", py: "sān", vi: "số 3" } },
            { a: { hz: "书", py: "shū", vi: "sách" }, b: { hz: "苏", py: "sū", vi: "tô/tỉnh lại" } }
          ],
          words: [
            { a: { hz: "老师", py: "lǎoshī", vi: "giáo viên" }, b: { hz: "公司", py: "gōngsī", vi: "công ty" } },
            { a: { hz: "时间", py: "shíjiān", vi: "thời gian" }, b: { hz: "宿舍", py: "sùshè", vi: "ký túc xá" } }
          ],
          sentences: [
            { a: { hz: "四十不是十四。", py: "Sìshí bú shì shísì.", vi: "40 không phải là 14 (câu luyện lưỡi kinh điển!)." }, b: { hz: "我在公司工作。", py: "Wǒ zài gōngsī gōngzuò.", vi: "Tôi làm việc ở công ty." } }
          ]
        },
        {
          key: "r/l",
          a: "r", b: "l",
          artA: "retroflex", artB: "alveolar",
          explain: "r (uốn cong đầu lưỡi mềm, rung thanh nhẹ, KHÔNG rung đầu lưỡi) vs l (đầu lưỡi chạm lợi trên, hơi thoát hai bên lưỡi).",
          syllables: [
            { a: { hz: "人", py: "rén", vi: "người" }, b: { hz: "冷", py: "lěng", vi: "lạnh" } },
            { a: { hz: "热", py: "rè", vi: "nóng" }, b: { hz: "乐", py: "lè", vi: "vui" } },
            { a: { hz: "肉", py: "ròu", vi: "thịt" }, b: { hz: "楼", py: "lóu", vi: "tòa nhà/tầng" } }
          ],
          words: [
            { a: { hz: "认识", py: "rènshi", vi: "quen biết" }, b: { hz: "老师", py: "lǎoshī", vi: "giáo viên" } },
            { a: { hz: "容易", py: "róngyì", vi: "dễ dàng" }, b: { hz: "旅游", py: "lǚyóu", vi: "du lịch" } }
          ],
          sentences: [
            { a: { hz: "认识你很高兴。", py: "Rènshi nǐ hěn gāoxìng.", vi: "Rất vui được quen biết bạn." }, b: { hz: "今天很冷。", py: "Jīntiān hěn lěng.", vi: "Hôm nay rất lạnh." } }
          ]
        }
      ]
    },
    {
      id: "nasals",
      title: "3. Vận mẫu MŨI TRƯỚC (-n) vs MŨI SAU (-ng) & u / ü",
      warning: "Phân biệt -n và -ng: Với -n (an, en, in), kết thúc ĐẦU LƯỠI CHẠM LỢI TRÊN (âm gọn, phía trước). Với -ng (ang, eng, ing, ong), miệng mở hơn, GỐC LƯỠI NÂNG CHẠM NGẠC MỀM (âm vang sâu trong khoang mũi).",
      pairs: [
        {
          key: "an/ang",
          a: "an", b: "ang",
          artA: "nasal_front", artB: "nasal_back",
          explain: "an (đầu lưỡi chạm lợi trên, kết âm gọn) vs ang (mở miệng rộng, vang sâu gốc lưỡi -ng).",
          syllables: [
            { a: { hz: "班", py: "bān", vi: "lớp học" }, b: { hz: "帮", py: "bāng", vi: "giúp đỡ" } },
            { a: { hz: "慢", py: "màn", vi: "chậm" }, b: { hz: "忙", py: "máng", vi: "bận" } },
            { a: { hz: "看", py: "kàn", vi: "nhìn" }, b: { hz: "康", py: "kāng", vi: "khỏe mạnh" } }
          ],
          words: [
            { a: { hz: "上班", py: "shàngbān", vi: "đi làm" }, b: { hz: "帮忙", py: "bāngmáng", vi: "giúp đỡ" } },
            { a: { hz: "饭馆", py: "fànguǎn", vi: "quán ăn" }, b: { hz: "房间", py: "fángjiān", vi: "căn phòng" } }
          ],
          sentences: [
            { a: { hz: "请慢慢说。", py: "Qǐng mànmàn shuō.", vi: "Xin hãy nói từ từ." }, b: { hz: "今天我很忙。", py: "Jīntiān wǒ hěn máng.", vi: "Hôm nay tôi rất bận." } }
          ]
        },
        {
          key: "en/eng",
          a: "en", b: "eng",
          artA: "nasal_front", artB: "nasal_back",
          explain: "en (âm 'ân' gọn, đầu lưỡi chạm lợi trên) vs eng (âm 'âng/ơng' vang mở trong họng).",
          syllables: [
            { a: { hz: "本", py: "běn", vi: "quyển" }, b: { hz: "蹦", py: "bèng", vi: "nhảy cẫng" } },
            { a: { hz: "真", py: "zhēn", vi: "thật" }, b: { hz: "正", py: "zhèng", vi: "đang/chính" } },
            { a: { hz: "门", py: "mén", vi: "cửa" }, b: { hz: "梦", py: "mèng", vi: "giấc mơ" } }
          ],
          words: [
            { a: { hz: "认真", py: "rènzhēn", vi: "nghiêm túc" }, b: { hz: "朋友", py: "péngyou", vi: "bạn bè" } },
            { a: { hz: "我们", py: "wǒmen", vi: "chúng tôi" }, b: { hz: "学生", py: "xuésheng", vi: "học sinh" } }
          ],
          sentences: [
            { a: { hz: "他学习很认真。", py: "Tā xuéxí hěn rènzhēn.", vi: "Anh ấy học rất chăm chỉ." }, b: { hz: "我是大学生。", py: "Wǒ shì dàxuéshēng.", vi: "Tôi là sinh viên đại học." } }
          ]
        },
        {
          key: "in/ing",
          a: "in", b: "ing",
          artA: "nasal_front", artB: "nasal_back",
          explain: "in (đầu lưỡi chạm lợi trên, sắc gọn) vs ing (kéo vang sâu khoang mũi sau, gần 'iêng/inh' vang).",
          syllables: [
            { a: { hz: "新", py: "xīn", vi: "mới" }, b: { hz: "星", py: "xīng", vi: "ngôi sao" } },
            { a: { hz: "今", py: "jīn", vi: "nay" }, b: { hz: "京", py: "jīng", vi: "kinh đô" } },
            { a: { hz: "您", py: "nín", vi: "ngài" }, b: { hz: "宁", py: "níng", vi: "yên bình" } }
          ],
          words: [
            { a: { hz: "今天", py: "jīntiān", vi: "hôm nay" }, b: { hz: "北京", py: "Běijīng", vi: "Bắc Kinh" } },
            { a: { hz: "拼音", py: "pīnyīn", vi: "Pinyin" }, b: { hz: "电影", py: "diànyǐng", vi: "phim ảnh" } }
          ],
          sentences: [
            { a: { hz: "今天是星期一。", py: "Jīntiān shì xīngqīyī.", vi: "Hôm nay là thứ Hai." }, b: { hz: "我想去北京旅游。", py: "Wǒ xiǎng qù Běijīng lǚyóu.", vi: "Tôi muốn đi Bắc Kinh du lịch." } }
          ]
        },
        {
          key: "ian/iang",
          a: "ian", b: "iang",
          artA: "nasal_front", artB: "nasal_back",
          explain: "ian đọc gần 'iên' (mũi trước) vs iang mở rộng miệng 'iang' vang mũi sau.",
          syllables: [
            { a: { hz: "先", py: "xiān", vi: "trước" }, b: { hz: "想", py: "xiǎng", vi: "muốn/nhớ" } },
            { a: { hz: "天", py: "tiān", vi: "trời/ngày" }, b: { hz: "亮", py: "liàng", vi: "sáng" } }
          ],
          words: [
            { a: { hz: "时间", py: "shíjiān", vi: "thời gian" }, b: { hz: "漂亮", py: "piàoliang", vi: "xinh đẹp" } }
          ],
          sentences: [
            { a: { hz: "我没有时间。", py: "Wǒ méiyǒu shíjiān.", vi: "Tôi không có thời gian." }, b: { hz: "你的衣服很漂亮。", py: "Nǐ de yīfu hěn piàoliang.", vi: "Quần áo của bạn rất đẹp." } }
          ]
        },
        {
          key: "uan/uang",
          a: "uan", b: "uang",
          artA: "nasal_front", artB: "nasal_back",
          explain: "uan (oan, gọn đầu lưỡi) vs uang (oang, vang sâu mũi sau).",
          syllables: [
            { a: { hz: "欢", py: "huān", vi: "vui" }, b: { hz: "黄", py: "huáng", vi: "màu vàng" } },
            { a: { hz: "穿", py: "chuān", vi: "mặc" }, b: { hz: "床", py: "chuáng", vi: "cái giường" } }
          ],
          words: [
            { a: { hz: "喜欢", py: "xǐhuan", vi: "thích" }, b: { hz: "起床", py: "qǐchuáng", vi: "thức dậy" } }
          ],
          sentences: [
            { a: { hz: "我喜欢穿白衣服。", py: "Wǒ xǐhuan chuān bái yīfu.", vi: "Tôi thích mặc áo trắng." }, b: { hz: "我六点起床。", py: "Wǒ liù diǎn qǐchuáng.", vi: "Tôi 6 giờ thức dậy." } }
          ]
        },
        {
          key: "ong/eng",
          a: "ong", b: "eng",
          artA: "rounded_u", artB: "nasal_back",
          explain: "ong (tròn môi 'ung' vang mũi sau) vs eng (môi mở tự nhiên 'ơng/âng' vang mũi sau).",
          syllables: [
            { a: { hz: "中", py: "zhōng", vi: "giữa" }, b: { hz: "正", py: "zhèng", vi: "đang" } },
            { a: { hz: "东", py: "dōng", vi: "phía đông" }, b: { hz: "等", py: "děng", vi: "đợi" } }
          ],
          words: [
            { a: { hz: "同学", py: "tóngxué", vi: "bạn học" }, b: { hz: "朋友", py: "péngyou", vi: "bạn bè" } }
          ],
          sentences: [
            { a: { hz: "他是我的同学。", py: "Tā shì wǒ de tóngxué.", vi: "Anh ấy là bạn học của tôi." }, b: { hz: "他是我的好朋友。", py: "Tā shì wǒ de hǎo péngyou.", vi: "Anh ấy là bạn tốt của tôi." } }
          ]
        },
        {
          key: "u/ü",
          a: "u", b: "ü",
          artA: "rounded_u", artB: "rounded_u",
          explain: "u (lưỡi lùi sau, môi tròn bình thường) vs ü (vị trí lưỡi là âm 'i' nhưng giữ môi TRÒN NHỎ cố định như huýt sáo!).",
          syllables: [
            { a: { hz: "路", py: "lù", vi: "con đường" }, b: { hz: "绿", py: "lǜ", vi: "màu xanh lá" } },
            { a: { hz: "努", py: "nǔ", vi: "nỗ lực" }, b: { hz: "女", py: "nǚ", vi: "nữ" } }
          ],
          words: [
            { a: { hz: "努力", py: "nǔlì", vi: "nỗ lực" }, b: { hz: "旅游", py: "lǚyóu", vi: "du lịch" } }
          ],
          sentences: [
            { a: { hz: "我们要努力学习。", py: "Wǒmen yào nǔlì xuéxí.", vi: "Chúng ta phải nỗ lực học tập." }, b: { hz: "我喜欢去中国旅游。", py: "Wǒ xǐhuan qù Zhōngguó lǚyóu.", vi: "Tôi thích đi Trung Quốc du lịch." } }
          ]
        }
      ]
    }
  ]
};
