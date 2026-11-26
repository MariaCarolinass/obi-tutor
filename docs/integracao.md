# Integração do OBI Tutor

A divisão a seguir documenta o contrato implementado para revisão do grupo. [Planejamento geral](https://github.com/MariaCarolinass/obi-tutor/issues/1) · [Integração e tutor](https://github.com/MariaCarolinass/obi-tutor/issues/5)

## Domínio, aluno e pedagogia

- **Domínio, Endriw.** `obi_tutor/dados/questoes.json` traz IDs únicos, `concept_id`, tipo, formato, dificuldade, enunciado, trecho opcional, alternativas com `id` e `texto`, gabarito, explicação e dicas. `obi_tutor/dados/conceitos.json` contém o grafo C1 a C10 usado em todas as telas. O servidor valida o grafo, as referências das questões e a distribuição declarada ao iniciar. [Issue #2](https://github.com/MariaCarolinass/obi-tutor/issues/2)
- **Modelo do aluno, Erika.** O fluxo web importa `ModeloAluno` de `obi_tutor.models.modelo_aluno`. O backend fornece à classe o ID da questão, o conceito, o tipo, a correção objetiva, o total de tentativas e o uso de ajuda. A interface recebe as pontuações, os acertos independentes e os estados calculados pela classe. A persistência JSON dos testes do pacote fica fora da sessão web. [Issue #3](https://github.com/MariaCarolinass/obi-tutor/issues/3)
- **Pedagogia e interface, Maria Carolina.** O backend calcula a recomendação, identifica pré-requisitos abaixo de 50, seleciona a orientação após um erro e disponibiliza quatro tipos de ajuda. O frontend apresenta o catálogo, o feedback e o estado oficial da sessão. [Issue #5](https://github.com/MariaCarolinass/obi-tutor/issues/5)

## API local

- **`POST /api/session`** cria uma sessão e retorna `id`, `catalog` e `state`. O catálogo público entrega `concepts`, `trainingMissions` e `diagnosticQuestions`. Gabaritos, explicações e dicas são lidos pelo servidor. A explicação é retornada no acerto ou quando a pessoa pede ajuda direta na missão.
- **`POST /api/session/action`** recebe o cabeçalho `X-Study-Session` com o ID e um `requestId` inteiro crescente por sessão. A resposta contém `state` e `result`. Reenviar a última solicitação com o mesmo ID e conteúdo devolve o mesmo resultado.
  - `action: "answer"` recebe `questionId` e `optionId` e devolve correção, pontos concedidos, indicação de revisão e feedback quando aplicável.
  - `action: "help"` recebe `questionId` e `kind` (`hint`, `simple`, `concept` ou `direct`) e devolve uma orientação. As ajudas da missão são registradas para os próximos acertos naquele item.
  - `action: "chat"` recebe `text` e, quando disponível, `questionId` da missão em foco. Retorna o texto do tutor e pode indicar uma missão relacionada ou oferecer o encerramento.
- **`DELETE /api/session`** recebe `X-Study-Session` e encerra aquela sessão. A interface usa um identificador em memória da aba e abre outra sessão ao reiniciar ou recarregar. Sessões abandonadas expiram após duas horas sem atividade. O servidor local suporta até 256 sessões ativas.

## Tutor e contingência

O chat da demonstração privada usa o Gemini 3.1 Flash-Lite via `generateContent`. Configure `OLIMPIO_TUTOR_OBI` no ambiente do backend ou no `.env` ignorado pelo Git. Use uma chave de um projeto do Google AI Studio no **Nível gratuito**. O projeto determina a cota e o faturamento. [API do Gemini](https://aistudio.google.com/api-reference/generate-content/generate-content) · [Cotas ativas do projeto](https://aistudio.google.com/rate-limit)

O módulo `obi_tutor/tutor.py` seleciona o contexto da conversa e a resposta de contingência. O adaptador `obi_tutor/services/gemini.py` lê a chave, envia a solicitação e extrai o texto retornado.

O adaptador envia a pergunta atual e, quando pertinente, o conceito e o enunciado da missão. Use perguntas fictícias na apresentação. Os termos do nível gratuito permitem que o Google use as entradas e respostas para melhorar seus produtos. Se a chave estiver ausente ou a API devolver erro de cota, falha ou texto vazio, o Olimpio usa uma orientação preparada. [Termos do Gemini](https://aistudio.google.com/docs/terms)

## Validação antes da apresentação

Os testes de integração exercitam o catálogo e o grafo, os três perfis de estudante, o reenvio de resposta, os estados de domínio, a recomendação pedagógica e a contingência do provedor. A revisão pedagógica dos enunciados e gabaritos e o teste com uma credencial real do provedor fazem parte da validação da entrega. [Roteiro da demonstração](testes-e-organizacao.md#4-validação-técnica)
