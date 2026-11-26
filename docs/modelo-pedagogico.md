# Modelo pedagógico e agente conversacional

## 1. Princípio central

O tutor deve oferecer um próximo passo útil ao estudante, sem insistir em perguntas socráticas sucessivas nem distribuir elogios genéricos. O objetivo é apoiar o raciocínio e a autonomia.

As regras de aprendizagem estimada, a seleção de questões e a correção por gabarito pertencem ao sistema. O tutor orienta o estudante.

## 2. Dois modos complementares

### Pergunte ao Tutor

O estudante pergunta sobre Python, enunciados, algoritmos e trechos de código. O tutor usa a mensagem atual e os últimos turnos de conteúdo para interpretar pedidos como “não entendi” ou “explica de outro jeito”. Quando o estudante se refere à missão, o tutor usa seu enunciado. O Olimpio responde brevemente a agradecimentos e confirmações de compreensão e leva em conta os pedidos de respostas mais curtas nos turnos seguintes. A contingência usa uma explicação ou um exemplo preparado do conceito relacionado à dúvida.

Perguntas livres **não atualizam** o domínio numérico. O tutor usa o conceito em foco para contextualizar explicações e o progresso para recomendar missões. Ao orientar sobre código enviado, descreve o que o trecho faria e esclarece dúvidas sobre a execução quando o estudante perguntar.

### Missões Interativas

O sistema apresenta um problema objetivo de previsão de saída, identificação de bug ou complemento de código. O estudante responde. A aplicação verifica o gabarito, registra tentativas e utiliza o modelo do aluno para pontuar.

O catálogo do MVP pode ter até **duas dicas preparadas** por questão. As missões oferecem pistas do catálogo, um exemplo menor, uma revisão do conceito e a explicação direta. As pistas do item são exibidas em sequência conforme o estudante pede ajuda. Um acerto após pedir ajuda na própria missão segue a regra de **+15 pontos**, respeita o limite do conceito e deixa a contagem de acertos independentes intacta. [Modelo do aluno](modelo-do-aluno.md)

## 3. Laços pedagógicos

| Laço | Pergunta que responde | Critérios |
| --- | --- | --- |
| Externo | O que estudar depois? | Grafo, domínio estimado, evidências independentes e preferências |
| Interno | Como ajudar no exercício atual? | Erros, tentativas, dicas, tipo de dificuldade e escolha do estudante |

O tutor pode recomendar revisão quando houver pré-requisito com menos de 50 pontos. A recomendação **não bloqueia** a autonomia do aluno.

Na demonstração, a recomendação prioriza dificuldades registradas no diagnóstico quando há uma missão pendente no conceito. Também pode sugerir um pré-requisito direto abaixo de 50 pontos quando ele tem uma atividade pendente. O catálogo atual delimita as recomendações disponíveis. [Recomendações no backend](../obi_tutor/pedagogia.py)

## 4. Rota de Desbloqueio

| Sinal observado | Comportamento planejado |
| --- | --- |
| Não sabe começar | Oferecer exemplo simples, explicação direta ou divisão do problema |
| Primeiro erro | Apontar o ponto relevante e oferecer nova tentativa |
| Erro repetido | Mudar a abordagem ou oferecer outra missão do mesmo conceito |
| Solicita resposta direta | Explicar com clareza e oferecer aplicação opcional |
| Relata tédio ou deseja encerrar | Oferecer troca de modo, outra missão, pausa ou encerramento sem insistir |
| Avança, mas falta evidência de domínio | Reconhecer o que fez e sugerir uma missão nova |

Não inferir emoções ocultas a partir de uma nota. As intervenções respondem a **ações observáveis e preferências expressas**. Quando o estudante diz que está entediado ou quer mudar de atividade, o Olimpio oferece outra missão, acesso à trilha ou pausa. Essa orientação é preparada pelo backend e mantém a conversa aberta para quem quiser continuar.

## 5. Exemplos de conversa previstos

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

## 7. Integração opcional de LLM

Na demonstração privada, o backend pode enviar a pergunta atual, até dois turnos anteriores de conteúdo, o conceito e o enunciado relevante à API do Gemini. O modelo recebe instruções para responder em português, ir direto à dúvida e manter a explicação breve. A correção, as recomendações e a pontuação são calculadas pelas regras do backend.

Quando a API falha, retorna uma resposta vazia ou ultrapassa o tempo de espera, o Olimpio apresenta orientação preparada. A aplicação permanece utilizável sem chave de API. [Contrato de integração](integracao.md#tutor-e-contingência)
