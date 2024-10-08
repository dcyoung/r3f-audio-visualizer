import { BackgroundFog, CanvasBackground } from "@/components/canvas/common";
import ModalVisual from "@/components/visualizers/visualizerModal";
import ParticleNoiseVisual from "@/components/visualizers/visualizerParticleNoise";
import {
  CAMERA_CONTROLS_MODE,
  useCameraControlsContext,
  useCameraControlsContextSetters,
} from "@/context/cameraControls";
import { useVisualContext } from "@/context/visual";
import { APPLICATION_MODE } from "@/lib/applicationModes";
import { useUser } from "@/lib/appState";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";

import { AutoOrbitCameraControls } from "./AutoOrbitCamera";
import { PaletteTracker } from "./paletteTracker";

const VisualizerComponent = ({
  mode,
}: {
  mode: "WAVE_FORM" | "NOISE" | "AUDIO" | "PARTICLE_NOISE";
}) => {
  const { visual } = useVisualContext();
  switch (mode) {
    case APPLICATION_MODE.WAVE_FORM:
    case APPLICATION_MODE.NOISE:
    case APPLICATION_MODE.AUDIO:
      return <ModalVisual visual={visual} />;
    case APPLICATION_MODE.PARTICLE_NOISE:
      return <ParticleNoiseVisual />;
    default:
      return mode satisfies never;
  }
};

const CameraControls = () => {
  const { mode, autoOrbitAfterSleepMs } = useCameraControlsContext();
  const { setMode } = useCameraControlsContextSetters();
  const { canvasInteractionEventTracker } = useUser();

  useFrame(() => {
    if (
      mode === CAMERA_CONTROLS_MODE.ORBIT_CONTROLS &&
      autoOrbitAfterSleepMs > 0 &&
      canvasInteractionEventTracker.msSinceLastEvent > autoOrbitAfterSleepMs
    ) {
      setMode(CAMERA_CONTROLS_MODE.AUTO_ORBIT);
    } else if (
      mode === CAMERA_CONTROLS_MODE.AUTO_ORBIT &&
      canvasInteractionEventTracker.msSinceLastEvent < autoOrbitAfterSleepMs
    ) {
      setMode(CAMERA_CONTROLS_MODE.ORBIT_CONTROLS);
    }
  });

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
  mode: "WAVE_FORM" | "NOISE" | "AUDIO" | "PARTICLE_NOISE";
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
      <PaletteTracker />
    </Canvas>
  );
};

export default Visual3DCanvas;
