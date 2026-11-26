import { createContext, useContext } from "react";
import type { Answer, Catalog, Help, LearningState } from "@/lib/learning";

export const tutorName = "Olimpio";

export type Message = {
  role: "tutor" | "student";
  text: string;
  missionId?: string;
  offerEnd?: boolean;
  offerChange?: boolean;
};

type LearningSession = {
  state: LearningState;
  catalog: Catalog;
  busy: boolean;
  answer: (questionId: string, optionId: string) => Promise<Answer | undefined>;
  help: (questionId: string, kind: Help) => Promise<string | undefined>;
  focus: (questionId: string) => void;
  reset: () => Promise<boolean>;
  end: () => Promise<boolean>;
  messages: Message[];
  send: (text: string) => Promise<boolean>;
};

export const LearningContext = createContext<LearningSession | null>(null);

export function useLearning() {
  const value = useContext(LearningContext);
  if (!value) throw new Error("LearningProvider is required");
  return value;
}
