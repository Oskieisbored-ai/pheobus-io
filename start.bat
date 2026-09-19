@echo off
echo ========================================
echo   Pheobus.io - Free B2B Contact Finder
echo ========================================
echo.

:: Start backend
echo Starting backend server...
cd backend
start "Pheobus Backend" cmd /k "python -m uvicorn app.main:app --reload --port 8000"
cd ..

:: Start frontend
echo Starting frontend dev server...
cd frontend
start "Pheobus Frontend" cmd /k "npm run dev"
cd ..

echo.
echo Servers starting...
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:5173
echo   API Docs: http://localhost:8000/docs
echo.
echo Demo login: demo@pheobus.io / demo1234
echo.
pause
