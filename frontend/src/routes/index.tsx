import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  ArrowRight,
  Bot,
  ClipboardCheck,
  Code2,
  Lightbulb,
  MessageSquareCode,
  X,
} from "lucide-react";
import { TutorIcon } from "@/components/app-shell";
import { CodeBlock } from "@/components/code-block";
import { tutorName, useLearning } from "@/components/learning-context";
import { ObiGuide, ObiTutorIntro } from "@/components/obi-guide";
import { Button } from "@/components/ui/button";
import { hasActivity, status } from "@/lib/learning";
import { pageMeta } from "@/lib/page-meta";
import "../home.css";

export const Route = createFileRoute("/")({
  head: () =>
    pageMeta(
      "Treine para a OBI com seu tutor",
      "Prepare-se para a modalidade Programação da Olimpíada Brasileira de Informática com desafios guiados, pistas e acompanhamento do progresso.",
    ),
  component: Index,
});

const sampleCode = `pontos = [5, 8, 12]
total = 0

for valor in pontos:
    total += valor

print(total)`;

const sampleOptions = [
  {
    value: 12,
    reply:
      "12 é o último valor da lista. O laço soma todos os valores. Como fica o total a cada volta?",
  },
  {
    value: 13,
    reply: "13 é a soma de 5 e 8. Ainda falta a última volta. Quanto dá quando você soma 12?",
  },
  {
    value: 25,
    reply: "Acertou! O total começa em 0 e passa por 5, 13 e 25. O print(total) mostra 25.",
  },
] as const;

function TutorExample() {
  const [selected, setSelected] = useState<number | null>(null);
  const [reply, setReply] = useState("");
  const replyTrigger = useRef<HTMLButtonElement>(null);

  return (
    <figure className="home-example">
      <figcaption>
        <TutorIcon />
        <div>
          <strong>{tutorName}</strong>
          <p>Vamos conferir juntos os pontos de três rodadas.</p>
          <p id="home-example-question">Qual número este código imprime?</p>
        </div>
      </figcaption>
      <CodeBlock code={sampleCode} label="aquecimento.py" />
      <div className="home-example-actions">
        <div className="home-example-controls">
          <div
            className="home-example-options"
            role="group"
            aria-labelledby="home-example-question"
          >
            {sampleOptions.map(({ value, reply }) => (
              <button
                key={value}
                type="button"
                aria-pressed={selected === value}
                onClick={(event) => {
                  replyTrigger.current = event.currentTarget;
                  setSelected(value);
                  setReply(reply);
                }}
              >
                {value}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="home-example-hint"
            onClick={(event) => {
              replyTrigger.current = event.currentTarget;
              setReply(
                "Comece com total igual a 0. Some 5 na primeira volta e 8 na segunda. Qual valor ainda falta somar?",
              );
            }}
          >
            Pedir uma pista
          </button>
        </div>
        <div className="home-example-reply">
          <div role="status">
            {reply && (
              <>
                <TutorIcon />
                <p>
                  <strong>{tutorName}</strong>
                  {reply}
                </p>
              </>
            )}
          </div>
          {reply && (
            <button
              type="button"
              className="home-example-dismiss"
              aria-label={`Fechar resposta do ${tutorName}`}
              onClick={() => {
                setReply("");
                replyTrigger.current?.focus();
              }}
            >
              <X size={18} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </figure>
  );
}

const studyPaths = [
  {
    to: "/diagnostico",
    icon: ClipboardCheck,
    title: "Fazer o diagnóstico",
    description: "Responda a dez questões para receber uma sugestão de estudo.",
  },
  {
    to: "/trilha",
    icon: Code2,
    title: "Explorar a trilha",
    description: "Escolha um conceito e pratique com desafios de programação.",
  },
  {
    to: "/tutor",
    icon: Bot,
    title: `Pergunte ao ${tutorName}`,
    description: "Tire dúvidas de Python e veja exemplos para entender o código.",
  },
] as const;

function Index() {
  const {
    state,
    catalog: { concepts, trainingMissions },
  } = useLearning();
  const started = hasActivity(state);
  const recommended = trainingMissions.find((m) => m.id === state.recommendation.missionId);
  const mastered = concepts.filter((c) => status(state.records[c.id]) === "Dominado").length;
  const completed = trainingMissions.filter((m) => state.completed.includes(m.id)).length;

  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-intro">
          <p className="home-kicker">
            <Code2 size={17} aria-hidden="true" /> Olimpíada Brasileira de Informática
          </p>
          <h1 id="home-title">
            Treine para a <mark>OBI</mark> <span>com seu tutor.</span>
          </h1>
          <p className="home-description">
            Pratique Python com desafios inspirados na <strong>modalidade Programação</strong>,
            voltados ao 1º e ao 2º ano do Ensino Médio. Se travar, peça uma pista ao Olimpio.
          </p>
          <div className="home-actions">
            <Button asChild size="lg">
              <Link to="/trilha">
                {started ? "Continuar na trilha" : "Começar pela trilha"}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link to="/tutor">
                <MessageSquareCode aria-hidden="true" />
                Conversar com o tutor
              </Link>
            </Button>
          </div>
        </div>

        <TutorExample />
      </section>

      {started && (
        <section className="home-progress" aria-labelledby="home-progress-title">
          <div>
            <h2 id="home-progress-title">Seu progresso nesta sessão</h2>
            <p>
              {completed} {completed === 1 ? "missão concluída" : "missões concluídas"} · {mastered}{" "}
              {mastered === 1 ? "conceito dominado" : "conceitos dominados"}
            </p>
            {recommended && (
              <Link className="home-next-mission" to="/missoes/$id" params={{ id: recommended.id }}>
                <Lightbulb size={16} aria-hidden="true" />
                Próximo desafio · {recommended.title}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            )}
          </div>
          <Link to="/progresso">
            Ver meu progresso <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>
      )}

      <section className="home-paths" aria-labelledby="home-paths-title">
        <h2 id="home-paths-title">
          {started ? "O que você quer estudar?" : "Como você quer começar?"}
        </h2>
        <ul className="home-path-grid">
          {studyPaths.map(({ to, icon: Icon, title, description }) => (
            <li key={to}>
              <Link to={to} className="home-path-card">
                <span className="home-path-icon">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <ArrowRight className="home-path-arrow" size={19} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <ObiTutorIntro />
      <ObiGuide />
    </div>
  );
}
