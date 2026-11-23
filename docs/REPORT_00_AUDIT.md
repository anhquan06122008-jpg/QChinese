# BÁO CÁO AUDIT TOÀN BỘ DỰ ÁN QCHINESE (GIAI ĐOẠN 0)

**Trạng thái:** `PASSED`  
**Ngày kiểm toán:** 2026-11-23  
**Checkpoint Git:** `ec45e30` (nhánh `fix` đồng bộ `origin/main`)

---

## 1. Kiến trúc hiện tại
- **Frontend:** Vanilla HTML5/CSS3/Modular ES6 trong `public/` (`index.html`, `css/styles.css`, `js/core.js`, `js/vocab-store.js`, `js/pinyin-ime.js`, `js/app.js`, 8 module trong `public/js/modules/`, bộ từ vựng HSK 2.0 4.991 từ & HSK 3.0 10.969 từ trong `public/data/vocab/`).
- **Backend:** Python 3.14 Standard Library (`server.py`, `ThreadingHTTPServer`, `backend/ai_pedagogy.py`), không dùng framework ngoài.
- **Database:** SQLite cục bộ (`data/qchinese.db`, WAL mode) gồm 3 bảng:
  - `users(id, username, display_name, password_hash, password_salt, created_at, last_login_at)`
  - `sessions(token_hash, user_id, expires_at, created_at)`
  - `user_state(user_id, state_json, updated_at)`
- **Tài liệu HSK 3.0 cục bộ người dùng cung cấp:**
  - `c:\Users\anhqu\Downloads\HSK-3.0\HSK 1`: `新HSK1.pdf` (132 MB), `新HSK1_workbook.pdf` (61.8 MB), `Vở luyện viết HSK1 3.0.pdf` (18.8 MB).
  - `c:\Users\anhqu\Downloads\HSK-3.0\MP3 GIÁO TRÌNH NEW HSK1 3.0`: **93 file MP3** đánh số theo từng bài (`1-1.mp3` ... `13-5.mp3`...).

## 2. Công nghệ đang sử dụng
- Python 3.14.7 (`C:\msys64\ucrt64\bin\python3.exe`, stdlib: `sqlite3`, `http.server`, `hashlib`, `hmac`, `zipfile`, `xml.etree.ElementTree`, `urllib`). Chưa cài thư viện PDF bên ngoài (`pypdf`/`pymupdf`).
- Node.js v22.11.0 + `playwright-core` + Edge Headless trong thư mục scratch để kiểm thử tự động E2E.
- GitHub Pages (`.github/workflows/pages.yml`), sẵn `render.yaml`, `Dockerfile`, `vercel.json`.

## 3. Chức năng đang hoạt động tốt (Bảo toàn tuyệt đối)
- Kho từ vựng HSK 2.0 (4.991 từ) & HSK 3.0 (10.969 từ) kèm Flashcard SM-2, 10 chế độ học, bộ lọc đa tầng.
- Phòng luyện Pinyin tương tác (21 thanh mẫu, 38 vận mẫu, 16 âm tiết đọc liền, sơ đồ SVG, đối chiếu âm bật hơi/cong lưỡi/mũi, Challenge 4 cấp độ).
- Hanzi Stroke Studio (`HanziWriter` + 17 chữ + ghim chữ), Smart Pinyin IME, Placement Test 7 kỹ năng, QChinese AI Tutor 6 chế độ, My Learning Materials, Notebook, Analytics, Settings.

