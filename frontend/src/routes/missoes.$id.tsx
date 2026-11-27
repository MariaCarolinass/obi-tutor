import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleHelp,
  Compass,
  Lightbulb,
  Network,
  Pause,
  RefreshCw,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TutorIcon } from "@/components/app-shell";
import { CodeBlock } from "@/components/code-block";
import { tutorName, useLearning } from "@/components/learning-context";
import { status, type Answer, type Help, type Mission } from "@/lib/learning";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/missoes/$id")({
  beforeLoad: ({ params }) => {
    if (params.id.startsWith("diag-") || params.id.startsWith("DIAG-")) {
      throw redirect({ to: "/diagnostico", replace: true });
    }
    const previousIds: Record<string, string> = {
      "reading-1": "MISS-C1-01",
      "io-1": "MISS-C2-01",
      "var-1": "MISS-C3-01",
      "if-1": "MISS-C4-01",
      "if-2": "MISS-C4-02",
      "if-3": "REF-C4-01",
      "for-1": "MISS-C5-01",
    };
    if (Object.hasOwn(previousIds, params.id)) {
      throw redirect({
        to: "/missoes/$id",
        params: { id: previousIds[params.id]! },
        replace: true,
      });
    }
  },
  head: () => pageMeta("Missão interativa", "Pratique Python com um desafio do OBI Tutor."),
  component: MissionPage,
});
function MissionPage() {
  const { id } = Route.useParams();
  const {
    catalog: { trainingMissions },
  } = useLearning();
  const mission = trainingMissions.find((m) => m.id === id);
  return mission ? (
    <MissionActivity key={id} mission={mission} />
  ) : (
    <div className="empty-state">
      <span className="icon-tile">
        <Target />
      </span>
      <h2>Essa missão não está disponível</h2>
      <p>Escolha uma das atividades da trilha para continuar.</p>
      <div className="button-row">
        <Button asChild>
          <Link to="/trilha">Explorar missões</Link>
        </Button>
      </div>
    </div>
  );
}
function MissionActivity({ mission }: { mission: Mission }) {
  const {
    state,
    answer,
    help,
    startActivity,
    busy,
    catalog: { concepts, trainingMissions },
  } = useLearning();
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Answer | null>(null);
  const [guidance, setGuidance] = useState<{ kind: Help; message: string } | null>(null);
  const [paused, setPaused] = useState(false);
  const [pauseMenu, setPauseMenu] = useState(false);
  useEffect(() => startActivity(mission.id), [mission.id, startActivity]);

  const concept = concepts.find((c) => c.id === mission.concept);
  const record = state.records[mission.concept];
  const attempt = state.attempts[mission.id];
  const solved = feedback?.correct === true;
  const points = feedback?.points ?? 0;
  const next =
    trainingMissions.find(
      (m) =>
        m.concept === mission.concept && m.id !== mission.id && !state.completed.includes(m.id),
    ) ??
    trainingMissions.find((m) => m.id === state.recommendation.missionId && m.id !== mission.id);
  const askHelp = async (kind: Help) => {
    const message = await help(mission.id, kind);
    if (message) setGuidance({ kind, message });
  };
  const verify = async () => {
    if (selected === null) return;
    const response = await answer(mission.id, selected);
    if (response) setFeedback(response);
  };
  if (paused)
    return (
      <div className="empty-state">
        <span className="icon-tile">
          <Pause />
        </span>
        <h2>Um respiro também faz parte.</h2>
        <p>Sua atividade está pausada. Seus pontos e tentativas continuam aqui nesta sessão.</p>
        <div className="button-row">
          <Button onClick={() => setPaused(false)}>
            Retomar atividade
            <ArrowRight />
          </Button>
          <Button variant="outline" asChild>
            <Link to="/trilha">Voltar ao treinamento</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/trilha">Escolher outra missão</Link>
          </Button>
        </div>
      </div>
    );
  return (
    <>
      <Link className="back-link" to="/trilha">
        <ArrowLeft size={14} />
        Treinar para a OBI
      </Link>
      <div className="mission-layout">
        <section className="mission-question">
          <div className="mission-meta">
            <span className="eyebrow mb-0">{mission.type}</span>
            <span className="tiny-tag">
              {concept?.short} · {mission.difficulty}
            </span>
          </div>
          <h2>{mission.title}</h2>
          <p className="mission-prompt">{mission.prompt}</p>
          {mission.code && <CodeBlock code={mission.code} />}
          <fieldset className="options" disabled={solved || busy}>
            <legend className="sr-only">Escolha uma resposta</legend>
            {mission.options.map((option, i) => (
              <label
                className={`answer-option ${selected === option.id ? "selected" : ""}`}
                key={option.id}
              >
                <input
                  type="radio"
                  name="answer"
                  checked={selected === option.id}
                  onChange={() => {
                    setSelected(option.id);
                    setFeedback(null);
                  }}
                />
                <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                <span className="answer-text">{option.texto}</span>
              </label>
            ))}
          </fieldset>
          {!solved && (
            <div className="mission-controls">
              <Button disabled={busy || selected === null} onClick={verify}>
                <CheckCircle2 />
                Verificar resposta
              </Button>
              <Button variant="outline" disabled={busy} onClick={() => void askHelp("hint")}>
                <Lightbulb />
                Preciso de uma dica
              </Button>
            </div>
          )}
          {feedback?.correct === false && (
            <div role="status" className="feedback">
              <h3>
                <CircleHelp size={17} />
                Ainda não é essa. Vamos pensar juntos?
              </h3>
              <p>{feedback.message}</p>
              <div className="button-row">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFeedback(null);
                    setSelected(null);
                  }}
                >
                  <RefreshCw />
                  Tentar novamente
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/tutor" search={{ contexto: mission.id }}>
                    Pergunte ao tutor
                  </Link>
                </Button>
              </div>
            </div>
          )}
          {solved && (
            <div role="status" className="feedback success">
              <h3>
                <CheckCircle2 size={18} />
                Boa descoberta!{" "}
                {points > 0 ? `+${points} pontos` : "Você reforçou seu conhecimento."}
              </h3>
              <p>{feedback?.message}</p>
              <p className="mt-2">
                {feedback?.review
                  ? "Você já concluiu esta questão nesta sessão."
                  : points === 0
                    ? "O conceito já atingiu 100 pontos."
                    : attempt?.hinted
                      ? "Você usou ajuda e chegou à solução. Isso também é aprender!"
                      : "Seu progresso foi atualizado. Continue explorando!"}{" "}
                {status(record) === "Dominado" ? "Conceito dominado!" : ""}
              </p>
              <div className="button-row">
                {next ? (
                  <Button asChild>
                    <Link to="/missoes/$id" params={{ id: next.id }}>
                      Próxima missão
                      <ArrowRight />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild>
                    <Link to="/trilha">
                      Explorar outra missão
                      <ArrowRight />
                    </Link>
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <Link to="/progresso">Ver meu progresso</Link>
                </Button>
              </div>
            </div>
          )}
          <div className="mission-controls">
            <Button variant="ghost" size="sm" onClick={() => setPauseMenu(!pauseMenu)}>
              <Pause />
              Quero fazer uma pausa
            </Button>
          </div>
          {pauseMenu && (
            <div className="button-row mt-2">
              <Button variant="outline" size="sm" onClick={() => setPaused(true)}>
                Pausar atividade
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/trilha">Voltar ao treinamento</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/trilha">Escolher outra missão</Link>
              </Button>
            </div>
          )}
        </section>
        <aside className="mission-help">
          <TutorIcon />
          <h3>Conte com o {tutorName}</h3>
          <p>
            {(attempt?.errors ?? 0) >= 2
              ? "Podemos seguir por outro caminho. Escolha o que faz sentido para você."
              : "Uma pista, um exemplo ou uma explicação. Você escolhe como continuar."}
          </p>
          <div className="help-actions">
            <Button variant="outline" disabled={busy} onClick={() => void askHelp("hint")}>
              <Lightbulb />
              Quero uma dica
            </Button>
            <Button variant="outline" disabled={busy} onClick={() => void askHelp("simple")}>
              <Compass />
              Mostrar um exemplo mais simples
            </Button>
            <Button variant="outline" disabled={busy} onClick={() => void askHelp("concept")}>
              <BookOpen />
              Explicar o conceito
            </Button>
            <Button variant="outline" disabled={busy} onClick={() => void askHelp("direct")}>
              <CircleHelp />
              Receber uma explicação direta
            </Button>
            {(attempt?.errors ?? 0) >= 2 && (
              <Button variant="ghost" asChild>
                {feedback?.alternativeId ? (
                  <Link to="/missoes/$id" params={{ id: feedback.alternativeId }}>
                    Tentar outra missão <ArrowRight />
                  </Link>
                ) : (
                  <Link to="/trilha">
                    Escolher outra missão <ArrowRight />
                  </Link>
                )}
              </Button>
            )}
            <Button variant="ghost" asChild>
              <Link to="/tutor" search={{ contexto: mission.id }}>
                Conversar com o Olimpio <ArrowRight />
              </Link>
            </Button>
          </div>
          {guidance && (
            <div role="status" className="help-content">
              <h4>
                {guidance.kind === "hint"
                  ? "Uma pista para você"
                  : guidance.kind === "simple"
                    ? "Vamos começar pelo simples"
                    : guidance.kind === "direct"
                      ? "O raciocínio completo"
                      : "Revisando o conceito"}
              </h4>
              <p>{guidance.message}</p>
            </div>
          )}
          <div className="mission-progress">
            <p>
              <span>{concept?.short}</span>
              <strong className={(record?.score ?? 0) > 0 ? "text-success" : undefined}>
                {record?.evaluated ? `${record.score} / 100` : "—"}
              </strong>
            </p>
            <progress max="100" value={record?.score ?? 0} aria-label="Progresso no conceito" />
            <small>
              {status(record)} · {record?.independent ?? 0} acertos independentes
              <br />
              {attempt?.errors ?? 0} tentativas incorretas ·{" "}
              {attempt?.hinted ? "Ajuda utilizada" : "Sem dica utilizada"}
            </small>
          </div>
        </aside>
      </div>
      <div className="integration-strip">
        <span>
          <Network size={12} />
          Domínio: {concept?.short}
        </span>
        <span>
          <Target size={12} />
          Aluno: tentativas e progresso registrados
        </span>
        <span>
          <Lightbulb size={12} />
          Pedagogia: orientação no seu ritmo
        </span>
      </div>
    </>
  );
}
