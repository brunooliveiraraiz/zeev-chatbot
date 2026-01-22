# 🕐 Agendamento Automático dos Testes

## ✅ Status: ATIVO

A tarefa **Zeev-Chatbot-Test** foi configurada no Agendador de Tarefas do Windows.

### 📅 Horários de Execução

- **09:00** (manhã)
- **21:00** (noite)

Executa todos os dias automaticamente.

---

## 📁 Arquivos do Agendamento

### `scripts/run-test.bat`
Script batch que:
1. Verifica se a API está rodando (localhost:3000)
2. Executa o teste do catálogo
3. Salva resultado em `scripts/reports/scheduled-tests.log`

### `scripts/setup-schedule.ps1`
Script PowerShell para configurar o agendamento.

---

## 🔧 Gerenciamento

### Ver status da tarefa
```powershell
Get-ScheduledTask -TaskName "Zeev-Chatbot-Test"
```

### Ver próxima execução
```powershell
Get-ScheduledTaskInfo -TaskName "Zeev-Chatbot-Test"
```

### Executar manualmente agora
```powershell
Start-ScheduledTask -TaskName "Zeev-Chatbot-Test"
```

### Desabilitar temporariamente
```powershell
Disable-ScheduledTask -TaskName "Zeev-Chatbot-Test"
```

### Reabilitar
```powershell
Enable-ScheduledTask -TaskName "Zeev-Chatbot-Test"
```

### Remover completamente
```powershell
Unregister-ScheduledTask -TaskName "Zeev-Chatbot-Test" -Confirm:$false
```

### Abrir interface gráfica
```cmd
taskschd.msc
```
(Procure por "Zeev-Chatbot-Test" na lista)

---

## 📊 Ver Logs

### Log de execuções agendadas
```cmd
type scripts\reports\scheduled-tests.log
```

### Ver últimas 20 linhas
```cmd
powershell Get-Content scripts\reports\scheduled-tests.log -Tail 20
```

### Limpar logs antigos
```cmd
del scripts\reports\scheduled-tests.log
```

---

## ⚠️ Requisitos

Para o teste funcionar automaticamente:

1. ✅ **API deve estar rodando** em localhost:3000
2. ✅ Computador deve estar ligado nos horários agendados
3. ✅ Se a API não estiver rodando, o teste será cancelado (registrado no log)

---

## 🔄 Reconfigurar

Se precisar alterar horários ou configurações:

```powershell
cd C:\Users\bruno.oliveira\Documents\zeev-chatbot
powershell -ExecutionPolicy Bypass -File scripts\setup-schedule.ps1
```

Isso removerá a tarefa antiga e criará uma nova.

---

## 💡 Dicas

### Receber notificação por email

Você pode configurar notificações no Agendador de Tarefas:

1. Abra `taskschd.msc`
2. Encontre a tarefa "Zeev-Chatbot-Test"
3. Clique com botão direito → Propriedades
4. Aba "Ações" → Adicionar nova ação
5. Configure envio de email (requer SMTP configurado)

### Executar apenas quando logado

Por padrão, a tarefa só executa quando você está logado. Para executar mesmo deslogado:

1. Abra `taskschd.msc`
2. Propriedades da tarefa
3. Aba "Geral" → Marque "Executar independentemente de o usuário ter feito logon ou não"
4. Digite sua senha quando solicitado

---

## 📈 Monitoramento

### Ver histórico de execuções

1. Abra `taskschd.msc`
2. Selecione a tarefa "Zeev-Chatbot-Test"
3. Aba "Histórico" (parte inferior)

### Verificar se última execução teve sucesso

```powershell
$task = Get-ScheduledTaskInfo -TaskName "Zeev-Chatbot-Test"
$task.LastTaskResult
```

- **0** = Sucesso
- **Outros números** = Código de erro

---

**Criado em:** 19/01/2026
**Última atualização:** 19/01/2026
