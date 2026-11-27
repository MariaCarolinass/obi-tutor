# Interface e fluxos de interação

## 1. Navegação

A interface web tem um menu lateral no desktop e um menu recolhível no celular. O estudante pode alternar entre treinar e conversar com o tutor durante a sessão.

- **Início** (`/`) apresenta o OBI Tutor e seu público, estudantes do 1º e do 2º ano do Ensino Médio. **Continuar de onde parei** retoma a atividade mais recente ainda em andamento na sessão. Quando não há atividade para retomar, **Começar pela trilha** abre os conceitos e desafios disponíveis. **Fazer o diagnóstico** é uma opção para quem quer uma sugestão de estudo. Quando há tentativas registradas, **Seu progresso nesta sessão** inclui um link direto para o **Próximo desafio** recomendado. **Conversar com o tutor** abre o chat com o Olimpio. No aquecimento, o estudante pode fechar a resposta do Olimpio pelo botão **X**. A página apresenta o projeto antes do guia sobre as provas de programação da OBI.
- **Diagnóstico** (`/diagnostico`) oferece dez questões opcionais, um resultado por conceito avaliado e uma missão recomendada.
- **Treinar para a OBI** (`/trilha`) apresenta os conceitos, pré-requisitos e atividades disponíveis. As missões abrem em `/missoes/<id>`.
- **Pergunte ao Tutor** (`/tutor`) reúne a conversa demonstrativa com o Olimpio e sugestões de perguntas.
- **Meu Progresso** (`/progresso`) exibe a pontuação, o estado e os acertos independentes de cada conceito.

## 2. Diagnóstico e Missões Interativas

### Diagnóstico opcional

No Início, **Fazer o diagnóstico** abre a tela do diagnóstico. O estudante pode iniciá-lo, pausá-lo ou seguir direto para a trilha. Na retomada, a interface abre a primeira questão ainda sem resposta registrada.

Ao concluir as dez questões, o estudante vê o total de acertos e uma missão sugerida. Em **Seu nível por conceito**, cada conceito avaliado mostra o resultado da questão, os pontos ganhos em caso de acerto e o estado atual do conceito na sessão. Essa estimativa orienta a prática. Os níveis oficiais de inscrição na OBI seguem critérios de escolaridade.

### Treinamento

1. Em **Treinar para a OBI**, abra um conceito para consultar sua descrição, seus pré-requisitos e suas missões. Com um pré-requisito abaixo de 50 pontos, a interface oferece revisão e permite iniciar a atividade escolhida.
2. Cada desafio tem uma questão e termina quando o estudante acerta. Escolha uma alternativa e pressione **Verificar resposta**. O backend compara o ID da alternativa ao gabarito local e devolve o efeito sobre o progresso.
3. Quando precisar de ajuda, escolha uma pista, um exemplo mais simples, uma revisão do conceito ou uma explicação direta. A cada erro, **Pergunte ao tutor** aparece ao lado de **Tentar novamente** e abre o chat com o contexto da missão. Após erros repetidos, a interface também oferece a troca de missão.
4. Após acertar, consulte a explicação, a pontuação do conceito antes e depois e o motivo dos pontos recebidos. Siga para outra missão ou abra **Meu Progresso**. Uma missão concluída pode ser repetida para revisão, sem conceder novos pontos.

**Quero fazer uma pausa** abre opções para pausar, voltar à trilha ou escolher outra missão. **Retomar atividade** volta à missão que está aberta.

## 3. Pergunte ao Tutor

Ao abrir **Pergunte ao Tutor** pelo menu, o estudante vê a saudação da conversa geral. O link **Conversar com o Olimpio** no resultado do diagnóstico abre uma conversa sobre as questões respondidas e os assuntos que vale revisar. O mesmo link em uma missão faz o Olimpio mencionar o desafio e perguntar onde surgiu a dúvida. Ele usa o enunciado e o trecho de código da missão para orientar a resposta. Cada conversa conserva seu histórico na sessão.

O estudante pode digitar uma pergunta, colar um trecho de Python ou usar uma das sugestões do chat. A pergunta aparece imediatamente e a conversa indica enquanto o Olimpio prepara a resposta. Os atalhos **Ver exemplo** e **Explicar de outro jeito** podem enfileirar outra pergunta. O tutor retoma o assunto dos turnos recentes da conversa. Mensagens livres deixam a pontuação intacta.

Quando o estudante diz que está entediado ou quer trocar de atividade, o chat oferece uma missão diferente, a trilha e uma pausa. O estudante também pode ficar no chat. O chat analisa o código recebido como texto. [Modelo pedagógico](modelo-pedagogico.md)

## 4. Trilha e painel de progresso

A trilha mostra os dez conceitos e indica os pré-requisitos em cada cartão. **Meu Progresso** reúne a pontuação, os acertos de primeira e sem ajuda e o estado de cada conceito. O painel indica quantos pontos ou acertos ainda faltam para confirmar o domínio. **Como a pontuação funciona?** explica o valor de cada tipo de acerto e quando a pontuação fica igual.

Após registrar atividade, o painel **Seu progresso nesta sessão**, no Início, exibe os totais de missões concluídas e conceitos dominados, além do próximo desafio recomendado.

Os estados são **Não avaliado**, **Inicial**, **Em progresso** e **Dominado**. A interface usa um traço no campo de pontuação de um conceito ainda não avaliado. Após uma resposta incorreta sem pontuação anterior, o conceito aparece como **Inicial**, com zero pontos. [Modelo do aluno](modelo-do-aluno.md)

## 5. Sessão

O diagnóstico registrado, a pontuação, as missões concluídas, os erros e o uso de ajuda por item e a conversa são compartilhados entre as telas. Uma alternativa ainda não enviada, o feedback visível e o painel de ajuda aberto pertencem à tela da missão e podem ser reiniciados ao sair dela.

O botão **Reiniciar sessão** pede confirmação, limpa os registros e retorna ao Início. Recarregar a página ou fechar a aba descarta o acesso à sessão anterior. **Encerrar sessão** apaga o progresso dessa sessão no servidor e limpa o chat da aba. O Olimpio oferece encerrar ou pausar quando o estudante pede para parar.

## 6. Critérios de aceitação da interface

- A navegação entre os modos preserva o que já foi registrado na sessão.
- O mesmo ID de missão pontua uma única vez.
- O progresso é apresentado como estimativa, com os critérios de domínio explícitos.
- Em caso de erro, o estudante pode decidir como obter ajuda ou continuar.
- O estudante pode pausar, retomar ou encerrar a sessão.
- Quando a API de LLM está indisponível, o tutor usa orientação local e o progresso permanece acessível.
