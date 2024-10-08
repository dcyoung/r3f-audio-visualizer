import { Suspense } from "react";
import AudioAnalyzer from "@/components/analyzers/audioAnalyzer";
import AudioScopeCanvas from "@/components/canvas/AudioScope";
import Visual3DCanvas from "@/components/canvas/Visual3D";
import { ControlsPanel } from "@/components/controls/main";
import {
  APPLICATION_MODE,
  type TApplicationMode,
} from "@/lib/applicationModes";

import { useAppStateActions, useMode } from "./lib/appState";

const getAnalyzerComponent = (mode: TApplicationMode) => {
  switch (mode) {
    case APPLICATION_MODE.AUDIO:
    case APPLICATION_MODE.AUDIO_SCOPE:
      return <AudioAnalyzer mode={mode} />;
    case APPLICATION_MODE.WAVE_FORM:
    case APPLICATION_MODE.NOISE:
    case APPLICATION_MODE.PARTICLE_NOISE:
      return null;
    default:
      return mode satisfies never;
  }
};

const getCanvasComponent = (mode: TApplicationMode) => {
  switch (mode) {
    case APPLICATION_MODE.AUDIO_SCOPE:
      return <AudioScopeCanvas />;
    case APPLICATION_MODE.WAVE_FORM:
    case APPLICATION_MODE.NOISE:
    case APPLICATION_MODE.AUDIO:
    case APPLICATION_MODE.PARTICLE_NOISE:
      return <Visual3DCanvas mode={mode} />;
    default:
      return mode satisfies never;
  }
};

const App = () => {
  const mode = useMode();
  const { noteCanvasInteraction } = useAppStateActions();

  return (
    <main className="relative h-[100dvh] w-[100dvw] bg-black">
      <div
        className="absolute h-[100dvh] w-[100dvw]"
        onMouseDown={noteCanvasInteraction}
        onTouchStart={noteCanvasInteraction}
      >
        <Suspense fallback={<span>loading...</span>}>
          {getCanvasComponent(mode)}
        </Suspense>
      </div>
      <div className="pointer-events-none absolute h-[100dvh] w-[100dvw]">
        <Suspense fallback={<span>loading...</span>}>
          {getAnalyzerComponent(mode)}
        </Suspense>
      </div>
      <ControlsPanel />
    </main>
  );
};

export default App;
