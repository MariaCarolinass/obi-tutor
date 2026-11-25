# Interface e fluxos de interação

## 1. Navegação

A interface web tem um menu lateral no desktop e um menu recolhível no celular. O estudante pode alternar entre treinar e conversar com o tutor durante a sessão.

- **Início** (`/`) apresenta o OBI Tutor e seu público, estudantes do 1º e do 2º ano do Ensino Médio. **Começar com o tutor** ou **Continuar com o tutor** abre a missão recomendada. **Conversar com o tutor** abre o chat com o Olimpio. A página também dá acesso ao diagnóstico, à trilha e ao guia sobre a modalidade Programação da OBI.
- **Diagnóstico** (`/diagnostico`) oferece cinco questões opcionais, um resultado por conceito avaliado e uma missão recomendada.
- **Treinar para a OBI** (`/trilha`) apresenta os conceitos, pré-requisitos e atividades disponíveis. As missões abrem em `/missoes/<id>`.
- **Pergunte ao Tutor** (`/tutor`) reúne a conversa demonstrativa com o Olimpio e sugestões de perguntas.
- **Meu Progresso** (`/progresso`) exibe a pontuação, o estado e os acertos independentes de cada conceito.

## 2. Diagnóstico e Missões Interativas

### Diagnóstico opcional

No Início, **Fazer o diagnóstico** abre a tela do diagnóstico. O estudante pode iniciá-lo, pausá-lo ou seguir direto para a trilha. Na retomada, a interface abre a primeira questão ainda sem resposta registrada.

Ao concluir as cinco questões, o estudante vê o total de acertos e uma missão sugerida. Em **Seu nível por conceito**, cada conceito avaliado mostra o resultado da questão, os pontos ganhos em caso de acerto e o estado atual do conceito na sessão. Essa estimativa orienta a prática. Os níveis oficiais de inscrição na OBI seguem critérios de escolaridade.

### Treinamento

1. Em **Treinar para a OBI**, abra um conceito para consultar sua descrição, seus pré-requisitos e suas missões. Com um pré-requisito abaixo de 50 pontos, a interface oferece revisão e permite iniciar a atividade escolhida.
2. Escolha uma alternativa e pressione **Verificar resposta**. A aplicação compara a alternativa ao gabarito local.
3. Quando precisar de ajuda, escolha uma pista, um exemplo mais simples, uma revisão do conceito ou uma explicação direta. Após erros repetidos, a interface também oferece a troca de missão.
4. Após acertar, consulte a explicação e os pontos recebidos. Siga para outra missão ou abra **Meu Progresso**. Uma missão concluída pode ser repetida para revisão, sem conceder novos pontos.

**Quero fazer uma pausa** abre opções para pausar, voltar à trilha ou escolher outra missão. **Retomar atividade** volta à missão que está aberta.

## 3. Pergunte ao Tutor

O estudante pode digitar uma pergunta, colar um trecho de Python ou usar uma das sugestões do chat. A demonstração responde com textos e exemplos preparados sobre condicionais, laços, listas e identificação de erros. A conversa pode levar a uma missão relacionada. Mensagens livres deixam a pontuação intacta.

A interpretação contextual de código e o uso do conceito em foco no chat estão previstos para o MVP. [Modelo pedagógico](modelo-pedagogico.md)

## 4. Trilha e painel de progresso

A trilha mostra os dez conceitos e indica os pré-requisitos em cada cartão. **Meu Progresso** reúne pontuações, acertos independentes, estados e uma recomendação para continuar.

Após registrar atividade, o painel **Seu progresso nesta sessão**, no Início, exibe os totais de missões concluídas e conceitos dominados, além do próximo desafio recomendado.

Os estados são **Não avaliado**, **Inicial**, **Em progresso** e **Dominado**. A interface usa um traço no campo de pontuação de um conceito ainda não avaliado. Após uma resposta incorreta sem pontuação anterior, o conceito aparece como **Inicial**, com zero pontos. [Modelo do aluno](modelo-do-aluno.md)

## 5. Sessão

O diagnóstico registrado, a pontuação, as missões concluídas, os erros e o uso de ajuda por item e a conversa são compartilhados entre as telas. Uma alternativa ainda não enviada, o feedback visível e o painel de ajuda aberto pertencem à tela da missão e podem ser reiniciados ao sair dela.

O botão **Reiniciar demonstração** pede confirmação, limpa os registros e retorna ao Início. Recarregar a página ou fechar a aba também descarta o estado mantido em memória. O MVP prevê um fluxo dedicado de encerramento, respeitando a decisão de parar sem insistência.

## 6. Critérios de aceitação da interface

- A navegação entre os modos preserva o que já foi registrado na sessão.
- O mesmo ID de missão pontua uma única vez.
- O progresso é apresentado como estimativa, com os critérios de domínio explícitos.
- Em caso de erro, o estudante pode decidir como obter ajuda ou continuar.
- O estudante pode pausar, retomar ou encerrar a sessão.
- Quando a API de LLM for integrada, sua indisponibilidade deve permitir orientação local e acesso ao estado.
