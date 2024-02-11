import { useRef } from "react";
import {
  COORDINATE_TYPE,
  gaussianRandom,
  TWO_PI,
  type ICoordinateMapper,
} from "@/lib/mappers/coordinateMappers/common";
import { useFrame } from "@react-three/fiber";
import { type Points } from "three";

const BaseDiffusedRing = ({
  coordinateMapper,
  radius = 2.0,
  pointSize = 0.2,
  nPoints = 1000,
  mirrorEffects = false,
}: {
  coordinateMapper: ICoordinateMapper;
  radius?: number;
  nPoints?: number;
  pointSize?: number;
  mirrorEffects?: boolean;
}) => {
  const noise = Array.from({ length: nPoints }).map(gaussianRandom);
  const refPoints = useRef<Points>(null!);

  useFrame(({ clock }) => {
    //in ms
    const elapsedTimeSec = clock.getElapsedTime();
    let effectiveRadius, normIdx, angRad;
    const positionsBuffer = refPoints.current.geometry.attributes.position;
    for (let i = 0; i < nPoints; i++) {
      normIdx = i / (nPoints - 1);
      effectiveRadius =
        radius *
        (1 +
          noise[i] *
            coordinateMapper.map(
              COORDINATE_TYPE.CARTESIAN_1D,
              mirrorEffects ? 2 * Math.abs(normIdx - 0.5) : normIdx,
              0,
              0,
              elapsedTimeSec,
            ));

      angRad = normIdx * TWO_PI;
      positionsBuffer.setXYZ(
        i,
        effectiveRadius * Math.cos(angRad), // x
        effectiveRadius * Math.sin(angRad), // y
        0, // z
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
