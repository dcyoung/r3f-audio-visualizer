import { BackgroundFog, CanvasBackground } from "@/components/canvas/common";
import ModalVisual from "@/components/visualizers/visualizerModal";
import { useAppStateActions, useCameraState, useUser } from "@/lib/appState";
import { OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

import { AutoOrbitCameraControls } from "./AutoOrbitCamera";
import { PaletteTracker } from "./paletteTracker";
import { WebGPUCanvas3D } from "./webgpu/WebGPUCanvas3D";

const CameraControls = () => {
  const { mode, autoOrbitAfterSleepMs } = useCameraState();
  const { setCamera } = useAppStateActions();
  const { canvasInteractionEventTracker } = useUser();

  useFrame(() => {
    if (
      mode === "ORBIT_CONTROLS" &&
      autoOrbitAfterSleepMs > 0 &&
      canvasInteractionEventTracker.msSinceLastEvent > autoOrbitAfterSleepMs
    ) {
      setCamera({ mode: "AUTO_ORBIT" });
    } else if (
      mode === "AUTO_ORBIT" &&
      canvasInteractionEventTracker.msSinceLastEvent < autoOrbitAfterSleepMs
    ) {
      setCamera({ mode: "ORBIT_CONTROLS" });
    }
  });

  switch (mode) {
    case "ORBIT_CONTROLS":
      return <OrbitControls makeDefault />;
    case "AUTO_ORBIT":
      return <AutoOrbitCameraControls />;
    default:
      return mode satisfies never;
  }
};

const Visual3DCanvas = () => {
  return (
    <WebGPUCanvas3D>
      <CanvasBackground />
      <ambientLight intensity={Math.PI} />
      <BackgroundFog />
      <ModalVisual />
      {/* <Stats /> */}
      <CameraControls />
      <PaletteTracker />
    </WebGPUCanvas3D>
  );
};

export default Visual3DCanvas;
