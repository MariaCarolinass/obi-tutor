export type Concept = {
  id: string;
  name: string;
  short: string;
  prerequisites: string[];
  description: string;
};
export const concepts: Concept[] = [
  {
    id: "C1",
    name: "Interpretação de enunciados",
    short: "Enunciados",
    prerequisites: [],
    description: "Identifique os dados, as restrições e o resultado esperado de um problema.",
  },
  {
    id: "C2",
    name: "Entradas, saídas e casos de teste",
    short: "Entradas e saídas",
    prerequisites: ["C1"],
    description:
      "Leia dados com input(), apresente resultados com print() e compare casos de teste.",
  },
  {
    id: "C3",
    name: "Variáveis e operações",
    short: "Variáveis",
    prerequisites: ["C2"],
    description: "Armazene valores e combine operações para transformar os dados.",
  },
  {
    id: "C4",
    name: "Condicionais e comparações",
    short: "Condicionais",
    prerequisites: ["C3"],
    description: "Use if, elif e else para tomar decisões a partir de condições.",
  },
  {
    id: "C5",
    name: "Laços de repetição",
    short: "Repetições",
    prerequisites: ["C3"],
    description: "Repita instruções com for e while e reconheça quando o laço termina.",
  },
  {
    id: "C6",
    name: "Contadores e acumuladores",
    short: "Contadores",
    prerequisites: ["C4", "C5"],
    description: "Conte ocorrências e acumule resultados durante as repetições.",
  },
  {
    id: "C7",
    name: "Listas e percursos",
    short: "Listas",
    prerequisites: ["C5"],
    description: "Organize valores em listas e percorra seus elementos.",
  },
  {
    id: "C8",
    name: "Teste de mesa",
    short: "Teste de mesa",
    prerequisites: ["C4", "C5"],
    description: "Acompanhe os valores das variáveis passo a passo, sem executar o código.",
  },
  {
    id: "C9",
    name: "Casos-limite e validação",
    short: "Casos-limite",
    prerequisites: ["C2", "C8"],
    description: "Investigue valores extremos e verifique se sua solução respeita as restrições.",
  },
  {
    id: "C10",
    name: "Resolução de problema combinado",
    short: "Problemas combinados",
    prerequisites: ["C6", "C7", "C9"],
    description: "Combine diferentes conceitos para construir uma solução completa.",
  },
];
export type RecordState = { evaluated: boolean; score: number; independent: string[] };
export type Attempt = { errors: number; hinted: boolean; awarded: boolean; points: number };
export type LearningState = {
  records: Record<string, RecordState>;
  attempts: Record<string, Attempt>;
  completed: string[];
  diagnosticAnswers: Record<string, boolean>;
};
export function initialState(): LearningState {
  return {
    records: Object.fromEntries(concepts.map((c) => [c.id, initialRecord()])),
    attempts: {},
    completed: [],
    diagnosticAnswers: {},
  };
}
function initialRecord(): RecordState {
  return { evaluated: false, score: 0, independent: [] };
}

