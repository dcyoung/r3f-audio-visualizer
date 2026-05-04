import "@/r3f-webgpu";

import { useEffect, useRef } from "react";
import { BackgroundFog, CanvasBackground } from "@/components/canvas/common";
import ModalVisual from "@/components/visualizers/visualizerModal";
import {
  useAppStateActions,
  useCameraState,
  useUser,
  useVisual,
} from "@/lib/appState";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber/webgpu";
import * as THREE from "three/webgpu";

import { AutoOrbitCameraControls } from "./AutoOrbitCamera";
import { DebugStats } from "./DebugStats";
import { PaletteTracker } from "./paletteTracker";

const FLUID_VISUAL_IDS = new Set(["fluidBox", "fluidSpeaker", "fluidBall"]);

const FLUID_CAMERA_POS: [number, number, number] = [-1.6, -1.0, 1.2];
const DEFAULT_CAMERA_POS: [number, number, number] = [-17, -6, 6.5];

/**
 * Repositions the camera when switching between fluid and non-fluid visuals
 * so the initial view is appropriately framed before auto-orbit activates.
 */
const CameraPositioner = () => {
  const visual = useVisual();
  const camera = useThree((s) => s.camera);
  const prevFluidRef = useRef<boolean | null>(null);

  useEffect(() => {
    const isFluid = FLUID_VISUAL_IDS.has(visual.id);
    const wasFluid = prevFluidRef.current;
    prevFluidRef.current = isFluid;

    if (wasFluid === isFluid) return;

    const pos = isFluid ? FLUID_CAMERA_POS : DEFAULT_CAMERA_POS;
    camera.position.set(...pos);
    camera.lookAt(0, 0, 0);
  }, [visual.id, camera]);

  return null;
};

const SceneLighting = () => {
  const visual = useVisual();
  const isFluid = FLUID_VISUAL_IDS.has(visual.id);

  if (isFluid) {
    return (
      <>
        <ambientLight intensity={1.5} />
        <directionalLight position={[3, 2, 5]} intensity={2.5} />
        <directionalLight position={[-2, -3, 3]} intensity={1.0} />
        <directionalLight position={[0, 4, -2]} intensity={0.6} />
      </>
    );
  }

  return <ambientLight intensity={Math.PI} />;
};

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
      renderer={{
        powerPreference: "high-performance",
        antialias: true,
        outputColorSpace: THREE.LinearSRGBColorSpace,
        toneMapping: THREE.NoToneMapping,
      }}
      camera={{
        fov: 45,
        near: 0.1,
        far: 1000,
        position: [-17, -6, 6.5],
        up: [0, 0, 1],
      }}
    >
      <CanvasBackground />
      <SceneLighting />
      <BackgroundFog />
      <ModalVisual />
      <CameraPositioner />
      <CameraControls />
      <PaletteTracker />
      <DebugStats />
    </Canvas>
  );
};

export default Visual3DCanvas;
