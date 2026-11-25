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

**Pergunte ao Tutor** oferece um chat para dúvidas e exemplos de Python. Na demonstração, a aplicação seleciona respostas predefinidas a partir da mensagem do estudante. A conversa não altera a pontuação.

**Missões Interativas** oferece diagnóstico opcional e desafios com gabarito local. A aplicação registra tentativas, oferece ajuda e concede pontos uma única vez por item.

O estudante pode alternar os modos na mesma sessão.

## 5. Fluxo funcional

1. Abrir o Início e escolher entre fazer o diagnóstico, começar a treinar ou acessar o tutor pelo menu.
2. Responder ao diagnóstico opcional e consultar a recomendação inicial, ou seguir direto para a trilha.
3. Escolher um conceito ou seguir uma sugestão. A trilha indica dependências e atividades disponíveis.
4. Na missão, verificar uma resposta, pedir ajuda ou tentar outra abordagem.
5. Consultar o progresso atualizado por conceito e escolher o próximo passo.
6. Continuar treinando, alternar para o chat, pausar a atividade ou sair da página.

A pausa e a navegação preservam o progresso registrado enquanto a sessão estiver ativa. O fluxo dedicado de encerramento está previsto para o MVP. [Interface e fluxos](interface-e-fluxos.md)

## 6. Arquitetura

### Demonstração atual

- React, TypeScript, TanStack Router e Vite executam a interface migrada do Lovable no navegador. [Frontend](../frontend/)
- O grafo C1 a C10, o catálogo demonstrativo, o gabarito, a pontuação e as recomendações são locais. [Lógica em TypeScript](../frontend/src/lib/learning.ts)
- O provedor de sessão mantém pontuações, conclusões, resultados do diagnóstico, erros e ajuda usada por atividade, além do histórico do chat. Recarregar a página ou confirmar **Reiniciar demonstração** descarta esse estado. [Provedor de sessão](../frontend/src/components/learning-provider.tsx)

### Evolução prevista para o MVP

- O pacote Python está reservado para a lógica planejada. Os arquivos JSON previstos descrevem conceitos, dependências, questões, gabaritos, explicações e dicas do catálogo completo. [Pacote Python](../obi_tutor/)
- A integração de LLM poderá formular explicações, contextualizar orientações e usar o conceito em foco. As regras locais continuam responsáveis pelo gabarito, pela pontuação e pelo estado de domínio.
- Se a API ficar indisponível, a aplicação deve manter o fluxo principal e usar uma orientação preparada. [Modelo pedagógico](modelo-pedagogico.md)

O sistema não exige banco de dados no MVP. Não serão implementados autenticação, perfis permanentes, execução de código enviado, RAG, scraping de provas, ranking ou voz.

## 7. Resultado demonstrável

A demonstração conecta as três camadas quando a resposta a uma missão atualiza a pontuação e o estado do conceito na trilha e no painel, alimentando a recomendação seguinte. O grupo validará a cadeia completa do MVP com perfis de acerto total, erro total e desempenho misto. [Cenários de validação](testes-e-organizacao.md#3-cenários-obrigatórios)
