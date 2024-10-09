import { StrictMode } from "react";
import App from "@/App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";

import "@/style/globals.css";

import { ThemeProvider } from "@/context/theme";

import { SoundcloudContextProvider } from "./context/soundcloud";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <SoundcloudContextProvider>
          <App />
        </SoundcloudContextProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
