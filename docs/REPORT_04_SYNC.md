# BÁO CÁO HẠNG MỤC 4: ĐỒNG BỘ DỮ LIỆU THỜI GIAN THỰC TRÊN MỌI THIẾT BỊ

**Trạng thái:** `PASSED`  
**Ngày nghiệm thu:** 2026-11-23

1. **Đã thực hiện:** Xây dựng kiến trúc đồng bộ thời gian thực dựa trên Cloud SQLite làm nguồn dữ liệu chính:
   - Kênh Server-Sent Events (`GET /api/sync/stream`) đẩy `state_update` tức thời tới tất cả thiết bị đang đăng nhập cùng tài khoản.
   - Kiểm soát phiên bản (`version` + `updated_at`) và giải quyết xung đột thông minh `_merge_user_states()` (gộp set-union bài học đã hoàn thành, giữ bản ghi SRS/Hanzi mới nhất, gộp Notebook & Tài liệu theo `id`, tuyệt đối không cho dữ liệu cũ ghi đè dữ liệu mới).
   - Cơ chế chống trùng lặp `clientMutationId` (idempotent) và hàng đợi offline (`qchinese_offline_sync_*`) tự động đẩy lại khi có mạng (`online`) hoặc quay lại ứng dụng (`visibilitychange`).
   - Tự động cập nhật giao diện trực tiếp (`QApp.refreshCurrentView()`) không cần đăng xuất hay tải lại trang.
2. **Các file đã thay đổi:** `server.py`, `public/js/core.js`, `public/js/app.js`.
3. **Thay đổi Database:** Bổ sung cột `version INTEGER NOT NULL DEFAULT 1` vào bảng `user_state`.
4. **Bài kiểm thử đã chạy:** `test_m4.mjs` (kiểm tra idempotency, kiểm tra merge xung đột từ bản ghi cũ `baseVersion=1`, và **kiểm thử thực tế 2 trình duyệt độc lập: Laptop 1280px + Điện thoại 390px** cùng đăng nhập 1 tài khoản).
5. **Kết quả kiểm thử:** **5/5 PASS** — Điện thoại nhận từ `同步 (đồng bộ thời gian thực)` vừa lưu trên Laptop theo thời gian thực qua SSE mà không cần F5 hay đăng nhập lại; 0 lỗi JS trên cả 2 thiết bị.
6. **Lỗi đã phát hiện & sửa:** Không phát sinh lỗi.
7. **Vấn đề còn tồn tại:** Không có.
8. **Kết luận:** **ĐỦ ĐIỀU KIỆN (`PASSED`)** mở khóa chuyển sang **Hạng mục 5**.
