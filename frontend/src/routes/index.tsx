import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ChevronDown,
  ClipboardCheck,
  Code2,
  Lightbulb,
  MessageSquareCode,
  Terminal,
} from "lucide-react";
import { CodeBlock } from "@/components/code-block";
import { useLearning } from "@/components/learning-context";
import { Button } from "@/components/ui/button";
import { concepts, hasActivity, recommendation, status, trainingMissions } from "@/lib/learning";
import { pageMeta } from "@/lib/page-meta";
import "../home.css";

export const Route = createFileRoute("/")({
  head: () =>
    pageMeta(
      "Treine para a OBI com Python",
      "Prepare-se para a modalidade Programação da Olimpíada Brasileira de Informática com desafios guiados, pistas e acompanhamento do progresso.",
    ),
  component: Index,
});

const sampleCode = `pontos = [5, 8, 12]
total = 0

for valor in pontos:
    total += valor

print(total)`;

const studyPaths = [
  {
    to: "/diagnostico",
    icon: ClipboardCheck,
    title: "Fazer o diagnóstico",
    description: "Responda a cinco questões para receber uma sugestão de estudo.",
  },
  {
    to: "/trilha",
    icon: Code2,
    title: "Explorar a trilha",
    description: "Escolha um conceito e pratique com desafios de programação.",
  },
  {
    to: "/tutor",
    icon: MessageSquareCode,
    title: "Pergunte ao tutor",
    description: "Tire dúvidas de Python e veja exemplos para entender o código.",
  },
] as const;

function Index() {
  const { state } = useLearning();
  const started = hasActivity(state);
  const recommended = recommendation(state);
  const mastered = concepts.filter((c) => status(state.records[c.id]) === "Dominado").length;
  const completed = trainingMissions.filter((m) => state.completed.includes(m.id)).length;

  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-intro">
          <p className="home-kicker">
            <Code2 size={17} aria-hidden="true" /> Modalidade Programação
          </p>
          <h1 id="home-title">
            Treine para a OBI <span>com Python.</span>
          </h1>
          <p className="home-description">
            O OBI Tutor ajuda você a se preparar para a Olimpíada Brasileira de Informática. Resolva
            desafios guiados, peça pistas e acompanhe seu progresso.
          </p>
          <div className="home-actions">
            <Button asChild size="lg">
              <Link to="/missoes/$id" params={{ id: recommended.id }}>
                {started ? "Continuar meu treino" : "Fazer meu primeiro desafio"}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link to="/diagnostico">
                <ClipboardCheck aria-hidden="true" />
                Descobrir meu nível
              </Link>
            </Button>
          </div>
          {started && (
            <p className="home-next-mission">
              <Lightbulb size={16} aria-hidden="true" />
              Próximo desafio · {recommended.title}
            </p>
          )}
        </div>

        <figure className="home-example">
          <figcaption>
            <Terminal size={17} aria-hidden="true" />
            Preveja a saída
          </figcaption>
          <CodeBlock code={sampleCode} label="aquecimento.py" />
          <details className="home-example-answer">
            <summary>
              Ver a saída
              <ChevronDown size={17} aria-hidden="true" />
            </summary>
            <p>
              <samp>25</samp>O laço soma 5, 8 e 12.
            </p>
          </details>
        </figure>
      </section>

      {started && (
        <section className="home-progress" aria-labelledby="home-progress-title">
          <div>
            <h2 id="home-progress-title">Seu progresso nesta sessão</h2>
            <p>
              {completed} {completed === 1 ? "missão concluída" : "missões concluídas"} · {mastered}{" "}
              {mastered === 1 ? "conceito dominado" : "conceitos dominados"}
            </p>
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

      <details className="home-about">
        <summary>
          O que é a OBI?
          <ChevronDown size={17} aria-hidden="true" />
        </summary>
        <p>
          A Olimpíada Brasileira de Informática é uma competição para estudantes. Na modalidade
          Programação, os participantes resolvem problemas escrevendo programas de computador.
        </p>
        <a href="https://olimpiada.ic.unicamp.br/info/apresentacao/">Conheça a OBI</a>
      </details>
    </div>
  );
}