## 4. Các lỗi & khoảng trống hiện có so với Master Prompt
1. **Chưa có Hạng mục 1:** Chưa có hệ thống **100 AI Agent Evolution Tournament** (Agent Registry, Task Manager, Worker Pool, Independent Judge 7 trọng số 25/20/15/15/10/10/5, Bracket 100→50→25→13→7→4→2→1, Selective Inheritance & Re-Test, Artifact Storage, Audit Logs, Cost/Token Tracking, Real-time Tournament Dashboard).
2. **Hạng mục 2 (Đăng nhập đa thiết bị):** Bảng `sessions` hiện chưa lưu `session_id`, `device_name`, `user_agent`, `ip_address`, `last_active_at`, `revoked_at`; chưa có API liệt kê thiết bị, đăng xuất 1 thiết bị cụ thể, đăng xuất tất cả thiết bị, hoặc khôi phục mật khẩu bằng mã khôi phục an toàn (recovery code).
3. **Hạng mục 3 (Server Online 24/7):** Chưa có endpoint `/api/system/metrics`, `/api/system/logs`, cơ chế sao lưu & khôi phục SQLite tự động (`data/backups/`), cấu hình CORS đa origin cho kiến trúc tách Frontend (Vercel/GitHub Pages) + Backend (Render/Docker 24/7), và file `.env` hiện chưa tồn tại (`False`).
4. **Hạng mục 4 (Đồng bộ thời gian thực):** Hiện `user_state` chỉ lưu 1 JSON blob không có `version` / `client_updated_at`, không có SSE/WebSocket push thời gian thực giữa 2 thiết bị, không có offline sync queue và conflict resolution!
5. **Hạng mục 5 (AI PDF & Giáo trình HSK 3.0):** Chưa có hệ thống AI PDF 7 bước (background job queue, lưu DB, phân biệt nội dung trích xuất/AI giải thích/AI tạo thêm, cấu trúc khóa học HSK 3.0 mở khóa HSK 1 & khóa HSK 2–9 chờ tài liệu, tích hợp thực tế 93 file MP3 & giáo trình HSK 1 3.0).
6. **Hạng mục 6 (Hệ thống Lesson & AI Tạo Bài Tập):** Reading hiện có ít câu hỏi (chưa đạt 4–5+ câu đa dạng), chưa có bố cục chia đôi trái/phải theo Lesson 6 kỹ năng + nút `AI – TẠO BÀI TẬP MỚI` nhắm đúng lỗi sai người học + theo dõi tiến trình/điểm tốt nhất từng Lesson.
7. **Hạng mục 7 (QEnglish & TKB):** Chưa được cung cấp đường dẫn/quyền truy cập repository của QEnglish & TKB trong phiên này (lệnh `PEN-3` trước đó đã được người dùng yêu cầu hủy bỏ). Sẽ kiểm tra rõ và hỏi người dùng ở Hạng mục 7 trước khi đồng bộ.
8. **Hạng mục 8 (Kiểm thử toàn diện & Production):** Cần bộ test tổng lực cuối cùng sau khi cả 7 hạng mục trước đạt `PASSED`.

## 5. Rủi ro kỹ thuật & Biện pháp kiểm soát
- **Chi phí API khi chạy 100 AI:** Bắt buộc xây dựng chế độ **Pilot (8–16 Agent)** kiểm tra độ ổn định & ước tính chi phí token trước khi mở rộng lên 100 Agent, dùng hàng đợi có giới hạn concurrency (`WorkerPool`), và hỗ trợ chạy mô phỏng đánh giá khách quan cục bộ (0 USD) hoặc kết hợp Gemini/OpenAI khi người dùng cấu hình API key.
- **File PDF dung lượng lớn (132 MB `新HSK1.pdf`):** Không nạp toàn bộ 132 MB vào RAM trình duyệt hay serverless function! Xử lý bất đồng bộ qua background worker trên Python backend, chia chunk từng trang/chương, lưu tiến độ vào SQLite.
- **Bảo toàn dữ liệu cũ:** Không xóa bảng `users`, `sessions`, `user_state`; chỉ dùng `ALTER TABLE` / `CREATE TABLE IF NOT EXISTS` migration an toàn và backup `data/qchinese.db` trước khi migration.

## 6. Tài khoản / Dịch vụ còn cần xác nhận khi tới bước triển khai Cloud
- `GEMINI_API_KEY` hoặc `OPENAI_API_KEY` trong `.env` / Render Environment (để bật LLM thời gian thực cho AI Tutor & AI PDF; trong khi đó toàn bộ kiến trúc backend/engine vẫn hoạt động và kiểm thử đầy đủ ngay lập tức).
- Tài khoản Render/Railway & Vercel (môi trường hiện tại không có sẵn CLI đăng nhập `vercel`/`gh` hay plugin auth; ta đã sẵn sàng đẩy code lên GitHub `origin/main` và cung cấp đầy đủ cấu hình `render.yaml`, `Dockerfile`, `vercel.json`, `Procfile` cho triển khai 1-click).
- Đường dẫn/repo QEnglish và TKB (chỉ cần đến khi bước vào Hạng mục 7).
