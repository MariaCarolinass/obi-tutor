import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpen, Send, Sparkles } from "lucide-react";
import { PageHeading, TutorIcon } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/code-block";
import { useLearning } from "@/components/learning-context";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/tutor")({
  head: () =>
    pageMeta(
      "Pergunte ao tutor",
      "Converse com o tutor demonstrativo sobre condicionais, laços, listas e raciocínio em Python.",
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
  const { messages, send } = useLearning();
  const [text, setText] = useState("");
  const history = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = history.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages]);
  const submit = () => {
    if (!text.trim()) return;
    send(text);
    setText("");
  };
  const latest = messages.at(-1)?.code ?? "";
  const exercise =
    latest.includes("notas") || latest.includes("for n")
      ? "for-1"
      : latest.includes("senha")
        ? "if-2"
        : "if-1";
  return (
    <>
      <PageHeading
        eyebrow="PENSE JUNTO. DESCUBRA NO SEU RITMO."
        title="Toda boa ideia começa com uma pergunta."
        description="Seu espaço para tirar dúvidas, explorar exemplos e encontrar um novo jeito de entender."
      />
      <div className="chat-layout">
        <section className="chat-main">
          <header className="chat-header">
            <TutorIcon />
            <div>
              <h3>Seu tutor de Python</h3>
              <p>Uma conversa para aprender, não para julgar.</p>
            </div>
            <span>Demonstração</span>
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
                  <small>{m.role === "tutor" ? "OBI Tutor" : "Você"}</small>
                  <p>{m.text}</p>
                  {m.code && <CodeBlock code={m.code} />}{" "}
                  {m.role === "tutor" && i === messages.length - 1 && (
                    <div className="chat-context-actions">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => send("Ver exemplo de if em Python")}
                      >
                        Ver exemplo
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/missoes/$id" params={{ id: exercise }}>
                          Resolver exercício
                          <ArrowRight />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => send("Pode explicar de outro jeito?")}
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
              submit();
            }}
          >
            <textarea
              aria-label="Sua pergunta"
              placeholder="O que você gostaria de entender melhor?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
            />
            <Button type="submit" size="icon" disabled={!text.trim()} aria-label="Enviar pergunta">
              <Send />
            </Button>
          </form>
          <p className="chat-disclaimer">
            Respostas demonstrativas pré-definidas · Sem IA externa · Não executa código nem altera
            pontos.
          </p>
        </section>
        <aside className="chat-suggestions">
          <h3>
            <Sparkles size={15} className="inline mr-2 text-primary" />
            Por onde começar?
          </h3>
          {suggestions.map((s) => (
            <Button variant="outline" key={s} onClick={() => send(s)}>
              <BookOpen />
              {s}
            </Button>
          ))}
          <p>
            Você pode pedir uma ajuda direta ou escolher uma abordagem diferente. A decisão de como
            aprender continua sendo sua.
          </p>
        </aside>
      </div>
    </>
  );
}
