import { useCallback, useEffect, useRef } from "react";
import { useFFTAnalyzerContext } from "@/context/fftAnalyzer";
import type FFTAnalyzer from "@/lib/analyzers/fft";
import {
  useAppStateActions,
  useEnergyInfo,
  useVisualSourceDataX,
} from "@/lib/appState";

export const FFTAnalyzerControls = ({
  analyzer,
}: {
  analyzer: FFTAnalyzer;
}) => {
  const { octaveBandMode, energyMeasure } = useFFTAnalyzerContext();
  const freqData = useVisualSourceDataX();
  const energyInfo = useEnergyInfo();
  const { resizeVisualSourceData } = useAppStateActions();
  const animationRequestRef = useRef<number>(null!);

  /**
   * Transfers data from the analyzer to the target array
   */
  const mapData = useCallback(() => {
    const bars = analyzer.getBars();

    if (freqData.length != bars.length) {
      console.log(`Resizing ${bars.length}`);
      resizeVisualSourceData(bars.length);
      return;
    }

    energyInfo.current = analyzer.getEnergy(energyMeasure);

    bars.forEach(({ value }, index) => {
      freqData[index] = value;
    });
  }, [freqData, analyzer, resizeVisualSourceData, energyInfo, energyMeasure]);

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
  }, [freqData, energyMeasure, mapData]);

  /**
   * Make sure an analyzer exists with the correct mode
   */
  useEffect(() => {
    analyzer.mode = octaveBandMode;
  }, [octaveBandMode, analyzer]);
  return <></>;
};

export default FFTAnalyzerControls;
