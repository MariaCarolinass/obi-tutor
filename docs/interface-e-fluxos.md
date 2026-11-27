# Interface e fluxos de interação

## 1. Navegação

A interface web tem um menu lateral no desktop e um menu recolhível no celular. O estudante pode alternar entre treinar e conversar com o tutor durante a sessão.

- **Início** (`/`) apresenta o OBI Tutor e seu público, estudantes do 1º e do 2º ano do Ensino Médio. **Começar pela trilha** ou **Continuar na trilha** abre os conceitos e desafios disponíveis. Após iniciar uma atividade, **Seu progresso nesta sessão** inclui um link direto para o **Próximo desafio** recomendado. **Conversar com o tutor** abre o chat com o Olimpio. No aquecimento, o estudante pode fechar a resposta do Olimpio pelo botão **X**. A página também dá acesso ao diagnóstico e apresenta o projeto antes do guia sobre a modalidade Programação da OBI.
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
2. Escolha uma alternativa e pressione **Verificar resposta**. O backend compara o ID da alternativa ao gabarito local e devolve o efeito sobre o progresso.
3. Quando precisar de ajuda, escolha uma pista, um exemplo mais simples, uma revisão do conceito ou uma explicação direta. Após erros repetidos, a interface também oferece a troca de missão.
4. Após acertar, consulte a explicação e os pontos recebidos. Siga para outra missão ou abra **Meu Progresso**. Uma missão concluída pode ser repetida para revisão, sem conceder novos pontos.

**Quero fazer uma pausa** abre opções para pausar, voltar à trilha ou escolher outra missão. **Retomar atividade** volta à missão que está aberta.

## 3. Pergunte ao Tutor

O estudante pode digitar uma pergunta, colar um trecho de Python ou usar uma das sugestões do chat. A pergunta aparece imediatamente e a conversa indica enquanto o Olimpio prepara a resposta. Os atalhos **Ver exemplo** e **Explicar de outro jeito** podem enfileirar outra pergunta. O tutor retoma o assunto das mensagens recentes e usa o enunciado da missão quando o estudante pergunta sobre ela. Mensagens livres deixam a pontuação intacta.

Quando o estudante diz que está entediado ou quer trocar de atividade, o chat oferece uma missão diferente, a trilha e uma pausa. O estudante também pode ficar no chat. O chat analisa o código recebido como texto. [Modelo pedagógico](modelo-pedagogico.md)

## 4. Trilha e painel de progresso

A trilha mostra os dez conceitos e indica os pré-requisitos em cada cartão. **Meu Progresso** reúne pontuações, acertos independentes, estados e uma recomendação para continuar.

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
