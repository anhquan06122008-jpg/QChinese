# PROJECT_AUDIT.md – Báo cáo Kiểm toán Hệ thống QChinese (Giai đoạn 1)

**Ngày kiểm toán:** 2026-11-22  
**Thư mục dự án:** `c:\Users\anhqu\Downloads\QChinese`  
**Repository GitHub:** `https://github.com/anhquan06122008-jpg/QChinese`

---

## 1. Kiến trúc & Công nghệ hiện tại

| Thành phần | Công nghệ hiện có | Ghi chú kiểm toán |
|---|---|---|
| **Backend** | Python 3.10+ Standard Library (`server.py`, `ThreadingHTTPServer`), không cần pip bên ngoài | Ổn định, nhẹ, dễ triển khai trên Render / Docker / local. Đã có `backend/ai_pedagogy.py` (Gemini / OpenAI + pedagogical fallback). |
| **Database** | SQLite (`data/qchinese.db`, WAL mode, foreign keys) | Lưu `users`, `sessions`, `user_states` (JSON blob), kèm fallback `localStorage` cho bản tĩnh GitHub Pages / Vercel. |
| **Auth & Bảo mật** | PBKDF2-HMAC-SHA256 + random salt + SHA-256 session token + sliding-window rate limiter | Tốt. Cần bổ sung security headers HTTP và kiểm tra SSRF / giới hạn kích thước khi thêm tính năng nhập URL & tài liệu. |
| **Frontend** | Vanilla HTML5 / CSS3 / Modular ES6 (`public/index.html`, `public/css/styles.css`, `public/js/`) | Không cần build step nặng, tương thích tốt desktop/mobile, có Dark/Light mode và Smart Pinyin IME (`pinyin-ime.js`). |
| **Hanzi Stroke Engine** | `HanziWriter` (`public/vendor/hanzi-writer.min.js`) + cache `Make Me a Hanzi` (`/api/strokes`) | Hoạt động tốt, dữ liệu bút thuận xác thực. |
| **TTS & Speech** | Backend proxy `/api/tts` + Web Speech API (`zh-CN`) + MediaRecorder / SpeechRecognition | Hoạt động tốt ở chế độ có mạng; cần công khai rõ giới hạn đánh giá thanh điệu của Web Speech API. |
| **QEnglish** | Không tìm thấy mã nguồn QEnglish trong workspace được cấp quyền | Không sao chép giả định; thiết kế khu vực **QChinese AI Tutor** chuyên biệt cho tiếng Trung theo đúng chuẩn sư phạm trong yêu cầu. |

---

## 2. Kiểm kê các chức năng hiện có

### Đang hoạt động tốt (Cần bảo toàn 100%)
1. **Hệ thống đa tài khoản** (Đăng ký/Đăng nhập/Đổi tài khoản, lưu tiến độ riêng biệt từng người, Sao lưu & Khôi phục JSON).
2. **Dashboard & Placement Test 7 kỹ năng** + Lộ trình HSK 1–6 (không tự động nhảy cấp theo số ngày).
3. **Hanzi Studio (15 thông tin chữ Hán + Bút thuận SVG + Bảng luyện viết chấm điểm + Ghim chữ chọn nhanh)**.
4. **Smart Pinyin IME** (gõ Pinyin hiện gợi ý chữ Hán Giản thể + dấu thanh).
5. **Grammar, Listening Replay, Reading cơ bản, Writing (Phần A chữ Hán + Phần B câu/đoạn 7 tiêu chí), Notebook, Analytics, Settings**.

