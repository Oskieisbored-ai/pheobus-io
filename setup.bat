@echo off
echo ========================================
echo   Pheobus.io - Setup
echo ========================================
echo.

:: Backend setup
echo [1/4] Installing Python dependencies...
cd backend
pip install -r requirements.txt
echo.

:: Seed database
echo [2/4] Seeding database with demo data...
python seed_data.py
echo.
cd ..

:: Frontend setup
echo [3/4] Installing Node dependencies...
cd frontend
npm install
echo.
cd ..

echo [4/4] Setup complete!
echo.
echo Run 'start.bat' to launch the application.
echo   Demo login: demo@pheobus.io / demo1234
echo.
pause
