import { Suspense } from "react";

import AudioFFTAnalyzer from "@/components/analyzers/audioFFTAnalyzer";
import AudioScopeAnalyzer from "@/components/analyzers/audioScopeAnalyzer";
import {
  type ApplicationMode,
  APPLICATION_MODE,
} from "@/components/applicationModes";
import AudioScopeCanvas from "@/components/canvas/AudioScope";
import Visual3DCanvas from "@/components/canvas/Visual3D";
import { ControlsPanel } from "@/components/controls/main";
import { useModeContext } from "@/context/mode";

const getAnalyzerComponent = (mode: ApplicationMode) => {
  switch (mode) {
    case APPLICATION_MODE.AUDIO:
      return <AudioFFTAnalyzer />;
    case APPLICATION_MODE.AUDIO_SCOPE:
      return <AudioScopeAnalyzer />;
    default:
      return null;
  }
};

const getCanvasComponent = (mode: ApplicationMode) => {
  switch (mode) {
    case APPLICATION_MODE.AUDIO_SCOPE:
      return <AudioScopeCanvas />;
    default:
      return <Visual3DCanvas mode={mode} />;
  }
};

const App = () => {
  const { mode } = useModeContext();
  return (
    <div className=" relative h-[100dvh] w-[100dvw] bg-background">
      <div className="absolute h-[100dvh] w-[100dvw]">
        <Suspense fallback={<span>loading...</span>}>
          {getAnalyzerComponent(mode)}
          {getCanvasComponent(mode)}
        </Suspense>
      </div>
      <ControlsPanel />
    </div>
  );
};

export default App;
