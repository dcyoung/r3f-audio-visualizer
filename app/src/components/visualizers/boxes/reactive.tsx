import { type VisualProps } from "@/components/visualizers/common";
import Ground from "@/components/visualizers/ground";
import { Vector3 } from "three";

import BaseBoxes from "./base";

const BoxesVisual = ({ scalarTracker }: VisualProps) => {
  const nBoxes = 200;
  const gridSize = 100;
  const cellSize = 1;

  return (
    <>
      <BaseBoxes
        scalarTracker={
          scalarTracker ?? {
            getNormalizedValue: () => Math.sin(0.0025 * Date.now()) + 1,
          }
        }
        nBoxes={nBoxes}
        gridSize={gridSize}
        cellSize={cellSize}
      />
      <Ground position={new Vector3(0, 0, -cellSize / 2)} />
    </>
  );
};

export default BoxesVisual;
