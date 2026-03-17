import { useCallback, useMemo, useRef } from "react";
import {
  COORDINATE_TYPE,
  type ICoordinateMapper,
} from "@/lib/mappers/coordinateMappers/common";
import { useFrame } from "@react-three/fiber";
import {
  CylinderGeometry,
  DoubleSide,
  EdgesGeometry,
  Vector3,
  type Mesh as ThreeMesh,
} from "three";

import FluidBody from "../fluidSimulation/FluidBody";
import type { SimulationInstance } from "../fluidSimulation/simulation";

const GRID_SIZE = 64;
// Z-up: gravity pulls in -Z
const DEFAULT_GRAVITY = new Vector3(0, 0, -(9.81 * 9.81));

const CylinderWireframe = ({
  radius,
  height,
  zOffset,
}: {
  radius: number;
  height: number;
  zOffset: number;
}) => {
  const edges = useMemo(
    () =>
      new EdgesGeometry(
        new CylinderGeometry(radius, radius, height, 32, 1, true),
      ),
    [radius, height],
  );
  // CylinderGeometry is Y-up by default, rotate so it aligns with Z-up
  return (
    <lineSegments
      position={[0.5, 0.5, zOffset + height / 2]}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <primitive object={edges} attach="geometry" />
      <lineBasicMaterial color="#8a9bae" transparent opacity={0.7} />
    </lineSegments>
  );
};

const SpeakerCone = ({
  radius,
  zOffset,
  displacementRef,
}: {
  radius: number;
  zOffset: number;
  displacementRef: React.RefObject<number>;
}) => {
  const meshRef = useRef<ThreeMesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.position.z = zOffset + (displacementRef.current ?? 0) * 0.3;
  });

  return (
    <mesh ref={meshRef} position={[0.5, 0.5, zOffset]}>
      <circleGeometry args={[radius, 32]} />
      <meshStandardMaterial
        color="#b0bcc8"
        transparent
        opacity={0.25}
        side={DoubleSide}
      />
    </mesh>
  );
};

const BaseFluidSpeaker = ({
  coordinateMapper,
  particleCount = 8192 * 9,
  stiffness = 50,
  restDensity = 1.5,
  dynamicViscosity = 0.1,
  speakerAmplitude = 0.02,
  cylinderRadius = 0.35,
  cylinderHeight = 0.5,
  color = "#0099FF",
  showWireframe = true,
}: {
  coordinateMapper: ICoordinateMapper;
  particleCount?: number;
  stiffness?: number;
  restDensity?: number;
  dynamicViscosity?: number;
  speakerAmplitude?: number;
  cylinderRadius?: number;
  cylinderHeight?: number;
  color?: string;
  showWireframe?: boolean;
}) => {
  const elapsedRef = useRef(0);
  const displacementRef = useRef(0);

  const gs = GRID_SIZE;
  const normRadius = Math.min(0.48, cylinderRadius + 0.1);
  // Z is the vertical axis: floor at low Z, ceiling at higher Z
  const floorZ = 2 / gs;
  const ceilZ = Math.min((gs - 2) / gs, floorZ + cylinderHeight);

  // Fill: radial in XY centered at 0.5, vertical in Z from floor
  const fillMin = useMemo(
    () =>
      new Vector3(
        0.5 - normRadius * 0.8,
        0.5 - normRadius * 0.8,
        floorZ + 0.02,
      ),
    [normRadius, floorZ],
  );
  const fillMax = useMemo(
    () =>
      new Vector3(
        0.5 + normRadius * 0.8,
        0.5 + normRadius * 0.8,
        floorZ + (ceilZ - floorZ) * 0.5,
      ),
    [normRadius, floorZ, ceilZ],
  );
  const fillRegion = useMemo(
    () => ({ min: fillMin, max: fillMax }),
    [fillMin, fillMax],
  );

  const onBeforeStep = useCallback(
    (sim: SimulationInstance, dt: number) => {
      elapsedRef.current += dt;
      const t = elapsedRef.current;
      const amp =
        coordinateMapper.amplitude > 0
          ? speakerAmplitude / coordinateMapper.amplitude
          : speakerAmplitude;

      const floorDisp = coordinateMapper.map(
        COORDINATE_TYPE.CARTESIAN_1D,
        0.5,
        0,
        0,
        t,
      );
      displacementRef.current = floorDisp * amp;

      // Z is vertical: move floor boundary up/down
      const dynamicFloor = floorZ + floorDisp * amp;
      // Boundary: XY radial (encoded in x,y), Z floor/ceiling (encoded in z)
      (sim.uniforms.boundaryMin as { value: Vector3 }).value.set(
        0.5 - normRadius,
        0.5 - normRadius,
        Math.max(2 / gs, dynamicFloor),
      );
      (sim.uniforms.boundaryMax as { value: Vector3 }).value.set(
        0.5 + normRadius,
        0.5 + normRadius,
        ceilZ,
      );

      // Upward force along Z
      const forceZ = floorDisp * amp * 50;
      (sim.uniforms.externalForce as { value: Vector3 }).value.set(
        0,
        0,
        forceZ,
      );
    },
    [coordinateMapper, speakerAmplitude, floorZ, ceilZ, normRadius, gs],
  );

  const visualRadius = normRadius;
  const visualHeight = ceilZ - floorZ;
  const visualZOffset = floorZ;

  return (
    <>
      <FluidBody
        boundaryMode="cylinder"
        particleCount={particleCount}
        gridSize={gs}
        stiffness={stiffness}
        restDensity={restDensity}
        dynamicViscosity={dynamicViscosity}
        gravity={DEFAULT_GRAVITY}
        color={color}
        initialFillRegion={fillRegion}
        onBeforeStep={onBeforeStep}
      />
      {showWireframe && (
        <group position={[-0.5, -0.5, -0.5]}>
          <CylinderWireframe
            radius={visualRadius}
            height={visualHeight}
            zOffset={visualZOffset}
          />
          <SpeakerCone
            radius={visualRadius * 0.95}
            zOffset={visualZOffset}
            displacementRef={displacementRef}
          />
        </group>
      )}
    </>
  );
};

export default BaseFluidSpeaker;