export function status(record: RecordState | undefined) {
  if (!record?.evaluated) return "Não avaliado";
  if (record.score < 35) return "Inicial";
  return record.score >= 70 && record.independent.length >= 2 ? "Dominado" : "Em progresso";
}
export type Mission = {
  id: string;
  concept: string;
  type: "Preveja a Saída" | "Detetive de Bugs" | "Complete o Código";
  title: string;
  prompt: string;
  code: string;
  options: string[];
  answer: number;
  hint: string;
  explanation: string;
  simpler: string;
  diagnostic?: boolean;
};
export const trainingMissions: Mission[] = [
  {
    id: "if-1",
    concept: "C4",
    type: "Preveja a Saída",
    title: "Uma decisão no caminho",
    prompt:
      "Um estudante precisa de pelo menos 60 pontos para avançar. Observe o código: qual mensagem será exibida?",
    code: 'pontos = 45\n\nif pontos >= 60:\n    print("Pode avançar!")\nelse:\n    print("Vamos praticar!")',
    options: ["Pode avançar!", "Vamos praticar!", "As duas mensagens", "Nenhuma mensagem"],
    answer: 1,
    hint: "Compare 45 com 60. A condição pontos >= 60 é verdadeira ou falsa? O else é executado quando ela é falsa.",
    explanation:
      "45 é menor que 60, então a condição é falsa. O programa executa apenas o bloco else e exibe “Vamos praticar!”.",
    simpler:
      'idade = 15\nif idade >= 18:\n    print("Maior de idade")\nelse:\n    print("Menor de idade")\n\n# 15 é menor que 18: o bloco else é escolhido.',
  },
  {
    id: "if-2",
    concept: "C4",
    type: "Detetive de Bugs",
    title: "O detalhe da comparação",
    prompt:
      "Queremos verificar se a senha é igual a 1234. Qual alteração corrige o erro de sintaxe?",
    code: 'senha = 1234\n\nif senha = 1234:\n    print("Acesso permitido")',
    options: [
      "Trocar = por == na condição",
      "Trocar if por for",
      "Remover o print",
      "Trocar 1234 por 0",
    ],
    answer: 0,
    hint: "Em Python, atribuir um valor e comparar dois valores usam operadores diferentes.",
    explanation:
      "O operador = atribui um valor. Para verificar igualdade na condição, usamos ==: if senha == 1234:",
    simpler: "numero = 2\nprint(numero == 2)  # True\n# = guarda um valor; == compara valores.",
  },
  {
    id: "if-3",
    concept: "C4",
    type: "Complete o Código",
    title: "A fronteira dos 60 pontos",
    prompt: "Complete a condição para incluir todos os estudantes com 60 pontos ou mais.",
    code: 'pontos = 60\n\nif pontos ____ 60:\n    print("Pode avançar!")',
    options: [">", "<", ">=", "!="],
    answer: 2,
    hint: "O valor 60 também precisa ser aceito. Qual operador inclui a igualdade?",
    explanation:
      ">= significa “maior ou igual”. Com >, quem tem exatamente 60 pontos ficaria de fora.",
    simpler: "print(3 >= 3)  # True\nprint(3 > 3)   # False",
  },
  {
    id: "for-1",
    concept: "C5",
    type: "Preveja a Saída",
    title: "Passo a passo com o for",
    prompt:
      "Qual sequência é exibida pelo laço? Lembre-se de que o limite final de range não é incluído.",
    code: "for numero in range(1, 4):\n    print(numero)",
    options: ["1, 2, 3, 4", "0, 1, 2, 3", "1, 2, 3", "Apenas 4"],
    answer: 2,
    hint: "Comece em 1 e pare antes de 4. Liste cada valor que aparece nesse intervalo.",
    explanation: "range(1, 4) produz 1, 2 e 3. O limite final, 4, não é incluído.",
    simpler: "for numero in range(2):\n    print(numero)\n# Exibe 0 e depois 1.",
  },
  {
    id: "var-1",
    concept: "C3",
    type: "Complete o Código",
    title: "O total da compra",
    prompt: "Cada caderno custa 8 reais. Qual expressão calcula o preço de 3 cadernos?",
    code: "preco = 8\nquantidade = 3\ntotal = ____\nprint(total)",
    options: [
      "preco + quantidade",
      "preco * quantidade",
      "preco - quantidade",
      "preco / quantidade",
    ],
    answer: 1,
    hint: "O preço de cada caderno deve ser somado três vezes. Qual operação representa isso?",
    explanation: "Multiplicamos preço por quantidade: 8 × 3 = 24 reais.",
    simpler: "preco = 2\nquantidade = 2\nprint(preco * quantidade)  # 4",
  },
  {
    id: "reading-1",
    concept: "C1",
    type: "Complete o Código",
    title: "As peças de um problema",
    prompt:
      "Um desafio pede o total de pontos de duas rodadas. Você recebe dois números inteiros. Qual expressão resolve o que o enunciado pede?",
    code: "rodada_1 = 12\nrodada_2 = 8\ntotal = ____\nprint(total)",
    options: ["rodada_1 - rodada_2", "rodada_1 + rodada_2", "rodada_1 * rodada_2", "rodada_1"],
    answer: 1,
    hint: "O enunciado pede o total, não a diferença. Pense em reunir os pontos das duas rodadas.",
    explanation:
      "Somamos os pontos das duas rodadas: 12 + 8 = 20. Identificar o resultado esperado é o primeiro passo da solução.",
    simpler: "pontos_1 = 2\npontos_2 = 3\nprint(pontos_1 + pontos_2)  # 5",
  },
  {
    id: "io-1",
    concept: "C2",
    type: "Preveja a Saída",
    title: "Lendo o placar",
    prompt: "O programa recebe 10 e depois 5, um valor por linha. Qual resultado será exibido?",
    code: "primeiro = int(input())\nsegundo = int(input())\nprint(primeiro + segundo)",
    options: ["105", "10", "15", "5"],
    answer: 2,
    hint: "Cada input lê um valor. int converte o texto em número antes da soma.",
    explanation:
      "O programa lê os inteiros 10 e 5. A soma numérica é 15, e print apresenta esse resultado.",
    simpler: 'numero = int("3")\nprint(numero + 2)  # 5',
  },
];
function diagnosticQuestion(
  question: Omit<Mission, "diagnostic" | "type" | "hint" | "explanation" | "simpler">,
): Mission {
  return {
    ...question,
    diagnostic: true,
    type: "Preveja a Saída",
    hint: "",
    explanation: "",
    simpler: "",
  };
}
export const diagnosticQuestions: Mission[] = [
  diagnosticQuestion({
    id: "diag-reading",
    concept: "C1",
    title: "Entendendo o problema",
    prompt:
      "Um desafio recebe a quantidade de pontos de Ana e Bruno e pede quem fez mais pontos. O que sua solução deve apresentar?",
    code: "",
    options: [
      "A soma dos pontos",
      "O nome de quem fez mais pontos (ou indicar empate)",
      "Sempre o nome de Ana",
      "A quantidade de participantes",
    ],
    answer: 1,
  }),
  diagnosticQuestion({
    id: "diag-1",
    concept: "C2",
    title: "Entradas e saídas",
    prompt: "O estudante digita 7. Qual valor será exibido?",
    code: "numero = int(input())\nprint(numero + 1)",
    options: ["7", "8", "71", "1"],
    answer: 1,
  }),
  diagnosticQuestion({
    id: "diag-variables",
    concept: "C3",
    title: "Acompanhando valores",
    prompt: "Qual é o valor de total ao final?",
    code: "total = 3\ntotal = total + 4\nprint(total)",
    options: ["3", "4", "7", "12"],
    answer: 2,
  }),
  diagnosticQuestion({
    id: "diag-if",
    concept: "C4",
    title: "Escolhendo um caminho",
    prompt: "Qual mensagem será exibida?",
    code: 'pontos = 8\nif pontos >= 10:\n    print("Avançar")\nelse:\n    print("Praticar")',
    options: ["Avançar", "Praticar", "As duas mensagens", "Nenhuma mensagem"],
    answer: 1,
  }),
  diagnosticQuestion({
    id: "diag-loops",
    concept: "C5",
    title: "Repetindo instruções",
    prompt: "Quantas vezes a palavra OBI será exibida?",
    code: 'for rodada in range(3):\n    print("OBI")',
    options: ["1 vez", "2 vezes", "3 vezes", "4 vezes"],
    answer: 2,
  }),
];
export function hasActivity(state: LearningState) {
  return Object.keys(state.attempts).length > 0;
}

