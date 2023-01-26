import "./App.css";
import { Suspense } from "react";
import { useControls } from "leva";
import {
  ApplicationMode,
  APPLICATION_MODE,
  getAppModeDisplayName,
  getPlatformSupportedApplicationModes,
} from "./components/applicationModes";
import AudioFFTAnalyzer from "./components/analyzers/audioFFTAnalyzer";
import AudioScopeAnalyzer from "./components/analyzers/audioScopeAnalyzer";
import AudioScopeCanvas from "./components/canvas/AudioScope";
import Visual3DCanvas from "./components/canvas/Visual3D";

const getAnalyzerComponent = (mode: ApplicationMode): JSX.Element | null => {
  switch (mode) {
    case APPLICATION_MODE.AUDIO:
      return <AudioFFTAnalyzer />;
    case APPLICATION_MODE.AUDIO_SCOPE:
      return <AudioScopeAnalyzer />;
    default:
      return null;
  }
};

const AVAILABLE_MODES = getPlatformSupportedApplicationModes();

const getCanvasComponent = (mode: ApplicationMode): JSX.Element => {
  switch (mode) {
    case APPLICATION_MODE.AUDIO_SCOPE:
      return <AudioScopeCanvas />;
    default:
      return <Visual3DCanvas mode={mode} />;
  }
};

const App = (): JSX.Element => {
  const { mode } = useControls({
    mode: {
      value: AVAILABLE_MODES[0],
      options: AVAILABLE_MODES.reduce(
        (o, mode) => ({ ...o, [getAppModeDisplayName(mode)]: mode }),
        {}
      ),
      order: -100,
    },
  });

  return (
    <Suspense fallback={<span>loading...</span>}>
      {getAnalyzerComponent(mode as ApplicationMode)}
      {getCanvasComponent(mode as ApplicationMode)}
    </Suspense>
  );
};

export default App;
