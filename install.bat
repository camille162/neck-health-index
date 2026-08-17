@echo off
chcp 65001 >nul
title Neck Care Index - Install
cd /d "%~dp0"

echo ============================================
echo   颈椎健康索引 - 一键安装依赖
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo [错误] 未检测到 Node.js。
    echo 请先到 https://nodejs.org/zh-cn 下载并安装 LTS 版本，
    echo 安装完成后重新双击本脚本。
    echo.
    pause
    exit /b 1
)

for /f "delims=" %%v in ('node --version') do set NODE_VER=%%v
echo 检测到 Node.js: %NODE_VER%
echo.

echo 正在安装依赖（首次大约需要 1-3 分钟）...
call npm install
if errorlevel 1 (
    echo.
    echo [错误] 依赖安装失败，请检查网络连接后重新运行本脚本。
    pause
    exit /b 1
)

echo.
echo ============================================
echo   安装完成！以后双击 start.bat 即可启动应用。
echo ============================================
pause
