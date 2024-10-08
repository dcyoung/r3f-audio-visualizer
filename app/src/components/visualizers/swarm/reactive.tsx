import Ground from "@/components/visualizers/ground";
import { type MotionVisualProps } from "@/components/visualizers/models";
import { Vector3 } from "three";

import BaseSwarm from "./base";
import { useSwarmVisualConfigContext } from "./config";

const SwarmVisual = ({ motionMapper }: MotionVisualProps) => {
  const { maxDim, pointSize } = useSwarmVisualConfigContext();
  // const { maxDim, pointSize } = useControls({
  //   Particles: folder(
  //     {
  //       maxDim: { value: 10, min: 0.25, max: 10, step: 0.25 },
  //       pointSize: { value: 0.2, min: 0.01, max: 2, step: 0.01 },
  //     },
  //     { collapsed: true }
  //   ),
  // });

  return (
    <>
      <BaseSwarm
        motionMapper={motionMapper}
        maxDim={maxDim}
        pointSize={pointSize}
      />
      <Ground position={new Vector3(0, 0, -1.5 * maxDim)} />
    </>
  );
};

export default SwarmVisual;
