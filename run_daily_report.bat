@echo off
setlocal
echo ========================================
echo Agente de Reportes - Landing Diagnostico
echo ========================================
echo.

cd /d "%~dp0"

echo Ejecutando reporte diario...
call npx.cmd tsx landing_agent.ts daily

echo.
echo ========================================
echo Finalizado. Presiona cualquier tecla para salir...
pause >nul
