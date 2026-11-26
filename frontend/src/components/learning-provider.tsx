import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { Answer, Catalog, Help, LearningState } from "@/lib/learning";
import { LearningContext, tutorName, type Message } from "./learning-context";

const welcome: Message = {
  role: "tutor",
  text: `Oi! Sou o ${tutorName}, seu tutor para a OBI. Estou aqui para ajudar você a se preparar para a modalidade Programação. Me conte o que você quer aprender ou em que parte travou. Podemos começar com um exemplo pequeno e pensar juntos no próximo passo.`,
};

type Session = { id: string; catalog: Catalog; state: LearningState };

async function request<T>(path: string, method: string, id?: string, body?: object): Promise<T> {
  const response = await fetch(path, {
    method,
    headers: {
      ...(body && { "Content-Type": "application/json" }),
      ...(id && { "X-Study-Session": id }),
    },
    ...(body && { body: JSON.stringify(body) }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(response.status === 410 ? data.error : "Falha na solicitação.");
  return data as T;
}

export function LearningProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([welcome]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ended, setEnded] = useState(false);
  const pending = useRef(false);
  const opening = useRef<Promise<Session> | null>(null);
  const latest = useRef({ id: 0, retry: "" });
  const activeQuestion = useRef<string | undefined>(undefined);
  const focus = useCallback((questionId: string) => {
    activeQuestion.current = questionId;
  }, []);

  function openSession() {
    return request<Session>("/api/session", "POST");
  }

  useEffect(() => {
    opening.current ??= openSession();
    let mounted = true;
    opening.current.then(
      (current) => {
        if (mounted) setSession(current);
      },
      () => {
        if (mounted) setError("Não foi possível conectar ao servidor do tutor.");
      },
    );
    return () => {
      mounted = false;
    };
  }, []);

  async function run<T>(operation: () => Promise<T>) {
    if (pending.current) return undefined;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      return await operation();
    } catch (err) {
      const message =
        err instanceof Error && err.message.startsWith("A sessão expirou")
          ? err.message
          : "Não foi possível concluir a ação. Tente novamente.";
      setError(message);
      return undefined;
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  async function action<T>(body: object, onSuccess?: (result: T) => void) {
    if (!session) return undefined;
    return run(async () => {
      const retry = JSON.stringify(body);
      if (retry !== latest.current.retry) {
        latest.current = { id: latest.current.id + 1, retry };
      }
      const { result, state } = await request<{ result: T; state: LearningState }>(
        "/api/session/action",
        "POST",
        session.id,
        { requestId: latest.current.id, ...body },
      );
      latest.current.retry = "";
      setSession({ ...session, state });
      onSuccess?.(result);
      return result;
    });
  }

  const answer = (questionId: string, optionId: string) =>
    action<Answer>({ action: "answer", questionId, optionId });
  const help = async (questionId: string, kind: Help) =>
    (await action<{ message: string }>({ action: "help", questionId, kind }))?.message;
  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return false;
    const questionId = activeQuestion.current;
    const result = await action<Omit<Message, "role">>(
      { action: "chat", text: trimmed, questionId },
      (reply) =>
        setMessages((history) => [
          ...history,
          { role: "student", text: trimmed },
          { role: "tutor", ...reply },
        ]),
    );
    return !!result;
  };

  const end = async () =>
    !!(await run(async () => {
      if (session) await request("/api/session", "DELETE", session.id);
      setSession(null);
      setMessages([welcome]);
      setEnded(true);
      activeQuestion.current = undefined;
      return true;
    }));

  const reset = async () =>
    !!(await run(async () => {
      const current = await openSession();
      if (session) {
        // A nova sessão pode começar mesmo se a limpeza da anterior depender da expiração.
        void request("/api/session", "DELETE", session.id).catch(() => {});
      }
      latest.current = { id: 0, retry: "" };
      activeQuestion.current = undefined;
      setSession(current);
      setMessages([welcome]);
      setEnded(false);
      return true;
    }));

  if (!session) {
    return (
      <main className="study-page">
        <div className="empty-state">
          <h1>{ended ? "Sessão encerrada" : "OBI Tutor"}</h1>
          {error && <p role="alert">{error}</p>}
          {!ended && !error && <p role="status">Conectando ao tutor…</p>}
          {(ended || error) && (
            <Button disabled={busy} onClick={() => void reset()}>
              {ended ? "Iniciar nova sessão" : "Tentar novamente"}
            </Button>
          )}
        </div>
      </main>
    );
  }

  return (
    <LearningContext.Provider
      value={{ ...session, busy, answer, help, focus, reset, end, messages, send }}
    >
      {error && (
        <p className="notice" role="alert">
          {error}
        </p>
      )}
      {children}
    </LearningContext.Provider>
  );
}
