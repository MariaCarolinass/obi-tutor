import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ClipboardCheck,
  Compass,
  Info,
  Lightbulb,
  Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeading, StatusBadge } from "@/components/app-shell";
import { CodeBlock } from "@/components/code-block";
import { useLearning } from "@/components/learning-context";
import { concepts, diagnosticQuestions, recommendation, status } from "@/lib/learning";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/diagnostico")({
  head: () =>
    pageMeta(
      "Diagnóstico inicial",
      "Descubra por onde começar sua preparação introdutória para a OBI com cinco perguntas sobre raciocínio e fundamentos de programação.",
    ),
  component: Diagnostic,
});
function Diagnostic() {
  const { state, diagnose } = useLearning();
  const [started, setStarted] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const answered = diagnosticQuestions.filter((q) => state.diagnosticAnswers[q.id] !== undefined);
  const question = diagnosticQuestions.find((q) => state.diagnosticAnswers[q.id] === undefined);
  const finished = answered.length === diagnosticQuestions.length;
  const recommended = recommendation(state);
  if (finished) {
    const known = diagnosticQuestions.filter((q) => state.diagnosticAnswers[q.id] === true);
    const reinforce = diagnosticQuestions.filter((q) => state.diagnosticAnswers[q.id] === false);
    return (
      <div className="diagnostic-page">
        <PageHeading
          eyebrow="UM PONTO DE PARTIDA, NÃO UM RÓTULO"
          title="Seu caminho começa aqui."
          description="Esta é uma estimativa inicial dos seus conhecimentos nos conteúdos avaliados."
        />
        <div className="diagnostic-result">
          <div className="diagnostic-result-top">
            <span className="icon-tile green">
              <Check />
            </span>
            <div>
              <h2>Diagnóstico concluído</h2>
              <p>
                {known.length} de 5 respostas corretas · Vamos transformar isso em próximos passos.
              </p>
            </div>
          </div>
          <section className="diagnostic-profile" aria-labelledby="diagnostic-profile-title">
            <h3 id="diagnostic-profile-title">Seu nível por conceito</h3>
            <p>Veja sua estimativa na sessão e como você se saiu em cada questão.</p>
            <ul>
              {diagnosticQuestions.map((q) => {
                const correct = state.diagnosticAnswers[q.id];
                return (
                  <li key={q.id}>
                    <div>
                      <strong>{concepts.find((c) => c.id === q.concept)?.name}</strong>
                      <p>
                        {correct ? (
                          <>
                            Acerto no diagnóstico ·{" "}
                            <span className="text-success">
                              +{state.attempts[q.id]?.points ?? 0} pontos
                            </span>
                          </>
                        ) : (
                          "Vale reforçar"
                        )}
                      </p>
                    </div>
                    <StatusBadge value={status(state.records[q.concept])} />
                  </li>
                );
              })}
            </ul>
          </section>
          <div className="notice">
            <Info size={16} />
            <span>
              O domínio é confirmado com prática e acertos independentes. Os níveis oficiais de
              inscrição na OBI seguem critérios de escolaridade.
            </span>
          </div>
          <div className="diagnostic-recommendation">
            <span className="eyebrow">RECOMENDAÇÃO DO TUTOR</span>
            <h3>{concepts.find((c) => c.id === recommended.concept)?.name}</h3>
            <p>
              Comece com o desafio “{recommended.title}”.{" "}
              {reinforce.length
                ? "Use este desafio para praticar uma base relacionada ao diagnóstico."
                : "Vamos colocar seu raciocínio em prática."}
            </p>
            <div className="button-row">
              <Button asChild>
                <Link to="/missoes/$id" params={{ id: recommended.id }}>
                  Começar meu treinamento
                  <ArrowRight />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/trilha">Escolher outro conceito</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!started)
    return (
      <section className="diagnostic-invitation">
        <span className="icon-tile">
          <ClipboardCheck size={24} />
        </span>
        <div className="eyebrow">DIAGNÓSTICO INICIAL · OBI TUTOR</div>
        <h1>
          Vamos descobrir
          <br />
          por onde começar?
        </h1>
        <p>
          Cinco perguntas introdutórias de raciocínio e programação, voltadas ao 1º e ao 2º ano do
          Ensino Médio. Ao final, veja seu nível por conceito e receba uma sugestão de desafio.
        </p>
        <div className="diagnostic-details">
          <span>
            <ClipboardCheck size={16} />5 questões
          </span>
          <span>
            <Compass size={16} />
            Cerca de 5 minutos
          </span>
          <span>
            <BookOpen size={16} />
            Totalmente opcional
          </span>
        </div>
        <div className="button-row">
          <Button size="lg" onClick={() => setStarted(true)}>
            {answered.length ? "Continuar diagnóstico" : "Iniciar diagnóstico"}
            <ArrowRight />
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/trilha">Pular e começar a treinar</Link>
          </Button>
        </div>
        <p className="diagnostic-footnote">
          Uma estimativa para orientar seus estudos, não uma classificação oficial da OBI.
        </p>
      </section>
    );
  if (!question) return null;
  return (
    <div className="diagnostic-page">
      <div className="diagnostic-question-progress">
        <span>DIAGNÓSTICO INICIAL</span>
        <strong>Questão {answered.length + 1} de 5</strong>
      </div>
      <progress max="5" value={answered.length} />
      <section className="diagnostic-question">
        <div className="eyebrow">{concepts.find((c) => c.id === question.concept)?.short}</div>
        <h1>{question.title}</h1>
        <p className="mission-prompt">{question.prompt}</p>
        {question.code && <CodeBlock code={question.code} />}
        <fieldset className="options">
          <legend className="sr-only">Escolha uma resposta</legend>
          {question.options.map((option, index) => (
            <label className={`answer-option ${selected === index ? "selected" : ""}`} key={option}>
              <input
                type="radio"
                name="diagnostic-answer"
                checked={selected === index}
                onChange={() => setSelected(index)}
              />
              <span className="option-letter">{String.fromCharCode(65 + index)}</span>
              <span>{option}</span>
            </label>
          ))}
        </fieldset>
        <div className="diagnostic-question-controls">
          <Button
            disabled={selected === null}
            onClick={() => {
              if (selected === null) return;
              diagnose(question, selected);
              setSelected(null);
            }}
          >
            {answered.length === 4 ? "Ver meu resultado" : "Próxima questão"}
            <ArrowRight />
          </Button>
          <Button variant="ghost" onClick={() => setStarted(false)}>
            <Pause />
            Pausar diagnóstico
          </Button>
        </div>
      </section>
    </div>
  );
}
