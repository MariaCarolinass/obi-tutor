import { createRouter, type RouterHistory } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export function getRouter(history?: RouterHistory) {
  return createRouter({
    routeTree,
    ...(history && { history }),
    scrollRestoration: true,
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
