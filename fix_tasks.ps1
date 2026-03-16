# Recreate Scheduled Tasks

$ErrorActionPreference = "SilentlyContinue"

# Delete existing tasks
schtasks /Delete /TN "Landing Daily Report" /F
schtasks /Delete /TN "Landing Weekly Report" /F

$projectPath = "C:\Users\JuanMartínezCarrillo\Desktop\TRABAJOS\Landing Funnel"
$nodePath = "node.exe"

# Create daily task (Mon-Thu at 5:05 PM)
$dailyCmd = "cd /d `"$projectPath`" && $nodePath node_modules\.bin\tsx landing_agent.ts daily"
schtasks /Create /TN "Landing Daily Report" /TR "cmd /c $dailyCmd" /SC WEEKLY /D MON,TUE,WED,THU /ST 17:05 /F /RL HIGHEST

# Create weekly task (Friday at 5:05 PM)
$weeklyCmd = "cd /d `"$projectPath`" && $nodePath node_modules\.bin\tsx landing_agent.ts weekly"
schtasks /Create /TN "Landing Weekly Report" /TR "cmd /c $weeklyCmd" /SC WEEKLY /D FRI /ST 17:05 /F /RL HIGHEST

Write-Host "========================================"
Write-Host "Tareas recreadas!"
Write-Host "========================================"
Write-Host ""
Write-Host "Landing Daily Report   - Lun-Jue 5:05 PM"
Write-Host "Landing Weekly Report   - Vie 5:05 PM"
