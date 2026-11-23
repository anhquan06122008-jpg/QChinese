# BÁO CÁO HẠNG MỤC 7 – ĐỒNG BỘ HỆ SINH THÁI QCHINESE · QENGLISH · TKB

- **Dự án:** QChinese (`c:\Users\anhqu\Downloads\QChinese`)
- **Tham chiếu CHỈ ĐỌC (không sửa bất kỳ tệp nào):** `c:\Users\anhqu\Downloads\QEnglish` và `c:\Users\anhqu\Downloads\TKB`
- **Trạng thái:** `PASSED` (đã triển khai kiến trúc đồng bộ đám mây thống nhất theo chuẩn QEnglish & TKB; 0 thay đổi lên QEnglish/TKB)

---

## 1. Phân tích kiến trúc hệ sinh thái (Read-Only Audit)
- **QEnglish** (`api/config.js`, `js/core/supabase-client.js`, `supabase-schema.sql`): dùng **Supabase Auth (`auth.users`) + PostgREST RLS + Supabase Realtime WebSocket (`wss://.../realtime/v1/websocket`)** kết hợp endpoint `/api/config` chỉ trả cấu hình công khai (`supabaseUrl`, `supabaseAnonKey`).
- **TKB** (`supabase_cloud_direct.sql`, `cloud_store.py`): dùng chung dự án Supabase với tiền tố bảng độc lập `tkb_*`, đảm bảo **không xung đột bảng** với QEnglish.

## 2. Triển khai trên QChinese (100% Cô lập & An toàn)
1. **Schema độc lập ([supabase-schema.sql](file:///c:/Users/anhqu/Downloads/QChinese/supabase-schema.sql)):**
   - Sử dụng tiền tố riêng `qchinese_*`: `qchinese_user_profiles`, `qchinese_user_snapshots`, `qchinese_user_devices`.
   - Bật Row Level Security (`auth.uid() = user_id`), cấp quyền tối thiểu (`authenticated`), và bật `supabase_realtime` CDC trên `qchinese_user_snapshots` & `qchinese_user_devices`.
2. **Backend Public Config ([server.py](file:///c:/Users/anhqu/Downloads/QChinese/server.py)):**
   - Bổ sung `GET /api/config` theo đúng chuẩn QEnglish/TKB (chỉ trả `supabaseUrl`, `supabaseAnonKey`, `aiConfigured`, `aiProvider`, `aiModel`; tuyệt đối không lộ `GEMINI_API_KEY` hay `SERVICE_ROLE_KEY`).
3. **Frontend Cloud Sync ([cloud-sync.js](file:///c:/Users/anhqu/Downloads/QChinese/public/js/cloud-sync.js), [core.js](file:///c:/Users/anhqu/Downloads/QChinese/public/js/core.js), [app.js](file:///c:/Users/anhqu/Downloads/QChinese/public/js/app.js), [notebook-analytics-settings.js](file:///c:/Users/anhqu/Downloads/QChinese/public/js/modules/notebook-analytics-settings.js)):**
   - Đăng nhập trực tiếp bằng cùng tài khoản Supabase Auth của QEnglish/TKB (ví dụ `anhquan06122008@gmail.com`).
   - Hỗ trợ đăng nhập đồng thời Laptop + Điện thoại, đăng xuất thiết bị cục bộ (`scope=local`), đăng xuất thiết bị từ xa, đồng bộ thời gian thực qua WebSocket 24/7, tự gộp dữ liệu chống xung đột và hàng đợi Offline.
   - Giữ nguyên fallback SQLite cục bộ khi chạy local không cấu hình Supabase.
