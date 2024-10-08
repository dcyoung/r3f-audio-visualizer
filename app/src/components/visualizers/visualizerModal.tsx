import {
  useCoordinateMapper,
  useEnergyTracker,
  useMotionMapper,
  useTextureMapper,
} from "@/lib/appState";

import { type TVisual } from "./registry";

const ModalVisual = ({ visual }: { visual: TVisual }) => {
  const coordinateMapper = useCoordinateMapper();
  const textureMapper = useTextureMapper();
  const energyTracker = useEnergyTracker();
  const motionMapper = useMotionMapper();
  return (
    <visual.ReactiveComponent
      coordinateMapper={coordinateMapper}
      scalarTracker={energyTracker}
      textureMapper={textureMapper}
      motionMapper={motionMapper}
    />
  );
};

export default ModalVisual;
