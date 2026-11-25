import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  BookOpen,
  ChartNoAxesCombined,
  Check,
  ChevronRight,
  Code2,
  Home,
  Lightbulb,
  Menu,
  MessageCircle,
  RotateCcw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLearning } from "@/components/learning-context";
import { concepts, hasActivity, status } from "@/lib/learning";

const nav = [
  { to: "/", label: "Início", icon: Home },
  { to: "/trilha", label: "Treinar para a OBI", icon: Code2 },
  { to: "/tutor", label: "Pergunte ao tutor", icon: MessageCircle },
  { to: "/progresso", label: "Meu progresso", icon: ChartNoAxesCombined },
] as const;
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { state, reset } = useLearning();
  const [open, setOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (open) closeButton.current?.focus();
  }, [open]);

  const closeMenu = () => {
    setOpen(false);
    menuButton.current?.focus();
  };

  const mastered = concepts.filter((c) => status(state.records[c.id]) === "Dominado").length;
  const title =
    nav.find((n) => n.to === pathname)?.label ??
    (pathname === "/diagnostico" ? "Diagnóstico inicial" : "Treinar para a OBI");
  return (
    <div className="app-shell">
      <aside
        id="app-sidebar"
        className={`sidebar ${open ? "is-open" : ""}`}
        onKeyDown={(event) => {
          if (event.key === "Escape" && open) closeMenu();
        }}
      >
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">
            <Lightbulb size={25} aria-hidden="true" />
          </span>
          <span>
            OBI <strong>Tutor</strong>
            <small>Treino de programação</small>
          </span>
        </Link>
        <Button
          ref={closeButton}
          variant="ghost"
          size="icon"
          className="sidebar-close"
          aria-label="Fechar menu"
          onClick={closeMenu}
        >
          <X aria-hidden="true" />
        </Button>
        <nav aria-label="Navegação principal">
          {nav.map((n) => {
            const active =
              pathname === n.to || (n.to === "/trilha" && pathname.startsWith("/missoes"));
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`nav-link ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                <n.icon size={19} aria-hidden="true" />
                <span>{n.label}</span>
                {active && <ChevronRight size={15} aria-hidden="true" />}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          {hasActivity(state) && (
            <div className="journey-summary">
              <span className="mini-icon">
                <ChartNoAxesCombined size={17} aria-hidden="true" />
              </span>
              <strong>Seu progresso</strong>
              <div className="progress-track">
                <progress max="10" value={mastered} aria-label="Conceitos dominados" />
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
        </div>
      </aside>
      {open && <div className="sidebar-overlay" onClick={closeMenu} />}
      <div className="app-main">
        <header className="topbar">
          <div className="breadcrumb">
            <Button
              ref={menuButton}
              variant="ghost"
              size="icon"
              className="mobile-menu"
              aria-label="Abrir menu"
              aria-controls="app-sidebar"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <Menu aria-hidden="true" />
            </Button>
            <Link to="/" className="mobile-brand">
              <span className="brand-mark">
                <Lightbulb size={19} aria-hidden="true" />
              </span>
              OBI Tutor
            </Link>
            <strong className="topbar-location">{title}</strong>
          </div>
          <span className="demo-badge">Modo demonstração</span>
        </header>
        <main>{children}</main>
        <footer className="page-footer">
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
      <Lightbulb size={21} aria-hidden="true" />
    </span>
  );
}
