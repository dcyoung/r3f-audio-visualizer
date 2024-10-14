import { useCallback, useEffect, useRef } from "react";
import type FFTAnalyzer from "@/lib/analyzers/fft";
import { useAnalyzerFFT, useMappers } from "@/lib/appState";
import { COORDINATE_MAPPER_REGISTRY } from "@/lib/mappers/coordinateMappers/registry";

export const FFTAnalyzerControls = ({
  analyzer,
}: {
  analyzer: FFTAnalyzer;
}) => {
  const { octaveBandMode, energyMeasure } = useAnalyzerFFT();
  const { energyTracker } = useMappers();
  const coordinateMapperData =
    COORDINATE_MAPPER_REGISTRY.data.hooks.useInstance();
  const { setParams } = COORDINATE_MAPPER_REGISTRY.data.hooks.useActions();
  const animationRequestRef = useRef<number>(null!);

  /**
   * Transfers data from the analyzer to the target array
   */
  const mapData = useCallback(() => {
    const bars = analyzer.getBars();

    if (coordinateMapperData.data.length != bars.length) {
      console.log(`Resizing ${bars.length}`);
      setParams({ size: bars.length });
      return;
    }

    energyTracker?.set(analyzer.getEnergy(energyMeasure));

    bars.forEach(({ value }, index) => {
      coordinateMapperData.data[index] = value;
    });
  }, [coordinateMapperData, analyzer, energyTracker, energyMeasure, setParams]);

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
