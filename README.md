# FinPilot

Aplicação de gestão financeira com frontend React, API Node/Express, SQLite e integração opcional com a OpenAI.

## Comandos

```bash
npm install
npm --prefix server install
npm run dev
npm run build
npm run lint
npm test
```

## Estrutura

```text
src/
├── components/
│   ├── auth/       # Autenticação e onboarding
│   ├── brand/      # Elementos de marca
│   ├── modals/     # Formulários e router de modais
│   └── ui/         # Componentes reutilizáveis
├── config/         # Temas e estilos globais
├── data/           # Dados de demonstração
├── pages/          # Páginas principais
├── utils/          # Formatação e utilitários
├── FinPilotApp.jsx # Composição e estado global da aplicação
└── main.jsx        # Entrada do React

server/
├── src/
│   ├── db/         # Base de dados SQLite
│   ├── middleware/ # Segurança e validação
│   ├── routes/     # API REST
│   └── services/   # Regras financeiras e IA
└── test/           # Testes de integração
```

O `FinPilot.jsx` da raiz é mantido como ponto de compatibilidade e reexporta a aplicação organizada em `src/`.

Consulta [BACKEND.md](docs/BACKEND.md) para a API e [AI.md](docs/AI.md) para configurar e evoluir o assistente financeiro.
