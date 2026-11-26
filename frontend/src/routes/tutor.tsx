import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpen, Send, Sparkles } from "lucide-react";
import tutorIllustration from "@/assets/obi-learning-red.webp";
import { PageHeading, TutorIcon } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { tutorName, useLearning } from "@/components/learning-context";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/tutor")({
  head: () =>
    pageMeta(
      "Pergunte ao tutor",
      "Converse com o tutor sobre condicionais, laços, listas e raciocínio em Python.",
    ),
  component: Tutor,
});
const suggestions = [
  "Como funciona uma estrutura if?",
  "Qual a diferença entre for e while?",
  "Você pode me explicar listas em Python?",
  "Como identificar erros no meu código?",
  "Pode mostrar um exemplo mais simples?",
];
function Tutor() {
  const { messages, send, busy, end, state } = useLearning();
  const [text, setText] = useState("");
  const history = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = history.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages]);
  const submit = async () => {
    if (!text.trim() || busy) return;
    if (await send(text)) setText((draft) => (draft === text ? "" : draft));
  };
  return (
    <>
      <PageHeading
        eyebrow="PENSE JUNTO. DESCUBRA NO SEU RITMO."
        title="Toda boa ideia começa com uma pergunta."
        description="Pratique para a OBI. Tire dúvidas e explore exemplos em Python."
      />
      <div className="chat-layout">
        <section className="chat-main">
          <header className="chat-header">
            <TutorIcon />
            <div>
              <h3>{tutorName}</h3>
              <p>Seu tutor para a OBI</p>
            </div>
          </header>
          <div
            className="messages"
            ref={history}
            role="log"
            aria-live="polite"
            aria-label="Histórico da conversa"
          >
            {messages.map((m, i) => (
              <div className={`message ${m.role}`} key={i}>
                {m.role === "tutor" && <TutorIcon />}
                <div className="message-body">
                  <small>{m.role === "tutor" ? tutorName : "Você"}</small>
                  <p>{m.text}</p>
                  {m.role === "tutor" && i === messages.length - 1 && m.offerEnd && (
                    <div className="chat-context-actions">
                      <Button disabled={busy} variant="outline" onClick={() => void end()}>
                        Encerrar sessão
                      </Button>
                      <Button variant="ghost" asChild>
                        <Link to="/">Pausar e voltar ao início</Link>
                      </Button>
                    </div>
                  )}
                  {m.role === "tutor" && i === messages.length - 1 && !m.offerEnd && (
                    <div className="chat-context-actions">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={busy}
                        onClick={() => void send("Pode mostrar um exemplo menor do conceito?")}
                      >
                        Ver exemplo
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          to="/missoes/$id"
                          params={{ id: m.missionId ?? state.recommendation.missionId }}
                        >
                          Resolver exercício
                          <ArrowRight />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={busy}
                        onClick={() => void send("Pode explicar de outro jeito?")}
                      >
                        Explicar de outro jeito
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <form
            className="chat-form"
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            <textarea
              aria-label="Sua pergunta"
              placeholder="O que você gostaria de entender melhor?"
              maxLength={2000}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void submit();
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              disabled={busy || !text.trim()}
              aria-label="Enviar pergunta"
            >
              <Send />
            </Button>
          </form>
          <p className="chat-disclaimer">
            {busy ? "Olimpio está preparando uma resposta. " : ""}O tutor analisa o texto da sua
            pergunta. Evite enviar dados pessoais.
          </p>
        </section>
        <aside className="chat-suggestions">
          <h3>
            <Sparkles size={15} className="inline mr-2 text-primary" />
            Por onde começar?
          </h3>
          {suggestions.map((s) => (
            <Button variant="outline" key={s} disabled={busy} onClick={() => void send(s)}>
              <BookOpen />
              {s}
            </Button>
          ))}
          <p>
            Você pode pedir uma ajuda direta ou escolher uma abordagem diferente. A decisão de como
            aprender continua sendo sua.
          </p>
          <img
            className="chat-tutor-illustration"
            src={tutorIllustration}
            alt="Olimpio, o robô tutor, ao lado de um notebook com código"
            width={720}
            height={540}
            loading="lazy"
          />
        </aside>
      </div>
    </>
  );
}
