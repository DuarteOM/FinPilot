# Backend do FinPilot

O backend é uma API REST em Node.js e Express. Para desenvolvimento usa SQLite através do módulo nativo `node:sqlite` do Node 24.

## Arranque

Na raiz do projeto:

```bash
npm install
npm --prefix server install
copy server\.env.example server\.env
npm run dev
```

O frontend fica em `http://localhost:5173` e a API em `http://localhost:3001`. O Vite encaminha pedidos `/api` para a API durante o desenvolvimento.

## Endpoints

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PATCH /api/user/profile`
- `PATCH /api/user/settings`
- CRUD em `/api/transactions`, `/api/budgets`, `/api/goals` e `/api/subscriptions`
- `GET /api/dashboard`
- `GET /api/reports?months=7`
- `POST /api/ai/chat`
- `GET|DELETE /api/ai/history`

Todas as rotas financeiras exigem `Authorization: Bearer <token>`.

## Estrutura

```text
server/src/
├── config/       # Ambiente
├── db/           # SQLite e esquema
├── middleware/   # Autenticação, validação e erros
├── routes/       # Contrato HTTP
├── services/     # Cálculos, dados de demonstração e IA
└── utils/        # Tokens, passwords e helpers HTTP
```

SQLite é adequado ao desenvolvimento e a um MVP numa única instância. Antes de escalar horizontalmente, a base de dados deve migrar para PostgreSQL e os tokens devem ganhar rotação/revogação.
