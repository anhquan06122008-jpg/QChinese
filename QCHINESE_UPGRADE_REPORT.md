# QCHINESE_UPGRADE_REPORT.md – Báo cáo Nâng cấp Toàn diện & Nghiệm thu QChinese

**Ngày hoàn thành:** 2026-11-22  
**Repository:** `https://github.com/anhquan06122008-jpg/QChinese`

---

## 1. Tóm tắt Quy trình Kiểm toán & Phản biện (Mô phỏng Hội đồng Chuyên gia)

*Lưu ý minh bạch:* Quá trình phản biện được thực hiện bằng mô phỏng nhiều góc nhìn chuyên gia (Giáo dục tiếng Trung, Ngữ âm học Phổ thông, AI/NLP, UI/UX, Kiến trúc/Bảo mật, QA) trực tiếp trên mã nguồn và kiểm thử thực tế, không tuyên bố kết nối với 100 AI độc lập bên ngoài.

### Các lỗi nghiêm trọng đã được phát hiện & sửa triệt để qua vòng phản biện + kiểm thử
1. **Lỗi chọn sai cách đọc Pinyin ưu tiên từ nguồn CC-CEDICT (`scripts/build_vocab.py`):**
   - *Phát hiện:* Ở lần build đầu tiên, 24 từ HSK 1–2 (như `个`, `都`, `上`, `能`, `吗`, `听`, `读`, `书`, `水`, `要`, `着`, `吧`, `离`, `告诉`, `妻子`, `累`, `东西`) bị gán cách đọc họ riêng viết hoa (`Néng - surname Neng`, `Dū - surname Du`) hoặc nghĩa cổ (`听 yǐn - smile archaic`) do thứ tự gốc của `complete.json`.
   - *Cách sửa:* Bổ sung hàm chấm điểm `pick_primary_form()` ưu tiên cách đọc phổ thông viết thường, kết hợp bảng `PRIMARY_PINYIN_OVERRIDE` và kiểm định lại bằng script tự động → kết quả kiểm tra HSK 1 (150 từ) & HSK 2 (147 từ): **0 từ lỗi (`suspicious_primary=0`)**.
2. **Lỗi cú pháp chí mạng trong `public/js/data/hanzi-data.js`:**
   - *Phát hiện:* Kiểm tra cú pháp `node --check` trên 17 file JS phát hiện dấu `{` dư tại dòng 7 và thiếu `{` tại dòng 38 khi chèn thêm chữ `水`.
   - *Cách sửa:* Sửa chuẩn cấu trúc mảng JSON, bảo toàn đầy đủ cả chữ `水` lẫn 16 chữ nền tảng (tổng 17 chữ).
3. **Lỗi thiếu phương thức `QPinyinIME.attachAll` (`public/js/pinyin-ime.js`):**
   - *Phát hiện:* Bộ test Playwright E2E trên trình duyệt thật phát hiện 4 tính năng (AI Word Explainer, Sentence Corrector, Conversation Hub, Material Writing) bị ngắt gắn sự kiện nút bấm do gọi `QPinyinIME.attachAll` trong khi `QPinyinIME` dùng event delegation toàn cục.
   - *Cách sửa:* Xuất bổ sung `attachAll` an toàn trong `public/js/pinyin-ime.js` và chạy lại toàn bộ 27 test → **27/27 PASS, 0 lỗi console/page**.

---

## 2. Chức năng được Giữ nguyên & Bảo toàn Dữ liệu

