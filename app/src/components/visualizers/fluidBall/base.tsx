import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  COORDINATE_TYPE,
  TWO_PI,
  type ICoordinateMapper,
} from "@/lib/mappers/coordinateMappers/common";
import { useFrame } from "@react-three/fiber";
import {
  DoubleSide,
  SphereGeometry,
  Vector3,
  type BufferAttribute,
  type Mesh as ThreeMesh,
} from "three";

import FluidBody from "../fluidSimulation/FluidBody";
import type { SimulationInstance } from "../fluidSimulation/simulation";
import {
  SPHERE_MAP_PHI_RES,
  SPHERE_MAP_THETA_RES,
} from "../fluidSimulation/types";

const GRID_SIZE = 64;
const RADIAL_GRAVITY_STRENGTH = 0.05;

/**
 * Visible morphing sphere mesh that deforms per-direction based on audio,
 * rendered semi-transparent underneath the fluid particles.
 */
const MorphingSphereShell = ({
  coordinateMapper,
  baseRadius,
  morphScale,
}: {
  coordinateMapper: ICoordinateMapper;
  baseRadius: number;
  morphScale: number;
}) => {
  const meshRef = useRef<ThreeMesh>(null);
  const directionsRef = useRef<Float32Array | null>(null);

  const { geometry, dirs } = useMemo(() => {
    const geo = new SphereGeometry(1, 32, 24);
    const pos = geo.attributes.position as BufferAttribute;
    const d = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const len = Math.sqrt(x * x + y * y + z * z) || 1;
      d[i * 3] = x / len;
      d[i * 3 + 1] = y / len;
      d[i * 3 + 2] = z / len;
    }
    return { geometry: geo, dirs: d };
  }, []);

  useEffect(() => {
    directionsRef.current = dirs;
  }, [dirs]);

  useFrame(({ elapsed }) => {
    const mesh = meshRef.current;
    const dirs = directionsRef.current;
    if (!mesh || !dirs) return;
    const pos = mesh.geometry.attributes.position as BufferAttribute;
    const t = elapsed;

    for (let i = 0; i < pos.count; i++) {
      const dx = dirs[i * 3];
      const dy = dirs[i * 3 + 1];
      const dz = dirs[i * 3 + 2];

      const theta = Math.atan2(dy, dx);
      const phi = Math.acos(Math.max(-1, Math.min(1, dz)));

      const r =
        baseRadius +
        morphScale *
          baseRadius *
          coordinateMapper.map(
            COORDINATE_TYPE.POLAR,
            (theta + Math.PI) / TWO_PI,
            phi / Math.PI,
            0,
            t,
          );

      pos.setXYZ(i, dx * r, dy * r, dz * r);
    }
    pos.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} geometry={geometry} renderOrder={0}>
      <meshPhysicalMaterial
        color="#6699bb"
        transmission={0.85}
        thickness={0.15}
        roughness={0.3}
        metalness={0.1}
        side={DoubleSide}
      />
    </mesh>
  );
};

const BaseFluidBall = ({
  coordinateMapper,
  particleCount = 8192 * 9,
  stiffness = 60,
  restDensity = 2.0,
  dynamicViscosity = 0.15,
  sphereRadius = 0.28,
  morphScale = 0.25,
  color = "#2266FF",
  showMorphMesh = false,
}: {
  coordinateMapper: ICoordinateMapper;
  particleCount?: number;
  stiffness?: number;
  restDensity?: number;
  dynamicViscosity?: number;
  sphereRadius?: number;
  morphScale?: number;
  color?: string;
  showMorphMesh?: boolean;
}) => {
  const elapsedRef = useRef(0);
  const gs = GRID_SIZE;

  const shellThickness = 0.16;
  const outerR = sphereRadius + shellThickness;
  const fillMin = useMemo(
    () => new Vector3(0.5 - outerR, 0.5 - outerR, 0.5 - outerR),
    [outerR],
  );
  const fillMax = useMemo(
    () => new Vector3(0.5 + outerR, 0.5 + outerR, 0.5 + outerR),
    [outerR],
  );
  const fillRegion = useMemo(
    () => ({ min: fillMin, max: fillMax }),
    [fillMin, fillMax],
  );

  const radialGravity = useMemo(
    () => new Vector3(RADIAL_GRAVITY_STRENGTH, 0, 0),
    [],
  );

  const onBeforeStep = useCallback(
    (sim: SimulationInstance, dt: number) => {
      elapsedRef.current += dt;
      const t = elapsedRef.current;

      if (sim.radiusMap) {
        const { array, attribute } = sim.radiusMap;
        for (let ti = 0; ti < SPHERE_MAP_THETA_RES; ti++) {
          for (let pi = 0; pi < SPHERE_MAP_PHI_RES; pi++) {
            const theta = (ti / SPHERE_MAP_THETA_RES) * 2 * Math.PI - Math.PI;
            const phi = (pi / SPHERE_MAP_PHI_RES) * Math.PI;

            const thetaNorm = (theta + Math.PI) / (2 * Math.PI);
            const phiNorm = phi / Math.PI;

            const mapVal = coordinateMapper.map(
              COORDINATE_TYPE.POLAR,
              thetaNorm,
              phiNorm,
              0,
              t,
            );

            array[ti * SPHERE_MAP_PHI_RES + pi] =
              sphereRadius + morphScale * sphereRadius * mapVal;
          }
        }
        attribute.needsUpdate = true;
      }

      (sim.uniforms.externalForce as { value: Vector3 }).value.set(0, 0, 0);
    },
    [coordinateMapper, sphereRadius, morphScale],
  );

  return (
    <>
      <FluidBody
        boundaryMode="morphing_sphere"
        particleCount={particleCount}
        gridSize={gs}
        stiffness={stiffness}
        restDensity={restDensity}
        dynamicViscosity={dynamicViscosity}
        gravity={radialGravity}
        color={color}
        initialFillRegion={fillRegion}
        onBeforeStep={onBeforeStep}
      />
      {showMorphMesh && (
        <MorphingSphereShell
          coordinateMapper={coordinateMapper}
          baseRadius={sphereRadius}
          morphScale={morphScale}
        />
      )}
    </>
  );
};

export default BaseFluidBall;
