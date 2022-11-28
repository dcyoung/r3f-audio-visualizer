import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Points } from "three";
import { gaussianRandom, _2PI } from "../utils";
import { ICoordinateMapper } from "../../coordinateMapper";

interface BaseDiffusedRingProps {
  coordinateMapper: ICoordinateMapper;
  radius?: number;
  nPoints?: number;
  pointSize?: number;
}

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
      angRad = angNorm * _2PI;
      effectiveRadius =
        radius *
        (1 + noise[i] * coordinateMapper.map(angNorm, 0, 0, elapsedTimeSec));

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
