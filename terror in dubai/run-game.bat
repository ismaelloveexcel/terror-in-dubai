@echo off
echo ========================================
echo   SAVE ISMAEL - Game Launcher
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    echo.
    call npm run install:all
    echo.
)

echo Starting game...
echo.
echo Server will run on: http://localhost:3000
echo Client will run on: http://localhost:5173
echo.
echo Press Ctrl+C to stop
echo.

call npm run dev
