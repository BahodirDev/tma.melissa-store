import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { initTelegramWebApp } from "./lib/telegram";
import "./index.css";
import App from "./App.tsx";

initTelegramWebApp();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
