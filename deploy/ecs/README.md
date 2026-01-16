# Deploy no ECS Fargate (sa-east-1)

## Visão geral
- 2 containers na mesma task:
  - `api` (porta 3000, health em `/health`)
  - `widget` (porta 80, serve o build estático)
- ALB público com 2 target groups (api e widget) ou único TG apontando para widget se a API for consumida pelo mesmo domínio via path `/route`.
- Region alvo: `sa-east-1`.

## 1) Preparar ECR
```bash
aws ecr create-repository --repository-name zeev-chatbot-api --region sa-east-1
aws ecr create-repository --repository-name zeev-chatbot-widget --region sa-east-1
```

## 2) Build e push das imagens
```bash
AWS_ACCOUNT_ID=<sua-conta> AWS_REGION=sa-east-1 IMAGE_TAG=v2 ./deploy/ecs/build_and_push_ecr.sh
```

## 3) Task Definition
- Use `deploy/ecs/task-definition.json` como template.
- Ajuste:
  - `image` para o ECR gerado (api e widget).
  - `executionRoleArn` / `taskRoleArn`.
  - Variáveis de ambiente da API:
    - `PORT` (3000)
    - `STAGE_DEFAULT` (`hml` ou `prod`)
    - `CORS_ORIGINS` (inclua domínios do Zeev e do host do widget)
    - `LOG_LEVEL`
- Health check já configurado: `GET /health` na porta 3000.

## 4) Criar Cluster/Service
1. Criar cluster Fargate (VPC + subnets públicas ou privadas com NAT).
2. Criar Target Groups:
   - API TG: porta 3000, health `/health`.
   - Widget TG: porta 80.
3. Criar ALB e listeners:
   - Listener 80/443 direcionando:
     - Path `/route` e `/health` → API TG.
     - Demais paths (ou `/`) → Widget TG.
4. Criar Service ECS:
   - Family: `zeev-chatbot-v2`
   - Desired tasks >= 1
   - Assign public IP se estiver em subnets públicas.

## 5) Variáveis de ambiente obrigatórias (API)
- `PORT` (default 3000)
- `STAGE_DEFAULT` (`hml`|`prod`)
- `CORS_ORIGINS` (CSV com portais Zeev + host do widget)
- `LOG_LEVEL`

## 6) Testes pós-deploy
```bash
curl https://<api-host>/health
curl -X POST https://<api-host>/route -H "Content-Type: application/json" \
  -d '{"message":"meu computador não liga"}'
```

## 7) Observabilidade
- Logs em JSON: `event`, `sessionId`, `stage`, `message_normalized`, `topMatches`.
- Evite incluir segredos nos logs.
