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

import { type TVisualProps } from "../models";

const curvePoints = [
  [-1, 1],
  [-0.75, -0.1],
  [-0.6, 0],
  [0, 0],
  [0.6, 0],
  [0.75, -0.1],
  [1, 1],
] as const;

export const Treadmill = ({
  nStones = 30,
  stoneWidth = 5,
  stoneHeight = 0.1,
  stoneLength = 1,
  coordinateMapper,
}: TVisualProps & {
  nStones?: number;
  stoneWidth?: number;
  stoneHeight?: number;
  stoneLength?: number;
}) => {
  const stoneRef = useRef<InstancedMesh>(null);
  const [tmpMatrix, tmpVecPosition, tmpQuat, tmpVecScale] = useMemo(
    () => [new Matrix4(), new Vector3(), new Quaternion(), new Vector3()],
    [],
  );

  const curve = useMemo(() => {
    const scale = 10.0;
    return new CatmullRomCurve3(
      curvePoints.map((v) => new Vector3(0, v[0], v[1]).multiplyScalar(scale)),
      false,
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
    const speed = 0.025;

    const q = 0.5;
    // assume v(t) = (sin(q * t) + 1) / 2... integrate to find position
    const normPosition = (speed * (t - Math.cos(q * t) / q)) % 1;

    const alphaRaw = normPosition;
    const alpha = 1 - easeInOut(alphaRaw, EASING_FUNCTION.LINEAR);

    for (let instanceIdx = 0; instanceIdx < nStones; instanceIdx++) {
      const stoneAlpha = (alpha + instanceIdx / nStones) % 1;
      const widthScalar = 1 - 2 * Math.abs(stoneAlpha - 0.5);
      // const widthScalar = 1;

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
