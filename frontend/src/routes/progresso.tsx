import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCheck, Info, Target } from "lucide-react";
import { PageHeading, StatusBadge } from "@/components/app-shell";
import { useLearning } from "@/components/learning-context";
import { Button } from "@/components/ui/button";
import { status } from "@/lib/learning";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/progresso")({
  head: () =>
    pageMeta(
      "Meu progresso",
      "Acompanhe sua pontuação, seus acertos independentes e os dez conceitos da preparação introdutória para a OBI.",
    ),
  component: Progress,
});

const masteryPoints = 70;
const masteryAnswers = 2;

function masteryGap(score: number, independent: number) {
  const points = Math.max(0, masteryPoints - score);
  const answers = Math.max(0, masteryAnswers - independent);
  return [
    points > 0 ? `${points} ${points === 1 ? "ponto" : "pontos"}` : null,
    answers > 0
      ? `${answers} ${answers === 1 ? "acerto" : "acertos"} de primeira, sem ajuda`
      : null,
  ]
    .filter(Boolean)
    .join(" e ");
}

function Progress() {
  const {
    state,
    catalog: { concepts, trainingMissions },
  } = useLearning();
  const recommended = trainingMissions.find((m) => m.id === state.recommendation.missionId);
  const mastered = concepts.filter((c) => status(state.records[c.id]) === "Dominado").length;
  return (
    <>
      <PageHeading
        eyebrow="MODELO DO ALUNO"
        title="Cada passo conta."
        description="Aprender não é uma corrida. Veja o que você já construiu e o que pode explorar a seguir."
      />
      <section className="progress-summary">
        <div>
          <h2>
            <CheckCheck size={24} className="inline text-success mr-2" />
            {mastered} de 10 conceitos dominados
          </h2>
          <p>
            {state.completed.length} atividades concluídas nesta sessão · Seu progresso, sem
            comparações.
          </p>
        </div>
        <div>
          <progress max="10" value={mastered} aria-label="Conceitos dominados" />
        </div>
      </section>
      <div className="table-wrap" role="region" aria-label="Progresso por conceito" tabIndex={0}>
        <table className="progress-table" role="table">
          <thead>
            <tr>
              <th>Conceito</th>
              <th>Pontuação</th>
              <th>Seu momento</th>
              <th>Acertos de primeira, sem ajuda</th>
              <th>Próximo passo</th>
            </tr>
          </thead>
          <tbody>
            {concepts.map((c) => {
              const record = state.records[c.id];
              const value = status(record);
              const independent = record?.independent ?? 0;
              const missing = masteryGap(record?.score ?? 0, independent);
              const mission =
                trainingMissions.find(
                  (m) => m.concept === c.id && !state.completed.includes(m.id),
                ) ?? trainingMissions.find((m) => m.concept === c.id);
              return (
                <tr className={value === "Dominado" ? "mastered" : ""} key={c.id}>
                  <td>
                    <span>{c.id}</span>
                    {c.name}
                  </td>
                  <td>
                    <span className="progress-mobile-label" aria-hidden="true">
                      Pontuação
                    </span>
                    <div className="table-score">
                      <strong className={(record?.score ?? 0) > 0 ? "text-success" : undefined}>
                        {record?.evaluated ? `${record.score}/100` : "—"}
                      </strong>
                      <progress
                        max="100"
                        value={record?.score ?? 0}
                        aria-label={`Progresso em ${c.name}`}
                      />
                    </div>
                  </td>
                  <td>
                    <span className="progress-mobile-label" aria-hidden="true">
                      Seu momento
                    </span>
                    <StatusBadge value={value} />
                  </td>
                  <td>
                    <span className="progress-mobile-label" aria-hidden="true">
                      Acertos de primeira, sem ajuda
                    </span>
                    <strong>
                      {Math.min(independent, masteryAnswers)} de {masteryAnswers}
                    </strong>
                    {independent > masteryAnswers && (
                      <span className="progress-extra-answers"> · {independent} no total</span>
                    )}
                  </td>
                  <td>
                    {!record?.evaluated ? (
                      <p className="progress-gap">Responda à primeira questão deste conceito.</p>
                    ) : value !== "Dominado" && missing ? (
                      <p className="progress-gap">Para dominar, ainda precisa de {missing}.</p>
                    ) : null}
                    {mission ? (
                      <Link to="/missoes/$id" params={{ id: mission.id }}>
                        {value === "Dominado" ? "Reforçar" : "Praticar"}
                        <ArrowRight size={11} className="inline ml-1" />
                      </Link>
                    ) : (
                      <Link to="/trilha" hash={c.id}>
                        Explorar conceito
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="progress-note">
        <Info size={14} className="inline mr-1" />
        Um conceito é dominado com pelo menos{" "}
        <strong>
          {masteryPoints} pontos e {masteryAnswers} acertos de primeira, sem ajuda
        </strong>{" "}
        em questões diferentes.
      </p>
      <details className="scoring-rules">
        <summary>Como a pontuação funciona?</summary>
        <ul>
          <li>
            <strong>+30 pontos</strong> por acerto no diagnóstico.
          </li>
          <li>
            <strong>+25 pontos</strong> por acerto de primeira em uma missão, sem ajuda.
          </li>
          <li>
            <strong>+15 pontos</strong> por acerto em uma missão após usar ajuda, mesmo se você
            tiver errado antes.
          </li>
          <li>
            <strong>+10 pontos</strong> por acerto em uma nova tentativa, sem ajuda.
          </li>
        </ul>
        <p>
          Cada questão concede pontos uma vez, até o limite de 100 por conceito. Erros, pedidos de
          ajuda, pausas e conversas com o Olimpio deixam a pontuação como está.
        </p>
      </details>
      <section className="recommendation">
        <div className="recommendation-top">
          <Target size={16} /> SEU PRÓXIMO PASSO
        </div>
        <h3>{concepts.find((c) => c.id === recommended?.concept)?.name}</h3>
        <p>{state.recommendation.message}</p>
        <div className="button-row">
          <Button asChild>
            <Link to="/missoes/$id" params={{ id: state.recommendation.missionId }}>
              Continuar treinando
              <ArrowRight />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/trilha">Escolher outro conceito</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
