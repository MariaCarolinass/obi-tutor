# OBI Tutor

Sistema Tutor Inteligente (STI) conversacional para apoiar estudantes do 1º e 2º anos do Ensino Médio na aprendizagem de fundamentos de programação em Python e na resolução de desafios inspirados na modalidade Programação da Olimpíada Brasileira de Informática (OBI).

## Proposta

O sistema combina um **grafo de 10 conceitos e pré-requisitos**, um **modelo do aluno** com estimativas de domínio de 0 a 100 e um **modelo pedagógico** que decide quando recomendar prática, revisão ou outro tipo de ajuda.

O estudante pode alternar, na mesma sessão, entre:

- **Pergunte ao Tutor:** dúvidas sobre conceitos, trechos de código e resolução de problemas. As mensagens livres não alteram a pontuação.
- **Missões Interativas:** desafios objetivos de prever saídas, identificar bugs e completar código. Respostas verificadas por gabarito podem atualizar a pontuação.

A **Rota de Desbloqueio** oferece alternativas quando há dificuldade: pista, exemplo menor, explicação direta, outra missão ou pausa, conforme o contexto e a escolha do estudante.

## Demonstração atual

- Início, Diagnóstico, Treinar para a OBI, Pergunte ao Tutor e Meu Progresso em React, TypeScript, TanStack Router e Vite.
- Uma trilha com os dez conceitos, cinco questões de diagnóstico opcional e sete missões de prática.
- Gabaritos e pontuação calculados no navegador. Um conceito é exibido como **Dominado** quando tem pelo menos 70 pontos e dois acertos independentes em questões distintas.
- Chat com o Olimpio, tutor demonstrativo da OBI com respostas predefinidas. O progresso e a conversa ficam em memória no navegador enquanto a sessão está ativa.

O MVP prevê um catálogo de 33 itens e uma integração de LLM para formular orientações, com resposta local de contingência. Autenticação, armazenamento persistente, execução de código enviado pelo aluno, RAG, scraping de provas, geração ilimitada de questões, ranking e voz ficam fora do escopo. [Visão geral do MVP](docs/visao-geral.md)

## Documentação

| Arquivo | Finalidade |
| --- | --- |
| [`docs/visao-geral.md`](docs/visao-geral.md) | Requisitos, fluxo e arquitetura |
| [`docs/dominio-e-conteudo.md`](docs/dominio-e-conteudo.md) | Conceitos, grafo e preparação dos exercícios |
| [`docs/modelo-do-aluno.md`](docs/modelo-do-aluno.md) | Estado, pontuação, domínio e regras verificáveis |
| [`docs/modelo-pedagogico.md`](docs/modelo-pedagogico.md) | Estratégias de ajuda, dois modos e laços do tutor |
| [`docs/interface-e-fluxos.md`](docs/interface-e-fluxos.md) | Telas, rotas e comportamento da sessão |
| [`docs/testes-e-organizacao.md`](docs/testes-e-organizacao.md) | Frentes de trabalho, casos de teste e demonstração |
| [`AGENTS.md`](AGENTS.md) | Instruções para agentes de IA usados no desenvolvimento |

## Desenvolvimento local

### Iniciar a aplicação

Use **Node.js 20.19 ou superior na linha 20.x, ou Node.js 22.12 ou superior**, com npm. Execute na raiz do repositório.

```bash
cd frontend
npm ci
npm run dev
```

Abra o endereço exibido no terminal, normalmente [http://localhost:5173](http://localhost:5173). Depois de instalar as dependências, a demonstração usa fontes, imagens e dados locais e dispensa um arquivo `.env` ou chaves de API.

### Testar e gerar o build

Execute em `frontend/`.

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

`npm run build` gera `frontend/dist/`. Use `npm run preview` para testar esse build localmente. Em uma hospedagem estática, configure o servidor para servir `index.html` ao acessar diretamente rotas do frontend como `/tutor` e `/missoes/if-1`.

### Pacote Python

O pacote `obi_tutor/` já contém uma implementação do modelo do aluno. A demonstração web usa sua implementação em TypeScript no navegador. Para rodar os testes Python de importação e do modelo do aluno, use **Python 3.10+** em um ambiente virtual e execute a partir da raiz.

```bash
python -m pip install -r requirements.txt
python -m pytest
```
