@echo off
title Servidor Congreso Maria Camino a Jesus
color 0b
cls
echo ===================================================================
echo     CONGRESO GRACIA Y MISERICORDIA 2026 - SERVIDOR WEB
echo ===================================================================
echo.
echo   * Acceso en esta PC:       http://localhost:3000
echo   * Acceso desde tu Telefono: http://192.168.5.248:3000
echo.
echo   Presiona Ctrl + C en esta ventana para detener el servidor.
echo ===================================================================
echo.

cd /d "C:\Users\A\Documents\MariaCaminoAJesus\congreso"
call npm run dev
pause
