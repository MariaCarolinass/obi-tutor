import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Bot,
  ChartNoAxesCombined,
  Check,
  ChevronRight,
  Code2,
  FlaskConical,
  Home,
  Menu,
  MessageCircle,
  RotateCcw,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLearning } from "@/components/learning-context";
import { concepts, hasActivity, status } from "@/lib/learning";

const nav = [
  { to: "/", label: "Início", icon: Home },
  { to: "/trilha", label: "Treinar para a OBI", icon: Target },
  { to: "/tutor", label: "Pergunte ao tutor", icon: MessageCircle },
  { to: "/progresso", label: "Meu progresso", icon: ChartNoAxesCombined },
] as const;
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { state, reset } = useLearning();
  const [open, setOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const mastered = concepts.filter((c) => status(state.records[c.id]) === "Dominado").length;
  const title =
    nav.find((n) => n.to === pathname)?.label ??
    (pathname === "/diagnostico" ? "Diagnóstico inicial" : "Treinar para a OBI");
  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? "is-open" : ""}`}>
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">
            <Code2 size={25} />
          </span>
          <span>
            OBI <strong>Tutor</strong>
            <small>Seu próximo passo para a OBI</small>
          </span>
        </Link>
        <div className="nav-label">ESPAÇO DE APRENDIZAGEM</div>
        <nav aria-label="Navegação principal">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={`nav-link ${pathname === n.to || (n.to === "/trilha" && pathname.startsWith("/missoes")) ? "active" : ""}`}
              onClick={() => setOpen(false)}
            >
              <n.icon size={19} />
              <span>{n.label}</span>
              {(pathname === n.to || (n.to === "/trilha" && pathname.startsWith("/missoes"))) && (
                <ChevronRight size={15} />
              )}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          {hasActivity(state) && (
            <div className="journey-summary">
              <span className="mini-icon">
                <Sparkles size={17} />
              </span>
              <strong>Um passo de cada vez</strong>
              <p>Seu aprendizado, no seu ritmo.</p>
              <div className="progress-track">
                <progress max="10" value={mastered} />
              </div>
              <small>
                {mastered} de 10 conceitos dominados <span>{mastered * 10}%</span>
              </small>
              <Link to="/progresso">
                Ver meu progresso <ArrowUpRight size={14} />
              </Link>
            </div>
          )}
          <Button variant="ghost" className="reset-button" onClick={() => setConfirmReset(true)}>
            <RotateCcw />
            Reiniciar demonstração
          </Button>
          <div className="sidebar-footer">
            <FlaskConical size={14} /> Protótipo acadêmico <span>v1.0</span>
          </div>
        </div>
      </aside>
      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}
      <div className="app-main">
        <header className="topbar">
          <div className="breadcrumb">
            <Button
              variant="ghost"
              size="icon"
              className="mobile-menu"
              aria-label="Abrir menu"
              onClick={() => setOpen(!open)}
            >
              <Menu />
            </Button>
            <span>Meu espaço</span>
            <ChevronRight size={14} />
            <strong>{title}</strong>
          </div>
          <div className="topbar-right">
            <span className="demo-badge">
              <span /> Modo demonstração
            </span>
            <div className="student-avatar" aria-label="Perfil de estudante">
              E
            </div>
          </div>
        </header>
        <main>{children}</main>
        <footer className="page-footer">
          <span>Feito para aprender. Pensado para você.</span>
          <span>OBI Tutor · Projeto acadêmico independente</span>
        </footer>
      </div>
      {confirmReset && (
        <div className="modal-overlay">
          <section role="dialog" aria-modal="true" aria-labelledby="reset-title" className="modal">
            <Button
              variant="ghost"
              size="icon"
              className="modal-close"
              aria-label="Fechar"
              onClick={() => setConfirmReset(false)}
            >
              <X />
            </Button>
            <span className="icon-tile">
              <RotateCcw />
            </span>
            <h2 id="reset-title">Começar de novo?</h2>
            <p>
              As respostas e conversas desta sessão serão apagadas. O diagnóstico e os pontos
              voltarão ao início.
            </p>
            <div className="button-row">
              <Button variant="outline" onClick={() => setConfirmReset(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  reset();
                  setConfirmReset(false);
                  setOpen(false);
                  void navigate({ to: "/", replace: true });
                }}
              >
                Reiniciar demonstração
              </Button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
export function StatusBadge({ value }: { value: ReturnType<typeof status> }) {
  return (
    <span
      className={`status-badge ${value === "Dominado" ? "mastered" : value === "Não avaliado" ? "unrated" : "learning"}`}
    >
      {value === "Dominado" ? <Check size={12} /> : <span />}
      {value}
    </span>
  );
}
export function TutorIcon() {
  return (
    <span className="tutor-icon">
      <Bot size={21} />
    </span>
  );
}
