import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
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
import { concepts, trainingMissions, status, type Mission } from "@/lib/learning";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/missoes/$id")({
  beforeLoad: ({ params }) => {
    if (params.id === "diag-1") throw redirect({ to: "/diagnostico", replace: true });
  },
  head: ({ params }) => {
    const m = trainingMissions.find((m) => m.id === params.id);
    return pageMeta(
      m?.title ?? "Missão indisponível",
      m?.prompt ?? "Explore as missões de programação Python disponíveis no OBI Tutor.",
    );
  },
  component: MissionPage,
});
function MissionPage() {
  const { id } = Route.useParams();
  const mission = trainingMissions.find((m) => m.id === id);
  return mission ? (
    <MissionActivity key={id} mission={mission} />
  ) : (
    <div className="empty-state">
      <span className="icon-tile">
        <Target />
      </span>
      <h2>Essa missão não está disponível</h2>
      <p>Escolha uma das atividades demonstrativas para continuar.</p>
      <div className="button-row">
        <Button asChild>
          <Link to="/trilha">Explorar missões</Link>
        </Button>
      </div>
    </div>
  );
}
function MissionActivity({ mission }: { mission: Mission }) {
  const { state, answer, hint } = useLearning();
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"wrong" | "correct" | "review" | null>(null);
  const [help, setHelp] = useState<"hint" | "simple" | "concept" | "direct" | null>(null);
  const [paused, setPaused] = useState(false);
  const [pauseMenu, setPauseMenu] = useState(false);
  const concept = concepts.find((c) => c.id === mission.concept);
  const record = state.records[mission.concept];
  const attempt = state.attempts[mission.id];
  const solved = feedback === "correct" || feedback === "review";
  const points = feedback === "correct" ? (attempt?.points ?? 0) : 0;
  const next = trainingMissions.find(
    (m) => m.concept === mission.concept && m.id !== mission.id && !state.completed.includes(m.id),
  );
  const askHelp = (kind: "hint" | "simple" | "concept" | "direct") => {
    hint(mission.id);
    setHelp(kind);
  };
  const verify = () => {
    if (selected === null) return;
    const correct = selected === mission.answer;
    answer(mission, correct);
    setFeedback(correct ? (attempt?.awarded ? "review" : "correct") : "wrong");
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
            <span className="tiny-tag">{concept?.short} · Iniciante</span>
            <span className="tiny-tag">1º e 2º anos do Ensino Médio</span>
          </div>
          <h2>{mission.title}</h2>
          <p className="mission-prompt">{mission.prompt}</p>
          <CodeBlock code={mission.code} />
          <fieldset className="options" disabled={solved}>
            <legend className="sr-only">Escolha uma resposta</legend>
            {mission.options.map((option, i) => (
              <label className={`answer-option ${selected === i ? "selected" : ""}`} key={option}>
                <input
                  type="radio"
                  name="answer"
                  checked={selected === i}
                  onChange={() => {
                    setSelected(i);
                    setFeedback(null);
                  }}
                />
                <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                <span>{option}</span>
              </label>
            ))}
          </fieldset>
          {!solved && (
            <div className="mission-controls">
              <Button disabled={selected === null} onClick={verify}>
                <CheckCircle2 />
                Verificar resposta
              </Button>
              <Button variant="outline" onClick={() => askHelp("hint")}>
                <Lightbulb />
                Preciso de uma dica
              </Button>
            </div>
          )}
          {feedback === "wrong" && (
            <div role="status" className="feedback">
              <h3>
                <CircleHelp size={17} />
                Ainda não é essa. Vamos pensar juntos?
              </h3>
              <p>
                {(attempt?.errors ?? 0) >= 2
                  ? "Que tal mudar a abordagem? Você pode revisar o conceito, ver um exemplo mais simples ou pedir uma explicação direta ao lado."
                  : "Releia a pergunta e acompanhe o código linha por linha. Use a pista se quiser testar outra ideia."}
              </p>
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
            </div>
          )}
          {solved && (
            <div role="status" className="feedback success">
              <h3>
                <CheckCircle2 size={18} />
                Boa descoberta!{" "}
                {points > 0 ? `+${points} pontos` : "Você reforçou seu conhecimento."}
              </h3>
              <p>{mission.explanation}</p>
              <p className="mt-2">
                {points === 0
                  ? "Esta questão já concedeu pontos nesta sessão ou o conceito atingiu 100 pontos."
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
            <Button variant="outline" onClick={() => askHelp("hint")}>
              <Lightbulb />
              Quero uma dica
            </Button>
            <Button variant="outline" onClick={() => askHelp("simple")}>
              <Compass />
              Mostrar um exemplo mais simples
            </Button>
            <Button variant="outline" onClick={() => askHelp("concept")}>
              <BookOpen />
              Explicar o conceito
            </Button>
            <Button variant="outline" onClick={() => askHelp("direct")}>
              <CircleHelp />
              Receber uma explicação direta
            </Button>
            {(attempt?.errors ?? 0) >= 2 && (
              <Button variant="ghost" asChild>
                <Link to="/trilha">
                  Tentar outra missão
                  <ArrowRight />
                </Link>
              </Button>
            )}
          </div>
          {help && (
            <div role="status" className="help-content">
              <h4>
                {help === "hint"
                  ? "Uma pista para você"
                  : help === "simple"
                    ? "Vamos começar pelo simples"
                    : help === "direct"
                      ? "O raciocínio completo"
                      : "Revisando o conceito"}
              </h4>
              <p>
                {help === "hint"
                  ? mission.hint
                  : help === "concept"
                    ? `${concept?.description} Leia cada instrução e acompanhe os valores antes de escolher sua resposta.`
                    : help === "direct"
                      ? mission.explanation
                      : "Observe este exemplo menor e depois volte ao desafio."}
              </p>
              {help === "simple" && <CodeBlock code={mission.simpler} />}
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
              {status(record)} · {record?.independent.length ?? 0} acertos independentes
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
