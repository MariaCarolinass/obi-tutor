import { describe, expect, it } from "vitest";
import {
  concepts,
  initialState,
  trainingMissions,
  registerAnswer,
  registerHint,
  status,
  type Mission,
} from "@/lib/learning";
const mission = trainingMissions[0];
if (!mission) throw new Error("A demonstration mission is required");
const question: Mission = mission;
describe("Learning rules", () => {
  it("awards 25 points for a first independent success", () => {
    const result = registerAnswer(initialState(), question, true);
    expect(result.points).toBe(25);
    expect(result.state.records["C4"]?.score).toBe(25);
    expect(result.state.records["C4"]?.independent).toEqual([question.id]);
  });
  it("awards 15 points after a hint", () => {
    const result = registerAnswer(registerHint(initialState(), question.id), question, true);
    expect(result.points).toBe(15);
    expect(result.state.records["C4"]?.independent).toEqual([]);
  });
  it("awards 10 after a retry without hint", () => {
    const failed = registerAnswer(initialState(), question, false);
    expect(registerAnswer(failed.state, question, true).points).toBe(10);
  });
  it("awards 30 for a diagnostic and counts an independent first answer", () => {
    const diagnostic = { ...question, id: "diagnostic", diagnostic: true };
    const result = registerAnswer(initialState(), diagnostic, true);
    expect(result.points).toBe(30);
    expect(result.state.records["C4"]?.independent).toEqual(["diagnostic"]);
  });
  it("errors do not remove points and record attempts", () => {
    const result = registerAnswer(initialState(), question, false);
    expect(result.points).toBe(0);
    expect(result.state.records["C4"]?.score).toBe(0);
    expect(status(result.state.records["C4"])).toBe("Inicial");
    expect(result.state.attempts[question.id]?.errors).toBe(1);
  });
  it("a question grants points only once", () => {
    const first = registerAnswer(initialState(), question, true);
    const second = registerAnswer(first.state, question, true);
    expect(second.points).toBe(0);
    expect(registerAnswer(second.state, question, false).state).toBe(second.state);
    expect(registerHint(second.state, question.id)).toBe(second.state);
    expect(second.state.completed).toEqual([question.id]);
  });
  it("scores cannot exceed 100", () => {
    const state = initialState();
    state.records["C4"] = { evaluated: true, score: 95, independent: [] };
    const result = registerAnswer(state, question, true);
    expect(result.state.records["C4"]?.score).toBe(100);
    expect(result.points).toBe(5);
  });
  it("mastery requires at least 70 points AND two independent questions", () => {
    expect(status({ evaluated: true, score: 69, independent: ["a", "b"] })).toBe("Em progresso");
    expect(status({ evaluated: true, score: 70, independent: ["a"] })).toBe("Em progresso");
    expect(status({ evaluated: true, score: 70, independent: ["a", "b"] })).toBe("Dominado");
  });
  it("a hint without an answer leaves the concept unevaluated", () => {
    const state = registerHint(initialState(), question.id);
    expect(status(state.records["C4"])).toBe("Não avaliado");
  });
  it("a hinted diagnostic is not an independent success", () => {
    const q = { ...question, diagnostic: true };
    const result = registerAnswer(registerHint(initialState(), q.id), q, true);
    expect(result.points).toBe(30);
    expect(result.state.records["C4"]?.independent).toEqual([]);
  });
  it("keeps all ten concepts and exact prerequisites without blocking access", () => {
    expect(concepts).toHaveLength(10);
    expect(concepts.map((c) => c.prerequisites)).toEqual([
      [],
      ["C1"],
      ["C2"],
      ["C3"],
      ["C3"],
      ["C4", "C5"],
      ["C5"],
      ["C4", "C5"],
      ["C2", "C8"],
      ["C6", "C7", "C9"],
    ]);
  });
});
