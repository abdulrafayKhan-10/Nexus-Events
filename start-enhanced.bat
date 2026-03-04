@echo off
title NexusEvents Startup Script
color 0A

echo.
echo  ╔══════════════════════════════════════╗
echo  ║         NexusEvents Platform         ║
echo  ║        Startup Script                ║
echo  ╚══════════════════════════════════════╝
echo.

REM Check if .NET is installed
dotnet --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: .NET is not installed or not in PATH
    echo Please install .NET 7 or later
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Node.js is not installed or not in PATH
    echo Please install Node.js
    pause
    exit /b 1
)

REM Check directories
echo 🔍 Checking project structure...

if not exist "EventTicketing.API" (
    echo ❌ Error: EventTicketing.API directory not found!
    echo Current directory: %CD%
    pause
    exit /b 1
)

if not exist "EventTicketingfrontend" (
    echo ❌ Error: Frontend directory not found!
    echo Current directory: %CD%
    pause
    exit /b 1
)

echo ✅ Project structure verified!
echo.

REM Start Backend
echo 🚀 Starting Backend API...
start "NexusEvents API - Port 5251" cmd /k "title NexusEvents API && cd /d EventTicketing.API && echo Starting .NET API... && dotnet run"

echo ⏳ Waiting for API to initialize...
timeout /t 8 /nobreak >nul

REM Start Frontend
echo 🚀 Starting Frontend...
start "NexusEvents Frontend - Port 3000" cmd /k "title NexusEvents Frontend && cd /d EventTicketingfrontend && echo Starting Next.js... && npm run dev"

echo.
echo ✅ NexusEvents Platform is starting up!
echo.
echo 📱 Frontend:    http://localhost:3000
echo 🔧 Backend API: http://localhost:5251/swagger
echo.
echo 💡 Tip: Both applications will open in separate windows
echo 💡 To stop: Close both terminal windows or press Ctrl+C in each
echo.
echo Press any key to close this launcher...
pause >nul