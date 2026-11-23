# Modelo pedagógico e agente conversacional

## 1. Princípio central

O tutor deve oferecer um próximo passo útil ao estudante, sem insistir em perguntas socráticas sucessivas nem distribuir elogios genéricos. O objetivo é apoiar o raciocínio e a autonomia.

O agente **não é a autoridade sobre a pontuação**: regras de aprendizagem estimada, seleção de questões e correção por gabarito pertencem ao sistema.

## 2. Dois modos complementares

### Pergunte ao Tutor

O estudante pergunta sobre Python, enunciados, algoritmos e trechos de código. O agente pode explicar, levantar hipóteses sobre um erro e recomendar testes. **Não deve afirmar que executou o código** quando apenas o analisou.

Perguntas livres **não atualizam** o domínio numérico. O modo pode utilizar o conceito em foco e o conhecimento já registrado para contextualizar a orientação.

### Missões Interativas

O sistema apresenta um problema objetivo de previsão de saída, identificação de bug ou complemento de código. O estudante responde. A aplicação verifica o gabarito, registra tentativas e utiliza o modelo do aluno para pontuar.

As missões podem ter até **duas dicas preparadas**. Uma resposta correta após dica recebe a pontuação definida no modelo do aluno, sem equivaler a um acerto independente.

## 3. Laços pedagógicos

| Laço | Pergunta que responde | Critérios |
| --- | --- | --- |
| Externo | O que estudar depois? | Grafo, domínio estimado, evidências independentes e preferências |
| Interno | Como ajudar no exercício atual? | Erros, tentativas, dicas, tipo de dificuldade e escolha do estudante |

O tutor pode recomendar revisão quando houver pré-requisito com menos de 50 pontos. A recomendação **não bloqueia** a autonomia do aluno.

## 4. Rota de Desbloqueio

| Sinal observado | Comportamento planejado |
| --- | --- |
| Não sabe começar | Oferecer exemplo simples, explicação direta ou divisão do problema |
| Primeiro erro | Apontar o ponto relevante e oferecer nova tentativa |
| Erro repetido | Mudar a abordagem ou oferecer outra missão do mesmo conceito |
| Solicita resposta direta | Explicar com clareza e oferecer aplicação opcional |
| Relata tédio ou deseja encerrar | Oferecer troca de modo, outra missão, pausa ou encerramento sem insistir |
| Avança, mas falta evidência de domínio | Reconhecer o que fez e sugerir uma missão nova |

Não inferir emoções ocultas a partir de uma nota. As intervenções respondem a **ações observáveis e preferências expressas**.

## 5. Exemplos de conversa

**Pergunte ao Tutor**

> Aluno: Meu programa retorna 5, mas a maior sequência é 3. Onde errei?  
> Tutor: O código está somando todas as vitórias. Em `[1, 0, 1, 1]`, temos 3 vitórias, mas apenas 2 seguidas. Quer revisar onde o contador é reiniciado?

A orientação não altera a pontuação.

**Missões Interativas**

> Missão: Qual condição aprova quem tirou pelo menos 7?  
> Aluno: `nota > 7`  
> Tutor: Teste a nota 7. Qual operador inclui esse valor?  
> Aluno: `nota >= 7`  
> Tutor: Agora o limite está incluído. O sistema registra o resultado conforme o histórico de dicas e tentativas.

O gabarito é validado pela aplicação. O agente não atribui pontos livremente.

## 6. Fundamentação

- **Bloom:** aprendizagem para o domínio inspira recomendações de prática e revisão.
- **Vygotsky:** apoio gradual por meio de exemplos menores e microtarefas.
- **Hattie e Timperley:** feedback específico, centrado no erro e na ação seguinte.
- **Deci e Ryan:** escolha do modo, do tipo de ajuda e da possibilidade de parar.

Essas teorias justificam decisões de projeto, mas **não comprovam a eficácia do protótipo**.

## 7. Comportamento esperado do LLM

Receber somente o contexto necessário: conceito em foco, enunciado ativo quando houver, resumo pertinente do estado do aluno, tipo de intervenção permitida e mensagem atual. Responder de forma breve, apropriada ao estudante e sem inventar validações.

Se a API falhar, a aplicação deve manter o fluxo principal e apresentar orientação preparada. A ausência do LLM não pode invalidar o gabarito nem corromper a pontuação.
