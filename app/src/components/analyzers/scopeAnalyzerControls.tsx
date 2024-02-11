import { useCallback, useEffect, useRef } from "react";
import type ScopeAnalyzer from "@/lib/analyzers/scope";
import {
  useAppStateActions,
  useVisualSourceDataX,
  useVisualSourceDataY,
} from "@/lib/appState";

export const AudioScopeAnalyzerControls = ({
  analyzer,
}: {
  analyzer: ScopeAnalyzer;
}) => {
  const timeData = useVisualSourceDataX();
  const quadData = useVisualSourceDataY();
  const { resizeVisualSourceData } = useAppStateActions();
  const animationRequestRef = useRef<number>(null!);

  /**
   * Transfers data from the analyzer to the target arrays
   */
  const mapData = useCallback(() => {
    // Check if the state sizes need to be updated
    const targetLength = analyzer.quadSamples.length;
    if (timeData.length !== targetLength || quadData.length !== targetLength) {
      console.log(`Resizing ${targetLength}`);
      resizeVisualSourceData(targetLength);
      return;
    }
    // Copy the data over to state
    analyzer.timeSamples.forEach((v, index) => {
      timeData[index] = v;
    });
    analyzer.quadSamples.forEach((v, index) => {
      quadData[index] = v;
    });
  }, [timeData, quadData, analyzer, resizeVisualSourceData]);

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
  }, [timeData, quadData, mapData]);

  return <></>;
};

export default AudioScopeAnalyzerControls;
