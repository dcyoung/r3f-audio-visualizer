import { useEffect, useMemo, useRef } from "react";
import { ScalarMovingAvgEventDetector } from "@/lib/analyzers/scalarEventDetector";
import { usePalette } from "@/lib/appState";
import { clip, easeInOut, lerp } from "@/lib/easing";
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
  const meshRef = useRef<InstancedMesh>(null);
  const tmpMatrix = useMemo(() => new Matrix4(), []);
  const palette = usePalette();
  const lut = ColorPalette.getPalette(palette).buildLut();

  const cellAssignments = useMemo(
    () =>
      Array.from({ length: nBoxes }, (_) => {
        // eslint-disable-next-line react-hooks/purity
        const row = Math.floor(nRows * Math.random());
        // eslint-disable-next-line react-hooks/purity
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
    if (!meshRef.current) {
      return;
    }
    for (let instanceIdx = 0; instanceIdx < nBoxes; instanceIdx++) {
      meshRef.current.setColorAt(
        instanceIdx,
        lut.getColor(instanceIdx / (nBoxes - 1)),
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    meshRef.current.instanceColor!.needsUpdate = true;
  }, [lut, nBoxes]);

  useFrame(() => {
    if (!meshRef.current) {
      return;
    }
    if (detector.step(scalarTracker?.get() ?? 0)) {
      // random jitter in one direction or the other
      const [rowJitter, colJitter] =
        Math.random() > 0.5 ? [true, false] : [false, true];

      for (let i = 0; i < nBoxes; i++) {
        // eslint-disable-next-line react-hooks/immutability
        cellAssignments[i].fromRow = cellAssignments[i].toRow;
        cellAssignments[i].fromCol = cellAssignments[i].toCol;
        if (rowJitter) {
          cellAssignments[i].toRow += Math.random() > 0.5 ? 1 : -1;
        }
        if (colJitter) {
          cellAssignments[i].toCol += Math.random() > 0.5 ? 1 : -1;
        }
      }
    }

    // smooth the roll
    const alpha = easeInOut(
      clip(detector.timeSinceLastEventMs / rotateDurationMs),
    );
    // roll angle for each cube
    const beta = lerp(Math.PI / 4, (3 * Math.PI) / 4, alpha);
    // formula for COM of a rolling cube as a fxn of beta
    const rollU = (-0.5 * cellSize * Math.cos(beta)) / Math.sqrt(2);
    const rollV = (0.5 * cellSize * Math.sin(beta)) / Math.sqrt(2);

    let normCubeX, normCubeY, x, y, z, deltaRow, deltaCol;
    for (const [
      instanceIdx,
      { fromRow, fromCol, toRow, toCol },
    ] of cellAssignments.entries()) {
      deltaRow = toRow - fromRow;
      deltaCol = toCol - fromCol;
      const row = fromRow + deltaRow * (rollU + 0.5);
      const col = fromCol + deltaCol * (rollU + 0.5);

      if (deltaRow !== 0) {
        tmpMatrix.makeRotationY((beta - Math.PI / 4) * deltaRow);
      }
      if (deltaCol !== 0) {
        tmpMatrix.makeRotationX(-(beta - Math.PI / 4) * deltaCol);
      }

      normCubeX = row / (nRows - 1);
      normCubeY = col / (nCols - 1);

      x = nRows * cellSize * (normCubeX - 0.5);
      y = nCols * cellSize * (normCubeY - 0.5);
      z = rollV - cellSize / 4;
      // Position
      tmpMatrix.setPosition(x, y, z);

      meshRef.current.setMatrixAt(instanceIdx, tmpMatrix);
    }

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
