import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Leva } from "leva";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "@/App";
import "@/style/globals.css";
import { CameraControlsContextProvider } from "@/context/cameraControls";
import { ModeContextProvider } from "@/context/mode";
import { ThemeProvider } from "@/context/theme";
import { VisualContextProvider } from "@/context/visual";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  </StrictMode>
);
