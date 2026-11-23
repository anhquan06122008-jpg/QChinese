# Hướng Dẫn Triển Khai QChinese Online 24/7 (Kiến Trúc Tách Frontend + Backend)

Để điện thoại, iPad, PC và Laptop truy cập QChinese mọi lúc **ngay cả khi tắt laptop cá nhân**, QChinese sử dụng kiến trúc lai ổn định:

| Thành phần | Nơi triển khai khuyến nghị | Lý do kỹ thuật |
|---|---|---|
| **Frontend (UI + 10.969 từ HSK)** | **Vercel** (`vercel.json`) hoặc **GitHub Pages** | Tốc độ CDN toàn cầu, HTTPS tự động, miễn phí. |
| **Backend API + SSE Sync + AI PDF + 100 AI Worker + SQLite** | **Render** (`render.yaml`) hoặc **Railway / Docker VPS** | Hỗ trợ tiến trình nền chạy dài (phân tích PDF lớn 132 MB, 100 AI Worker Pool, kết nối SSE thời gian thực) và ổ đĩa bền vững (`data/`) cho SQLite + sao lưu tự động mỗi 6 giờ — điều mà serverless function của Vercel không hỗ trợ. |

## Quy trình triển khai 3 bước (5 phút)

1. **Triển khai Backend 24/7 lên Render (hoặc Docker VPS):**
   - Đăng nhập [render.com](https://render.com) → **New → Blueprint** → chọn repo `anhquan06122008-jpg/QChinese`.
   - Render tự động đọc `render.yaml`, gắn ổ đĩa bền vững `/opt/render/project/src/data`, bật `healthCheckPath: /api/health` và tự khởi động lại nếu có sự cố.
   - Nhập `GEMINI_API_KEY` (hoặc `OPENAI_API_KEY`) vào mục **Environment Variables** của Render (tuyệt đối không đưa vào GitHub).
   - Nhận URL HTTPS của Backend (ví dụ `https://qchinese-personal-tutor.onrender.com`).

2. **Kết nối Frontend trên mọi thiết bị:**
   - Cách A (Đơn giản nhất): Truy cập trực tiếp URL HTTPS của Render trên điện thoại, iPad và laptop — Backend đã phục vụ sẵn toàn bộ giao diện + API + Đồng bộ thời gian thực cùng 1 domain!
   - Cách B (Tách CDN Vercel / GitHub Pages): Mở QChinese trên Vercel/GitHub Pages → vào **Cài đặt → Kết nối Backend Server Online 24/7** → dán URL Render vào và bấm **Lưu**.

3. **Giám sát & Sao lưu tự động:**
   - Kiểm tra tình trạng server: `GET /api/health` và `GET /api/system/status`.
   - Tạo bản sao lưu SQLite nóng bất cứ lúc nào: `POST /api/system/backup` (hệ thống cũng tự động sao lưu định kỳ mỗi 6 giờ vào `data/backups/` và giữ 10 bản gần nhất).
   - Nhật ký lỗi hệ thống lưu tại `data/logs/server.log`.
