# FinPilot

Aplicação de gestão financeira pessoal com frontend React, API Node/Express, SQLite e assistente financeiro com IA (OpenAI).

## Arranque rápido

```bash
npm install
npm --prefix server install
copy server\.env.example server\.env   # edita e define OPENAI_API_KEY
npm run dev
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:3001`

O Vite encaminha pedidos `/api` para a API durante o desenvolvimento.

## Comandos

| Comando | Descrição |
|---|---|
| `npm run dev` | Frontend + API em simultâneo |
| `npm run build` | Build de produção do frontend |
| `npm run lint` | ESLint + verificação de sintaxe do servidor |
| `npm test` | Testes de integração do servidor |

## Estrutura

```
src/                          # Frontend React
├── components/
│   ├── auth/                 # LoginPage, OnboardingWizard
│   ├── brand/                # Elementos de marca (GoogleLogo)
│   ├── layout/               # Sidebar, TopBar, ChatPanel, ToastList
│   ├── modals/               # ModalRouter (CRUD forms)
│   └── ui/                   # Componentes reutilizáveis (Metric, Section…)
├── config/                   # Temas dark/light e estilos globais
├── data/                     # Dados de demonstração (mockData)
├── pages/                    # Dashboard, Transações, Orçamentos, Objetivos…
├── services/                 # Cliente HTTP da API (api.js)
├── utils/                    # Formatação de moeda, hidratação de entidades
├── FinPilotApp.jsx            # Composição principal e estado global
└── main.jsx                  # Entrada do React

server/src/                   # Backend Node/Express
├── config/                   # Validação do ambiente (.env)
├── db/                       # SQLite (node:sqlite nativo) e esquema
├── middleware/               # Auth JWT, validação Zod, erros
├── routes/                   # Contrato HTTP (9 routers)
├── services/                 # Lógica financeira, dados demo, IA (OpenAI)
└── utils/                    # JWT manual, HttpError, asyncHandler

docs/
├── BACKEND.md                # Endpoints e arquitectura da API
└── AI.md                     # Integração IA, segurança e evolução
```

## Assistente financeiro IA

O assistente usa a Responses API da OpenAI e responde com **streaming** (SSE).

- `POST /api/ai/chat` — resposta completa (JSON)
- `POST /api/ai/chat/stream` — streaming via Server-Sent Events
- `GET  /api/ai/history` — histórico de mensagens
- `DELETE /api/ai/history` — apagar histórico

Sem `OPENAI_API_KEY`, o endpoint devolve `503` e o resto da aplicação funciona normalmente.

Consulta [docs/BACKEND.md](docs/BACKEND.md) e [docs/AI.md](docs/AI.md) para mais detalhes.