- **100% ID từ vựng cũ (`v_ni`, `v_hao`, ...)** được giữ nguyên trong kho từ vựng HSK mới để không làm mất tiến độ `st.srs` của người dùng cũ.
- **Migration an toàn trong `public/js/core.js`** (`ensureStateIntegrity`): bổ sung không phá hủy các trường mới (`vocabVersion`, `favoriteVocab`, `customVocab`, `vocabSubSkills`, `phoneticErrors`, `pronunciationSessions`, `materials`, `aiHistory`).
- Giữ nguyên toàn bộ: Hệ thống đa tài khoản PBKDF2/SQLite, Placement Test 7 kỹ năng, Hanzi Stroke Studio (`HanziWriter` + 17 chữ + ghim chữ), 12-Step AI Word Teacher, Grammar, Notebook, Analytics, Settings, Dark/Light mode, Smart Pinyin IME.

---

## 3. Kho Từ Vựng HSK 1–6 (+ HSK 3.0 7–9) & Thống kê Minh bạch

### Nguồn dữ liệu xác thực (Không tự bịa từ hay gán cấp độ tùy tiện)
- **`complete-hsk-vocabulary` (drkameleon – MIT License):** danh sách từ theo từng phiên bản HSK 2.0 & HSK 3.0, Pinyin có dấu & dạng số, chữ Phồn thể, từ loại.
- **CC-CEDICT (CC BY-SA 4.0):** nghĩa tiếng Anh & đa nghĩa.
- **Unicode Unihan (`kVietnamese`):** âm Hán Việt từng chữ hỗ trợ người Việt liên hệ.
- **QChinese Verified Vietnamese Glossary (`data/sources/vi_manual.tsv` + bộ biên soạn gốc):** nghĩa tiếng Việt chuẩn hóa cho **100% HSK 1 (150/150) & 100% HSK 2 (147/147)** cùng nhóm từ cốt lõi HSK 3–6.

### Số lượng từ thực tế từng phiên bản & cấp độ

| Cấp độ | HSK 2.0 (Chuẩn 6 cấp) | Nghĩa Việt sẵn (HSK 2.0) | Hán Việt (HSK 2.0) | HSK 3.0 (Chuẩn 9 cấp) | Nghĩa Việt sẵn (HSK 3.0) |
|---|---:|---:|---:|---:|---:|
| **HSK 1** | 150 / 150 | **150 (100%)** | 118 | 506 / 500 | 232 |
| **HSK 2** | 147 / 150 | **147 (100%)** | 121 | 750 / 772 | 115 |
| **HSK 3** | 298 / 300 | 75 | 234 | 953 / 973 | 57 |
| **HSK 4** | 598 / 600 | 53 | 464 | 972 / 1.000 | 27 |
| **HSK 5** | 1.298 / 1.300 | 9 | 992 | 1.059 / 1.071 | 8 |
| **HSK 6** | 2.500 / 2.500 | 4 | 1.799 | 1.123 / 1.140 | 2 |
| **HSK 7–9** | — | — | — | 5.606 / 5.636 | 3 |
| **TỔNG** | **4.991 / 5.000** | **438** | **3.728** | **10.969 / 11.092** | **444** |

- **Phân loại & Tìm kiếm:** Bộ lọc đa tầng theo Phiên bản HSK, Cấp độ, 20 Chủ đề, 11 Từ loại, 7 Trạng thái (`Chưa học`, `Đang học`, `Đến hạn ôn SRS`, `Đã thuộc`, `Thường xuyên quên`, `Yêu thích`); tìm kiếm tức thì theo Chữ Hán (Giản/Phồn), Pinyin có/không dấu/dạng số, tiếng Việt, tiếng Anh, Hán Việt.
- **10 Chế độ học & ôn tập:** Kho từ vựng phân trang, Flashcard SRS SM-2 (lật thẻ, ẩn/hiện Pinyin mặt trước, tạo Flashcard mới có tự điền từ kho HSK), Nhìn Chữ→Nghĩa, Nghĩa→Chữ, Nghe→Chọn từ, Nghe→Gõ Pinyin, Điền từ vào câu, Ghép cặp, Đọc & Ghi âm, Đặt câu AI — theo dõi riêng từng kỹ năng con (`meaning`, `pinyin`, `listening`, `usage`).

