import { useEffect, useMemo, useRef } from "react";
import { ScalarMovingAvgEventDetector } from "@/lib/analyzers/eventDetector";
import { usePalette } from "@/lib/appState";
import { type IScalarTracker } from "@/lib/mappers/valueTracker/common";
import { ColorPalette } from "@/lib/palettes";
import { useFrame } from "@react-three/fiber";
import {
  BoxGeometry,
  Matrix4,
  MeshBasicMaterial,
  type InstancedMesh,
} from "three";

const BaseBoxes = ({
  scalarTracker,
  nBoxes = 5,
  gridSize = 10,
  cellSize = 0.25,
}: {
  scalarTracker: IScalarTracker;
  nBoxes?: number;
  gridSize?: number;
  cellSize?: number;
}) => {
  const nRows = gridSize;
  const nCols = gridSize;
  const detector = useMemo(
    () => new ScalarMovingAvgEventDetector(0.65, 150, 500),
    [],
  );
  const meshRef = useRef<InstancedMesh>(null!);
  const tmpMatrix = useMemo(() => new Matrix4(), []);
  const palette = usePalette();
  const lut = ColorPalette.getPalette(palette).buildLut();

  const cellAssignments = useMemo(
    () =>
      Array.from({ length: nBoxes }, (_) => {
        return {
          //   row: Math.floor(nRows * (idx / nBoxes)),
          //   col: Math.floor(nCols * (idx / nBoxes)),
          row: Math.floor(nRows * Math.random()),
          col: Math.floor(nCols * Math.random()),
        };
      }),
    [nBoxes, nRows, nCols],
  );

  //   Recolor;
  useEffect(() => {
    for (let instanceIdx = 0; instanceIdx < nBoxes; instanceIdx++) {
      meshRef.current.setColorAt(
        instanceIdx,
        lut.getColor(instanceIdx / (nBoxes - 1)),
      );
    }
    meshRef.current.instanceColor!.needsUpdate = true;
  }, [lut, nBoxes]);

  useFrame(() => {
    if (detector.step(scalarTracker?.getNormalizedValue() ?? 0)) {
      // random jitter
      const rowJitter = Math.floor(Math.random() * 3) - 1;
      const colJitter = Math.floor(Math.random() * 3) - 1;
      for (let i = 0; i < nBoxes; i++) {
        cellAssignments[i].col += (Math.random() > 0.5 ? 1 : -1) * colJitter;
        cellAssignments[i].row += (Math.random() > 0.5 ? 1 : -1) * rowJitter;
      }
    }

    let normCubeX, normCubeY, x, y, z;
    cellAssignments.forEach(({ row, col }, instanceIdx) => {
      // Find a random cell
      normCubeX = row / (nRows - 1);
      normCubeY = col / (nCols - 1);

      x = nRows * cellSize * (normCubeX - 0.5);
      y = nCols * cellSize * (normCubeY - 0.5);
      z = 0;
      // Position
      tmpMatrix.setPosition(x, y, z);

      meshRef.current.setMatrixAt(instanceIdx, tmpMatrix);
    });

    // Update the instance
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      castShadow={true}
      receiveShadow={true}
      args={[new BoxGeometry(), new MeshBasicMaterial(), nBoxes]}
    >
      <boxGeometry attach="geometry" args={[cellSize, cellSize, cellSize, 1]} />
      <meshBasicMaterial attach="material" color={"white"} toneMapped={false} />
    </instancedMesh>
  );
};

export default BaseBoxes;
