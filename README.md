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

## Desenvolvimento local

O PR 0 disponibiliza uma estrutura Python inicial, uma página Streamlit e testes
de smoke. Os modelos de domínio, aluno e pedagógico, as missões e o chat descritos
acima continuam planejados.

Requer **Python 3.10 ou superior**. Execute os comandos na raiz do repositório.

### Preparar o ambiente

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

No Windows (PowerShell), crie o ambiente com `py -m venv .venv` e ative-o com
`.venv\Scripts\Activate.ps1`; depois use o mesmo comando de instalação.

O bootstrap não exige `.env`, chave de API nem arquivos de questões. Após instalar
as dependências, a página inicial funciona sem acesso à internet.

### Iniciar a aplicação

```bash
python -m streamlit run app.py
```

Abra o endereço local indicado no terminal (normalmente `http://localhost:8501`).
Para encerrar o servidor, pressione `Ctrl+C`.

### Executar os testes

```bash
python -m pytest
```

Os testes verificam a importação de `obi_tutor/` e a página inicial com
conexões de rede bloqueadas. Para sair do ambiente virtual, execute `deactivate`.
