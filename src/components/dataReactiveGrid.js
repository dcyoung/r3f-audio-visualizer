import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Lut } from "three/examples/jsm/math/Lut.js";
import * as THREE from "three";

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

function DataReactiveGrid({
  dataRef,
  nGridCols = 100,
  nGridRows = 100,
  amplitude = 1.0,
  cubeSideLength = 0.025,
  spacingScalar = 5,
}) {
  const ref = useRef();
  const tempObj = new THREE.Object3D();
  const lut = new Lut("cooltowarm");

  useFrame(() => {
    //in ms
    const gridSizeX = nGridRows * spacingScalar * cubeSideLength;
    const gridSizeY = nGridCols * spacingScalar * cubeSideLength;
    const normQuadrantHypotenuse = Math.sqrt(
      Math.pow(0.5, 2) + Math.pow(0.5, 2)
    );
    let x, y, z, idx, normGridX, normGridY, normRadialOffset;

    for (let row = 0; row < nGridRows; row++) {
      for (let col = 0; col < nGridCols; col++) {
        idx = row * nGridCols + col;
        normGridX = row / nGridRows;
        normGridY = col / nGridCols;
        x = gridSizeX * (normGridX - 0.5);
        y = gridSizeY * (normGridY - 0.5);
        normRadialOffset =
          Math.sqrt(
            Math.pow(normGridX - 0.5, 2) + Math.pow(normGridY - 0.5, 2)
          ) / normQuadrantHypotenuse;
        z =
          amplitude *
          getValueForNormalizedCoord(dataRef?.current, normRadialOffset);
        tempObj.position.set(x, y, z);
        tempObj.updateMatrix();
        ref.current.setMatrixAt(idx, tempObj.matrix);
        ref.current.setColorAt(idx, lut.getColor(normRadialOffset));
      }
    }
    // Update the instance
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={ref}
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
