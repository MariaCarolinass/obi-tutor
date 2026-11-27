export type Concept = {
  id: string;
  name: string;
  short: string;
  prerequisites: string[];
  description: string;
};

export type ConceptStatus = "Não avaliado" | "Inicial" | "Em progresso" | "Dominado";
export type RecordState = {
  evaluated: boolean;
  score: number;
  independent: number;
  status: ConceptStatus;
};
type Attempt = { errors: number; hinted: boolean; points: number };
export type TrainingScore = { points: number; maxPoints: number };
export type LearningState = {
  records: Record<string, RecordState>;
  trainingProgress: Record<string, TrainingScore>;
  attempts: Record<string, Attempt>;
  completed: string[];
  diagnosticAnswers: Record<string, boolean>;
  recommendation: { missionId: string; message: string };
  weakPrerequisites: Record<string, string[]>;
};

export type Mission = {
  id: string;
  concept: string;
  type: string;
  difficulty: string;
  title: string;
  prompt: string;
  code: string | null;
  options: { id: string; texto: string }[];
};

export type Catalog = {
  concepts: Concept[];
  trainingMissions: Mission[];
  diagnosticQuestions: Mission[];
};

export type Answer = {
  correct: boolean;
  points: number;
  review: boolean;
  message?: string;
  alternativeId?: string | null;
};
export type Help = "hint" | "simple" | "concept" | "direct";

export function status(record: RecordState | undefined): ConceptStatus {
  return record?.status ?? "Não avaliado";
}

export function hasActivity(state: LearningState) {
  return Object.keys(state.attempts).length > 0;
}
