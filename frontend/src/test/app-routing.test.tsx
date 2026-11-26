import { spawn, type ChildProcess } from "node:child_process";
import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterAll, beforeAll, expect, it, vi } from "vitest";
import { getRouter } from "@/router";

let backend: ChildProcess;
beforeAll(async () => {
  const env = { ...process.env, OLIMPIO_TUTOR_OBI: "" };
  backend = spawn("python3", ["-m", "obi_tutor.api", "--port", "0"], { cwd: "..", env });
  const base = await new Promise<string>((resolve, reject) => {
    backend.on("error", reject);
    backend.on("exit", (code) => reject(new Error(`O backend de teste encerrou (${code}).`)));
    backend.stderr?.on("data", (error: Buffer) => {
      if (error.toString().includes("Traceback")) reject(new Error(error.toString()));
    });
    backend.stdout?.on("data", (output: Buffer) => {
      const address = output.toString().match(/http:\/\/127\.0\.0\.1:[0-9]+/)?.[0];
      if (address) resolve(address);
    });
  });
  const http = globalThis.fetch;
  vi.stubGlobal("fetch", (url: string, init?: RequestInit) => http(new URL(url, base), init));
});
afterAll(() => {
  backend?.kill();
  vi.unstubAllGlobals();
});

it("offers diagnostic from the home page and preserves learning and chat when navigating", async () => {
  const router = getRouter(createMemoryHistory({ initialEntries: ["/"] }));
  render(<RouterProvider router={router} />);

  expect(
    await screen.findByRole("heading", { name: "Treine para a OBI com seu tutor." }),
  ).toBeVisible();
  expect(screen.getByText("Olimpíada Brasileira de Informática", { exact: true })).toBeVisible();
  fireEvent.click(screen.getByRole("link", { name: /^Fazer o diagnóstico/ }));
  fireEvent.click(await screen.findByRole("button", { name: "Iniciar diagnóstico" }));
  fireEvent.click(screen.getByRole("radio", { name: /Recebe 1 medalha de ouro\./ }));
  fireEvent.click(screen.getByRole("button", { name: "Próxima questão" }));
  expect(await screen.findByText("Questão 2 de 10")).toBeVisible();

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
  expect(await within(chat).findByText(/Organize valores em listas/)).toBeVisible();

  fireEvent.click(within(nav).getByRole("link", { name: "Meu progresso" }));
  const c1 = await screen.findByRole("row", { name: /Interpretação de enunciados/ });
  expect(within(c1).getByText("30/100")).toBeVisible();
  expect(within(c1).getByText("Inicial")).toBeVisible();

  fireEvent.click(within(nav).getByRole("link", { name: "Pergunte ao tutor" }));
  expect(await screen.findByText(question)).toBeVisible();
});

it("shows the next recommendation and lets the student reset the session", async () => {
  const router = getRouter(createMemoryHistory({ initialEntries: ["/"] }));
  render(<RouterProvider router={router} />);

  fireEvent.click(await screen.findByRole("link", { name: "Começar com o tutor" }));
  expect(
    await screen.findByRole("heading", { name: "Detetive de Bugs · Enunciados · 1" }),
  ).toBeVisible();
  expect(screen.getByRole("button", { name: "Preciso de uma dica" })).toBeVisible();
  expect(screen.getByRole("heading", { name: "Conte com o Olimpio" })).toBeVisible();
  fireEvent.click(screen.getAllByRole("radio")[0]!);
  fireEvent.click(screen.getByRole("button", { name: "Verificar resposta" }));
  expect(await screen.findByText(/Boa descoberta! \+25 pontos/)).toBeVisible();

  const nav = screen.getByRole("navigation", { name: "Navegação principal" });
  fireEvent.click(within(nav).getByRole("link", { name: "Início" }));
  const progress = await screen.findByRole("region", { name: "Seu progresso nesta sessão" });
  expect(
    within(progress).getByText("Próximo desafio · Complete o Código · Enunciados · 2"),
  ).toBeVisible();
  expect(screen.queryByText("Modo demonstração")).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Reiniciar sessão" }));
  const dialog = screen.getByRole("dialog", { name: "Começar de novo?" });
  fireEvent.click(within(dialog).getByRole("button", { name: "Reiniciar sessão" }));
  expect(await screen.findByRole("link", { name: "Começar com o tutor" })).toBeVisible();
  expect(
    screen.queryByRole("region", { name: "Seu progresso nesta sessão" }),
  ).not.toBeInTheDocument();
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

it("shows the learner model status and diagnostic result for each assessed concept", async () => {
  const router = getRouter(createMemoryHistory({ initialEntries: ["/diagnostico"] }));
  render(<RouterProvider router={router} />);

  fireEvent.click(await screen.findByRole("button", { name: "Iniciar diagnóstico" }));
  for (let index = 0; index < 10; index++) {
    await screen.findByText(`Questão ${index + 1} de 10`);
    fireEvent.click(screen.getAllByRole("radio")[0]!);
    fireEvent.click(
      screen.getByRole("button", { name: index === 9 ? "Ver meu resultado" : "Próxima questão" }),
    );
  }

  const profile = await screen.findByRole("region", { name: "Seu nível por conceito" });
  const [reading, inputOutput] = within(profile).getAllByRole("listitem");
  expect(within(profile).getAllByRole("listitem")).toHaveLength(10);
  expect(reading).toHaveTextContent("Acerto no diagnóstico");
  expect(reading).toHaveTextContent("+30 pontos");
  expect(reading).toHaveTextContent("Inicial");
  expect(inputOutput).toHaveTextContent("Vale reforçar");
  expect(inputOutput).toHaveTextContent("Inicial");
});

it("redirects the old diagnostic URL into the single diagnostic flow", async () => {
  const router = getRouter(createMemoryHistory({ initialEntries: ["/missoes/diag-1"] }));
  render(<RouterProvider router={router} />);
  expect(await screen.findByRole("button", { name: "Iniciar diagnóstico" })).toBeVisible();
  expect(router.state.location.pathname).toBe("/diagnostico");
});

it("keeps mission help in the scoring session and lets the student end it", async () => {
  const router = getRouter(createMemoryHistory({ initialEntries: ["/missoes/MISS-C4-01"] }));
  render(<RouterProvider router={router} />);
  fireEvent.click(await screen.findByRole("button", { name: "Preciso de uma dica" }));
  expect(await screen.findByRole("heading", { name: "Uma pista para você" })).toBeVisible();
  fireEvent.click(screen.getAllByRole("radio")[0]!);
  fireEvent.click(screen.getByRole("button", { name: "Verificar resposta" }));
  expect(await screen.findByText(/Boa descoberta! \+15 pontos/)).toBeVisible();
  fireEvent.click(screen.getByRole("link", { name: "Conversar com o Olimpio" }));
  const input = await screen.findByRole("textbox", { name: "Sua pergunta" });
  fireEvent.change(input, { target: { value: "Pode mostrar um exemplo menor?" } });
  fireEvent.click(screen.getByRole("button", { name: "Enviar pergunta" }));
  expect(await screen.findByText(/idade >= 16/)).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: /^Encerrar sessão$/ }));
  const dialog = screen.getByRole("dialog");
  fireEvent.click(within(dialog).getByRole("button", { name: "Encerrar sessão" }));
  expect(await screen.findByRole("heading", { name: "Sessão encerrada" })).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Iniciar nova sessão" }));
  expect(await screen.findByRole("link", { name: "Começar com o tutor" })).toBeVisible();
});
