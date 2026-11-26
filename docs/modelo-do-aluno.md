# Modelo do aluno: estado e pontuação

## 1. O que é armazenado

Para cada conceito `C1` a `C10`, manter:

- `avaliado`: se já existe resposta objetiva observada para o conceito.
- `pontuacao`: valor inteiro de 0 a 100.
- `acertos_independentes`: quantidade de itens distintos acertados **de primeira e sem dica**.
- `itens_pontuados`: conjunto de IDs de questões que já receberam pontuação.

Na sessão do MVP, registrar ainda conceito atual, modo ativo, tentativas na questão, dicas utilizadas, respostas e histórico de conversa. A interface deve indicar que um conceito está **não avaliado** até receber uma resposta objetiva.

Na aplicação web, o backend mantém o estado de cada conceito, os resultados do diagnóstico, as missões concluídas, os erros e as ajudas por item. O histórico do chat fica em memória na aba. A alternativa em edição e o feedback visível ficam na tela da atividade. [Modelo do aluno em Python](../obi_tutor/models/modelo_aluno.py) · [Sessão web](../obi_tutor/sessao.py)

## 2. Eventos e atualização

| Evento verificável | Variação |
| --- | ---: |
| Acerto no diagnóstico | +30 |
| Acerto na primeira tentativa e sem ajuda, em missão inédita | +25 |
| Acerto em missão após receber dica | +15 |
| Acerto em missão após nova tentativa, sem dica | +10 |
| Erro, missão não resolvida ou abandono | 0 |
| Pedido de dica, texto livre, troca de modo ou pausa | 0 |

A pontuação é limitada ao intervalo **0 a 100**, de acordo com:

`nova_pontuacao = min(100, max(0, pontuacao_atual + delta))`

Se houve dica e mais de uma tentativa, o acerto vale **+15**, conforme o pré-projeto. Se houve nova tentativa sem dica, vale **+10**. Na demonstração, a pista, o exemplo menor, a revisão do conceito e a explicação direta, quando pedidos na missão antes do acerto, registram uso de ajuda no item.

A primeira resposta registrada encerra cada questão do diagnóstico. Nas missões, os erros contam como tentativas e é possível tentar novamente até acertar. A primeira resposta correta aplica a pontuação da missão, limitada pelos 100 pontos do conceito. Repetições posteriores servem para revisão e valem zero.

Uma resposta correta no diagnóstico, por ser dada de primeira e sem dica, também conta como um acerto independente. Acertos após dica ou após nova tentativa não contam como independentes.

## 3. Estado do conceito

| Situação | Estado exibido |
| --- | --- |
| Sem respostas objetivas | Não avaliado |
| 0 a 34 pontos, já avaliado | Inicial |
| 35 a 69 pontos | Em progresso |
| 70 a 100 pontos, porém menos de 2 acertos independentes | Em progresso |
| Pelo menos 70 pontos **e** 2 acertos independentes em itens distintos | Dominado |

O valor 70 é um **limiar heurístico de funcionamento do protótipo**, não uma prova de aprendizagem estável.

## 4. Casos de exemplo

**Exemplo A: evolução após diagnóstico incorreto**

| Evento | Pontos acumulados | Acertos independentes |
| --- | ---: | ---: |
| Diagnóstico incorreto | 0 | 0 |
| Missão 1 correta de primeira | 25 | 1 |
| Missão 2 correta de primeira | 50 | 2 |
| Missão 3 de reforço correta de primeira | 75 | 3 |

Resultado **Dominado**. A terceira missão precisa ser um item novo. É possível reproduzir esse exemplo em C4 na demonstração atual.

**Exemplo B: pontuação alta, mas apoio frequente**

Se o estudante alcançar 70 pontos utilizando dicas em várias missões, mas tiver apenas um acerto independente, o estado continua **em progresso**. O tutor recomenda outra oportunidade de prática, sem punição.

**Exemplo C: diagnóstico correto e duas missões corretas de primeira**

`30 + 25 + 25 = 80` pontos, com três acertos independentes. Resultado: **dominado**.

## 5. Recomendações a partir do estado

O modelo do aluno **registra fatos**, não decide sozinho a mensagem do tutor. O modelo pedagógico consulta os resultados e o grafo:

- Quando não houver domínio confirmado, pode recomendar outra missão ou revisão.
- Antes de sugerir avanço, verificar se algum pré-requisito direto tem menos de 50 pontos.
- Recomendar revisão de base fraca sem bloquear a escolha do estudante.

## 6. Limitações e testes

A estimativa não distingue chute e compreensão profunda, não considera esquecimento, nem calibra automaticamente a dificuldade entre questões. Pedidos de explicação e conversas livres não mudam pontos.

Testes mínimos: limites 0 e 100, repetição de item, acerto com dica, acerto após tentativa, dois acertos independentes, erro sem desconto, conceito não avaliado e evolução por missões novas.
