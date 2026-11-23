# BÁO CÁO HẠNG MỤC 2: ĐĂNG NHẬP ĐA THIẾT BỊ & BẢO MẬT TÀI KHOẢN

**Trạng thái:** `PASSED`  
**Ngày nghiệm thu:** 2026-11-23

1. **Đã thực hiện:** Nâng cấp hệ thống phiên đăng nhập hỗ trợ đăng nhập đồng thời trên nhiều thiết bị (Laptop, Điện thoại, iPad, nhiều trình duyệt) không đá phiên nhau; lưu tên thiết bị (phân tích từ User-Agent), IP và thời gian hoạt động cuối; cung cấp API & giao diện Cài đặt quản lý thiết bị (xem danh sách, đăng xuất 1 thiết bị cụ thể, đăng xuất tất cả thiết bị khác / tất cả thiết bị); bổ sung cơ chế khôi phục mật khẩu bảo mật bằng Mã khôi phục băm PBKDF2 (`QCN-XXXX-XXXX-XXXX`, tự động thu hồi toàn bộ phiên cũ khi đặt lại mật khẩu); hỗ trợ CORS đa nguồn cho kiến trúc tách Frontend + Backend 24/7.
2. **Các file đã thay đổi:** `server.py`, `public/js/core.js`, `public/js/app.js`, `public/js/modules/notebook-analytics-settings.js`.
3. **Thay đổi Database:** Migration an toàn (`ALTER TABLE` chỉ khi thiếu cột) bổ sung `session_id`, `device_name`, `user_agent`, `ip_address`, `last_active_at` vào bảng `sessions`, và `recovery_hash`, `recovery_salt` vào bảng `users`; backfill `session_id` cho các phiên cũ.
4. **Bài kiểm thử đã chạy:** `test_m2.mjs` (3 thiết bị đồng thời Laptop + iPhone + iPad, thu hồi riêng iPhone kiểm chứng iPad vẫn sống, khôi phục mật khẩu bằng mã khôi phục, kiểm tra UI Cài đặt bằng Playwright).
5. **Kết quả kiểm thử:** **9/9 PASS**, 0 lỗi JavaScript.
6. **Lỗi đã phát hiện & sửa:** Không phát sinh lỗi.
7. **Vấn đề còn tồn tại:** Không có (lưu ý: tính năng quản lý đa thiết bị hoạt động khi kết nối tới Backend server SQLite, không áp dụng ở chế độ tĩnh thuần trình duyệt).
8. **Kết luận:** **ĐỦ ĐIỀU KIỆN (`PASSED`)** mở khóa chuyển sang **Hạng mục 3**.
