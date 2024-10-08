import Ground from "@/components/visualizers/ground";
import { type VisualProps } from "@/components/visualizers/models";
import { Vector3 } from "three";

import BaseVisual from "./base";

export default ({ scalarTracker }: VisualProps) => {
  const nBoxes = 200;
  const gridSize = 100;
  const cellSize = 1;

  return (
    <>
      <BaseVisual
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
