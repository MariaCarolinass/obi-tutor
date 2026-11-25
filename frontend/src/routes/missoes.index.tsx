import { createFileRoute, Navigate } from "@tanstack/react-router";
import { pageMeta } from "@/lib/page-meta";
export const Route = createFileRoute("/missoes/")({
  head: () =>
    pageMeta(
      "Desafios para a OBI",
      "Os conceitos e desafios introdutórios estão reunidos em Treinar para a OBI.",
    ),
  component: () => <Navigate to="/trilha" replace />,
});
