import { useCoordinateMapper, useEnergyTracker } from "@/lib/appState";

import { type TVisual } from "./registry";

const ModalVisual = ({ visual }: { visual: TVisual }) => {
  const coordinateMapper = useCoordinateMapper();
  const energyTracker = useEnergyTracker();
  return (
    <visual.ReactiveComponent
      coordinateMapper={coordinateMapper}
      scalarTracker={energyTracker}
    />
  );
};

export default ModalVisual;
