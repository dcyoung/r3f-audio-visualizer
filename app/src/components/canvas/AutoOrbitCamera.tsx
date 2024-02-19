import { useVisualContext } from "@/context/visual";
import { useFrame, useThree } from "@react-three/fiber";
import { Spherical, type Vector3 } from "three";

import { VISUAL } from "../visualizers/common";

const setFromSphericalZUp = (vec: Vector3, s: Spherical) => {
  const sinPhiRadius = Math.sin(s.phi) * s.radius;
  vec.x = sinPhiRadius * Math.sin(s.theta);
  vec.z = Math.cos(s.phi) * s.radius;
  vec.y = sinPhiRadius * Math.cos(s.theta);
  return vec;
};

const useSphericalLimits = () => {
  const { visual } = useVisualContext();
  // r     is the Radius
  // theta is the equator angle
  // phi is the polar angle
  switch (visual) {
    case VISUAL.RIBBONS:
      return {
        rMin: 10,
        rMax: 15,
        rSpeed: 0.1,
        thetaMin: Math.PI / 8,
        thetaMax: 2 * Math.PI - Math.PI / 8,
        thetaSpeed: 0.025,
        phiMin: Math.PI / 3,
        phiMax: Math.PI / 2.1,
        phiSpeed: 0.25,
      };
    case VISUAL.SPHERE:
      return {
        rMin: 10,
        rMax: 15,
        rSpeed: 0.1,
        thetaMin: 0,
        thetaMax: 2 * Math.PI,
        thetaSpeed: 0.025,
        phiMin: Math.PI / 3,
        phiMax: Math.PI / 2,
        phiSpeed: 0.25,
      };
    case VISUAL.CUBE:
      return {
        rMin: 12,
        rMax: 20,
        rSpeed: 0.1,
        thetaMin: 0,
        thetaMax: 2 * Math.PI,
        thetaSpeed: 0.025,
        phiMin: Math.PI / 4,
        phiMax: Math.PI / 2,
        phiSpeed: 0.25,
      };
    case VISUAL.DIFFUSED_RING:
      return {
        rMin: 10,
        rMax: 18,
        rSpeed: 0.1,
        thetaMin: 0,
        thetaMax: 2 * Math.PI,
        thetaSpeed: 0.025,
        phiMin: Math.PI / 8,
        phiMax: Math.PI / 2.25,
        phiSpeed: 0.25,
      };
    case VISUAL.WALK:
      return {
        rMin: 15,
        rMax: 22,
        rSpeed: 0.1,
        thetaMin: 0,
        thetaMax: 2 * Math.PI,
        thetaSpeed: 0.025,
        phiMin: Math.PI / 3.5,
        phiMax: Math.PI / 2.25,
        phiSpeed: 0.25,
      };
    case VISUAL.BOXES:
    case VISUAL.DNA:
    case VISUAL.GRID:
      return {
        rMin: 15,
        rMax: 22,
        rSpeed: 0.1,
        thetaMin: 0,
        thetaMax: 2 * Math.PI,
        thetaSpeed: 0.025,
        phiMin: Math.PI / 3,
        phiMax: Math.PI / 2,
        phiSpeed: 0.25,
      };
    default:
      return visual satisfies never;
  }
};

export const AutoOrbitCameraControls = () => {
  const camera = useThree((state) => state.camera);
  // r     is the Radius
  // theta is the equator angle
  // phi is the polar angle
  const {
    rMin,
    rMax,
    rSpeed,
    thetaMin,
    thetaMax,
    thetaSpeed,
    phiMin,
    phiMax,
    phiSpeed,
  } = useSphericalLimits();
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
