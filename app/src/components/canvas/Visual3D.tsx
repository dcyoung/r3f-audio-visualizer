import { BackgroundFog, CanvasBackground } from "@/components/canvas/common";
import AudioVisual from "@/components/visualizers/visualizerAudio";
import NoiseVisual from "@/components/visualizers/visualizerNoise";
import ParticleNoiseVisual from "@/components/visualizers/visualizerParticleNoise";
import WaveformVisual from "@/components/visualizers/visualizerWaveform";
import {
  CAMERA_CONTROLS_MODE,
  useCameraControlsContext,
  useCameraControlsContextSetters,
} from "@/context/cameraControls";
import { useVisualContext } from "@/context/visual";
import { APPLICATION_MODE } from "@/lib/applicationModes";
import { useUser } from "@/lib/appState";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Spherical, type Vector3 } from "three";

import { PaletteTracker } from "./paletteTracker";

const VisualizerComponent = ({
  mode,
}: {
  mode: "WAVE_FORM" | "NOISE" | "AUDIO" | "PARTICLE_NOISE";
}) => {
  const { visual } = useVisualContext();
  switch (mode) {
    case APPLICATION_MODE.WAVE_FORM:
      return <WaveformVisual visual={visual} />;
    case APPLICATION_MODE.NOISE:
      return <NoiseVisual visual={visual} />;
    case APPLICATION_MODE.PARTICLE_NOISE:
      return <ParticleNoiseVisual />;
    case APPLICATION_MODE.AUDIO:
      return <AudioVisual visual={visual} />;
    default:
      return mode satisfies never;
  }
};

const setFromSphericalZUp = (vec: Vector3, s: Spherical) => {
  const sinPhiRadius = Math.sin(s.phi) * s.radius;
  vec.x = sinPhiRadius * Math.sin(s.theta);
  vec.z = Math.cos(s.phi) * s.radius;
  vec.y = sinPhiRadius * Math.cos(s.theta);
  return vec;
};

const AutoOrbitCameraControls = () => {
  const camera = useThree((state) => state.camera);
  // r     is the Radius
  // theta is the equator angle
  // phi is the polar angle
  const [rMin, rMax, rSpeed] = [15, 22, 0.1];
  const [thetaMin, thetaMax, thetaSpeed] = [0, 2 * Math.PI, 0.025];
  const [phiMin, phiMax, phiSpeed] = [Math.PI / 3, Math.PI / 2, 0.25];
  const target = new Spherical();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    const rAlpha = 0.5 * (1 + Math.sin(t * rSpeed));
    const r = rMin + rAlpha * (rMax - rMin);

    const thetaAlpha = 0.5 * (1 + Math.cos(t * thetaSpeed));
    const theta = thetaMin + thetaAlpha * (thetaMax - thetaMin);

    const phiAlpha = 0.5 * (1 + Math.cos(t * phiSpeed));
    const phi = phiMin + phiAlpha * (phiMax - phiMin);

    setFromSphericalZUp(camera.position, target.set(r, phi, theta));
    camera.lookAt(0, 0, 0);
  });
  return null;
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