### Hạn chế nghiêm trọng & Phần còn thiếu cần nâng cấp
1. **Kho từ vựng quá ít (Nghiêm trọng nhất):**
   - Hiện tại `public/js/data/vocab-data.js` chỉ có **35 từ mẫu**:
     - HSK 1: **21 từ** (thiếu 129 từ so với HSK 2.0 chuẩn 150 từ)
     - HSK 2: **5 từ** (thiếu 145 từ)
     - HSK 3: **3 từ** (thiếu 297 từ)
     - HSK 4: **2 từ** (thiếu 598 từ)
     - HSK 5: **2 từ** (thiếu 1.298 từ)
     - HSK 6: **2 từ** (thiếu 2.498 từ)
   - Chưa phân biệt phiên bản HSK 2.0 (6 cấp – 5.000 từ) và HSK 3.0 (9 cấp).
   - Chưa có bộ lọc theo từ loại (POS), trạng thái ghi nhớ, từ hay sai, yêu thích, hoặc tìm kiếm đa ngôn ngữ toàn kho.
2. **Phòng luyện Pinyin chưa đủ chiều sâu tương tác cho người Việt:**
   - Mới dừng ở bảng tra cứu và vài câu quiz cơ bản.
   - Thiếu sơ đồ minh họa vị trí lưỡi/môi trực quan (SVG), thiếu khu vực **đối chiếu chuyên sâu** âm bật hơi (`b/p`, `d/t`, `g/k`, `j/q`, `zh/ch`, `z/c`), âm cong lưỡi vs thẳng lưỡi (`zh/z`, `ch/c`, `sh/s`, `r/l`), vận mẫu mũi `-n/-ng` (`an/ang`, `en/eng`, `in/ing`, `ian/iang`, `uan/uang`, `ong/eng`), thiếu 16 âm tiết đọc liền (整体认读音节), và chưa lưu lịch sử lỗi âm để cá nhân hóa.
3. **Thiếu trung tâm QChinese AI Tutor chuyên biệt:**
   - Hiện AI nằm rải rác ở Speaking/Writing/Analytics.
   - Chưa có các công cụ độc lập: AI Giải thích từ vựng sâu (phân biệt từ dễ nhầm như `了解` vs `知道`), AI Sửa câu (phân biệt sai ngữ pháp vs chưa tự nhiên vs trang trọng/khẩu ngữ), AI Giải thích ngữ pháp, AI Luyện phát âm có đối chiếu âm tiết, AI Tạo bài tập cá nhân hóa từ lỗi thực tế, và 10 tình huống hội thoại có bật/tắt dịch & Pinyin.
4. **Thiếu My Learning Materials (Kho tài liệu cá nhân) & Tích hợp 4 kỹ năng:**
   - Người học chưa thể tải đề bài/file (PDF, DOCX, TXT, ảnh, MP3/WAV, video) hoặc nhập URL bài học công khai để đưa trực tiếp vào luyện Writing, Listening (có tốc độ + lặp đoạn A–B), Speaking theo chủ đề giảng viên giao, và Reading tương tác bấm tra từng từ (kiểu LWT).

---

## 3. Chiến lược Bảo toàn Dữ liệu & Migration

- **Bảo toàn 100% ID từ cũ (`v_ni`, `v_hao`, ...)** trong bộ dữ liệu HSK mới để không mất bất kỳ thẻ `st.srs` nào của người dùng đã học.
- **Migration an toàn trong `ensureStateIntegrity()` (`public/js/core.js`):** chỉ bổ sung các khóa mới (`vocabVersion`, `favoriteVocab`, `customVocab`, `vocabSubSkills`, `phoneticErrors`, `pronunciationSessions`, `materials`, `materialHistory`, `aiHistory`) với giá trị mặc định nếu chưa tồn tại.
- **Tải dữ liệu từ vựng theo từng cấp độ (`public/data/vocab/{hsk2|hsk3}/L1..L7.json`):** giữ tốc độ tải trang ban đầu nhanh, hoạt động đồng bộ trên cả Python Backend, Render, Vercel và GitHub Pages.
- **Bảo mật:** Không lưu API key trong frontend hay Git; bổ sung lọc SSRF khi nhập URL công khai và kiểm tra kích thước/định dạng file tải lên.
