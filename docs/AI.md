# Assistente financeiro com IA

## Fluxo atual

1. O utilizador autentica-se na API.
2. O servidor calcula um resumo financeiro com receitas, despesas, categorias, orçamentos, objetivos e subscrições.
3. O texto do utilizador é validado e moderado.
4. O servidor envia o resumo e a pergunta para a Responses API da OpenAI.
5. A resposta é guardada no histórico local e devolvida ao frontend.

A chave da OpenAI fica exclusivamente em `server/.env`:

```env
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5.5
```

Sem chave, o resto da aplicação funciona normalmente e o endpoint de IA devolve `503` com uma explicação clara.

## Decisões de segurança

- Não são enviados email, nome, password ou identificadores bancários ao modelo.
- O identificador de segurança enviado à OpenAI é um hash do ID interno.
- A entrada tem limite de tamanho, autenticação, rate limit e moderação.
- O prompt proíbe inventar movimentos e apresentar aconselhamento financeiro, fiscal ou jurídico como certeza.
- A IA apenas sugere: não executa transferências, compras ou alterações financeiras.

## Evolução recomendada

- Criar um conjunto de perguntas e respostas esperadas para avaliar qualidade e alucinações.
- Comparar o modelo principal com uma variante mais económica antes de escolher o modelo de produção.
- Adicionar streaming para melhorar a sensação de velocidade.
- Pedir consentimento explícito antes de analisar descrições detalhadas de transações reais.
- Implementar eliminação/exportação do histórico e política de retenção.

Referências oficiais: [Responses API](https://developers.openai.com/api/docs/guides/responses), [geração de texto](https://developers.openai.com/api/docs/guides/text) e [boas práticas de segurança](https://developers.openai.com/api/docs/guides/safety-best-practices).
