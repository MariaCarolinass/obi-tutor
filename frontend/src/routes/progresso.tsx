import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCheck, Info, Target } from "lucide-react";
import { PageHeading, StatusBadge } from "@/components/app-shell";
import { useLearning } from "@/components/learning-context";
import { Button } from "@/components/ui/button";
import { concepts, trainingMissions, recommendation, status } from "@/lib/learning";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/progresso")({
  head: () =>
    pageMeta(
      "Meu progresso",
      "Acompanhe sua pontuação, seus acertos independentes e os dez conceitos da preparação introdutória para a OBI.",
    ),
  component: Progress,
});
function Progress() {
  const { state } = useLearning();
  const recommended = recommendation(state);
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
              <th>Acertos independentes</th>
              <th>Próximo passo</th>
            </tr>
          </thead>
          <tbody>
            {concepts.map((c) => {
              const record = state.records[c.id];
              const value = status(record);
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
                      Acertos independentes
                    </span>
                    {record?.independent.length ?? 0} acertos
                  </td>
                  <td>
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
        Um conceito é dominado com pelo menos <strong>
          70 pontos e 2 acertos independentes
        </strong>{" "}
        em questões diferentes, de primeira e sem ajuda. Erros e dicas nunca retiram pontos.
      </p>
      <div className="notice">
        <Info size={16} />
        <span>
          Seu progresso reúne diagnóstico e desafios desta sessão. As respostas do tutor são
          demonstrativas e não alteram sua pontuação.
        </span>
      </div>
      <section className="recommendation">
        <div className="recommendation-top">
          <Target size={16} /> SEU PRÓXIMO PASSO
        </div>
        <h3>{concepts.find((c) => c.id === recommended.concept)?.name}</h3>
        <p>
          Comece com o desafio “{recommended.title}”. Pedir ajuda faz parte da aprendizagem, e você
          pode escolher qualquer conceito da trilha.
        </p>
        <div className="button-row">
          <Button asChild>
            <Link to="/missoes/$id" params={{ id: recommended.id }}>
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
