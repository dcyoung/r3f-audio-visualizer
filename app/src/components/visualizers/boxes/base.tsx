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
  const rotateDurationMs = 250;
  const nRows = gridSize;
  const nCols = gridSize;
  const detector = useMemo(
    () => new ScalarMovingAvgEventDetector(0.65, 150, 2 * rotateDurationMs),
    [rotateDurationMs],
  );
  const meshRef = useRef<InstancedMesh>(null!);
  const tmpMatrix = useMemo(() => new Matrix4(), []);
  const palette = usePalette();
  const lut = ColorPalette.getPalette(palette).buildLut();

  const cellAssignments = useMemo(
    () =>
      Array.from({ length: nBoxes }, (_) => {
        const row = Math.floor(nRows * Math.random());
        const col = Math.floor(nCols * Math.random());
        return {
          fromRow: row,
          fromCol: col,
          toRow: row,
          toCol: col,
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
        cellAssignments[i].fromRow = cellAssignments[i].toRow;
        cellAssignments[i].fromCol = cellAssignments[i].toCol;
        cellAssignments[i].toRow += (Math.random() > 0.5 ? 1 : -1) * colJitter;
        cellAssignments[i].toCol += (Math.random() > 0.5 ? 1 : -1) * rowJitter;
      }
    }

    const alpha = Math.min(
      1,
      Math.max(0, detector.timeSinceLastEventMs / rotateDurationMs),
    );

    let normCubeX, normCubeY, x, y, z;
    cellAssignments.forEach(
      ({ fromRow, fromCol, toRow, toCol }, instanceIdx) => {
        const row = fromRow + alpha * (toRow - fromRow);
        const col = fromCol + alpha * (toCol - fromCol);

        // Find a random cell
        normCubeX = row / (nRows - 1);
        normCubeY = col / (nCols - 1);

        x = nRows * cellSize * (normCubeX - 0.5);
        y = nCols * cellSize * (normCubeY - 0.5);
        z = 0;
        // Position
        tmpMatrix.setPosition(x, y, z);

        meshRef.current.setMatrixAt(instanceIdx, tmpMatrix);
      },
    );

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
