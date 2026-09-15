@echo off
cd /d "%~dp0"

echo Building gSender...
call npm run build-dev-css
call npm run build-dev-server

echo Starting server...
start "gSender Server" cmd /k npm run start-dev

ping -n 7 127.0.0.1 > nul
start "" "http://127.0.0.1:8000"

echo.
echo Opened in browser. To switch to Japanese: Settings - Basic - Language - ja,
echo then close the "gSender Server" window and run this file again.
pause
