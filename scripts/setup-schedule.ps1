# Configurar agendamento automatico dos testes

$taskName = "Zeev-Chatbot-Test"
$scriptPath = "C:\Users\bruno.oliveira\Documents\zeev-chatbot\scripts\run-test.bat"

Write-Host "Configurando agendamento automatico..." -ForegroundColor Cyan

# Remove tarefa existente
$existing = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existing) {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

# Cria acao
$action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$scriptPath`""

# Cria triggers (9h e 21h)
$trigger1 = New-ScheduledTaskTrigger -Daily -At 9:00AM
$trigger2 = New-ScheduledTaskTrigger -Daily -At 9:00PM

# Configuracoes
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

# Registra tarefa
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger1,$trigger2 -Settings $settings -Principal $principal -Description "Teste automatico do catalogo Zeev a cada 12h"

Write-Host "Tarefa criada com sucesso!" -ForegroundColor Green
Write-Host "Horarios: 09:00 e 21:00" -ForegroundColor White
