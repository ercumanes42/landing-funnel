@echo off
setlocal
echo ========================================
echo Agente de Reportes - Landing Diagnostico
echo ========================================
echo.

cd /d "%~dp0"

echo Ejecutando reporte semanal...
call npx.cmd tsx landing_agent.ts weekly

echo.
echo ========================================
echo Finalizado. Presiona cualquier tecla para salir...
pause >nul
