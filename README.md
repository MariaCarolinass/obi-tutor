# OBI Tutor

Sistema Tutor Inteligente (STI) conversacional para apoiar estudantes do 1º e 2º anos do Ensino Médio na aprendizagem de fundamentos de programação em Python e na resolução de desafios inspirados na modalidade Programação da Olimpíada Brasileira de Informática (OBI).

## Proposta

O sistema combina um **grafo de 10 conceitos e pré-requisitos**, um **modelo do aluno** com estimativas de domínio de 0 a 100 e um **modelo pedagógico** que decide quando recomendar prática, revisão ou outro tipo de ajuda.

O estudante pode alternar, na mesma sessão, entre:

- **Pergunte ao Tutor:** dúvidas sobre conceitos, trechos de código e resolução de problemas. As mensagens livres não alteram a pontuação.
- **Missões Interativas:** desafios objetivos de prever saídas, identificar bugs e completar código. Respostas verificadas por gabarito podem atualizar a pontuação.

A **Rota de Desbloqueio** oferece alternativas quando há dificuldade: pista, exemplo menor, explicação direta, outra missão ou pausa, conforme o contexto e a escolha do estudante.

## Escopo do protótipo

- **Tecnologias previstas:** Python, Streamlit e arquivos JSON para conceitos e exercícios.
- **Estado do aluno:** memória da sessão, sem banco de dados ou autenticação.
- **Conteúdo:** 10 questões diagnósticas, 20 missões de prática e 3 missões adicionais de reforço para conceitos centrais da demonstração.
- **Avaliação:** regras explícitas e determinísticas, sem usar o LLM como corretor de gabaritos.
- **Fora do escopo:** persistência entre sessões, execução de código arbitrário enviado pelo aluno, scraping de provas, geração ilimitada de questões, ranking e voz.

## Documentação

| Arquivo | Finalidade |
| --- | --- |
| [`docs/visao-geral.md`](docs/visao-geral.md) | Requisitos, fluxo e arquitetura prevista |
| [`docs/dominio-e-conteudo.md`](docs/dominio-e-conteudo.md) | Conceitos, grafo e preparação dos exercícios |
| [`docs/modelo-do-aluno.md`](docs/modelo-do-aluno.md) | Estado, pontuação, domínio e regras verificáveis |
| [`docs/modelo-pedagogico.md`](docs/modelo-pedagogico.md) | Estratégias de ajuda, dois modos e laços do tutor |
| [`docs/interface-e-fluxos.md`](docs/interface-e-fluxos.md) | Organização das telas e rascunhos em texto |
| [`docs/testes-e-organizacao.md`](docs/testes-e-organizacao.md) | Frentes de trabalho, casos de teste e demonstração |
| [`AGENTS.md`](AGENTS.md) | Instruções para agentes de IA usados no desenvolvimento |
