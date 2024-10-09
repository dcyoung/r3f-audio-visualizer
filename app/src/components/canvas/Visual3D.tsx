import { BackgroundFog, CanvasBackground } from "@/components/canvas/common";
import ModalVisual from "@/components/visualizers/visualizerModal";
import { useAppStateActions, useCameraState, useUser } from "@/lib/appState";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";

import { AutoOrbitCameraControls } from "./AutoOrbitCamera";
import { PaletteTracker } from "./paletteTracker";

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
      <ModalVisual />
      {/* <Stats /> */}
      <CameraControls />
      <PaletteTracker />
    </Canvas>
  );
};

export default Visual3DCanvas;
