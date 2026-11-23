# BÁO CÁO HẠNG MỤC 5: HỆ THỐNG AI PDF & PHÂN TÍCH GIÁO TRÌNH HSK 3.0

**Trạng thái:** `PASSED`  
**Ngày nghiệm thu:** 2026-11-23

1. **Đã thực hiện:** Xây dựng module `backend/pdf_engine.py` và giao diện `public/js/modules/ai-pdf-studio.js` triển khai Pipeline 7 bước chạy bất đồng bộ trên worker nền (Upload & kiểm tra magic-byte `%PDF-` + lọc prompt injection → Trích xuất & phát hiện PDF scan → Phân tích AI → Phân loại 6 kỹ năng → Tạo Lesson → Kiểm định đáp án → Xuất bản). Tích hợp trực tiếp tài liệu HSK 1 (3.0) người dùng cung cấp (`新HSK1.pdf` 143 trang, `新HSK1_workbook.pdf` 140 trang, `Vở luyện viết HSK1 3.0.pdf` 109 trang) cùng **93 file MP3 giáo trình gốc** trải đều trên 15 Lesson (`1-1.mp3` .. `15-6.mp3`) và khóa chặt HSK 2–6, HSK 7–9 chờ tải tài liệu (không tạo dữ liệu giả). Phân biệt rõ nhãn `extracted_from_pdf`, `ai_explained`, `ai_generated`.
2. **Các file đã thay đổi:** `backend/pdf_engine.py` (mới), `public/js/modules/ai-pdf-studio.js` (mới), `server.py`, `public/index.html`, `public/js/app.js`.
3. **Thay đổi Database:** Bổ sung 2 bảng mới `pdf_documents` và `pdf_courses` trong `data/qchinese.db`.
4. **Bài kiểm thử đã chạy:** `test_m5.py` (kiểm tra ma trận khóa/mở HSK 1 vs HSK 2–9, kiểm tra 15 Lesson + 93 MP3, phát thử `1-1.mp3`, chặn path traversal `/api/pdf/audio?file=../../server.py`, chặn file giả không có header `%PDF-`, upload & chạy pipeline 7 bước cho tài liệu HSK 2).
5. **Kết quả kiểm thử:** **6/6 PASS**.
6. **Lỗi đã phát hiện & sửa:** Đã phát hiện `新HSK1.pdf` (125.9 MB) là PDF scan không có text layer (`has_font=False`), nên đã gắn cờ minh bạch `ocr_required=1` kèm hướng dẫn cấu hình `GEMINI_API_KEY` để OCR hoặc dán văn bản bổ sung, không bịa nội dung.
7. **Vấn đề còn tồn tại:** Để phát 93 file MP3 giáo trình gốc trên server Render cloud 24/7, cần tải thư mục MP3 lên object storage/persistent disk (trên máy local phát trực tiếp qua `/api/pdf/audio`).
8. **Kết luận:** **ĐỦ ĐIỀU KIỆN (`PASSED`)** mở khóa chuyển sang **Hạng mục 6**.
