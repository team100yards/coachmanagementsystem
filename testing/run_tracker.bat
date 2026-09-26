@echo off
setlocal
cd /d "%~dp0"
title Match Video Player & Ball Tracker

set "PYTHON_EXE=C:\Users\PCCF\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"

if not exist "%PYTHON_EXE%" (
    set "PYTHON_EXE=python"
)

echo ========================================================
echo   Launching Match Video Player Tracker (OpenCV CSRT)
echo ========================================================
echo.
"%PYTHON_EXE%" "%~dp0player_tracker.py" %*
if errorlevel 1 (
    echo.
    echo Application closed with an error code.
    pause
)
