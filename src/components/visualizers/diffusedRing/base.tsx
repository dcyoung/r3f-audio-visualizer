import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Points } from "three";
import {
  COORDINATE_TYPE,
  ICoordinateMapper,
  TWO_PI,
} from "../../coordinateMappers/common";

interface BaseDiffusedRingProps {
  coordinateMapper: ICoordinateMapper;
  radius?: number;
  nPoints?: number;
  pointSize?: number;
}

/**
 * Generates random numbers from a normalized gaussian distribution.
 * @returns - a random normalized value from a gaussian distribution.
 */
const gaussianRandom = (): number => {
  let u = 0,
    v = 0;
  while (u === 0) {
    u = Math.random(); //Converting [0,1) to (0,1)
  }
  while (v === 0) {
    v = Math.random();
  }
  const num =
    (Math.sqrt(-2.0 * Math.log(u)) * Math.cos(TWO_PI * v)) / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0) {
    return gaussianRandom(); // resample between 0 and 1
  }
  return num;
};

const BaseDiffusedRing = ({
  coordinateMapper,
  radius = 2.0,
  pointSize = 0.2,
  nPoints = 1000,
}: BaseDiffusedRingProps): JSX.Element => {
  const noise = [...Array(nPoints)].map(gaussianRandom);
  const refPoints = useRef<Points>(null!);

  useFrame(({ clock }) => {
    //in ms
    const elapsedTimeSec = clock.getElapsedTime();
    let effectiveRadius, angNorm, angRad;
    const positionsBuffer = refPoints.current.geometry.attributes.position;
    for (let i = 0; i < nPoints; i++) {
      angNorm = i / (nPoints - 1);
      angRad = angNorm * TWO_PI;
      effectiveRadius =
        radius *
        (1 +
          noise[i] *
            coordinateMapper.map(
              COORDINATE_TYPE.CARTESIAN_1D,
              angNorm,
              0,
              0,
              elapsedTimeSec
            ));

      positionsBuffer.setXYZ(
        i,
        effectiveRadius * Math.cos(angRad), // x
        effectiveRadius * Math.sin(angRad), // y
        0 // z
      );
    }
    positionsBuffer.needsUpdate = true;
  });

  return (
    <points ref={refPoints}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={new Float32Array(nPoints * 3)}
          count={nPoints}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial attach="material" size={pointSize} />
    </points>
  );
};

export default BaseDiffusedRing;
