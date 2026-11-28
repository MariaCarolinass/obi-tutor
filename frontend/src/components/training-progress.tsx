import type { TrainingScore } from "@/lib/learning";

export function TrainingProgress({
  score,
  concept,
}: {
  score: TrainingScore | undefined;
  concept: string;
}) {
  if (!score?.maxPoints) return <p>Sem pontuação na trilha</p>;

  return (
    <div className="training-progress">
      <p>
        Trilha ·{" "}
        <strong>
          {score.points} de {score.maxPoints} pontos
        </strong>
      </p>
      <progress
        max={score.maxPoints}
        value={score.points}
        aria-label={`Pontos na trilha em ${concept}`}
      />
    </div>
  );
}
