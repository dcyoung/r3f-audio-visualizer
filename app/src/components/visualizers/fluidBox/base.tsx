import { useCallback, useMemo, useRef } from "react";
import {
  COORDINATE_TYPE,
  type ICoordinateMapper,
} from "@/lib/mappers/coordinateMappers/common";
import { useFrame } from "@react-three/fiber";
import { BoxGeometry, EdgesGeometry, Vector3, type LineSegments } from "three";

import FluidBody from "../fluidSimulation/FluidBody";
import type { SimulationInstance } from "../fluidSimulation/simulation";

const GRID_SIZE = 64;
const BASE_MIN = 2 / GRID_SIZE;
const BASE_MAX = (GRID_SIZE - 2) / GRID_SIZE;
// Z-up: gravity pulls in -Z
const DEFAULT_GRAVITY = new Vector3(0, 0, -(9.81 * 9.81));
// Fill bottom half in Z, full extent in XY
const FILL_MIN = new Vector3(0.1, 0.1, 0.1);
const FILL_MAX = new Vector3(0.9, 0.9, 0.5);

const unitEdges = new EdgesGeometry(new BoxGeometry(1, 1, 1));

const DynamicContainerBox = ({
  boundsRef,
}: {
  boundsRef: React.RefObject<{ min: Vector3; max: Vector3 } | null>;
}) => {
  const lineRef = useRef<LineSegments>(null);

  useFrame(() => {
    const line = lineRef.current;
    const bounds = boundsRef.current;
    if (!line || !bounds) return;

    const { min, max } = bounds;
    // Scale = size of the box in simulation space
    const sx = max.x - min.x;
    const sy = max.y - min.y;
    const sz = max.z - min.z;
    line.scale.set(sx, sy, sz);

    line.position.set(
      -0.5 + (min.x + max.x) / 2,
      -0.5 + (min.y + max.y) / 2,
      -0.5 + (min.z + max.z) / 2,
    );
  });

  return (
    <lineSegments ref={lineRef}>
      <primitive object={unitEdges} attach="geometry" />
      <lineBasicMaterial color="#8a9bae" transparent opacity={0.7} />
    </lineSegments>
  );
};

const BaseFluidBox = ({
  coordinateMapper,
  particleCount = 8192 * 9,
  stiffness = 50,
  restDensity = 1.5,
  dynamicViscosity = 0.1,
  wallAmplitude = 0.15,
  color = "#0088FF",
  showWireframe = true,
}: {
  coordinateMapper: ICoordinateMapper;
  particleCount?: number;
  stiffness?: number;
  restDensity?: number;
  dynamicViscosity?: number;
  wallAmplitude?: number;
  color?: string;
  showWireframe?: boolean;
}) => {
  const fillRegion = useMemo(() => ({ min: FILL_MIN, max: FILL_MAX }), []);
  const elapsedRef = useRef(0);
  const boundsRef = useRef({
    min: new Vector3(BASE_MIN, BASE_MIN, BASE_MIN),
    max: new Vector3(BASE_MAX, BASE_MAX, BASE_MAX),
  });

  const onBeforeStep = useCallback(
    (sim: SimulationInstance, dt: number) => {
      elapsedRef.current += dt;
      const t = elapsedRef.current;
      const amp =
        coordinateMapper.amplitude > 0
          ? wallAmplitude / coordinateMapper.amplitude
          : wallAmplitude;

      // Sample the signal at 6 spread positions to drive 6 walls
      const xMinD = coordinateMapper.map(
        COORDINATE_TYPE.CARTESIAN_1D,
        0.0,
        0,
        0,
        t,
      );
      const xMaxD = coordinateMapper.map(
        COORDINATE_TYPE.CARTESIAN_1D,
        0.2,
        0,
        0,
        t,
      );
      const yMinD = coordinateMapper.map(
        COORDINATE_TYPE.CARTESIAN_1D,
        0.4,
        0,
        0,
        t,
      );
      const yMaxD = coordinateMapper.map(
        COORDINATE_TYPE.CARTESIAN_1D,
        0.6,
        0,
        0,
        t,
      );
      const zMinD = coordinateMapper.map(
        COORDINATE_TYPE.CARTESIAN_1D,
        0.8,
        0,
        0,
        t,
      );
      const zMaxD = coordinateMapper.map(
        COORDINATE_TYPE.CARTESIAN_1D,
        1.0,
        0,
        0,
        t,
      );

      const bMin = (sim.uniforms.boundaryMin as { value: Vector3 }).value;
      const bMax = (sim.uniforms.boundaryMax as { value: Vector3 }).value;

      bMin.set(
        BASE_MIN + Math.max(0, xMinD * amp),
        BASE_MIN + Math.max(0, yMinD * amp),
        BASE_MIN + Math.max(0, zMinD * amp),
      );
      bMax.set(
        BASE_MAX - Math.max(0, -xMaxD * amp),
        BASE_MAX - Math.max(0, -yMaxD * amp),
        BASE_MAX - Math.max(0, -zMaxD * amp),
      );

      // Mirror to the visual bounds ref
      boundsRef.current.min.copy(bMin);
      boundsRef.current.max.copy(bMax);
    },
    [coordinateMapper, wallAmplitude],
  );

  return (
    <>
      <FluidBody
        boundaryMode="box"
        particleCount={particleCount}
        gridSize={GRID_SIZE}
        stiffness={stiffness}
        restDensity={restDensity}
        dynamicViscosity={dynamicViscosity}
        gravity={DEFAULT_GRAVITY}
        color={color}
        initialFillRegion={fillRegion}
        onBeforeStep={onBeforeStep}
      />
      {showWireframe && <DynamicContainerBox boundsRef={boundsRef} />}
    </>
  );
};

export default BaseFluidBox;
