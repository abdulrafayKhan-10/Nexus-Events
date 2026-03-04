@echo off
echo Starting NexusEvents Platform...
echo.

REM Check if directories exist
if not exist "EventTicketing.API" (
    echo Error: EventTicketing.API directory not found!
    pause
    exit /b 1
)

if not exist "EventTicketingfrontend" (
    echo Error: Frontend directory not found!
    pause
    exit /b 1
)

echo Starting Backend API...
start "NexusEvents API" cmd /k "cd /d EventTicketing.API && dotnet run"

echo Waiting for API to start...
timeout /t 5 /nobreak >nul

echo Starting Frontend...
start "NexusEvents Frontend" cmd /k "cd /d EventTicketingfrontend && npm run dev"

echo.
echo ============================================
echo NexusEvents Platform is starting up!
echo ============================================
echo Backend API: http://localhost:5251/swagger
echo Frontend:    http://localhost:3000
echo.
echo Both terminals will open automatically.
echo Close this window or press any key to continue...
pause >nul