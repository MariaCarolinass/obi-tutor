import { createContext, useContext } from "react";
import type { LearningState, Mission } from "@/lib/learning";

export type Message = { role: "tutor" | "student"; text: string; code?: string };

type LearningSession = {
  state: LearningState;
  answer: (mission: Mission, correct: boolean) => void;
  diagnose: (question: Mission, selected: number) => void;
  hint: (id: string) => void;
  reset: () => void;
  messages: Message[];
  send: (text: string) => void;
};

export const LearningContext = createContext<LearningSession | null>(null);

export function useLearning() {
  const value = useContext(LearningContext);
  if (!value) throw new Error("LearningProvider is required");
  return value;
}
