import { RouterProvider } from "@tanstack/react-router";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/dm-sans";
import "@fontsource-variable/jetbrains-mono";
import "./styles.css";
import { getRouter } from "./router";

const root = document.getElementById("root");
if (!root) throw new Error("Elemento raiz do OBI Tutor ausente.");

createRoot(root).render(<RouterProvider router={getRouter()} />);
