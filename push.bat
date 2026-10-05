@echo off
title Push Coach Management System to GitHub
echo ==============================================
echo       Uploading Coach Management System
echo                  to GitHub
echo ==============================================
echo.
echo Branch: main
echo Remote: https://github.com/team100yards/coachmanagementsystem.git
echo.
git push origin main
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ==============================================
    echo            UPLOAD SUCCESSFUL!
    echo ==============================================
) else (
    echo.
    echo ==============================================
    echo [NOTE] If GitHub asks for authentication:
    echo   Username: team100yards
    echo   Password: Use your GitHub Personal Access Token (PAT)
    echo             (Generate at: https://github.com/settings/tokens)
    echo ==============================================
)
echo.
pause
