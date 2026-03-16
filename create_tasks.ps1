# Crear tareas programadas para el Agente de Landing

$ErrorActionPreference = "SilentlyContinue"

# Borrar tareas existentes
schtasks /Delete /TN "Landing Daily Report" /F
schtasks /Delete /TN "Landing Weekly Report" /F

$nodePath = "C:\Program Files\nodejs\node.exe"
$tsxPath = "C:\Users\JuanMartínezCarrillo\Desktop\TRABAJOS\Landing Funnel\node_modules\.bin\tsx.cmd"
$scriptPath = "C:\Users\JuanMartínezCarrillo\Desktop\TRABAJOS\Landing Funnel\landing_agent.ts"

# Tarea diaria (Lun-Jue)
$dailyTask = "$nodePath $tsxPath $scriptPath daily"
schtasks /Create /TN "Landing Daily Report" /TR $dailyTask /SC WEEKLY /D MON,TUE,WED,THU /ST 17:05 /F

# Tarea semanal (Vie)
$weeklyTask = "$nodePath $tsxPath $scriptPath weekly"
schtasks /Create /TN "Landing Weekly Report" /TR $weeklyTask /SC WEEKLY /D FRI /ST 17:05 /F

Write-Host "========================================"
Write-Host "Tareas creadas exitosamente!"
Write-Host "========================================"
Write-Host ""
Write-Host "Landing Daily Report   - Lun-Jue 5:05 PM"
Write-Host "Landing Weekly Report   - Vie 5:05 PM"
Write-Host ""
Write-Host "Email: juanmartinez@gfs.es"
Write-Host ""
