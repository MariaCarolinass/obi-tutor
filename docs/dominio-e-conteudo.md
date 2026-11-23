# Modelo de domínio e conteúdo

## 1. Escopo

O domínio cobre interpretação de problemas e fundamentos de programação em Python, como aproximação didática de habilidades úteis em desafios inspirados na OBI Programação.

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

## 3. Banco de exercícios previsto

| Tipo | Quantidade | Finalidade |
| --- | ---: | --- |
| Diagnóstico | 10 | Um item inicial por conceito |
| Missões regulares | 20 | Duas atividades diferentes por conceito |
| Reforço para demonstração | 3 | Uma atividade extra para cada conceito central selecionado |
| **Total** | **33** | Itens preparados e revisados pelo grupo |

Formatos das missões: **Detetive de Bugs** (identificar falha), **Preveja a Saída** (interpretar execução) e **Complete o Código** (selecionar uma alternativa que falta).

O grupo pode usar desafios de integração que combinem conceitos, mas **cada item deve apontar para um conceito principal** ao qual a pontuação será atribuída.

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
- Indicação simples de dificuldade, útil para a escolha entre missões.

## 6. Regras de qualidade

1. Não criar ciclos nem referências para conceitos inexistentes.
2. Confirmar que cada alternativa correta é inequívoca.
3. Revisar gabarito e explicação **sem depender do LLM**.
4. Evitar itens repetidos com respostas memorizáveis quando forem usados para nova avaliação.
5. Não conceder pontos duas vezes pelo mesmo ID.
6. Manter os itens resolúveis sem executar código enviado pelo estudante.

## 7. Observação sobre cobertura

Com apenas dois exercícios regulares por conceito, quem erra o diagnóstico pode não atingir o limiar de domínio na primeira sessão. Por isso, existem **três missões extras de reforço para conceitos centrais da demonstração**. Não prometer que todos os conceitos terão três missões regulares enquanto o banco ainda não as tiver.
