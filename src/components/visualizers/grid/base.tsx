import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Lut } from "three/examples/jsm/math/Lut.js";
import { BoxGeometry, InstancedMesh, Matrix4, MeshBasicMaterial } from "three";
import {
  COORDINATE_TYPE,
  ICoordinateMapper,
} from "../../coordinateMappers/common";

interface BaseGridProps {
  coordinateMapper: ICoordinateMapper;
  nGridRows?: number;
  nGridCols?: number;
  cubeSideLength?: number;
  cubeSpacingScalar?: number;
  colorLut?: string;
  pinStyle?: boolean;
  color?: string;
}

const BaseGrid = ({
  coordinateMapper,
  nGridRows = 100,
  nGridCols = 100,
  cubeSideLength = 0.025,
  cubeSpacingScalar = 5,
  colorLut = "cooltowarm",
  pinStyle = false,
  color = "white",
}: BaseGridProps): JSX.Element => {
  const meshRef = useRef<InstancedMesh>(null!);
  const tmpMatrix = useMemo(() => new Matrix4(), []);

  // Recolor
  useEffect(() => {
    if (!colorLut) {
      return;
    }
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
    const baseHeight = cubeSideLength + coordinateMapper.amplitude;
    let instanceIdx, normGridX, normGridY, x, y, z;
    for (let row = 0; row < nGridRows; row++) {
      for (let col = 0; col < nGridCols; col++) {
        instanceIdx = row * nGridCols + col;
        normGridX = row / (nGridRows - 1);
        normGridY = col / (nGridCols - 1);
        z = coordinateMapper.map(
          COORDINATE_TYPE.CARTESIAN_2D,
          normGridX,
          normGridY,
          0,
          elapsedTimeSec
        );
        x = gridSizeX * (normGridX - 0.5);
        y = gridSizeY * (normGridY - 0.5);

        if (pinStyle) {
          // adjust the position and z-scale of each cube
          tmpMatrix.setPosition(x, y, (baseHeight + z) / 2);
          tmpMatrix.elements[10] = (baseHeight + z) / cubeSideLength;
        } else {
          // adjust position of each cube
          tmpMatrix.setPosition(x, y, z);
        }

        meshRef.current.setMatrixAt(instanceIdx, tmpMatrix);
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
      <meshPhongMaterial attach="material" color={color} toneMapped={false} />
    </instancedMesh>
  );
};

export default BaseGrid;
