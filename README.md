# Zeev Chatbot v2 — Triagem e Roteamento

Chatbot focado em **triagem** e **roteamento**: recebe a descrição do usuário, identifica a intenção e retorna **exatamente** o link do formulário correto no Zeev. Não cria tickets.

## Arquitetura
- Monorepo com dois apps:
  - `apps/api`: Express + TypeScript, endpoint `POST /route` e health `GET /health`.
  - `apps/widget`: Widget React (Vite) que consome `/route` e exibe texto, links e opções.
- Stateless. Catálogo em código (`apps/api/src/catalog/requests.ts`). Sem LLM.

## Rodando local
1) Instalar dependências:
```bash
npm install
```
2) Configurar env da API:
```bash
cp apps/api/.env.example apps/api/.env
```
3) Subir dev (API + widget):
```bash
npm run dev
# API: http://localhost:3000
# Widget: http://localhost:5173
```

## API
- `POST /route`
  - Body: `{ sessionId?: string, message: string, stage?: "hml" | "prod" }`
  - Resposta:
    - `direct_link` → `{ text, link: { label, url } }`
    - `choose_option` → `{ text, options: [{ id, label, description? }] }`
    - `clarify` → `{ text }`
- `GET /health` para healthcheck.

### Catálogo
`apps/api/src/catalog/requests.ts` contém os itens (inicialmente TI). Para adicionar:
1. Incluir novo objeto no `REQUESTS_CATALOG` com `id`, `name`, `area`, `description`, `tags`, `examples`, `url_hml`, `url_prod`.
2. Não inventar URLs — sempre use links reais do Zeev.

### Matcher (heurístico)
- Normaliza (lowercase, remove acentos/pontuação) e tokeniza.
- Score ponderado por tags (alto), name/description (médio) e examples (overlap).
- Top 5 retornado; regras de decisão:
  - `direct_link` se top1 >= 0.75 e gap >= 0.15
  - `choose_option` se top1 >= 0.45
  - senão `clarify`
- Se a mensagem for exatamente um `id` do catálogo, responde direto.
- Logs em JSON: `sessionId`, `stage`, `message_normalized`, `topMatches`.

### Variáveis de ambiente (API)
Veja `apps/api/.env.example`. Principais:
- `PORT` (default 3000)
- `STAGE_DEFAULT` (`hml`|`prod`)
- `CORS_ORIGINS` (CSV, incluir hosts do Zeev e do widget)
- `LOG_LEVEL`

## Widget
- Usa `POST /route` sem autenticação.
- Renderiza:
  - texto do bot,
  - botão “Abrir solicitação” para `direct_link`,
  - lista de botões para `choose_option` (envia `message = option.id`),
  - mensagem simples para `clarify`.
- Base da API: `VITE_API_URL` (build). Se vazio, usa `window.location.origin` (útil em homolog rodando em domínio diferente).
- SessionId armazenado em `localStorage` para manter o contexto de opções.
- Embed script (`apps/widget/src/embed.ts`): aceita `data-title` e `data-stage` (`hml|prod`).

## Testes
Heurística do matcher (vitest):
```bash
npm run test
```
Casos cobrindo infraestrutura, ticket raiz, sistemas, BI e frase desconhecida.

## Deploy (ECS Fargate - sa-east-1)
Arquivos em `deploy/ecs/`:
- `build_and_push_ecr.sh`: build/push das imagens `apps/api` e `apps/widget` para ECR.
- `task-definition.json`: template com dois containers (api:3000, widget:80) e healthcheck em `/health`.
- `README.md`: passos para criar repositórios ECR, task definition, serviço ECS e configurar ALB.

Variáveis importantes no container da API:
- `PORT`, `STAGE_DEFAULT`, `CORS_ORIGINS`, `LOG_LEVEL`

## Adicionando novos itens do catálogo
1. Edite `apps/api/src/catalog/requests.ts`.
2. Inclua exemplos e tags ricas para melhorar o score.
3. Rode `npm run test` para garantir que o matcher continua coerente.

## Docker local (opcional)
```
docker-compose up
```
Sobe API (3000) e widget (80) usando as Dockerfiles de produção.
