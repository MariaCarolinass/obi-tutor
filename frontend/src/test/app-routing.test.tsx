import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { getRouter } from "@/router";

it("offers diagnostic from the home page and preserves learning and chat when navigating", async () => {
  const router = getRouter(createMemoryHistory({ initialEntries: ["/"] }));
  render(<RouterProvider router={router} />);

  expect(
    await screen.findByRole("heading", { name: "Treine para a OBI com seu tutor." }),
  ).toBeVisible();
  expect(screen.getByText("Olimpíada Brasileira de Informática", { exact: true })).toBeVisible();
  fireEvent.click(screen.getByRole("link", { name: /^Fazer o diagnóstico/ }));
  fireEvent.click(await screen.findByRole("button", { name: "Iniciar diagnóstico" }));
  fireEvent.click(screen.getByRole("radio", { name: /O nome de quem fez mais pontos/ }));
  fireEvent.click(screen.getByRole("button", { name: "Próxima questão" }));
  expect(await screen.findByText("Questão 2 de 5")).toBeVisible();

  const nav = screen.getByRole("navigation", { name: "Navegação principal" });
  fireEvent.click(within(nav).getByRole("link", { name: "Início" }));
  fireEvent.click(await screen.findByRole("link", { name: "Conversar com o tutor" }));
  const chat = await screen.findByRole("log");
  expect(within(chat).getByText("Olimpio")).toBeVisible();
  expect(screen.getByText("Seu tutor para a OBI", { exact: true })).toBeVisible();
  expect(within(chat).getByText(/Sou o Olimpio.*modalidade Programação/)).toBeVisible();
  const question = "Como funciona uma lista?";
  fireEvent.change(screen.getByRole("textbox", { name: "Sua pergunta" }), {
    target: { value: question },
  });
  fireEvent.click(screen.getByRole("button", { name: "Enviar pergunta" }));
  expect(within(chat).getByText(/Uma lista guarda vários valores/)).toBeVisible();

  fireEvent.click(within(nav).getByRole("link", { name: "Meu progresso" }));
  const c1 = await screen.findByRole("row", { name: /Interpretação de enunciados/ });
  expect(within(c1).getByText("30/100")).toBeVisible();
  expect(within(c1).getByText("Inicial")).toBeVisible();

  fireEvent.click(within(nav).getByRole("link", { name: "Pergunte ao tutor" }));
  expect(await screen.findByText(question)).toBeVisible();
});

it("opens the first challenge and shows the next recommendation inside session progress", async () => {
  const router = getRouter(createMemoryHistory({ initialEntries: ["/"] }));
  render(<RouterProvider router={router} />);

  fireEvent.click(await screen.findByRole("link", { name: "Começar com o tutor" }));
  expect(await screen.findByRole("heading", { name: "As peças de um problema" })).toBeVisible();
  expect(screen.getByRole("button", { name: "Preciso de uma dica" })).toBeVisible();
  expect(screen.getByRole("heading", { name: "Conte com o Olimpio" })).toBeVisible();
  fireEvent.click(screen.getByRole("radio", { name: /rodada_1 \+ rodada_2/ }));
  fireEvent.click(screen.getByRole("button", { name: "Verificar resposta" }));
  expect(screen.getByText(/Boa descoberta! \+25 pontos/)).toBeVisible();

  const nav = screen.getByRole("navigation", { name: "Navegação principal" });
  fireEvent.click(within(nav).getByRole("link", { name: "Início" }));
  const progress = await screen.findByRole("region", { name: "Seu progresso nesta sessão" });
  expect(within(progress).getByText("Próximo desafio · Lendo o placar")).toBeVisible();
});

it("shows the OBI guide and links to official rules, preparation and participation", async () => {
  const router = getRouter(createMemoryHistory({ initialEntries: ["/"] }));
  render(<RouterProvider router={router} />);

  const guide = await screen.findByRole("region", {
    name: "Como funciona a OBI na modalidade Programação?",
  });
  expect(screen.getByRole("link", { name: "Saiba como funciona a OBI" })).toHaveAttribute(
    "href",
    "#sobre-a-obi",
  );
  expect(within(guide).getByRole("heading", { name: "Onde o OBI Tutor entra?" })).toBeVisible();
  expect(within(guide).getByRole("link", { name: /^Regulamento da OBI/ })).toHaveAttribute(
    "href",
    "https://olimpiada.ic.unicamp.br/info/regulamento/",
  );
  expect(
    within(guide).getByRole("link", { name: /^Pratique com provas anteriores/ }),
  ).toHaveAttribute("href", "https://olimpiada.ic.unicamp.br/pratique/");
  expect(within(guide).getByRole("link", { name: /^Como participar/ })).toHaveAttribute(
    "href",
    "https://olimpiada.ic.unicamp.br/info/como_participar_aluno/",
  );
});

it("guides the warmup with a hint and distinct feedback without starting a scored session", async () => {
  const router = getRouter(createMemoryHistory({ initialEntries: ["/"] }));
  render(<RouterProvider router={router} />);

  const options = await screen.findByRole("group", { name: "Qual número este código imprime?" });
  expect(screen.getByText("Vamos conferir juntos os pontos de três rodadas.")).toBeVisible();
  const reply = screen.getByRole("status");
  expect(reply).toBeEmptyDOMElement();

  fireEvent.click(screen.getByRole("button", { name: "Pedir uma pista" }));
  expect(within(reply).getByText("Olimpio")).toBeVisible();
  expect(reply).toHaveTextContent("Comece com total igual a 0");
  fireEvent.click(within(options).getByRole("button", { name: "13" }));
  expect(reply).toHaveTextContent("Ainda falta a última volta");
  fireEvent.click(within(options).getByRole("button", { name: "25" }));
  expect(reply).toHaveTextContent("O total começa em 0 e passa por 5, 13 e 25");
  expect(within(options).getByRole("button", { name: "25" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(screen.getByRole("link", { name: "Começar com o tutor" })).toBeVisible();
});

it("redirects the old diagnostic URL into the single diagnostic flow", async () => {
  const router = getRouter(createMemoryHistory({ initialEntries: ["/missoes/diag-1"] }));
  render(<RouterProvider router={router} />);
  expect(await screen.findByRole("button", { name: "Iniciar diagnóstico" })).toBeVisible();
  expect(router.state.location.pathname).toBe("/diagnostico");
});
