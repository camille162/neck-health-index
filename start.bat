@echo off
chcp 65001 >nul
title Neck Care Index - Start
cd /d "%~dp0"

echo ============================================
echo   颈椎健康索引 - 启动
echo ============================================

where node >nul 2>nul
if errorlevel 1 (
    echo [错误] 未检测到 Node.js，请先双击 install.bat。
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo 未检测到依赖，正在自动安装（首次约 1-3 分钟）...
    call npm install
    if errorlevel 1 (
        echo [错误] 依赖安装失败，请检查网络后重试。
        pause
        exit /b 1
    )
)

echo.
echo 正在启动开发服务器，浏览器将自动打开...
echo 关闭本黑色窗口即可停止应用。
echo.

call npm run dev -- --open --port 5173
pause
