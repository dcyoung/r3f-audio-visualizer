import { useCallback, useEffect, useRef } from "react";
import type ScopeAnalyzer from "@/lib/analyzers/scope";
import { useAppStateActions, useMappers } from "@/lib/appState";

export const AudioScopeAnalyzerControls = ({
  analyzer,
}: {
  analyzer: ScopeAnalyzer;
}) => {
  const { textureMapper } = useMappers();
  const { setMappers } = useAppStateActions();
  const animationRequestRef = useRef<number>(null!);

  /**
   * Transfers data from the analyzer to the target arrays
   */
  const mapData = useCallback(() => {
    const timeData = textureMapper.samplesX;
    const quadData = textureMapper.samplesY;
    // Check if the state sizes need to be updated
    const targetLength = analyzer.quadSamples.length;
    if (timeData.length !== targetLength || quadData.length !== targetLength) {
      console.log(`Resizing ${targetLength}`);
      setMappers({
        textureMapper: textureMapper.clone({
          size: targetLength,
        }),
      });
      return;
    }
    // Copy the data over to state
    analyzer.timeSamples.forEach((v, index) => {
      timeData[index] = v;
    });
    analyzer.quadSamples.forEach((v, index) => {
      quadData[index] = v;
    });
  }, [analyzer, setMappers, textureMapper]);

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
  }, [textureMapper, mapData]);

  return <></>;
};

export default AudioScopeAnalyzerControls;
