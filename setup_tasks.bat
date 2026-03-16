@echo off
setlocal EnableDelayedExpansion
echo ========================================
echo Configuracion de Tareas Programadas
echo Landing Diagnostico - Reportes Automaticos
echo ========================================
echo.

set "SCRIPT_DIR=%~dp0"

echo.
echo [1/2] Importando tarea diaria (Lunes-Jueves 5:05 PM)...
schtasks /create /tn "Landing Daily Report" /xml "%SCRIPT_DIR%task_daily_report.xml" /f
if !errorlevel! equ 0 (
    echo     [OK] Tarea diaria configurada correctamente
) else (
    echo     [ERROR] Error al crear tarea diaria
)

echo.
echo [2/2] Importando tarea semanal (Viernes 5:05 PM)...
schtasks /create /tn "Landing Weekly Report" /xml "%SCRIPT_DIR%task_weekly_report.xml" /f
if !errorlevel! equ 0 (
    echo     [OK] Tarea semanal configurada correctamente
) else (
    echo     [ERROR] Error al crear tarea semanal
)

echo.
echo ========================================
echo Configuracion completada!
echo.
echo Tareas configuradas:
echo   - Landing Daily Report    (Lun-Jue 5:05 PM)
echo   - Landing Weekly Report   (Vie 5:05 PM)
echo.
echo Los reportes se enviaran automaticamente a:
echo   juanmartinez@gfs.es
echo.
echo Presiona cualquier tecla para salir...
pause >nul
