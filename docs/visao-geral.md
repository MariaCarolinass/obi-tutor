# Visão geral e requisitos do MVP

## 1. Problema educacional

Resolver problemas de programação exige interpretar enunciados, escolher estruturas, testar hipóteses e corrigir erros. Quando o estudante não sabe continuar, uma solução pronta pode interromper a aprendizagem. Um tutor que apenas repete perguntas também pode tornar a experiência cansativa.

O OBI Tutor pretende oferecer apoio contextual sem substituir automaticamente o raciocínio do estudante.

## 2. Público e objetivos

**Público:** estudantes do 1º e 2º anos do Ensino Médio, com atividades introdutórias de Python inspiradas nas provas de programação da OBI. As séries escolares não são equivalentes aos níveis oficiais da competição.

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

**Pergunte ao Tutor** oferece um chat com o Olimpio para tirar dúvidas de Python e explorar exemplos de preparação para a OBI. O backend usa a mensagem e, quando pertinente, a missão em foco. O LLM é opcional e o tutor tem orientações locais de contingência. A conversa não altera a pontuação.

**Missões Interativas** oferece diagnóstico opcional e desafios com gabarito local. A aplicação registra tentativas, oferece ajuda e concede pontos uma única vez por item.

O estudante pode alternar os modos na mesma sessão.

## 5. Fluxo funcional

1. No Início, abrir a missão recomendada, fazer o diagnóstico opcional, explorar a trilha ou conversar com o Olimpio.
2. Ao concluir o diagnóstico, consultar o resultado por conceito avaliado e a missão recomendada.
3. Escolher um conceito ou seguir uma sugestão. A trilha indica dependências e atividades disponíveis.
4. Na missão, verificar uma resposta, pedir ajuda ou tentar outra abordagem.
5. Consultar o progresso atualizado por conceito e escolher o próximo passo.
6. Continuar treinando, alternar para o chat, pausar a atividade ou sair da página.

A pausa e a navegação preservam o progresso registrado enquanto a sessão estiver ativa. O estudante pode encerrar a sessão pelo menu ou pelo chat quando pedir para parar. [Interface e fluxos](interface-e-fluxos.md)

## 6. Arquitetura

- React, TypeScript, TanStack Router e Vite executam a interface no navegador.
- O servidor Python carrega e valida os conceitos, os pré-requisitos e o catálogo de 39 questões. O backend consulta o gabarito local e entrega à interface os dados necessários para cada tela.
- O modelo do aluno em Python registra respostas objetivas. O modelo pedagógico usa o estado do aluno e o grafo para recomendar revisão, prática ou avanço.
- O histórico do chat fica na aba. A correção, o progresso e as recomendações usam uma sessão em memória no servidor. O fluxo web funciona sem banco de dados.
- O tutor usa a API de LLM quando configurada. Se o provedor estiver indisponível, o backend usa uma orientação local e preserva o fluxo de estudo.

[Contrato de integração](integracao.md)

## 7. Resultado demonstrável

A demonstração conecta as três camadas quando a resposta a uma missão atualiza a pontuação e o estado do conceito na trilha e no painel, alimentando a recomendação seguinte. Os testes da API exercitam perfis de acerto total, erro total e desempenho misto. A demonstração em grupo segue o roteiro de validação. [Cenários de validação](testes-e-organizacao.md#3-cenários-obrigatórios)
