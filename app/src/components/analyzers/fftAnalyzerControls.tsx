import { useCallback, useEffect, useRef } from "react";
import type FFTAnalyzer from "@/lib/analyzers/fft";
import { useAnalyzerFFT, useAppStateActions, useMappers } from "@/lib/appState";
import { CoordinateMapper_Data } from "@/lib/mappers/coordinateMappers/data";

export const FFTAnalyzerControls = ({
  analyzer,
}: {
  analyzer: FFTAnalyzer;
}) => {
  const { octaveBandMode, energyMeasure } = useAnalyzerFFT();
  const { coordinateMapperData, energyTracker } = useMappers();
  const { setMappers } = useAppStateActions();
  const animationRequestRef = useRef<number>(null!);

  /**
   * Transfers data from the analyzer to the target array
   */
  const mapData = useCallback(() => {
    const bars = analyzer.getBars();

    if (coordinateMapperData.data.length != bars.length) {
      console.log(`Resizing ${bars.length}`);
      setMappers({
        coordinateMapperData: new CoordinateMapper_Data({
          ...coordinateMapperData.params,
          size: bars.length,
        }),
      });
      return;
    }

    energyTracker?.set(analyzer.getEnergy(energyMeasure));

    bars.forEach(({ value }, index) => {
      coordinateMapperData.data[index] = value;
    });
  }, [
    coordinateMapperData,
    analyzer,
    energyTracker,
    energyMeasure,
    setMappers,
  ]);

  /**
   * Re-Synchronize the animation loop if the target data destination changes.
   */
  useEffect(() => {
    if (animationRequestRef.current) {
      cancelAnimationFrame(animationRequestRef.current);
    }
    const animate = (): void => {
      mapData();
      animationRequestRef.current = requestAnimationFrame(animate);
    };
    animationRequestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRequestRef.current);
  }, [coordinateMapperData, energyMeasure, mapData]);

  /**
   * Make sure an analyzer exists with the correct mode
   */
  useEffect(() => {
    analyzer.mode = octaveBandMode;
  }, [octaveBandMode, analyzer]);
  return <></>;
};

export default FFTAnalyzerControls;
