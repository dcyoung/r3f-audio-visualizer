import { useEffect, useRef } from "react";

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
  const animate = (): void => {
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
    animationRequestRef.current = requestAnimationFrame(animate);
  };

  /**
   * Re-Synchronize the animation loop if the target data destination changes.
   */
  useEffect(() => {
    if (animationRequestRef.current) {
      cancelAnimationFrame(animationRequestRef.current);
    }
    animationRequestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRequestRef.current);
  }, [timeData, quadData]);

  return <></>;
};

export default AudioScopeAnalyzerControls;
