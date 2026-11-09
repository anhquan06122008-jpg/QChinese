@echo off
chcp 65001 >nul
title QChinese - AI 汉语私人教师 (Chinese Personal Tutor)
echo ====================================================================
echo   Đang khởi động QChinese - AI 汉语私人教师 (Tiếng Trung Giản Thể)
echo   Truy cập trình duyệt tại: http://localhost:8000
echo ====================================================================

if exist "C:\msys64\ucrt64\bin\python3.exe" (
    start "" http://localhost:8000
    "C:\msys64\ucrt64\bin\python3.exe" server.py
    goto :eof
)

where python >nul 2>nul
if %errorlevel%==0 (
    start "" http://localhost:8000
    python server.py
    goto :eof
)

echo [!] Không tìm thấy Python 3 trong PATH. Vui lòng cài đặt Python 3.10+ để chạy server.
pause