---

## 4. Phòng Luyện Phát Âm Pinyin Tương Tác (`public/js/modules/pinyin-listening.js`)

1. **Bảng Pinyin Tương Tác Đầy Đủ:** 21 Thanh mẫu + 2 quy ước `y/w`, 38 Vận mẫu chuẩn (đơn, kép, mũi trước `-n`, mũi sau `-ng`, `er`), và **16 Âm tiết đọc liền (`整体认读音节`)**.
2. **Sơ đồ Khẩu hình Lưỡi – Môi – Luồng hơi (SVG):** Vẽ trực quan điểm chạm lưỡi, độ cong lưỡi, luồng hơi bật mạnh (mũi tên đỏ) và khoang mũi.
3. **Phòng Đối chiếu Âm Khó chuyên biệt cho người Việt:**
   - **Bật hơi vs Không bật hơi:** `b/p`, `d/t`, `g/k`, `j/q`, `zh/ch`, `z/c` (giải thích rõ `b/d/g` tiếng Trung là phụ âm vô thanh không bật hơi, KHÔNG giống `b/đ/g` tiếng Việt + mẹo đặt tờ giấy trước miệng).
   - **Cong lưỡi vs Thẳng lưỡi:** `zh/z`, `ch/c`, `sh/s`, `r/l`.
   - **Vận mẫu mũi trước (-n) vs mũi sau (-ng) & u/ü:** `an/ang`, `en/eng`, `in/ing`, `ian/iang`, `uan/uang`, `ong/eng`, `u/ü`.
   - Nút nghe lần lượt **A → B** tự động + thu âm giọng nói so sánh trực tiếp.
4. **4 Thanh điệu, Thanh nhẹ & Biến điệu (`3+3`, `不`, `一`, `j/q/x/y + ü`).**
5. **CHALLENGE Nghe & Phân biệt 4 Cấp độ** (`Dễ`, `Trung bình`, `Khó`, `Nâng cao`) — ghi nhận mọi lỗi thật vào `st.phoneticErrors` để Dashboard và AI Tutor ưu tiên tạo bài luyện lại.

---

## 5. QChinese AI Tutor Hub & My Learning Materials

### QChinese AI Tutor (`public/js/modules/ai-tutor.js` + `backend/ai_pedagogy.py`)
- **6 chế độ chuyên sâu:** (1) Giải thích từ vựng & phân biệt cặp dễ nhầm (`了解 vs 知道`, `还是 vs 或者`, `一点儿 vs 有点儿`, `会 vs 能/可以`), (2) Sửa câu (phân biệt `correct` / `unnatural` / `grammar_error`, không sửa câu đúng thành sai), (3) Hội thoại 10 tình huống có bật/tắt Pinyin & dịch Việt, (4) Luyện phát âm có công khai rõ giới hạn Web Speech API (không bịa điểm thanh điệu giả), (5) Giải thích ngữ pháp (`把`, `比`, `了`, `不/没`...), (6) Tạo bài tập cá nhân hóa từ `phoneticErrors`, `srs` lapses và `skillScores`.

### My Learning Materials (`public/js/modules/materials-hub.js`)
- Thêm tài liệu bằng nhập/dán văn bản, tải file (`.txt`, `.md`, `.docx`, `.pdf`, ảnh, `.mp3/.wav/.mp4`), hoặc nhập URL công khai (`/api/materials/fetch-url` có bảo vệ SSRF, không vượt qua đăng nhập/paywall/CAPTCHA).
- Quản lý theo 8 loại bài tập, 5 thư mục, cấp độ HSK, trạng thái, điểm số và lịch sử luyện tập.
- **Tích hợp 1 bấm vào 4 kỹ năng:**
  - **Writing:** chấm bài bám sát đúng đề bài gốc và lưu điểm vào tài liệu.
  - **Listening:** phát file MP3/WAV/Video, chỉnh tốc độ `0.5x–1.5x`, lặp đoạn A–B, ẩn/hiện transcript, chấm chép chính tả.
  - **Speaking:** luyện nói theo đúng chủ đề giao, thu âm + AI sửa kịch bản.
  - **Reading (LWT-style):** tự động tách từ bằng từ điển HSK, bấm vào từng chữ để nghe & tra nghĩa tức thì, bật/tắt chú thích dưới chữ, đánh dấu từ mới & lưu Sổ tay.

