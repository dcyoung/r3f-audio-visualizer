import "./App.css";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useControls } from "leva";
import {
  ApplicationMode,
  APPLICATION_MODE,
  getAppModeDisplayName,
  getPlatformSupportedApplicationModes,
} from "./components/applicationModes";
import AudioVisual from "./components/visualizers/visualizerAudio";
import WaveformVisual from "./components/visualizers/visualizerWaveform";
import NoiseVisual from "./components/visualizers/visualizerNoise";
import CurlVisual from "./components/visualizers/visualizerParticleNoise";
import AudioFFTAnalyzer from "./components/analyzers/audioFFTAnalyzer";
import AudioScopeAnalyzer from "./components/analyzers/audioScopeAnalyzer";
import AudioScopeVisual from "./components/visualizers/visualizerAudioScope";

const getVisualizerComponent = (
  mode: ApplicationMode,
  visual: string
): JSX.Element => {
  switch (mode) {
    case APPLICATION_MODE.WAVE_FORM:
      return <WaveformVisual visual={visual} />;
    case APPLICATION_MODE.NOISE:
      return visual === "particleSwarm" ? (
        <CurlVisual />
      ) : (
        <NoiseVisual visual={visual} />
      );
    case APPLICATION_MODE.AUDIO:
      return <AudioVisual visual={visual} />;
    default:
      throw new Error(`Unknown mode ${mode}`);
  }
};

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

const AudioScopeCanvas = (): JSX.Element => {
  // const backgroundColor = "#010204";
  return (
    <Canvas>
      <color attach="background" args={["black"]} />
      <AudioScopeVisual />
    </Canvas>
  );
};

interface VisualCanvasProps {
  mode: ApplicationMode;
}
const VisualCanvas = ({ mode }: VisualCanvasProps): JSX.Element => {
  const { visualizer } = useControls({
    visualizer: {
      value: "grid",
      options: [
        "grid",
        "sphere",
        "cube",
        "diffusedRing",
        "pinGrid",
        // "particleSwarm",
      ],
    },
  });
  const backgroundColor = "#010204";
  return (
    <Canvas
      camera={{
        fov: 45,
        near: 1,
        far: 1000,
        position: [-17, -6, 6.5],
        up: [0, 0, 1],
      }}
    >
      <color attach="background" args={[backgroundColor]} />
      <ambientLight />
      <fog attach="fog" args={[backgroundColor, 0, 100]} />
      {getVisualizerComponent(mode as ApplicationMode, visualizer)}
      {/* <Stats /> */}
      <OrbitControls makeDefault />
    </Canvas>
  );
};

const getCanvasComponent = (mode: ApplicationMode): JSX.Element => {
  switch (mode) {
    case APPLICATION_MODE.AUDIO_SCOPE:
      return <AudioScopeCanvas />;
    default:
      return <VisualCanvas mode={mode} />;
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
