@echo off
echo ==============================================
echo       Deploying Coach Management System
echo ==============================================
echo.

where firebase.cmd >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Running firebase.cmd deploy...
    call firebase.cmd deploy
) else (
    echo [INFO] Running npx firebase-tools deploy...
    call npx --yes firebase-tools deploy
)

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ==============================================
    echo         DEPLOYMENT SUCCESSFUL!
    echo ==============================================
) else (
    echo.
    echo [FALLBACK] Trying npx firebase-tools deploy...
    call npx --yes firebase-tools deploy
)

echo.
pause