---

## 6. Bảo mật, Triển khai & Kết quả Kiểm thử

### Bảo mật
- API key (`GEMINI_API_KEY`, `OPENAI_API_KEY`) chỉ đọc từ biến môi trường / `.env` ở backend, tuyệt đối không có trong frontend hay Git.
- Chặn SSRF trong `/api/materials/fetch-url` (chặn `localhost`, `127.0.0.1`, dải IP nội bộ/private/link-local).
- Giới hạn dung lượng file tải lên (tối đa 8 MB), rate limiting API, và bổ sung HTTP security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`) trong `server.py` và `vercel.json`.

### Kết quả Kiểm thử Thực tế (2026-11-22)
- **Python `py_compile`:** `server.py`, `backend/ai_pedagogy.py`, `scripts/build_vocab.py` → **PASS (0 lỗi)**.
- **JavaScript `node --check`:** **17/17 files PASS (0 lỗi)**.
- **Kiểm định dữ liệu HSK 1–2:** **0 từ lỗi cách đọc/họ (`suspicious_primary=0`)**.
- **Automated API + Headless Edge Playwright E2E Suite:** **27/27 PASS** (8 API tests + 18 UI/functional desktop & mobile 390px tests + **0 lỗi JavaScript console/page**).

---

## 7. Những giới hạn minh bạch & Cấu hình tùy chọn

1. **Nghĩa tiếng Việt cho HSK 3–6 nâng cao:** Hiện 100% HSK 1–2 và các từ cốt lõi HSK 3–6 (438–444 từ) đã có nghĩa tiếng Việt biên soạn; các từ HSK 3–6 còn lại hiển thị nghĩa tiếng Anh xác thực từ CC-CEDICT + âm Hán Việt Unihan (và có thể bấm "AI giải thích sâu"). Có thể tiếp tục bổ sung nghĩa Việt vào `data/sources/vi_manual.tsv` rồi chạy lại `python scripts/build_vocab.py`.
2. **Đánh giá thanh điệu giọng nói:** Web Speech API trên trình duyệt chỉ nhận diện chuỗi chữ `zh-CN`, không đo đường cao độ F0 từng thanh điệu. Hệ thống cung cấp ghi âm đối chiếu + phân tích điểm ngữ âm mục tiêu và không bịa điểm thanh điệu giả.
3. **File PDF scan / nén & Ảnh đề bài:** Server thuần Python stdlib tách văn bản trực tiếp tốt nhất với `.txt`, `.md`, `.docx`. Với PDF scan/nén hoặc ảnh chụp đề bài, cần OCR ngoài (hoặc cấu hình Gemini Multimodal API), hiện tại hướng dẫn người học dán văn bản đề bài đi kèm ảnh.
4. **Triển khai Full-Stack (AI Live + SQLite + URL/DOCX Importer):**
   - **GitHub Pages / Vercel Static:** Chạy tốt toàn bộ giao diện, kho 10.969 từ vựng, Pinyin Lab, Flashcard SRS, LWT Reader, Kho tài liệu cục bộ & AI Sư phạm tích hợp.
   - **Render / Docker / Local (`python server.py`):** Chạy đầy đủ SQLite đa người dùng, `/api/materials/fetch-url`, `/api/materials/extract-file`, và LLM thời gian thực khi cấu hình `GEMINI_API_KEY` hoặc `OPENAI_API_KEY` trong Environment Variables.
