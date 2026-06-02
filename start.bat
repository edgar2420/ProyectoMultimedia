@echo off
title MediaVault - Iniciando...
color 0A

echo.
echo  ================================
echo    MediaVault - Iniciando...
echo  ================================
echo.

:: Backend Django
echo  [1/2] Iniciando Backend (Django)...
start "MediaVault Backend" cmd /k "cd /d %~dp0backend && call venv\Scripts\activate.bat && python manage.py migrate --run-syncdb 2>nul & python manage.py runserver"

:: Esperar 3 segundos para que Django arranque primero
timeout /t 3 /nobreak >nul

:: Frontend React
echo  [2/2] Iniciando Frontend (React)...
start "MediaVault Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

:: Esperar que el frontend levante
echo.
echo  Esperando que los servidores arranquen...
timeout /t 5 /nobreak >nul

:: Abrir el navegador
echo  Abriendo navegador...
start "" "http://localhost:5173"

echo.
echo  ================================
echo    Backend:  http://localhost:8000
echo    Frontend: http://localhost:5173
echo  ================================
echo.
echo  Cierra esta ventana cuando quieras.
pause
