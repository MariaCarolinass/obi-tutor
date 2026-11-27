# OBI Tutor

Sistema Tutor Inteligente (STI) conversacional para apoiar estudantes do 1º e 2º anos do Ensino Médio na aprendizagem de fundamentos de programação em Python e na resolução de desafios inspirados na modalidade Programação da Olimpíada Brasileira de Informática (OBI).

## Proposta

O sistema combina um **grafo de 10 conceitos e pré-requisitos**, um **modelo do aluno** com estimativas de domínio de 0 a 100 e um **modelo pedagógico** que decide quando recomendar prática, revisão ou outro tipo de ajuda.

O estudante pode alternar, na mesma sessão, entre:

- **Pergunte ao Tutor:** dúvidas sobre conceitos, trechos de código e resolução de problemas. As mensagens livres não alteram a pontuação.
- **Missões Interativas:** desafios objetivos de prever saídas, identificar bugs e completar código. Respostas verificadas por gabarito podem atualizar a pontuação.

A **Rota de Desbloqueio** oferece alternativas quando há dificuldade: pista, exemplo menor, explicação direta, outra missão ou pausa, conforme o contexto e a escolha do estudante.

## Demonstração integrada

- Início, Diagnóstico, Treinar para a OBI, Pergunte ao Tutor e Meu Progresso em React, TypeScript, TanStack Router e Vite.
- Trilha com dez conceitos e 33 questões do catálogo. São dez questões de diagnóstico, vinte missões regulares e três de reforço.
- O backend Python valida o domínio, corrige as respostas, registra o desempenho e recomenda o próximo passo. O chat do Olimpio usa orientações locais e pode usar um LLM quando configurado.
- O progresso fica em memória no backend e a conversa em memória no navegador. Os dois modos compartilham a sessão da aba.

Autenticação, armazenamento persistente de sessões web, execução de código enviado pelo aluno, RAG, scraping de provas, geração ilimitada de questões, ranking e voz ficam fora do MVP. [Visão geral](docs/visao-geral.md)

## Documentação

| Arquivo | Finalidade |
| --- | --- |
| [`docs/visao-geral.md`](docs/visao-geral.md) | Requisitos, fluxo e arquitetura |
| [`docs/dominio-e-conteudo.md`](docs/dominio-e-conteudo.md) | Conceitos, grafo e preparação dos exercícios |
| [`docs/modelo-do-aluno.md`](docs/modelo-do-aluno.md) | Estado, pontuação, domínio e regras verificáveis |
| [`docs/modelo-pedagogico.md`](docs/modelo-pedagogico.md) | Estratégias de ajuda, dois modos e laços do tutor |
| [`docs/interface-e-fluxos.md`](docs/interface-e-fluxos.md) | Telas, rotas e comportamento da sessão |
| [`docs/testes-e-organizacao.md`](docs/testes-e-organizacao.md) | Frentes de trabalho, casos de teste e demonstração |
| [`docs/integracao.md`](docs/integracao.md) | Contrato entre domínio, modelo do aluno, tutor e frontend |
| [`AGENTS.md`](AGENTS.md) | Instruções para agentes de IA usados no desenvolvimento |

## Desenvolvimento local

Use **Python 3.10+** e **Node.js 20.19+ na linha 20.x, ou 22.12+** com npm.

Para iniciar o backend, execute na raiz do repositório.

```bash
python3 -m obi_tutor.api
```

Em outro terminal, execute a partir da raiz.

```bash
cd frontend
npm ci
npm run dev
```

Abra o endereço exibido pelo Vite, normalmente [http://localhost:5173](http://localhost:5173). O Vite encaminha `/api` para o Python na porta 8000. O backend usa a biblioteca padrão do Python.

### Tutor com IA

Use uma chave do Google AI Studio e configure a variável de ambiente `GOOGLE_API_KEY` com o valor da chave. O Olimpio usa o Gemini 3.1 Flash-Lite.

### Testes e build

Na raiz do repositório, execute em um ambiente virtual.

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m pytest
```

Em `frontend/`, execute.

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

O teste de navegação inicia o backend Python em uma porta livre. Após o build, `python3 -m obi_tutor.api` serve a API e os arquivos de `frontend/dist/` em [http://127.0.0.1:8000](http://127.0.0.1:8000), incluindo o acesso direto a rotas como `/tutor` e `/missoes/MISS-C4-01`.
