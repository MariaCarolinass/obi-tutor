# Interface e fluxos de interação

## 1. Organização geral

Uma aplicação Streamlit com duas áreas de estudo e um painel de progresso. O estudante deve conseguir alternar os modos sem perder o estado enquanto a sessão estiver ativa.

Os esquemas abaixo descrevem **componentes e ações**, não um layout visual obrigatório.

## 2. Rascunho: Missões Interativas

```text
+-------------------------------------------------------------+
| OBI TUTOR                               [Pausar] [Encerrar] |
+-------------------------------------------------------------+
| [ Pergunte ao Tutor ]   [* Missoes Interativas *]            |
+-------------------------------------------------------------+
| CONCEITO: C4 - Condicionais       QUESTAO: C4-MISSAO-01      |
|                                                             |
| Qual condicao inclui a nota 7?                              |
|                                                             |
|  ( ) A. nota > 7                                            |
|  ( ) B. nota >= 7                                           |
|  ( ) C. nota == 8                                           |
|                                                             |
| [Responder]  [Pedir dica]  [Trocar missao]                   |
|                                                             |
| Feedback: avaliado pelo gabarito local.                      |
+-------------------------------------------------------------+
| PROGRESSO: C4 = 55/100  |  Em progresso                      |
| [Ver grafo C1-C10]          [Proxima recomendacao]           |
+-------------------------------------------------------------+
```

**Fluxo:** selecionar conceito -> abrir missão inédita -> responder ou pedir ajuda -> registrar resultado -> atualizar estado e painel -> sugerir missão, revisão ou avanço.

## 3. Rascunho: Pergunte ao Tutor

```text
+-------------------------------------------------------------+
| OBI TUTOR                               [Pausar] [Encerrar] |
+-------------------------------------------------------------+
| [* Pergunte ao Tutor *]   [ Missoes Interativas ]            |
+-------------------------------------------------------------+
| CONCEITO EM FOCO: C5 - Lacos de repeticao                    |
|                                                             |
| ALUNO: Por que meu loop nunca termina?                      |
|                                                             |
| TUTOR: Veja se a variavel da condicao muda dentro do laco.  |
|        Quer analisar um exemplo menor?                      |
|                                                             |
| [Ver exemplo] [Explicar diretamente] [Outra abordagem]      |
|                                                             |
| +---------------------------------------------------------+ |
| | Escreva sua pergunta ou cole um trecho de codigo...     | |
| +---------------------------------------------------------+ |
|                                                 [Enviar]    |
+-------------------------------------------------------------+
| PROGRESSO: consulte o grafo | Chat nao modifica a nota      |
+-------------------------------------------------------------+
```

**Fluxo:** selecionar conceito ou perguntar livremente -> identificar contexto -> orientar -> permitir escolha da próxima ação. Mensagens livres não geram pontos.

## 4. Painel de conceitos

- Exibir conceitos C1 a C10 e suas dependências.
- Diferenciar `não avaliado`, `inicial`, `em progresso` e `dominado`.
- Mostrar pontuação e, quando relevante, que ainda faltam acertos independentes para confirmar domínio.
- Indicar o conceito atual e uma recomendação de estudo, sem impedir escolhas alternativas.

## 5. Estados da sessão

O estado compartilhado pelos dois modos contém: conceito em foco, pontuações, itens concluídos, quantidade de acertos independentes, tentativa atual, dicas utilizadas e mensagens da conversa.

A pausa deve permitir a retomada **na mesma sessão ativa**. Não prometer recuperação do histórico após fechar o navegador, recarregar com sessão perdida ou reiniciar o servidor.

## 6. Critérios de aceitação da interface

- Alternar abas preserva o contexto da sessão.
- O mesmo ID de missão não pontua mais de uma vez.
- A interface deixa claro quando o progresso é apenas uma estimativa.
- Em caso de erro, existem opções distintas de ajuda e continuidade.
- O estudante pode pausar ou encerrar sem ser pressionado.
- Uma indisponibilidade da API não impede exibir uma orientação local nem consultar o estado.
