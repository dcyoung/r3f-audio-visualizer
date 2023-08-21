import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { folder, useControls } from "leva";

import { useVisualContext } from "@/context/visual";

import { APPLICATION_MODE } from "../applicationModes";
import {
  AVAILABLE_COLOR_PALETTES,
  ColorPalette,
  type ColorPaletteType,
  COLOR_PALETTE,
} from "../visualizers/palettes";
import AudioVisual from "../visualizers/visualizerAudio";
import NoiseVisual from "../visualizers/visualizerNoise";
// import ParticleNoiseVisual from "../visualizers/visualizerParticleNoise";
import WaveformVisual from "../visualizers/visualizerWaveform";

export const AVAILABLE_VISUALS = [
  "grid",
  "sphere",
  "cube",
  "diffusedRing",
  "pinGrid",
  "dna",
  // "traceParticles",
  // "particleSwarm",
] as const;

const getVisualizerComponent = (
  mode: "WAVE_FORM" | "NOISE" | "AUDIO",
  visual: (typeof AVAILABLE_VISUALS)[number],
  palette: ColorPaletteType
) => {
  switch (mode) {
    case APPLICATION_MODE.WAVE_FORM:
      return <WaveformVisual visual={visual} palette={palette} />;
    case APPLICATION_MODE.NOISE:
      // if (visual === "particleSwarm") {
      //   return <ParticleNoiseVisual />;
      // }
      return <NoiseVisual visual={visual} palette={palette} />;
    case APPLICATION_MODE.AUDIO:
      return <AudioVisual visual={visual} palette={palette} />;
    default:
      return mode satisfies never;
  }
};

const Visual3DCanvas = ({
  mode,
}: {
  mode: "WAVE_FORM" | "NOISE" | "AUDIO";
}) => {
  const { visual } = useVisualContext();
  // const visualizerParam = new URLSearchParams(document.location.search).get(
  //   "visual"
  // )!;
  // const { visualizer } = useControls({
  //   visualizer: {
  //     value:
  //       visualizerParam &&
  //       AVAILABLE_VISUALS.map((s) => s as string).includes(visualizerParam)
  //         ? visualizerParam
  //         : AVAILABLE_VISUALS[0],
  //     options: AVAILABLE_VISUALS,
  //   },
  // });
  const { palette, colorBackground } = useControls({
    "Visual - Color": folder(
      {
        palette: {
          value: COLOR_PALETTE.THREE_COOL_TO_WARM,
          options: AVAILABLE_COLOR_PALETTES,
        },
        colorBackground: false,
      },
      { collapsed: true }
    ),
  });
  const backgroundColor = colorBackground
    ? ColorPalette.getPalette(palette).calcBackgroundColor(0)
    : "#010204";
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
      {getVisualizerComponent(mode, visual, palette)}
      {/* <Stats /> */}
      <OrbitControls makeDefault />
    </Canvas>
  );
};

export default Visual3DCanvas;
