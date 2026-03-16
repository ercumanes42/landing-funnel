@echo off
echo ========================================
echo Creando Tareas Programadas
echo ========================================

schtasks /delete /tn "Landing Daily Report" /f 2>nul
schtasks /delete /tn "Landing Weekly Report" /f 2>nul

echo.
echo Creando tarea diaria (Lun-Jue 5:05 PM)...
schtasks /create /tn "Landing Daily Report" /tr "C:\Program Files\nodejs\node.exe C:\Users\JuanMartínezCarrillo\Desktop\TRABAJOS\Landing Funnel\node_modules\.bin\tsx.cmd C:\Users\JuanMartínezCarrillo\Desktop\TRABAJOS\Landing Funnel\landing_agent.ts daily" /sc weekly /d MON,TUE,WED,THU /st 17:05 /f

echo.
echo Creando tarea semanal (Vie 5:05 PM)...
schtasks /create /tn "Landing Weekly Report" /tr "C:\Program Files\nodejs\node.exe C:\Users\JuanMartínezCarrillo\Desktop\TRABAJOS\Landing Funnel\node_modules\.bin\tsx.cmd C:\Users\JuanMartínezCarrillo\Desktop\TRABAJOS\Landing Funnel\landing_agent.ts weekly" /sc weekly /d FRI /st 17:05 /f

echo.
echo ========================================
echo Tareas creadas!
echo.
echo Presiona cualquier tecla para salir...
pause >nul
