# Organização do trabalho, validação e apresentação

## 1. Frentes de responsabilidade

Endriw mantém domínio e conteúdo. Erika mantém o modelo do aluno. Maria Carolina mantém tutor, interface e integração. A revisão e a apresentação são coletivas. [Planejamento geral](https://github.com/MariaCarolinass/obi-tutor/issues/1)

| Frente | Atividades principais | Entrega verificável |
| --- | --- | --- |
| Domínio e conteúdo | Conferir C1-C10, dependências, questões, gabaritos e dicas | Grafo sem ciclos e 33 itens revisados |
| Modelo do aluno | Implementar notas, eventos, acertos independentes e testes | Regras de pontuação determinísticas com testes |
| Tutor e interface | Integrar os modos, Rota de Desbloqueio, LLM e painel | Fluxo interativo com estado compartilhado |
| Integração e validação | Conectar camadas, revisar mudanças, manter execução demonstrável | Aplicação que percorre o fluxo de ponta a ponta |
| Testes e apresentação | Executar perfis, registrar evidências e preparar relatório e demonstração | Resultados reproduzíveis e apresentação clara |

**Trabalho conjunto:** revisão de conceitos e gabaritos, teste exploratório com colegas e validação da experiência educacional. Um ponto focal deve integrar a versão final para evitar conflitos.

## 2. Ordem de execução

1. Validar grafo e catálogo de exercícios.
2. Construir modelo do aluno e testes de regras.
3. Implementar modelo pedagógico, recomendações e estados de ajuda.
4. Conectar o agente conversacional e interface.
5. Validar os modos, a transição entre eles e a sessão completa.

Essa ordem segue a orientação da disciplina de implementar domínio, depois aluno e, por último, tutor.

## 3. Cenários obrigatórios

| Perfil | Comportamento simulado | O que conferir |
| --- | --- | --- |
| Acerta tudo | Responde corretamente, de primeira, aos itens propostos | Pontuações, independência, domínio e grafo |
| Erra tudo | Erra diagnóstico e missões | Nota não fica negativa, ajuda e revisão funcionam |
| Misto | Alterna acertos, erros, pedidos de dica e novas tentativas | Notas diferenciadas e recomendação apropriada |

O cenário de reforço já pode ser reproduzido em C4. Errar a questão de condicionais no diagnóstico e acertar as três missões de C4 de primeira e sem ajuda resulta em 75 pontos e três acertos independentes.

## 4. Validação técnica

### Testes da demonstração

Na raiz, `python -m pytest` verifica o modelo do aluno e o contrato da API usando o catálogo real. Os testes incluem os três perfis, a primeira resposta do diagnóstico, a pontuação após erro ou dica, a recomendação com pré-requisito abaixo de 50, o reenvio de pedidos e a contingência simulada do tutor. [Testes de integração](../tests/test_integracao.py)

Em `frontend/`, `npm test` inicia um backend Python local em uma porta livre e exercita a navegação, a resolução de missões, a alternância de modos, o diagnóstico e o encerramento. `npm run typecheck`, `npm run lint` e `npm run build` verificam tipagem, código e empacotamento. [Ambiente e comandos](../README.md#desenvolvimento-local)

### Roteiro de verificação no navegador

1. Em uma sessão nova, selecione **Começar com o tutor** no Início. Conclua a primeira missão e volte ao Início. Confira se **Seu progresso nesta sessão** mostra uma missão concluída e indica o próximo desafio.
2. No Início, selecione **Fazer o diagnóstico**. Registre uma resposta, pause e retome. Confira se a questão seguinte está disponível. Ao concluir, confira o total de acertos e os dez resultados em **Seu nível por conceito**.
3. Na trilha, abra uma missão ainda não concluída, erre a resposta e peça uma pista. Pause, retome e acerte. Confira os 15 pontos e o registro de uso de ajuda.
4. No Início, abra **Conversar com o tutor**, envie uma pergunta ao Olimpio e confira **Meu Progresso**. Verifique se a nota se mantém e se a conversa aparece ao voltar ao chat.
5. Reabra a missão que já pontuou e acerte de novo. A pontuação deve permanecer igual.
6. Confirme **Reiniciar demonstração** e verifique o retorno ao Início e a limpeza dos registros. Depois, confirme **Encerrar sessão** e abra uma nova sessão. Em uma tela estreita, confira também o acesso aos modos pelo menu recolhível.

### Checklist de aceite do MVP

- [ ] Grafo não possui ciclos ou pré-requisitos inválidos.
- [ ] Cada questão possui ID único e gabarito correto.
- [ ] Pedido de dica não concede nem retira pontos.
- [ ] Conversa em Pergunte ao Tutor não altera domínio.
- [ ] Acerto de primeira sem ajuda vale +25 na missão.
- [ ] Acerto após dica vale +15.
- [ ] Acerto após nova tentativa, sem dica, vale +10.
- [ ] Acerto diagnóstico vale +30.
- [ ] Nota permanece entre 0 e 100.
- [ ] O mesmo item não pontua de novo.
- [ ] Pelo menos dois acertos independentes são exigidos para domínio.
- [ ] Um conceito com nota >= 70, mas sem acertos independentes suficientes, não aparece como dominado.
- [ ] Pré-requisito abaixo de 50 gera sugestão de revisão, sem bloquear escolha.
- [ ] Alteração de resultado modifica o painel ou grafo visivelmente.
- [ ] Os dois modos compartilham o contexto na mesma sessão.
- [ ] Pausa, troca de modo e encerramento não corrompem o estado.
- [ ] A ausência da API tem um comportamento de contingência.
- [ ] Nenhuma chave de API aparece no código ou nos arquivos versionados.

## 5. Evidências da experiência pedagógica

Registrar, sem afirmar causalidade: quantas missões foram concluídas, se o estudante continuou depois de errar, qual ajuda solicitou e se conseguiu mudar de estratégia. Essas observações não comprovam aprendizado duradouro nem aumento de motivação.

Para testes exploratórios, preferir colegas voluntários adultos. Testes com menores exigem as autorizações pertinentes.

## 6. Demonstração final

Preparar uma apresentação de aproximadamente **15 minutos** que mostre:

1. Domínio e objetivo educacional.
2. Grafo e pré-requisitos.
3. Modelo do aluno, regra de pontuação e limiar de domínio.
4. Uma missão com erro e resposta pedagógica.
5. Atualização observável do estado do conceito na trilha e recomendação seguinte.
6. Diferença entre Pergunte ao Tutor e Missões Interativas.
7. Três perfis de teste e limitações reconhecidas.

Além do código reproduzível, a disciplina solicita um **relatório curto** e registro do uso de IA no desenvolvimento. Documentar os prompts relevantes, problemas encontrados e correções reais, sem inventar evidências.

## 7. Critério de pronto

O MVP estará demonstrável quando for possível completar uma sessão que use os três modelos: selecionar um conceito, responder a um item verificável, receber ajuda apropriada, atualizar a pontuação e observar uma recomendação coerente com o grafo e as evidências registradas.
