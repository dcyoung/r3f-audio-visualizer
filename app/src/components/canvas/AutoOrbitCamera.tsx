import { useVisual } from "@/lib/appState";
import { useFrame, useThree } from "@react-three/fiber";
import { Spherical, type Vector3 } from "three";

const setFromSphericalZUp = (vec: Vector3, s: Spherical) => {
  const sinPhiRadius = Math.sin(s.phi) * s.radius;
  vec.x = sinPhiRadius * Math.sin(s.theta);
  vec.z = Math.cos(s.phi) * s.radius;
  vec.y = sinPhiRadius * Math.cos(s.theta);
  return vec;
};

const useSphericalLimits = () => {
  const visual = useVisual();
  // r     is the Radius
  // theta is the equator angle
  // phi is the polar angle
  switch (visual.id) {
    case "ribbons":
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
    case "sphere":
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
    case "cube":
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
    case "diffusedRing":
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
    case "treadmill":
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
    case "movingBoxes":
    case "dna":
    case "grid":
    case "neuron":
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
    case "waveHistory":
      return {
        rMin: 10,
        rMax: 14,
        rSpeed: 0.08,
        thetaMin: -Math.PI / 6,
        thetaMax: Math.PI / 6,
        thetaSpeed: 0.02,
        phiMin: Math.PI / 3,
        phiMax: Math.PI / 2,
        phiSpeed: 0.2,
      };
    case "swarm":
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
    case "fluidBox":
    case "fluidSpeaker":
      return {
        rMin: 1.8,
        rMax: 2.8,
        rSpeed: 0.08,
        thetaMin: 0,
        thetaMax: 2 * Math.PI,
        thetaSpeed: 0.02,
        phiMin: Math.PI / 4,
        phiMax: Math.PI / 2.25,
        phiSpeed: 0.2,
      };
    case "fluidBall":
      return {
        rMin: 1.5,
        rMax: 2.4,
        rSpeed: 0.08,
        thetaMin: 0,
        thetaMax: 2 * Math.PI,
        thetaSpeed: 0.02,
        phiMin: Math.PI / 3,
        phiMax: Math.PI / 1.8,
        phiSpeed: 0.12,
      };
    case "scope":
      return null;
    default:
      return visual satisfies never;
  }
};

export const AutoOrbitCameraControls = () => {
  const camera = useThree((state) => state.camera);
  // r     is the Radius
  // theta is the equator angle
  // phi is the polar angle
  const limits = useSphericalLimits();
  const target = new Spherical();

  useFrame(({ elapsed }) => {
    if (!limits) {
      return;
    }
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
    } = limits;
    const t = elapsed;

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
