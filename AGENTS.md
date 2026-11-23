# Instruções para agentes de desenvolvimento

Este arquivo orienta agentes a trabalhar no OBI Tutor. **Não substituir decisões por suposições.** A documentação em `docs/` é a referência funcional para o MVP.

## Objetivo

Construir um STI pequeno e demonstrável, com três componentes conectados: modelo de domínio (conceitos e pré-requisitos), modelo do aluno (estimativas de domínio) e modelo pedagógico (próximo passo e ajuda na questão atual).

## Ordem de implementação

1. **Domínio:** grafo válido, questões, IDs e gabaritos locais.
2. **Modelo do aluno:** estado por conceito, eventos, pontuação e testes determinísticos.
3. **Modelo pedagógico:** decisões de revisão, avanço, pistas e Rota de Desbloqueio.
4. **Interface e conversa:** integrar Pergunte ao Tutor, Missões Interativas e painel de progresso.
5. **Testes integrados:** simular três perfis e verificar mudanças reais no grafo.

Não conectar a camada seguinte antes de verificar o funcionamento da anterior.

## Regras que não podem ser alteradas sem revisão

- Existem **10 conceitos (C1 a C10)** e um grafo de pré-requisitos registrado em `docs/dominio-e-conteudo.md`.
- Pontuação e critério de domínio seguem **exatamente** `docs/modelo-do-aluno.md`.
- Apenas respostas objetivas, corrigidas por gabarito local, alteram a nota.
- Perguntas livres, pistas e mudanças de modo **não pontuam**.
- Uma questão só concede pontos **uma vez**, mesmo que a resposta seja reenviada.
- Um conceito só fica **dominado** com nota >= 70 **e** pelo menos dois acertos independentes, de primeira e sem dica, em questões distintas.
- A preferência do estudante deve ser respeitada: pode pedir explicação direta, mudar de atividade, pausar ou encerrar.
- O tutor não deve afirmar que executou, testou ou validou um código caso apenas tenha analisado o texto.
- O sistema não deve executar código arbitrário enviado pelo estudante.
- Não incluir autenticação, banco persistente, RAG, scraping ou gamificação com rankings no MVP.

## IA e segurança

- Usar um LLM apenas para formular explicações ou intervenções aprovadas pelo modelo pedagógico.
- Nunca deixar o LLM definir gabaritos, pontuações ou o estado oficial de domínio.
- Manter segredos fora de código, repositório, exemplos e logs. Usar variáveis de ambiente.
- Prever uma resposta local de contingência quando a API estiver indisponível.
- Evitar enviar dados pessoais desnecessários ao provedor de IA.

## Como desenvolver uma tarefa

Antes de editar código: identificar o requisito correspondente e os arquivos afetados. Implementar a menor alteração verificável. Incluir teste para regras de negócio. Ao concluir, resumir a mudança, os testes executados e qualquer limitação. Não apresentar uma funcionalidade como pronta sem executá-la ou testá-la.

## Critérios mínimos de aceite

- Grafo sem ciclos, com referências válidas.
- Respostas verificadas por código local.
- Pontuação aplicada uma vez por item e sempre entre 0 e 100.
- Dois acertos independentes exigidos para confirmar domínio.
- Recomendação do tutor coerente com pontuação e pré-requisitos.
- Dois modos acessíveis e alternáveis na sessão.
- Casos de teste: estudante que acerta tudo, que erra tudo e com desempenho misto.

Em caso de dúvida ou conflito entre arquivos, **não inventar uma regra**. Sinalizar a divergência para revisão.
