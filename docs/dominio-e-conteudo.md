# Modelo de domínio e conteúdo

## 1. Escopo

O domínio cobre interpretação de problemas, fundamentos de Python e prática introdutória com estruturas de dados. Os desafios são inspirados na OBI Programação e voltados a estudantes do 1º e do 2º ano do Ensino Médio.

## 2. Conceitos e pré-requisitos

| ID | Conceito | Pré-requisitos diretos |
| --- | --- | --- |
| C1 | Interpretação de enunciados | Nenhum |
| C2 | Entradas, saídas e casos de teste | C1 |
| C3 | Variáveis e operações | C2 |
| C4 | Condicionais e comparações | C3 |
| C5 | Laços de repetição | C3 |
| C6 | Contadores e acumuladores | C4, C5 |
| C7 | Listas e percursos | C5 |
| C8 | Teste de mesa | C4, C5 |
| C9 | Casos-limite e validação | C2, C8 |
| C10 | Resolução de problema combinado | C6, C7, C9 |

O sentido de uma dependência é **pré-requisito -> conceito dependente**. Um exemplo: C6 requer condições e repetição. C10 combina contagem, listas e verificação de casos-limite.

## 3. Catálogo de exercícios

### Catálogo integrado

A trilha exibe os dez conceitos e seus pré-requisitos. O diagnóstico é opcional e tem um item por conceito. Os IDs e gabaritos são carregados pelo backend. [Catálogo de questões](../obi_tutor/dados/questoes.json) · [Grafo](../obi_tutor/dados/conceitos.json)

| Tipo | Quantidade | Finalidade |
| --- | ---: | --- |
| Diagnóstico | 10 | Um item inicial por conceito |
| Missões regulares | 26 | Duas por conceito e seis adicionais de estruturas de dados em C7, C9 e C10 |
| Reforço para demonstração | 3 | Uma atividade extra para cada conceito central selecionado |
| **Total** | **39** | Questões do catálogo integrado |

Formatos das missões: **Detetive de Bugs** (identificar falha), **Preveja a Saída** (interpretar execução) e **Complete o Código** (selecionar uma alternativa que falta).

As seis missões adicionais trabalham pilha e matriz em C7, frequência com dicionário em C9 e conjunto, fila e parênteses balanceados em C10. Cada questão atribui seus pontos a um único conceito principal.

O catálogo de treino agrupa as missões por conceito e ordena as atividades de fácil a difícil. Dentro da mesma dificuldade, vale a ordem do arquivo de questões. Os níveis de dificuldade servem para orientar o estudo, e o estudante pode iniciar qualquer missão.

## 4. Dados necessários para cada conceito

- `id`, nome e descrição curta.
- Lista de IDs de pré-requisitos diretos.
- Referências aos itens que o avaliam.

## 5. Dados necessários para cada questão

- ID único e estável.
- Conceito principal (`concept_id`).
- Tipo (`diagnostico`, `missao` ou `reforco`) e formato da atividade.
- Enunciado e, quando necessário, trecho de código Python.
- Alternativas ou resposta estruturada verificável.
- Gabarito local inequívoco.
- Explicação do raciocínio e até duas dicas preparadas.
- O campo `feedback_por_alternativa` associa o ID de cada alternativa incorreta a uma orientação curta. O catálogo atual tem orientações nas 39 questões. O backend devolve a orientação a cada erro nas missões e na revisão após o diagnóstico.
- Indicação simples de dificuldade, útil para a escolha entre missões.

## 6. Regras de qualidade

1. Não criar ciclos nem referências para conceitos inexistentes.
2. Confirmar que cada alternativa correta é inequívoca.
3. Revisar gabarito e explicação **sem depender do LLM**.
4. Evitar itens repetidos com respostas memorizáveis quando forem usados para nova avaliação.
5. Não conceder pontos duas vezes pelo mesmo ID.
6. Manter os itens resolúveis sem executar código enviado pelo estudante.
7. Identificar exemplos fictícios quando o contexto puder ser confundido com uma regra oficial da OBI.
8. Em questões sobre regras gerais, usar casos de teste que distingam o gabarito de alternativas que funcionam apenas para um exemplo.

## 7. Observação sobre cobertura

Quem erra o diagnóstico e acerta duas missões regulares de primeira e sem ajuda chega a 50 pontos. O catálogo inclui missões de reforço em C4, C5 e C6 para oferecer uma nova oportunidade de avaliação.

Após errar o diagnóstico, é possível chegar a 75 pontos e três acertos independentes em C4, C5 e C6 com a missão de reforço e em C7, C9 e C10 com as missões adicionais. C1, C2, C3 e C8 têm duas missões cada e chegam a 50 pontos nesse cenário. [Modelo do aluno](modelo-do-aluno.md)
