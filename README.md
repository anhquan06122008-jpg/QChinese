# CHINESE PERSONAL TUTOR – AI 汉语私人教师 (QChinese)

Hệ thống học **Tiếng Trung Giản Thể (简体中文)** cá nhân hóa từ con số 0 đến **HSK 6**, được thiết kế chuyên biệt cho người Việt Nam mới bắt đầu.

---

## 🌟 Tính Năng Cốt Lõi

1. **100% Chữ Hán Giản Thể (简体中文):** Không trộn chữ Phồn thể; tự động phát hiện và hướng dẫn chuyển sang Giản thể nếu người học gõ nhầm.
2. **Đa Tài Khoản & Mật Khẩu Độc Lập (Multi-User Accounts):**
   - Đăng ký / Đăng nhập bằng tên tài khoản và mật khẩu riêng (mã hóa băm mật khẩu `PBKDF2-HMAC-SHA256` lưu trên `SQLite`).
   - Khi chia sẻ website cho bạn bè hoặc người thân cùng học, **mỗi người có một tài khoản riêng biệt**, tuyệt đối không bị trùng tiến độ, sổ tay hay điểm số.
3. **Bộ Gợi Ý Pinyin → Chữ Hán Thông Minh (Smart Pinyin IME):**
   - Chưa biết gõ tiếng Trung? Chỉ cần gõ Pinyin (ví dụ: `nihao`, `xihuan`, `xuesheng`, `lvyou` hoặc `ni3`) tại bất kỳ ô luyện tập nào, thanh gợi ý sẽ hiển thị ngay các từ tiếng Trung Giản thể kèm dấu thanh điệu chuẩn và nghĩa tiếng Việt.
4. **Hệ Thống Học Chữ Hán Chuyên Sâu (15 Thông Tin + Bút Thuận Chuẩn):**
   - Tích hợp dữ liệu thứ tự nét xác thực từ `Make Me a Hanzi` (`HanziWriter`).
   - Có dải ô phân tách từng nét màu đỏ chu sa, hoạt ảnh `Phát / Tạm dừng / Xem chậm / Xem từng nét`, và bảng luyện viết tương tác chấm thứ tự nét, hướng bút & bố cục ô vuông `米字格`.
5. **Đầy Đủ 13 Phân Khu Chức Năng:**
   - `Dashboard` & Nhiệm vụ hàng ngày tùy chỉnh
   - `Đánh giá trình độ` (Placement Test 7 kỹ năng + Thi vượt cấp HSK 1–6 theo năng lực thực tế)
   - `Học từ vựng` Ba ngôn ngữ Trung – Anh – Việt (8 chế độ học + Lặp lại ngắt quãng SRS + AI dạy từ mới 12 bước)
   - `Học chữ Hán` chuyên sâu
   - `Pinyin & Phát âm` (23 Thanh mẫu, Vận mẫu đơn/kép/mũi, Ghép âm, 4 Thanh điệu + Thanh nhẹ + Biến điệu, Thu âm giọng đọc so sánh âm mẫu)
   - `Ngữ pháp` HSK 1–6 (Công thức, lỗi người Việt hay mắc & 4 dạng bài tập)
   - `Luyện nghe` (Trình phát hội thoại ẩn/hiện Pinyin & dịch, tốc độ `0.5x–1.25x`, 4 bài tập sau nghe)
   - `Luyện nói AI` (8 tình huống cơ bản & Hội thoại tự do theo HSK)
   - `Luyện đọc` màn hình đôi (Bấm từng từ xem nghĩa, nghe âm, đánh dấu từ mới, lưu sổ tay & trắc nghiệm đọc hiểu)
   - `Luyện viết` (Phần A viết nét chữ Hán & Phần B viết câu/đoạn chấm sửa AI theo **7 tiêu chí**)
   - `Sổ tay cá nhân` (7 danh mục, tìm kiếm, sửa, xuất JSON, ôn tập Flashcard)
   - `Thống kê tiến độ` (12 chỉ số, biểu đồ Ngày/Tuần/Tháng & AI nhận xét đề xuất)
   - `Cài đặt` (Light/Dark Mode, Sao lưu/Phục hồi JSON, Quản lý tài khoản & mật khẩu)

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Trên Máy Tính

Dự án sử dụng **Python 3 Standard Library + SQLite** nên **không cần cài đặt thêm thư viện ngoài** phức tạp.

### Cách 1 (Nhanh nhất trên Windows)
Nháy đúp vào file [`start.bat`](./start.bat) trong thư mục dự án, hoặc chạy trong PowerShell:
```powershell
.\start.bat
```

### Cách 2 (Chạy trực tiếp bằng dòng lệnh)
```bash
python server.py
```
Sau đó mở trình duyệt tại địa chỉ: **`http://localhost:8000`**

---

## 🔐 Hướng Dẫn Cấu Hình API AI An Toàn

Hệ thống có sẵn **Động cơ Sư phạm Tiếng Trung tích hợp** nên mọi tính năng chấm câu 7 tiêu chí, hội thoại và phân tích tiến độ **hoạt động ngay lập tức** kể cả khi chưa điền API Key.

Nếu bạn muốn kết nối mô hình **Google Gemini** hoặc **OpenAI** để mở rộng hội thoại tự do không giới hạn:
1. Sao chép file `.env.example` thành `.env`:
   ```bash
   cp .env.example .env
   ```
2. Mở file `.env` và điền khóa của bạn (khóa chỉ nằm ở Backend, **tuyệt đối không lộ ra Frontend** và đã được chặn trong `.gitignore`):
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.5-flash
   ```
3. Khởi động lại `server.py`.

---

## ☁️ Hướng Dẫn Deploy (Triển Khai Lên Cloud Chia Sẻ Cho Bạn Bè)

- **Render / Railway:** Dự án đã chuẩn bị sẵn [`render.yaml`](./render.yaml) và [`Dockerfile`](./Dockerfile). Chỉ cần đẩy mã nguồn lên GitHub (lưu ý không đẩy `.env`), kết nối kho chứa với Render/Railway và thêm biến môi trường `GEMINI_API_KEY` trong bảng điều khiển bảo mật của nền tảng.
- **Sao lưu dữ liệu:** Người học có thể vào mục **Cài đặt → Tải file Sao lưu (.json)** bất cứ lúc nào để lưu giữ toàn bộ tiến độ cá nhân an toàn.
