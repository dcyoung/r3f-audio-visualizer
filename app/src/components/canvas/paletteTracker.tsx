import { useVisualContext } from "@/context/visual";
import { ScalarMovingAvgEventDetector } from "@/lib/analyzers/scalarEventDetector";
import { useAppStateActions, useEnergyTracker } from "@/lib/appState";
import { type IScalarTracker } from "@/lib/mappers/valueTracker/common";
import { useFrame } from "@react-three/fiber";

const PaletteUpdater = ({
  scalarTracker,
}: {
  scalarTracker: IScalarTracker;
}) => {
  const { paletteTrackEnergy: enabled } = useVisualContext();
  const detector = new ScalarMovingAvgEventDetector(0.5, 50, 500);
  const { nextPalette } = useAppStateActions();

  useFrame(() => {
    if (!enabled) {
      return;
    }

    if (detector.step(scalarTracker.get())) {
      nextPalette();
    }
  });

  return <></>;
};

export const PaletteTracker = () => {
  const energyTracker = useEnergyTracker();
  return <PaletteUpdater scalarTracker={energyTracker} />;
};
