import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Lut } from "three/examples/jsm/math/Lut.js";
import { BoxGeometry, InstancedMesh, Matrix4, MeshBasicMaterial } from "three";
import { useAppState } from "../../appState";

interface BaseGridProps {
  nGridRows?: number;
  nGridCols?: number;
  cubeSideLength?: number;
  cubeSpacingScalar?: number;
  colorLut?: string;
}

const BaseGrid = ({
  nGridRows = 100,
  nGridCols = 100,
  cubeSideLength = 0.025,
  cubeSpacingScalar = 5,
  colorLut = "cooltowarm",
}: BaseGridProps): JSX.Element => {
  const meshRef = useRef<InstancedMesh>(null!);
  const tmpMatrix = useMemo(() => new Matrix4(), []);
  const coordinateMapper = useAppState((state) => state.coordinateMapper);

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
  }, [nGridRows, nGridCols, cubeSideLength, cubeSpacingScalar, colorLut]);

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