export function weakPrerequisites(state: LearningState, conceptId: string): Concept[] {
  const concept = concepts.find(({ id }) => id === conceptId);
  return concepts.filter(
    ({ id }) => concept?.prerequisites.includes(id) && (state.records[id]?.score ?? 0) < 50,
  );
}

export function recommendation(state: LearningState): Mission {
  const pending = trainingMissions.filter((m) => !state.completed.includes(m.id));
  const needsPractice = concepts.filter(({ id }) => status(state.records[id]) !== "Dominado");
  const firstDifficulty = diagnosticQuestions.find(
    (q) =>
      state.diagnosticAnswers[q.id] === false &&
      needsPractice.some(({ id }) => id === q.concept) &&
      pending.some((m) => m.concept === q.concept),
  );
  const preferred =
    firstDifficulty?.concept ??
    needsPractice.find(({ id }) => pending.some((m) => m.concept === id))?.id;
  const candidate =
    pending.find((m) => m.concept === preferred) ?? pending[0] ?? trainingMissions[0];
  if (!candidate) throw new Error("Training requires at least one mission");

  const prerequisites = weakPrerequisites(state, candidate.concept);
  return pending.find((m) => prerequisites.some(({ id }) => id === m.concept)) ?? candidate;
}
export function registerDiagnosticAnswer(
  state: LearningState,
  question: Mission,
  selected: number,
): LearningState {
  if (
    !diagnosticQuestions.some((q) => q.id === question.id) ||
    state.diagnosticAnswers[question.id] !== undefined
  )
    return state;
  const correct = selected === question.answer;
  const result = registerAnswer(state, question, correct);
  return {
    ...result.state,
    diagnosticAnswers: { ...state.diagnosticAnswers, [question.id]: correct },
  };
}
export function registerAnswer(
  state: LearningState,
  mission: Mission,
  correct: boolean,
): { state: LearningState; points: number } {
  const attempt = state.attempts[mission.id] ?? initialAttempt();
  if (attempt.awarded) return { state, points: 0 };
  const record = state.records[mission.concept] ?? initialRecord();
  if (!correct)
    return {
      state: {
        ...state,
        records: { ...state.records, [mission.concept]: { ...record, evaluated: true } },
        attempts: { ...state.attempts, [mission.id]: { ...attempt, errors: attempt.errors + 1 } },
      },
      points: 0,
    };
  const independent = attempt.errors === 0 && !attempt.hinted;
  const award = mission.diagnostic ? 30 : attempt.hinted ? 15 : attempt.errors > 0 ? 10 : 25;
  const score = Math.min(100, Math.max(0, record.score + award));
  const points = score - record.score;
  return {
    points,
    state: {
      ...state,
      records: {
        ...state.records,
        [mission.concept]: {
          evaluated: true,
          score,
          independent: independent ? [...record.independent, mission.id] : record.independent,
        },
      },
      attempts: { ...state.attempts, [mission.id]: { ...attempt, awarded: true, points } },
      completed: [...state.completed, mission.id],
    },
  };
}
export function registerHint(state: LearningState, id: string): LearningState {
  const attempt = state.attempts[id] ?? initialAttempt();
  if (attempt.awarded || attempt.hinted) return state;
  return { ...state, attempts: { ...state.attempts, [id]: { ...attempt, hinted: true } } };
}

function initialAttempt(): Attempt {
  return { errors: 0, hinted: false, awarded: false, points: 0 };
}
