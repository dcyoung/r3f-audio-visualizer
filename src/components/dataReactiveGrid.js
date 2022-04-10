import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Lut } from "three/examples/jsm/math/Lut.js";
import { Matrix4 } from "three";
import { folder, useControls } from "leva";

function getValueForNormalizedCoord(bars, normalizedCoord) {
  if (bars === undefined || !bars || bars.length === 0) {
    return 0;
  }
  // Interpolate from the bar values based on the normalized Coord
  let rawIdx = normalizedCoord * (bars.length - 1);
  let valueBelow = bars[Math.floor(rawIdx)];
  let valueAbove = bars[Math.ceil(rawIdx)];
  return valueBelow + (rawIdx % 1) * (valueAbove - valueBelow);
}

function DataReactiveGrid({ dataRef, amplitude = 1.0 }) {
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
  const meshRef = useRef();
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
    meshRef.current.instanceColor.needsUpdate = true;
  }, [nGridRows, nGridCols]);

  useFrame(() => {
    //in ms
    const gridSizeX = nGridRows * cubeSpacingScalar * cubeSideLength;
    const gridSizeY = nGridCols * cubeSpacingScalar * cubeSideLength;
    const normQuadrantHypotenuse = Math.hypot(0.5, 0.5);

    let instanceIdx, normGridX, normGridY, x, y, z, normRadialOffset;
    for (let row = 0; row < nGridRows; row++) {
      for (let col = 0; col < nGridCols; col++) {
        instanceIdx = row * nGridCols + col;
        normGridX = row / nGridRows;
        normGridY = col / nGridCols;
        x = gridSizeX * (normGridX - 0.5);
        y = gridSizeY * (normGridY - 0.5);
        normRadialOffset =
          Math.hypot(normGridX - 0.5, normGridY - 0.5) / normQuadrantHypotenuse;
        z =
          amplitude *
          getValueForNormalizedCoord(dataRef?.current, normRadialOffset);
        meshRef.current.setMatrixAt(
          instanceIdx,
          tmpMatrix.setPosition(x, y, z)
        );
      }
    }
    // Update the instance
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      castShadow={true}
      receiveShadow={true}
      args={[null, null, nGridRows * nGridCols]}
    >
      <boxGeometry
        attach="geometry"
        args={[cubeSideLength, cubeSideLength, cubeSideLength, 1]}
      />
      <meshBasicMaterial attach="material" color={"white"} toneMapped={false} />
    </instancedMesh>
  );
}

export default DataReactiveGrid;
