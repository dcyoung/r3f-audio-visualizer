import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

import { BackgroundFog, CanvasBackground } from "@/components/canvas/common";
import AudioVisual from "@/components/visualizers/visualizerAudio";
import NoiseVisual from "@/components/visualizers/visualizerNoise";
// import ParticleNoiseVisual from "@/components/visualizers/visualizerParticleNoise";
import WaveformVisual from "@/components/visualizers/visualizerWaveform";
import {
  CAMERA_CONTROLS_MODE,
  useCameraControlsContext,
} from "@/context/cameraControls";
import { useVisualContext } from "@/context/visual";
import { APPLICATION_MODE } from "@/lib/applicationModes";

import { MaybePaletteTracker } from "./paletteTracker";

const VisualizerComponent = ({
  mode,
}: {
  mode: "WAVE_FORM" | "NOISE" | "AUDIO";
}) => {
  const {
    visual,
    //palette
  } = useVisualContext();
  switch (mode) {
    case APPLICATION_MODE.WAVE_FORM:
      return <WaveformVisual visual={visual} />;
    case APPLICATION_MODE.NOISE:
      // if (visual === "swarm") {
      //   return <ParticleNoiseVisual />;
      // }
      return <NoiseVisual visual={visual} />;
    case APPLICATION_MODE.AUDIO:
      return <AudioVisual visual={visual} />;
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
  return (
    <Canvas
      camera={{
        fov: 45,
        near: 1,
        far: 1000,
        position: [-17, -6, 6.5],
        up: [0, 0, 1],
      }}
      linear={true}
    >
      <CanvasBackground />
      <ambientLight intensity={Math.PI} />
      <BackgroundFog />
      <VisualizerComponent mode={mode} />
      {/* <Stats /> */}
      <CameraControls />
      <MaybePaletteTracker />
    </Canvas>
  );
};

export default Visual3DCanvas;
