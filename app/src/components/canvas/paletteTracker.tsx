import { ScalarMovingAvgEventDetector } from "@/lib/analyzers/scalarEventDetector";
import { useAppearance, useAppStateActions, useMappers } from "@/lib/appState";
import { type IScalarTracker } from "@/lib/mappers/valueTracker/common";
import { useFrame } from "@react-three/fiber";

const PaletteUpdater = ({
  scalarTracker,
}: {
  scalarTracker: IScalarTracker;
}) => {
  const { paletteTrackEnergy: enabled } = useAppearance();
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
  const { energyTracker } = useMappers();
  return energyTracker ? (
    <PaletteUpdater scalarTracker={energyTracker} />
  ) : null;
};
