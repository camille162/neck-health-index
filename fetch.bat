@echo off
chcp 65001 >nul
title Neck Care Index - Fetch
cd /d "%~dp0"

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

echo 正在从白名单渠道抓取最新内容...
echo.
call npm run fetch
echo.
echo ============================================
echo   抓取完成！新内容已写入 src\data\contents.json
echo   之后 git 提交推送到 GitHub 即可上线（或等每周一自动同步）
echo ============================================
pause
