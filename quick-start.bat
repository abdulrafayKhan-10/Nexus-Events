@echo off
cd /d "%~dp0"
start /min cmd /c "cd EventTicketing.API && dotnet run"
timeout /t 5 /nobreak >nul
start /min cmd /c "cd EventTicketingfrontend\event-ticketing-frontend-nextjs && npm run dev"