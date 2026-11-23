# BÁO CÁO HẠNG MỤC 3: KIẾN TRÚC SERVER ONLINE 24/7, GIÁM SÁT & SAO LƯU TỰ ĐỘNG

**Trạng thái:** `PASSED` *(Kiến trúc Backend 24/7, giám sát, backup/khôi phục & cấu hình Cloud đã kiểm thử đạt 5/5; bước bấm Deploy lên tài khoản Render/Vercel cá nhân cần người dùng đăng nhập trực tiếp)*  
**Ngày nghiệm thu:** 2026-11-23

1. **Đã thực hiện:** Xây dựng module vận hành `backend/ops_backup.py` cung cấp sao lưu SQLite nóng (`sqlite3.backup()` định kỳ 6 giờ + giữ 10 bản mới nhất trong `data/backups/`), nhật ký hệ thống có cấu trúc `data/logs/server.log`, endpoint giám sát `GET /api/system/status` & `POST /api/system/backup`; nâng cấp `render.yaml` (gắn Persistent Disk 1 GB cho SQLite & PDF + `healthCheckPath: /api/health` + `CORS_ORIGINS`), `Dockerfile` (bổ sung `HEALTHCHECK` tự phục hồi), hỗ trợ cấu hình URL Backend Cloud trong Cài đặt Frontend và tài liệu hướng dẫn triển khai 3 bước `docs/DEPLOY_24_7.md`.
2. **Các file đã thay đổi:** `backend/ops_backup.py` (mới), `docs/DEPLOY_24_7.md` (mới), `server.py`, `render.yaml`, `Dockerfile`, `.gitignore`.
3. **Thay đổi Database:** Không phá vỡ schema; xác thực bản sao lưu nóng bằng `PRAGMA integrity_check = ok`.
4. **Bài kiểm thử đã chạy:** `test_m3.py` (`/api/health`, `/api/system/status`, CORS `OPTIONS` preflight từ Vercel origin, tạo và kiểm tra toàn vẹn bản backup nóng SQLite, kiểm tra file log).
5. **Kết quả kiểm thử:** **5/5 PASS**.
6. **Lỗi đã phát hiện & sửa:** Không phát sinh lỗi.
7. **Vấn đề còn tồn tại (Minh bạch):** Môi trường hiện tại không có quyền đăng nhập tài khoản Render/Vercel của người dùng, nên chưa tự động bấm khởi tạo dịch vụ trên Render cloud; sau khi push GitHub, người dùng chỉ cần kết nối repo vào Render Blueprint (`render.yaml`) là server chạy 24/7 độc lập với laptop.
8. **Kết luận:** **ĐỦ ĐIỀU KIỆN (`PASSED`)** mở khóa chuyển sang **Hạng mục 4**.
