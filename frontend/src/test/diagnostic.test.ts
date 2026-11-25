import { describe, expect, it } from "vitest";
import {
  diagnosticQuestions,
  hasActivity,
  initialState,
  recommendation,
  registerAnswer,
  registerDiagnosticAnswer,
  registerHint,
  status,
  trainingMissions,
} from "@/lib/learning";

function getQuestion(index: number) {
  const q = diagnosticQuestions[index];
  if (!q) throw new Error("Diagnostic question missing");
  return q;
}
describe("Initial diagnostic and integrated training", () => {
  it("covers five questions, one for each requested foundational concept", () => {
    expect(diagnosticQuestions).toHaveLength(5);
    expect(diagnosticQuestions.map((q) => q.concept)).toEqual(["C1", "C2", "C3", "C4", "C5"]);
  });
  it("starts without activity or preassigned mastery", () => {
    const state = initialState();
    expect(hasActivity(state)).toBe(false);
    expect(
      Object.values(state.records).every((r) => r.score === 0 && r.independent.length === 0),
    ).toBe(true);
  });
  it("one diagnostic success awards 30 through the shared model but is not mastery", () => {
    const q = getQuestion(0);
    const state = registerDiagnosticAnswer(initialState(), q, q.answer);
    expect(state.records["C1"]?.score).toBe(30);
    expect(state.records["C1"]?.independent).toEqual([q.id]);
    expect(status(state.records["C1"])).toBe("Inicial");
    expect(hasActivity(state)).toBe(true);
  });
  it("retains the points actually awarded when diagnostics reach the score cap", () => {
    const question = getQuestion(3);
    let state = initialState();
    for (const mission of trainingMissions.filter((m) => m.concept === question.concept)) {
      state = registerAnswer(state, mission, true).state;
    }
    state = registerDiagnosticAnswer(state, question, question.answer);
    expect(state.records[question.concept]?.score).toBe(100);
    expect(state.attempts[question.id]?.points).toBe(25);
  });
  it("a diagnostic question awards only once, including after revisiting", () => {
    const q = getQuestion(1);
    const first = registerDiagnosticAnswer(initialState(), q, q.answer);
    const second = registerDiagnosticAnswer(first, q, q.answer);
    expect(second.records["C2"]?.score).toBe(30);
    expect(second.diagnosticAnswers).toEqual({ [q.id]: true });
  });
  it("wrong diagnostic answers never remove points and cannot be replaced", () => {
    const q = getQuestion(2);
    const original = initialState();
    original.records["C3"] = { evaluated: true, score: 25, independent: ["prior-mission"] };
    const first = registerDiagnosticAnswer(original, q, (q.answer + 1) % q.options.length);
    const second = registerDiagnosticAnswer(first, q, q.answer);
    expect(second.records["C3"]?.score).toBe(25);
    expect(second.diagnosticAnswers[q.id]).toBe(false);
    expect(second.attempts[q.id]?.errors).toBe(1);
  });
  it("five independent diagnostic answers still leave all evaluated concepts below mastery", () => {
    let state = initialState();
    for (const q of diagnosticQuestions) state = registerDiagnosticAnswer(state, q, q.answer);
    expect(Object.keys(state.diagnosticAnswers)).toHaveLength(5);
    expect(diagnosticQuestions.map((q) => state.records[q.concept]?.score)).toEqual([
      30, 30, 30, 30, 30,
    ]);
    expect(diagnosticQuestions.every((q) => status(state.records[q.concept]) === "Inicial")).toBe(
      true,
    );
  });
  it("recommends practice for a direct prerequisite below 50", () => {
    let state = initialState();
    for (const q of diagnosticQuestions)
      state = registerDiagnosticAnswer(state, q, q.concept === "C3" ? 0 : q.answer);
    const recommended = recommendation(state);
    expect(recommended.concept).toBe("C2");
    expect(trainingMissions.some((m) => m.id === recommended.id)).toBe(true);
    state.records["C2"] = { evaluated: true, score: 50, independent: [] };
    expect(recommendation(state).concept).toBe("C3");
  });
  it("diagnostic and a hinted mission contribute to the same concept score", () => {
    const q = getQuestion(3);
    const m = trainingMissions.find((m) => m.id === "if-1");
    if (!m) throw new Error("Mission missing");
    let state = registerDiagnosticAnswer(initialState(), q, q.answer);
    state = registerAnswer(state, m, false).state;
    state = registerHint(state, m.id);
    const result = registerAnswer(state, m, true);
    expect(result.points).toBe(15);
    expect(result.state.records["C4"]?.score).toBe(45);
    expect(result.state.records["C4"]?.independent).toEqual([q.id]);
  });
  it("resetting returns diagnostic, points and attempts to their initial state", () => {
    const state = initialState();
    expect(state.diagnosticAnswers).toEqual({});
    expect(state.attempts).toEqual({});
    expect(state.completed).toEqual([]);
    expect(state.records["C4"]?.score).toBe(0);
  });

  it.each([
    {
      name: "all correct",
      diagnosisCorrect: true,
      missionsCorrect: true,
      score: 100,
      independent: 4,
    },
    {
      name: "all wrong",
      diagnosisCorrect: false,
      missionsCorrect: false,
      score: 0,
      independent: 0,
    },
    {
      name: "wrong diagnostic followed by independent successes",
      diagnosisCorrect: false,
      missionsCorrect: true,
      score: 75,
      independent: 3,
    },
  ])(
    "keeps progress consistent for $name",
    ({ diagnosisCorrect, missionsCorrect, score, independent }) => {
      const diagnostic = getQuestion(3);
      let state = registerDiagnosticAnswer(
        initialState(),
        diagnostic,
        diagnosisCorrect ? diagnostic.answer : (diagnostic.answer + 1) % diagnostic.options.length,
      );
      for (const mission of trainingMissions.filter((m) => m.concept === diagnostic.concept)) {
        state = registerAnswer(state, mission, missionsCorrect).state;
      }
      const record = state.records[diagnostic.concept];
      expect(record?.score).toBe(score);
      expect(record?.independent).toHaveLength(independent);
      expect(status(record)).toBe(missionsCorrect ? "Dominado" : "Inicial");
    },
  );
});
