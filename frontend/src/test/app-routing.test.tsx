import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { getRouter } from "@/router";

it("offers diagnostic from the home page and preserves learning and chat when navigating", async () => {
  const router = getRouter(createMemoryHistory({ initialEntries: ["/"] }));
  render(<RouterProvider router={router} />);

  expect(
    await screen.findByRole("heading", { name: "Treine para a OBI com Python." }),
  ).toBeVisible();
  fireEvent.click(screen.getByRole("link", { name: "Descobrir meu nível" }));
  fireEvent.click(await screen.findByRole("button", { name: "Iniciar diagnóstico" }));
  fireEvent.click(screen.getByRole("radio", { name: /O nome de quem fez mais pontos/ }));
  fireEvent.click(screen.getByRole("button", { name: "Próxima questão" }));
  expect(await screen.findByText("Questão 2 de 5")).toBeVisible();

  const nav = screen.getByRole("navigation", { name: "Navegação principal" });
  fireEvent.click(within(nav).getByRole("link", { name: "Pergunte ao tutor" }));
  const chat = await screen.findByRole("log");
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

it("leads a new student straight to the first recommended challenge", async () => {
  const router = getRouter(createMemoryHistory({ initialEntries: ["/"] }));
  render(<RouterProvider router={router} />);

  fireEvent.click(await screen.findByRole("link", { name: "Fazer meu primeiro desafio" }));
  expect(await screen.findByRole("heading", { name: "As peças de um problema" })).toBeVisible();
});

it("redirects the old diagnostic URL into the single diagnostic flow", async () => {
  const router = getRouter(createMemoryHistory({ initialEntries: ["/missoes/diag-1"] }));
  render(<RouterProvider router={router} />);
  expect(await screen.findByRole("button", { name: "Iniciar diagnóstico" })).toBeVisible();
  expect(router.state.location.pathname).toBe("/diagnostico");
});
