# Zeev Chatbot API (v2)

Triagem e roteamento via `POST /route`, retornando link direto ou opções de formulários do Zeev. Stateless, baseado em catálogo local.

## Desenvolvimento rápido
```bash
npm install
cp env.example .env
npm run dev
# http://localhost:3000
```

## Endpoints
- `POST /route` — body `{ sessionId?: string, message: string, stage?: "hml" | "prod" }`
- `GET /health` — healthcheck para ALB/ECS

## Catálogo
`src/catalog/requests.ts` contém os itens com `id`, `name`, `tags`, `examples`, `url_hml`, `url_prod`. Não inventar URLs.

## Variáveis principais
- `PORT` (default 3000)
- `CORS_ORIGINS` (CSV)
- `STAGE_DEFAULT` (`hml`|`prod`)
- `LOG_LEVEL`

## Testes (matcher)
```bash
npm run test
```

## Build
```bash
npm run build
npm start
```
