import { Leva } from "leva";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import "./style/globals.css";
import { CameraControlsContextProvider } from "./context/cameraControls";
import { ModeContextProvider } from "./context/mode";
import { ThemeProvider } from "./context/theme";
import { VisualContextProvider } from "./context/visual";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ModeContextProvider>
        <CameraControlsContextProvider>
          <VisualContextProvider>
            <Leva collapsed={true} />
            <App />
          </VisualContextProvider>
        </CameraControlsContextProvider>
      </ModeContextProvider>
    </ThemeProvider>
  </StrictMode>
);
