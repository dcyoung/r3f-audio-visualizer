import { useEffect, useMemo, useRef } from "react";
import { usePalette } from "@/lib/appState";
import { easeInOut, EASING_FUNCTION } from "@/lib/easing";
import { COORDINATE_TYPE } from "@/lib/mappers/coordinateMappers/common";
import { ColorPalette } from "@/lib/palettes";
import { useFrame } from "@react-three/fiber";
import {
  BoxGeometry,
  CatmullRomCurve3,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
  type InstancedMesh,
} from "three";

import { type VisualProps } from "../common";

const curvePoints = [
  [0, 0],
  [0.5, 0],
  [0.6, 0],
  [0.75, -0.1],
  [0.9, 0],
  [1, 0.5],
  [0.75, 0.75],
  [0, 1],
  [-0.75, 0.75],
  [-1, 0.5],
  [-0.9, 0],
  [-0.75, -0.1],
  [-0.6, 0],
  [-0.5, 0],
] as const;

export const Treadmill = ({
  nStones = 80,
  stoneWidth = 5,
  stoneHeight = 0.1,
  stoneLength = 1,
  coordinateMapper,
}: VisualProps & {
  nStones?: number;
  stoneWidth?: number;
  stoneHeight?: number;
  stoneLength?: number;
}) => {
  const stoneRef = useRef<InstancedMesh>();
  const [tmpMatrix, tmpVecPosition, tmpQuat, tmpVecScale] = useMemo(
    () => [new Matrix4(), new Vector3(), new Quaternion(), new Vector3()],
    [],
  );

  const curve = useMemo(() => {
    const scale = 20.0;
    return new CatmullRomCurve3(
      curvePoints.map((v) => new Vector3(0, v[0], v[1]).multiplyScalar(scale)),
      true,
      "catmullrom",
      0.1,
    );
  }, []);

  const palette = usePalette();
  const lut = ColorPalette.getPalette(palette).buildLut();
  useEffect(() => {
    if (!stoneRef.current) {
      return;
    }
    for (let instanceIdx = 0; instanceIdx < nStones; instanceIdx++) {
      stoneRef.current.setColorAt(
        instanceIdx,
        lut.getColor(instanceIdx / (nStones - 1)),
      );
    }
    stoneRef.current.instanceColor!.needsUpdate = true;
  }, [stoneRef, lut, nStones]);

  useFrame(({ clock }) => {
    if (!stoneRef.current) {
      return;
    }
    const t = clock.getElapsedTime();
    // const rateOfChange = 0.5;
    // const tScale = (Math.sin(rateOfChange * t) + 1) / 2;
    // const periodSec = 16 * (1 + tScale / 1000);
    const periodSec = 16;
    const alphaRaw = (t % periodSec) / periodSec;
    const alpha = 1 - easeInOut(alphaRaw, EASING_FUNCTION.LINEAR);

    for (let instanceIdx = 0; instanceIdx < nStones; instanceIdx++) {
      const stoneAlpha = (alpha + instanceIdx / nStones) % 1;
      const widthScalar = 2 * Math.abs(stoneAlpha - 0.5);

      const dataAlpha = Math.abs(stoneAlpha - 0.5);
      const mappedWidthScalar =
        0.5 +
        coordinateMapper.map(COORDINATE_TYPE.CARTESIAN_1D, dataAlpha, t) / 2;
      const finalWidthScalar = widthScalar * (1 + mappedWidthScalar);

      //
      stoneRef.current.getMatrixAt(instanceIdx, tmpMatrix);
      tmpMatrix.decompose(tmpVecPosition, tmpQuat, tmpVecScale);

      curve.getPointAt(stoneAlpha, tmpVecPosition);
      tmpVecScale.set(finalWidthScalar, 1, 1);

      tmpMatrix.compose(tmpVecPosition, tmpQuat, tmpVecScale);
      stoneRef.current.setMatrixAt(instanceIdx, tmpMatrix);
    }

    stoneRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh
        ref={stoneRef}
        castShadow={true}
        receiveShadow={true}
        count={nStones}
        args={[new BoxGeometry(), new MeshStandardMaterial(), nStones]}
      >
        <boxGeometry
          attach="geometry"
          args={[stoneWidth, stoneLength, stoneHeight, 1, 1, 1]}
        />
        <meshStandardMaterial
          attach="material"
          color={"white"}
          toneMapped={false}
        />
      </instancedMesh>
    </>
  );
};
