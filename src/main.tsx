import { Leva } from "leva";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import "./style/globals.css";
import { ModeContextProvider } from "./context/mode";
import { VisualContextProvider } from "./context/visual";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ModeContextProvider>
      <VisualContextProvider>
        <Leva collapsed={true} />
        <App />
      </VisualContextProvider>
    </ModeContextProvider>
  </StrictMode>
);
