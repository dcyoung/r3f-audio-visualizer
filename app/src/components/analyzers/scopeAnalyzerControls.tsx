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
  const animationRequestRef = useRef<number | null>(null);

  /**
   * Transfers data from the analyzer to the target arrays
   */
  const mapData = useCallback(() => {
    const targetLength = analyzer.quadSamples.length;
    if (textureMapper.samplesX.length !== targetLength) {
      console.log(`Resizing ${targetLength}`);
      setMappers({
        textureMapper: textureMapper.clone({
          size: targetLength,
        }),
      });
      return;
    }

    analyzer.computeColorData();

    textureMapper.samplesX.set(analyzer.timeSamples);
    textureMapper.samplesY.set(analyzer.quadSamples);
    textureMapper.angularVelocity.set(analyzer.angularVelocity);
    textureMapper.noise.set(analyzer.noise);
  }, [analyzer, setMappers, textureMapper]);

  /**
   * Re-Synchronize the animation loop if the target data destination changes.
   */
  useEffect(() => {
    if (animationRequestRef.current !== null) {
      cancelAnimationFrame(animationRequestRef.current);
    }
    const animate = (): void => {
      mapData();
      animationRequestRef.current = requestAnimationFrame(animate);
    };
    animationRequestRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRequestRef.current !== null) {
        cancelAnimationFrame(animationRequestRef.current);
      }
    };
  }, [textureMapper, mapData]);

  return <></>;
};

export default AudioScopeAnalyzerControls;
