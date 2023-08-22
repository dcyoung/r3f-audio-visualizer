import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

import {
  CAMERA_CONTROLS_MODE,
  useCameraControlsContext,
} from "@/context/cameraControls";
import { useVisualContext } from "@/context/visual";

import { APPLICATION_MODE } from "../applicationModes";
import { ColorPalette, type ColorPaletteType } from "../visualizers/palettes";
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

const AutoOrbitCameraControls = () => {
  const camera = useThree((state) => state.camera);
  const [rMin, rMax, rSpeed] = [15, 22, 0.1];
  const thetaSpeed = 0.025;
  const [polarMin, polarMax, polarSpeed] = [Math.PI / 3, Math.PI / 2, 0.25];
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    // r     is the Radius
    // theta is the horizontal angle from the X axis
    // polar is the vertical angle from the Z axis
    const rAlpha = 0.5 * (1 + Math.sin(t * rSpeed));
    const r = rMin + rAlpha * (rMax - rMin);

    const thetaAlpha = 0.5 * (1 + Math.cos(t * thetaSpeed));
    const theta = thetaAlpha * (2 * Math.PI);
    const polarAlpha = 0.5 * (1 + Math.cos(t * polarSpeed));
    const polar = polarMin + polarAlpha * (polarMax - polarMin);
    camera.position.x = r * Math.sin(polar) * Math.cos(theta);
    camera.position.y = r * Math.sin(polar) * Math.sin(theta);
    camera.position.z = r * Math.cos(polar);
    camera.lookAt(0, 0, 0);
  });
  return null;
};

const CameraControls = () => {
  const { mode } = useCameraControlsContext();
  switch (mode) {
    case CAMERA_CONTROLS_MODE.ORBIT_CONTROLS:
      return <OrbitControls makeDefault />;
    case CAMERA_CONTROLS_MODE.AUTO_ORBIT:
      return <AutoOrbitCameraControls />;
    default:
      return mode satisfies never;
  }
};

const Visual3DCanvas = ({
  mode,
}: {
  mode: "WAVE_FORM" | "NOISE" | "AUDIO";
}) => {
  const { visual, palette, colorBackground } = useVisualContext();
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
      <CameraControls />
    </Canvas>
  );
};

export default Visual3DCanvas;
