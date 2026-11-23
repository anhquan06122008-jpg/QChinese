# BÁO CÁO HẠNG MỤC 1: HỆ THỐNG 100 AI THI ĐẤU VÀ TIẾN HÓA

**Trạng thái:** `PASSED`  
**Ngày nghiệm thu:** 2026-11-23

1. **Đã thực hiện:** Xây dựng hoàn chỉnh hệ thống Agent Orchestration trong `backend/ai_tournament.py` gồm Agent Registry (100 AI độc lập với ID, vai trò, chiến lược, bộ nhớ riêng, version artifact), Bounded Worker Pool (`ThreadPoolExecutor(max_workers=4)`), Independent Judge chấm độc lập theo đúng 7 trọng số (25/20/15/15/10/10/5) + vòng Tie-Breaker khi chênh lệch < 1.5 điểm, Knockout Bracket chuẩn `100→50→25→13→7→4→2→1` với cơ chế Fair Seed BYE cho vòng lẻ, Selective Inheritance & kiểm thử lại sau tích hợp (tự rollback nếu giảm điểm), bảo toàn artifact của AI thua trong SQLite, theo dõi ước tính token/chi phí API, và giao diện Dashboard thời gian thực `public/js/modules/ai-tournament.js` (hỗ trợ Pilot 16 AI trước khi chạy 100 AI).
2. **Các file đã thay đổi:** `backend/ai_tournament.py` (mới), `public/js/modules/ai-tournament.js` (mới), `server.py`, `public/index.html`, `public/js/app.js`.
3. **Thay đổi Database:** Bổ sung 5 bảng mới vào `data/qchinese.db`: `ai_tournaments`, `ai_agents`, `ai_matches`, `ai_artifacts`, `ai_audit_logs` (không ảnh hưởng dữ liệu cũ).
4. **Bài kiểm thử đã chạy:** `test_m1.mjs` (API Pilot 16 AI + Full 100 AI từng vòng + Playwright UI Desktop 1366px & Mobile 390px + kiểm tra 0 lỗi console/page).
5. **Kết quả kiểm thử:** **10/10 PASS** (`100->50->25->13->7->4->2->1`, 3 Fair BYE trên vòng lẻ 25/13/7, 298 artifacts lưu provenance, 12 tính năng kế thừa chọn lọc, 0 lỗi JS).
6. **Lỗi đã phát hiện & sửa:** Không phát sinh lỗi nghiêm trọng; đã thêm cơ chế `stopPolling()` khi chuyển trang trong `app.js` để tránh rò rỉ bộ nhớ trình duyệt.
7. **Vấn đề còn tồn tại:** Chế độ mặc định dùng Independent Judge định lượng cục bộ ($0 chi phí); nếu muốn mỗi agent gọi trực tiếp LLM thực tế cần cấu hình `GEMINI_API_KEY`/`OPENAI_API_KEY` và theo dõi ngân sách hiển thị trên Dashboard.
8. **Kết luận:** **ĐỦ ĐIỀU KIỆN (`PASSED`)** mở khóa chuyển sang **Hạng mục 2**.
