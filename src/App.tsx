import "./App.css";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useControls, Leva } from "leva";
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
import AudioAnalyzer from "./components/analyzers/audioAnalyzer";

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

const AVAILABLE_MODES = getPlatformSupportedApplicationModes();

const App = (): JSX.Element => {
  const { mode, visualizer } = useControls({
    mode: {
      value: AVAILABLE_MODES[0],
      options: AVAILABLE_MODES.reduce(
        (o, mode) => ({ ...o, [getAppModeDisplayName(mode)]: mode }),
        {}
      ),
      order: -100,
    },
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
    <Suspense fallback={<span>loading...</span>}>
      {(mode as ApplicationMode) === APPLICATION_MODE.AUDIO ? (
        <AudioAnalyzer />
      ) : null}
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
      <Leva collapsed={true} />
    </Suspense>
  );
};

export default App;
