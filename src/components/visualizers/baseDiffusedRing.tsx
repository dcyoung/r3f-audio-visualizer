import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { folder, useControls } from "leva";
import { Points } from "three";

interface BaseDiffusedRingProps {
  getValueForNormalizedCoord: (
    normAngle: number,
    elapsedTimeSec?: number
  ) => number;
}

const randn_bm = (): number => {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  num = num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0) return randn_bm(); // resample between 0 and 1
  return num;
};

const BaseDiffusedRing = ({
  getValueForNormalizedCoord,
}: BaseDiffusedRingProps): JSX.Element => {
  const nPoints = 1000;
  const noise = [...Array(nPoints)].map(randn_bm);
  const { radius, pointSize } = useControls({
    Ring: folder(
      {
        radius: { value: 2, min: 0.25, max: 3, step: 0.25 },
        pointSize: { value: 0.2, min: 0.01, max: 2, step: 0.01 },
        // noise: {
        //   value: 0,
        //   min: 0,
        //   max: 1,
        //   step: 0.05,
        // },
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
      angRad = angNorm * 2 * Math.PI;
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
