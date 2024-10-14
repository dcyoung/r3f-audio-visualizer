import Ground from "@/components/visualizers/ground";
import { type TVisualProps } from "@/components/visualizers/models";
import { Vector3 } from "three";

import BaseVisual from "./base";

export default ({ scalarTracker }: TVisualProps) => {
  const nBoxes = 200;
  const gridSize = 100;
  const cellSize = 1;

  return (
    <>
      <BaseVisual
        scalarTracker={
          scalarTracker ?? {
            get: () => Math.sin(0.0025 * Date.now()) + 1,
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            set: () => {},
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
