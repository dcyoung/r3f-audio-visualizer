import { BackgroundFog, CanvasBackground } from "@/components/canvas/common";
import ModalVisual from "@/components/visualizers/visualizerModal";
import {
  CAMERA_CONTROLS_MODE,
  useCameraControlsContext,
  useCameraControlsContextSetters,
} from "@/context/cameraControls";
import { useVisualContext } from "@/context/visual";
import { useUser } from "@/lib/appState";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";

import { AutoOrbitCameraControls } from "./AutoOrbitCamera";
import { PaletteTracker } from "./paletteTracker";

const VisualizerComponent = () => {
  const { visual } = useVisualContext();
  return <ModalVisual visual={visual} />;
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

const Visual3DCanvas = () => {
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
      <VisualizerComponent />
      {/* <Stats /> */}
      <CameraControls />
      <PaletteTracker />
    </Canvas>
  );
};

export default Visual3DCanvas;
