@echo off
REM Script para executar teste do catálogo
REM Este arquivo será executado pelo Agendador de Tarefas do Windows

cd /d "C:\Users\bruno.oliveira\Documents\zeev-chatbot"

REM Cria diretório de reports se não existir
if not exist "scripts\reports" mkdir "scripts\reports"

REM Verifica se a API está rodando
curl -s http://localhost:3000/health >nul 2>&1
if errorlevel 1 (
    echo [%date% %time%] API não está rodando. Teste cancelado. >> scripts\reports\scheduled-tests.log
    exit /b 1
)

REM Executa os testes
echo [%date% %time%] ========== Iniciando bateria de testes ========== >> scripts\reports\scheduled-tests.log
echo. >> scripts\reports\scheduled-tests.log

REM Teste 1: Catálogo Simples
echo [%date% %time%] Executando: test-catalog-simple.js >> scripts\reports\scheduled-tests.log
node scripts\test-catalog-simple.js >> scripts\reports\scheduled-tests.log 2>&1
echo [%date% %time%] Test-catalog-simple concluido. Exit code: %errorlevel% >> scripts\reports\scheduled-tests.log
echo. >> scripts\reports\scheduled-tests.log

REM Teste 2: Catálogo Completo
echo [%date% %time%] Executando: test-catalog.js >> scripts\reports\scheduled-tests.log
call npx tsx scripts\test-catalog.js >> scripts\reports\scheduled-tests.log 2>&1
set TEST2_EXIT=%errorlevel%
echo [%date% %time%] Test-catalog concluido. Exit code: %TEST2_EXIT% >> scripts\reports\scheduled-tests.log
echo. >> scripts\reports\scheduled-tests.log

REM Teste 3: Análise de Logs
echo [%date% %time%] Executando: analyze-logs.js >> scripts\reports\scheduled-tests.log
echo [%date% %time%] Analisando logs anteriores... >> scripts\reports\scheduled-tests.log
node scripts\analyze-logs.js scripts\reports\scheduled-tests.log > scripts\reports\log-analysis-output.txt 2>&1
set TEST3_EXIT=%errorlevel%
echo [%date% %time%] Analyze-logs concluido. Exit code: %TEST3_EXIT% >> scripts\reports\scheduled-tests.log
echo [%date% %time%] Resultado salvo em: scripts\reports\log-analysis-output.txt >> scripts\reports\scheduled-tests.log
echo. >> scripts\reports\scheduled-tests.log

echo [%date% %time%] ========== Bateria de testes concluida ========== >> scripts\reports\scheduled-tests.log
echo [%date% %time%] Todos os testes foram executados >> scripts\reports\scheduled-tests.log
echo. >> scripts\reports\scheduled-tests.log

REM Sempre retorna sucesso se todos os testes foram executados
exit /b 0
