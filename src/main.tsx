import { Leva } from "leva";
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./style/globals.css";
import { ModeContextProvider } from "./context/mode";
import { VisualContextProvider } from "./context/visual";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ModeContextProvider>
      <VisualContextProvider>
        <Leva collapsed={true} />
        <App />
      </VisualContextProvider>
    </ModeContextProvider>
  </React.StrictMode>
);
