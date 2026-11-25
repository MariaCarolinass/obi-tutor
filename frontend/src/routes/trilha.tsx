import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Bug,
  Check,
  Code2,
  Eye,
  Info,
  Network,
  Target,
  X,
} from "lucide-react";
import { PageHeading, StatusBadge } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { useLearning } from "@/components/learning-context";
import {
  concepts,
  trainingMissions,
  status,
  weakPrerequisites,
  type Concept,
} from "@/lib/learning";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/trilha")({
  head: () =>
    pageMeta(
      "Treinar para a OBI",
      "Explore os dez conceitos e inicie diretamente desafios introdutórios de raciocínio e programação inspirados na OBI.",
    ),
  component: Trail,
});
function Trail() {
  const { state } = useLearning();
  const [selected, setSelected] = useState<Concept | null>(null);
  const [reviewed, setReviewed] = useState(false);
  const weak = selected ? weakPrerequisites(state, selected.id) : [];
  const activities = trainingMissions.filter((m) => m.concept === selected?.id);
  return (
    <>
      <PageHeading
        eyebrow="DESAFIOS INSPIRADOS NA OLIMPÍADA"
        title="Treinar para a OBI"
        description="Pratique fundamentos de Python para a OBI com desafios introdutórios voltados ao 1º e ao 2º ano do Ensino Médio."
      />
      <div className="legend">
        <span>Seu momento</span>
        <StatusBadge value="Dominado" />
        <StatusBadge value="Em progresso" />
        <StatusBadge value="Inicial" />
        <StatusBadge value="Não avaliado" />
      </div>
      <div className="concept-grid">
        {concepts.map((c) => {
          const record = state.records[c.id];
          const value = status(record);
          const count = trainingMissions.filter((m) => m.concept === c.id).length;
          return (
            <article
              className={`concept-card ${value === "Dominado" ? "mastered" : ""}`}
              key={c.id}
              id={c.id}
            >
              <div className="concept-card-top">
                <span
                  data-status={value}
                  className={`path-node ${value === "Dominado" ? "" : value === "Não avaliado" ? "unrated" : "learning"}`}
                >
                  {value === "Dominado" ? <Check size={17} /> : <Code2 size={17} />}
                </span>
                <div>
                  <div className="concept-code">CONCEITO {c.id}</div>
                  <h3>{c.name}</h3>
                </div>
                <StatusBadge value={value} />
              </div>
              <p>{c.description}</p>
              <div className="concept-score">
                <progress
                  max="100"
                  value={record?.score ?? 0}
                  aria-label={`Progresso em ${c.name}`}
                />
                <strong className={(record?.score ?? 0) > 0 ? "text-success" : undefined}>
                  {record?.evaluated ? `${record.score} / 100` : "—"}
                </strong>
              </div>
              <div className="prerequisites">
                <Network size={12} />
                <span>Recomendado antes:</span>
                {c.prerequisites.length === 0 ? (
                  <span>Nenhum pré-requisito</span>
                ) : (
                  c.prerequisites.map((id) => (
                    <Link to="/trilha" hash={id} key={id}>
                      {concepts.find((c) => c.id === id)?.short}
                    </Link>
                  ))
                )}
              </div>
              <div className="concept-actions">
                <span>
                  {count
                    ? `${count} ${count === 1 ? "desafio disponível" : "desafios disponíveis"}`
                    : "Sem desafio demonstrativo"}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelected(c);
                    setReviewed(false);
                  }}
                >
                  {count ? "Ver desafios" : "Ver conceito"}
                  <ArrowRight />
                </Button>
              </div>
            </article>
          );
        })}
      </div>
      <p className="progress-note">
        <Info size={14} className="inline mr-1" />
        Os pré-requisitos são recomendações, não barreiras. Você pode explorar todos os conceitos.
      </p>
      {selected && (
        <div className="modal-overlay">
          <section
            className="modal training-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="concept-title"
          >
            <Button
              variant="ghost"
              size="icon"
              className="modal-close"
              aria-label="Fechar conceito"
              onClick={() => setSelected(null)}
            >
              <X />
            </Button>
            <span className="icon-tile">
              <BookOpen />
            </span>
            <h2 id="concept-title">{selected.name}</h2>
            <p>{selected.description}</p>
            {weak.length > 0 && (
              <div className="prerequisite-advice">
                <Info size={15} />
                <div>
                  <p>
                    Talvez seja útil revisar {weak.map((c) => c.short.toLowerCase()).join(" e ")}.
                    Você pode iniciar qualquer desafio mesmo assim.
                  </p>
                  <Button variant="link" size="sm" onClick={() => setReviewed(!reviewed)}>
                    {reviewed ? "Fechar revisão" : "Revisar pré-requisito"}
                  </Button>
                </div>
              </div>
            )}
            {reviewed && (
              <div className="help-content">
                {weak.map((c) => (
                  <p key={c.id}>
                    <strong>{c.name}:</strong> {c.description}
                  </p>
                ))}
              </div>
            )}
            {activities.length ? (
              <div className="concept-missions">
                {activities.map((m) => {
                  const Icon =
                    m.type === "Detetive de Bugs"
                      ? Bug
                      : m.type === "Complete o Código"
                        ? Code2
                        : Eye;
                  return (
                    <div className="concept-mission-row" key={m.id}>
                      <span className="icon-tile">
                        <Icon size={18} />
                      </span>
                      <div>
                        <small>{m.type}</small>
                        <h3>{m.title}</h3>
                        <span>
                          {state.completed.includes(m.id)
                            ? "Concluído · repetir sem novos pontos"
                            : "Iniciante · cerca de 5 min"}
                        </span>
                      </div>
                      <Button size="sm" asChild>
                        <Link to="/missoes/$id" params={{ id: m.id }}>
                          Iniciar
                          <ArrowRight />
                        </Link>
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <Target size={24} className="mx-auto text-muted-foreground" />
                <h3 className="mt-3">Ainda sem desafio demonstrativo</h3>
                <p className="mt-2">
                  O conceito permanece disponível para consulta. Escolha outro conceito para
                  praticar.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => setSelected(null)}>
                  Escolher outro conceito
                </Button>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
