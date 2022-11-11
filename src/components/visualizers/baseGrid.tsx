import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Lut } from "three/examples/jsm/math/Lut.js";
import { BoxGeometry, InstancedMesh, Matrix4, MeshBasicMaterial } from "three";
import { folder, useControls } from "leva";

interface BaseGridProps {
  getValueForNormalizedCoord: (
    normGridX: number,
    normGridY: number,
    elapsedTimeSec?: number
  ) => number;
}

const BaseGrid = ({
  getValueForNormalizedCoord,
}: BaseGridProps): JSX.Element => {
  const { nGridRows, nGridCols, cubeSideLength, cubeSpacingScalar } =
    useControls({
      Grid: folder(
        {
          nGridRows: {
            value: 100,
            min: 1,
            max: 500,
            step: 1,
          },
          nGridCols: {
            value: 100,
            min: 1,
            max: 500,
            step: 1,
          },
          cubeSideLength: {
            value: 0.025,
            min: 0.01,
            max: 0.5,
            step: 0.005,
          },
          cubeSpacingScalar: {
            value: 5,
            min: 1,
            max: 10,
            step: 0.5,
          },
        },
        { collapsed: true }
      ),
    });
  const meshRef = useRef<InstancedMesh>(null!);
  const tmpMatrix = useMemo(() => new Matrix4(), []);

  useEffect(() => {
    const lut = new Lut("cooltowarm");
    const normQuadrantHypotenuse = Math.hypot(0.5, 0.5);
    let instanceIdx, normGridX, normGridY, normRadialOffset;
    for (let row = 0; row < nGridRows; row++) {
      for (let col = 0; col < nGridCols; col++) {
        instanceIdx = row * nGridCols + col;
        normGridX = row / nGridRows;
        normGridY = col / nGridCols;
        normRadialOffset =
          Math.hypot(normGridX - 0.5, normGridY - 0.5) / normQuadrantHypotenuse;
        meshRef.current.setColorAt(instanceIdx, lut.getColor(normRadialOffset));
      }
    }
    meshRef.current.instanceColor!.needsUpdate = true;
  }, [
    nGridRows,
    nGridCols,
    cubeSideLength,
    cubeSpacingScalar,
    getValueForNormalizedCoord,
  ]);

  useFrame(({ clock }) => {
    //in ms
    const elapsedTimeSec = clock.getElapsedTime();
    const gridSizeX = nGridRows * cubeSpacingScalar * cubeSideLength;
    const gridSizeY = nGridCols * cubeSpacingScalar * cubeSideLength;
    let instanceIdx, normGridX, normGridY, x, y, z;
    for (let row = 0; row < nGridRows; row++) {
      for (let col = 0; col < nGridCols; col++) {
        instanceIdx = row * nGridCols + col;
        normGridX = row / nGridRows;
        normGridY = col / nGridCols;
        z = getValueForNormalizedCoord(normGridX, normGridY, elapsedTimeSec);
        x = gridSizeX * (normGridX - 0.5);
        y = gridSizeY * (normGridY - 0.5);
        meshRef.current.setMatrixAt(
          instanceIdx,
          tmpMatrix.setPosition(x, y, z)
        );
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
      args={[new BoxGeometry(), new MeshBasicMaterial(), nGridRows * nGridCols]}
    >
      <boxGeometry
        attach="geometry"
        args={[cubeSideLength, cubeSideLength, cubeSideLength, 1]}
      />
      <meshBasicMaterial attach="material" color={"white"} toneMapped={false} />
    </instancedMesh>
  );
};

export default BaseGrid;
