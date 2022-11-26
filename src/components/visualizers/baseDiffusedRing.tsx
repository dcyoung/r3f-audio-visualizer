import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { folder, useControls } from "leva";
import { Points } from "three";
import { gaussianRandom, ICoordinateMapper1D, _2PI } from "./utils";

interface BaseDiffusedRingProps {
  getValueForNormalizedCoord: ICoordinateMapper1D;
}

const BaseDiffusedRing = ({
  getValueForNormalizedCoord,
}: BaseDiffusedRingProps): JSX.Element => {
  const nPoints = 1000;
  const noise = [...Array(nPoints)].map(gaussianRandom);
  const { radius, pointSize } = useControls({
    Ring: folder(
      {
        radius: { value: 2, min: 0.25, max: 3, step: 0.25 },
        pointSize: { value: 0.2, min: 0.01, max: 2, step: 0.01 },
      },
      { collapsed: true }
    ),
  });

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
        (1 + noise[i] * getValueForNormalizedCoord(angNorm, elapsedTimeSec));

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
