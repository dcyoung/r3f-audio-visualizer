import { useVisualContext } from "@/context/visual";
import { ScalarMovingAvgEventDetector } from "@/lib/analyzers/scalarEventDetector";
import { useAppStateActions, useEnergyInfo } from "@/lib/appState";
import { type IScalarTracker } from "@/lib/mappers/valueTracker/common";
import { EnergyTracker } from "@/lib/mappers/valueTracker/energyTracker";
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

    if (detector.step(scalarTracker.getNormalizedValue())) {
      nextPalette();
    }
  });

  return <></>;
};

export const PaletteTracker = () => {
  const energyInfo = useEnergyInfo();
  const scalarTracker = new EnergyTracker(energyInfo);

  return <PaletteUpdater scalarTracker={scalarTracker} />;
};
