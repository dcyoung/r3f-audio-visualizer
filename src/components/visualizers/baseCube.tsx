import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Lut } from "three/examples/jsm/math/Lut.js";
import { BoxGeometry, InstancedMesh, Matrix4, MeshBasicMaterial } from "three";
import { folder, useControls } from "leva";

const NORM_QUADRANT_HYPOTENUSE = Math.hypot(0.5, 0.5);

interface BaseCubeProps {
  getValueForNormalizedCoord: (
    normCubeX: number,
    normCubeY: number,
    normCubeZ: number,
    elapsedTimeSec?: number
  ) => number;
}

const BaseCube = ({
  getValueForNormalizedCoord,
}: BaseCubeProps): JSX.Element => {
  const { nPerSide, cubeSideLength, cubeSpacingScalar } = useControls({
    Cube: folder(
      {
        nPerSide: {
          value: 10,
          min: 3,
          max: 50,
          step: 1,
        },
        cubeSideLength: {
          value: 0.5,
          min: 0.1,
          max: 2.0,
          step: 0.05,
        },
        cubeSpacingScalar: {
          value: 0.1,
          min: 0,
          max: 2,
          step: 0.1,
        },
      },
      { collapsed: true }
    ),
  });
  const meshRef = useRef<InstancedMesh>(null!);
  const tmpMatrix = useMemo(() => new Matrix4(), []);

  useEffect(() => {
    const lut = new Lut("cooltowarm");
    let instanceIdx, normCubeX, normCubeY, normCubeZ, normRadialOffset;
    // interior
    for (let row = 0; row < nPerSide; row++) {
      for (let col = 0; col < nPerSide; col++) {
        for (let depth = 0; depth < nPerSide; depth++) {
          instanceIdx = row * nPerSide ** 2 + col * nPerSide + depth;
          normCubeX = row / (nPerSide - 1);
          normCubeY = col / (nPerSide - 1);
          normCubeZ = depth / (nPerSide - 1);
          // Exterior:
          if (normCubeX == 0 || normCubeX == 1) {
            normRadialOffset =
              Math.hypot(normCubeY - 0.5, normCubeZ - 0.5) /
              NORM_QUADRANT_HYPOTENUSE;
          } else if (normCubeY == 0 || normCubeY == 1) {
            normRadialOffset =
              Math.hypot(normCubeX - 0.5, normCubeZ - 0.5) /
              NORM_QUADRANT_HYPOTENUSE;
          } else if (normCubeZ == 0 || normCubeZ == 1) {
            normRadialOffset =
              Math.hypot(normCubeX - 0.5, normCubeY - 0.5) /
              NORM_QUADRANT_HYPOTENUSE;
          } else {
            // interior
            normRadialOffset = 0;
          }
          meshRef.current.setColorAt(
            instanceIdx,
            lut.getColor(normRadialOffset)
          );
        }
      }
    }
    meshRef.current.instanceColor!.needsUpdate = true;
  }, [nPerSide, cubeSideLength, cubeSpacingScalar, getValueForNormalizedCoord]);

  useFrame(({ clock }) => {
    //in ms
    const elapsedTimeSec = clock.getElapsedTime();
    const faceSize = nPerSide * (1 + cubeSpacingScalar) * cubeSideLength;
    let instanceIdx, normCubeX, normCubeY, normCubeZ, x, y, z, normalizedScale;
    for (let row = 0; row < nPerSide; row++) {
      for (let col = 0; col < nPerSide; col++) {
        for (let depth = 0; depth < nPerSide; depth++) {
          instanceIdx = row * nPerSide ** 2 + col * nPerSide + depth;
          normCubeX = row / (nPerSide - 1);
          normCubeY = col / (nPerSide - 1);
          normCubeZ = depth / (nPerSide - 1);
          x = faceSize * (normCubeX - 0.5);
          y = faceSize * (normCubeY - 0.5);
          z = faceSize * (normCubeZ - 0.5);
          // Position
          tmpMatrix.setPosition(x, y, z);

          // Scale
          normalizedScale =
            0.1 +
            0.9 *
              getValueForNormalizedCoord(
                normCubeX,
                normCubeY,
                normCubeZ,
                elapsedTimeSec
              );
          tmpMatrix.elements[0] = normalizedScale;
          tmpMatrix.elements[5] = normalizedScale;
          tmpMatrix.elements[10] = normalizedScale;
          meshRef.current.setMatrixAt(instanceIdx, tmpMatrix);
        }
      }
    }
    // Update the instance
    meshRef.current.instanceMatrix!.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      castShadow={true}
      receiveShadow={true}
      args={[new BoxGeometry(), new MeshBasicMaterial(), nPerSide ** 3]}
    >
      <boxGeometry
        attach="geometry"
        args={[cubeSideLength, cubeSideLength, cubeSideLength, 1]}
      />
      <meshBasicMaterial attach="material" color={"white"} toneMapped={false} />
    </instancedMesh>
  );
};

export default BaseCube;
