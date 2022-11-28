import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Lut } from "three/examples/jsm/math/Lut.js";
import { BoxGeometry, InstancedMesh, Matrix4, MeshBasicMaterial } from "three";
import { ICoordinateMapper } from "../../coordinateMapper";

interface BaseGridProps {
  coordinateMapper: ICoordinateMapper;
  nGridRows?: number;
  nGridCols?: number;
  cubeSideLength?: number;
  cubeSpacingScalar?: number;
  colorLut?: string;
}

const BaseGrid = ({
  coordinateMapper,
  nGridRows = 100,
  nGridCols = 100,
  cubeSideLength = 0.025,
  cubeSpacingScalar = 5,
  colorLut = "cooltowarm",
}: BaseGridProps): JSX.Element => {
  const meshRef = useRef<InstancedMesh>(null!);
  const tmpMatrix = useMemo(() => new Matrix4(), []);

  // Recolor
  useEffect(() => {
    const lut = new Lut(colorLut);
    const normQuadrantHypotenuse = Math.hypot(0.5, 0.5);
    let instanceIdx, normGridX, normGridY, normRadialOffset;
    for (let row = 0; row < nGridRows; row++) {
      for (let col = 0; col < nGridCols; col++) {
        instanceIdx = row * nGridCols + col;
        normGridX = row / (nGridRows - 1);
        normGridY = col / (nGridCols - 1);
        normRadialOffset =
          Math.hypot(normGridX - 0.5, normGridY - 0.5) / normQuadrantHypotenuse;
        meshRef.current.setColorAt(instanceIdx, lut.getColor(normRadialOffset));
      }
    }
    meshRef.current.instanceColor!.needsUpdate = true;
  });

  useFrame(({ clock }) => {
    //in ms
    const elapsedTimeSec = clock.getElapsedTime();
    const gridSizeX = nGridRows * cubeSpacingScalar * cubeSideLength;
    const gridSizeY = nGridCols * cubeSpacingScalar * cubeSideLength;
    let instanceIdx, normGridX, normGridY, x, y, z;
    for (let row = 0; row < nGridRows; row++) {
      for (let col = 0; col < nGridCols; col++) {
        instanceIdx = row * nGridCols + col;
        normGridX = row / (nGridRows - 1);
        normGridY = col / (nGridCols - 1);
        z = coordinateMapper.map(normGridX, normGridY, 0, elapsedTimeSec);
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
