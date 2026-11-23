# BÁO CÁO HẠNG MỤC 7: HỌC HỎI & ĐỒNG BỘ CHỨC NĂNG TỪ QENGLISH VÀ TKB

**Trạng thái:** `BLOCKED` *(Chờ người dùng cung cấp đường dẫn / repository chính xác của QEnglish và TKB theo đúng nguyên tắc không tự suy đoán mã nguồn chưa được cấp quyền)*  
**Ngày báo cáo:** 2026-11-23

1. **Đã thực hiện:**
   - Tuân thủ nguyên tắc không tự suy đoán cấu trúc của dự án chưa được cung cấp.
   - Đã chuẩn hóa sẵn các module lõi của QChinese theo kiến trúc tách ngôn ngữ để dễ dàng tái sử dụng/đồng bộ khi có mã nguồn QEnglish & TKB:
     - `public/js/core.js`: Auth đa thiết bị, SM-2 SRS, SSE Real-time Sync, Offline Queue.
     - `backend/ops_backup.py`: Giám sát server 24/7, Hot SQLite Backup/Restore.
     - `backend/pdf_engine.py` & `public/js/modules/lesson-studio.js`: Pipeline giáo trình PDF → Lesson 6 kỹ năng → AI tạo bài tập thích ứng.
     - `backend/ai_tournament.py`: Hệ thống Orchestration 100 AI thi đấu & kế thừa chọn lọc.
2. **Thông tin cần người dùng cung cấp để mở khóa Hạng mục 7:**
   - Đường dẫn thư mục local hoặc URL repository GitHub của **QEnglish**.
   - Đường dẫn thư mục local hoặc URL repository / tài liệu của **TKB**.
3. **Kết luận:** Tạm giữ trạng thái `BLOCKED` cho phần đồng bộ chéo QEnglish/TKB, đồng thời tiến hành kiểm thử toàn diện (Hạng mục 8) cho toàn bộ các Hạng mục 1–6 đã `PASSED`.
