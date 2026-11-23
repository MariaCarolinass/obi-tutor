# Visão geral e requisitos do MVP

## 1. Problema educacional

Resolver problemas de programação exige interpretar enunciados, escolher estruturas, testar hipóteses e corrigir erros. Quando o estudante não sabe continuar, uma solução pronta pode interromper a aprendizagem. Um tutor que apenas repete perguntas também pode tornar a experiência cansativa.

O OBI Tutor pretende oferecer apoio contextual sem substituir automaticamente o raciocínio do estudante.

## 2. Público e objetivos

**Público:** estudantes do 1º e 2º anos do Ensino Médio, com atividades introdutórias de Python inspiradas na modalidade Programação da OBI. As séries escolares não são equivalentes aos níveis oficiais da competição.

**Objetivos verificáveis:**

1. Interpretar um enunciado e identificar entradas, saídas e casos de teste.
2. Aplicar condicionais, laços e contadores em trechos curtos de algoritmos.
3. Identificar uma falha lógica e justificar uma correção com base em exemplos.

## 3. Componentes do STI

| Componente | Responsabilidade | Evidência observável |
| --- | --- | --- |
| Modelo de domínio | Descrever o que ensinar e as dependências entre conceitos | Grafo C1 a C10 e catálogo de questões |
| Modelo do aluno | Registrar o desempenho observado por conceito | Nota 0 a 100, tentativas, dicas e acertos independentes |
| Modelo pedagógico | Recomendar estudo e decidir como ajudar na atividade atual | Revisão, nova missão, pista, exemplo e escolha do estudante |

O **laço externo** seleciona o próximo conceito ou exercício. O **laço interno** orienta o estudante durante o problema atual. Os dois utilizam o estado oficial do aluno, mas não delegam pontuação ao LLM.

## 4. Experiências

**Pergunte ao Tutor:** chat para perguntas, conceitos e interpretação de código. As respostas são orientações e não avaliações objetivas.

**Missões Interativas:** diagnóstico e pequenos desafios com gabaritos. O sistema pode conceder pontos e oferecer ajuda, mas não repete pontuação do mesmo item.

O estudante pode alternar os modos na mesma sessão.

## 5. Fluxo funcional

1. Abrir o sistema e selecionar um modo.
2. No modo de missões, responder ao diagnóstico curto e observar a recomendação inicial.
3. Escolher um conceito ou aceitar uma sugestão baseada no grafo.
4. Responder, solicitar ajuda ou tentar outra abordagem.
5. Corrigir objetivamente quando houver gabarito, registrando o resultado.
6. Atualizar a estimativa por conceito, exibir o progresso e sugerir próximo passo.
7. Continuar, alternar o modo, pausar ou encerrar.

A pausa mantém o estado apenas enquanto a sessão estiver ativa.

## 6. Arquitetura prevista

- **Python + Streamlit:** lógica e interface.
- **JSON:** conceitos, dependências, questões, alternativas, gabaritos, explicações e dicas.
- **Estado de sessão:** pontuações, questões concluídas, tentativas, pistas, conceito em foco e histórico do chat.
- **LLM:** redação de explicações, contextualização e orientação. Nunca executa a regra oficial de pontuação.
- **Fallback:** resposta preparada caso a API não esteja acessível.

O sistema não exige banco de dados no MVP. Não serão implementados autenticação, perfis permanentes, execução de código enviado, RAG, scraping de provas, ranking ou voz.

## 7. Resultado demonstrável

A demonstração deve conectar as três camadas: responder a uma missão, atualizar o estado do aluno, alterar o grafo e observar uma recomendação coerente. O grupo validará essa cadeia com perfis de acerto total, erro total e desempenho misto.
