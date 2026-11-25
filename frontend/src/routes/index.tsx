import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCheck,
  CircleHelp,
  ClipboardCheck,
  Lightbulb,
  Target,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLearning } from "@/components/learning-context";
import { concepts, hasActivity, recommendation, status, trainingMissions } from "@/lib/learning";
import { pageMeta } from "@/lib/page-meta";
import learningArt from "@/assets/obi-learning.webp";

export const Route = createFileRoute("/")({
  head: () =>
    pageMeta(
      "Prepare-se para a OBI",
      "Preparação introdutória para a Olimpíada Brasileira de Informática: desafios de raciocínio e programação com orientação de um tutor demonstrativo.",
    ),
  component: Index,
});
function Index() {
  const { state } = useLearning();
  const [aboutOpen, setAboutOpen] = useState(false);
  const started = hasActivity(state);
  const recommended = recommendation(state);
  const mastered = concepts.filter((c) => status(state.records[c.id]) === "Dominado").length;
  const completed = trainingMissions.filter((m) => state.completed.includes(m.id)).length;
  return (
    <>
      <section className="home-intro">
        <div className="eyebrow">OBI TUTOR · RACIOCÍNIO, PROGRAMAÇÃO E DESCOBERTAS</div>
        <h1>
          Prepare-se para a OBI
          <br />
          com um tutor inteligente.
        </h1>
        <p>
          Desenvolva seu raciocínio, pratique programação e receba orientação personalizada para
          resolver desafios inspirados na Olimpíada Brasileira de Informática.
        </p>
        <div className="button-row">
          <Button asChild size="lg">
            <Link to="/diagnostico">
              <ClipboardCheck />
              Descobrir meu nível
              <ArrowRight />
            </Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link to="/trilha">
              <Target />
              Começar a treinar
            </Link>
          </Button>
        </div>
        <Button variant="link" className="about-obi" onClick={() => setAboutOpen(true)}>
          <CircleHelp />O que é a OBI?
        </Button>
      </section>
      <section className="home-learning-band">
        <img src={learningArt} alt="Tutor azul ao lado de um notebook para praticar programação" />
        <div>
          <span className="eyebrow">SUA PRÓXIMA DESCOBERTA</span>
          <h2>
            Um desafio de cada vez.
            <br />
            Com orientação no caminho.
          </h2>
          <p>
            Preparação introdutória para a modalidade Programação, com Python e raciocínio lógico.
          </p>
          <Link to="/tutor">
            Converse com seu tutor
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
      {started && (
        <section className="home-session">
          <div className="section-title">
            <h2>Seu próximo passo</h2>
            <Link to="/progresso">
              Ver meu progresso
              <ArrowRight size={13} />
            </Link>
          </div>
          <div className="home-session-row">
            <div>
              <span className="recommendation-top">
                <Lightbulb size={15} /> SUGESTÃO DO TUTOR
              </span>
              <h3>{recommended.title}</h3>
              <p>{concepts.find((c) => c.id === recommended.concept)?.name}</p>
            </div>
            <Button asChild>
              <Link to="/missoes/$id" params={{ id: recommended.id }}>
                Continuar treinando
                <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="session-totals">
            <span>
              <Target size={14} />
              {completed} desafios concluídos
            </span>
            <span>
              <CheckCheck size={14} />
              {mastered} conceitos dominados
            </span>
          </div>
        </section>
      )}
      {aboutOpen && (
        <div className="modal-overlay">
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="obi-title">
            <Button
              variant="ghost"
              size="icon"
              className="modal-close"
              aria-label="Fechar explicação"
              onClick={() => setAboutOpen(false)}
            >
              <X />
            </Button>
            <span className="icon-tile">
              <BookOpen />
            </span>
            <h2 id="obi-title">O que é a OBI?</h2>
            <p>
              A Olimpíada Brasileira de Informática é uma competição educacional que incentiva o
              raciocínio lógico e a resolução de problemas.
            </p>
            <div className="obi-modal-content">
              <h3>Modalidade Iniciação</h3>
              <p>Propõe problemas de lógica e raciocínio, sem exigir programação.</p>
              <h3>Modalidade Programação</h3>
              <p>Propõe problemas que são resolvidos por meio de programas de computador.</p>
              <h3>Onde o OBI Tutor entra?</h3>
              <p>
                Este Sistema Tutor Inteligente demonstrativo oferece orientação conforme suas
                tentativas e seu progresso. Trabalhamos com{" "}
                <strong>conteúdos introdutórios da modalidade Programação</strong>, utilizando
                Python e desafios de raciocínio lógico.
              </p>
              <div className="notice">
                <CircleHelp size={16} />
                <span>
                  Projeto acadêmico independente, não oficial da OBI. Não contempla todas as
                  modalidades e níveis nem promete preparação completa.
                </span>
              </div>
            </div>
            <Button onClick={() => setAboutOpen(false)}>
              Entendi
              <ArrowRight />
            </Button>
          </section>
        </div>
      )}
    </>
  );
}
