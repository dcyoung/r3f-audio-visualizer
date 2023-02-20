import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useControls } from "leva";
import { ApplicationMode, APPLICATION_MODE } from "../applicationModes";
import AudioVisual from "../visualizers/visualizerAudio";
import NoiseVisual from "../visualizers/visualizerNoise";
import ParticleNoiseVisual from "../visualizers/visualizerParticleNoise";
import WaveformVisual from "../visualizers/visualizerWaveform";

const getVisualizerComponent = (
  mode: ApplicationMode,
  visual: string
): JSX.Element => {
  switch (mode) {
    case APPLICATION_MODE.WAVE_FORM:
      return <WaveformVisual visual={visual} />;
    case APPLICATION_MODE.NOISE:
      return visual === "particleSwarm" ? (
        <ParticleNoiseVisual />
      ) : (
        <NoiseVisual visual={visual} />
      );
    case APPLICATION_MODE.AUDIO:
      return <AudioVisual visual={visual} />;
    default:
      throw new Error(`Unknown mode ${mode}`);
  }
};
export interface Visual3DCanvasProps {
  mode: ApplicationMode;
}
const AVAILABLE_VISUALS = [
  "grid",
  "sphere",
  "cube",
  "diffusedRing",
  "pinGrid",
  "dna",
  // "particleSwarm",
];
const Visual3DCanvas = ({ mode }: Visual3DCanvasProps): JSX.Element => {
  const visualizerParam = new URLSearchParams(document.location.search).get(
    "visual"
  ) as string;
  const { visualizer } = useControls({
    visualizer: {
      value:
        visualizerParam && AVAILABLE_VISUALS.includes(visualizerParam)
          ? visualizerParam
          : AVAILABLE_VISUALS[0],
      options: AVAILABLE_VISUALS,
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

export default Visual3DCanvas;
