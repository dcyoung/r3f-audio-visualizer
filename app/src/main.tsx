import { StrictMode } from "react";
import App from "@/App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";

import "@/style/globals.css";

import { CameraControlsContextProvider } from "@/context/cameraControls";
import { ModeContextProvider } from "@/context/mode";
import { ThemeProvider } from "@/context/theme";
import { VisualContextProvider } from "@/context/visual";

import { AudioSourceContextProvider } from "./context/audioSource";
import { FFTAnalyzerContextProvider } from "./context/fftAnalyzer";
import { NoiseGeneratorContextProvider } from "./context/noiseGenerator";
import { SoundcloudContextProvider } from "./context/soundcloud";
import { WaveGeneratorContextProvider } from "./context/waveGenerator";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <ModeContextProvider>
          <WaveGeneratorContextProvider>
            <NoiseGeneratorContextProvider>
              <FFTAnalyzerContextProvider>
                <AudioSourceContextProvider>
                  <SoundcloudContextProvider>
                    <CameraControlsContextProvider>
                      <VisualContextProvider>
                        <App />
                      </VisualContextProvider>
                    </CameraControlsContextProvider>
                  </SoundcloudContextProvider>
                </AudioSourceContextProvider>
              </FFTAnalyzerContextProvider>
            </NoiseGeneratorContextProvider>
          </WaveGeneratorContextProvider>
        </ModeContextProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
