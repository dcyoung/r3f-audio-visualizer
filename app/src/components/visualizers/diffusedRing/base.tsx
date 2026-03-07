import { useEffect, useRef } from "react";
import {
  COORDINATE_TYPE,
  gaussianRandom,
  TWO_PI,
  type ICoordinateMapper,
} from "@/lib/mappers/coordinateMappers/common";
import { useFrame } from "@react-three/fiber";
import { float, instancedBufferAttribute } from "three/tsl";
import {
  InstancedBufferAttribute,
  PointsNodeMaterial,
  type Sprite,
} from "three/webgpu";

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
  const spriteRef = useRef<Sprite>(null);
  const posAttrRef = useRef<InstancedBufferAttribute | null>(null);

  useEffect(() => {
    const sprite = spriteRef.current;
    if (!sprite) return;

    const positions = new Float32Array(nPoints * 3);
    const posAttr = new InstancedBufferAttribute(positions, 3);
    posAttrRef.current = posAttr;

    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const mat = new PointsNodeMaterial({
      color: 0xffffff,
      sizeNode: float(pointSize) as any,
    });
    (mat as any).positionNode = instancedBufferAttribute(posAttr);
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

    sprite.material = mat;
    sprite.count = nPoints;
    sprite.frustumCulled = false;

    return () => {
      mat.dispose();
      posAttrRef.current = null;
    };
  }, [nPoints, pointSize]);

  useFrame(({ elapsed }) => {
    const posAttr = posAttrRef.current;
    if (!posAttr) return;

    const positions = posAttr.array as Float32Array;
    const elapsedTimeSec = elapsed;
    let effectiveRadius, normIdx, angRad;

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
      positions[i * 3] = effectiveRadius * Math.cos(angRad);
      positions[i * 3 + 1] = effectiveRadius * Math.sin(angRad);
      positions[i * 3 + 2] = 0;
    }
    posAttr.needsUpdate = true;
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
  return <sprite ref={spriteRef as any} frustumCulled={false} />;
};

export default BaseDiffusedRing;
