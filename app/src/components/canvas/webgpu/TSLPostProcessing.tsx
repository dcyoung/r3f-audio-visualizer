import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { useRenderPipeline } from "@react-three/tsl";
import { bloom } from "three/addons/tsl/display/BloomNode.js";
import { film } from "three/addons/tsl/display/FilmNode.js";
import { float, screenUV, smoothstep, vec4 } from "three/tsl";
import type { Node } from "three/webgpu";

/**
 * Lightweight TSL post-processing for individual visualizers.
 * Bloom + optional noise + optional vignette.
 */
export function TSLBloomPostProcessing({
  bloomStrength = 0.5,
  bloomRadius = 0.4,
  bloomThreshold = 0.6,
  noiseIntensity = 0,
  vignetteOffset = 0.1,
  vignetteDarkness = 0,
}: {
  bloomStrength?: number;
  bloomRadius?: number;
  bloomThreshold?: number;
  noiseIntensity?: number;
  vignetteOffset?: number;
  vignetteDarkness?: number;
}) {
  const size = useThree((s) => s.size);
  const seen = useRef({
    bloomStrength,
    bloomRadius,
    bloomThreshold,
    noiseIntensity,
    vignetteOffset,
    vignetteDarkness,
    w: size.width,
    h: size.height,
  });
  const { rebuild } = useRenderPipeline(({ renderPipeline, passes }) => {
    const scenePassColor = passes.scenePass.getTextureNode("output");
    let result: Node = scenePassColor;

    if (bloomStrength > 0) {
      result = scenePassColor.add(
        bloom(scenePassColor, bloomStrength, bloomRadius, bloomThreshold),
      );
    }

    if (noiseIntensity > 0) {
      result = film(result, float(noiseIntensity));
    }

    if (vignetteDarkness > 0) {
      const dist = screenUV.sub(0.5).length();
      const vignette = smoothstep(float(0.8), float(vignetteOffset), dist);
      const color = result as typeof scenePassColor;
      result = vec4(color.rgb.mul(vignette), color.a);
    }

    renderPipeline.outputNode = result;
  });

  useEffect(() => {
    const prev = seen.current;
    if (
      prev.bloomStrength === bloomStrength &&
      prev.bloomRadius === bloomRadius &&
      prev.bloomThreshold === bloomThreshold &&
      prev.noiseIntensity === noiseIntensity &&
      prev.vignetteOffset === vignetteOffset &&
      prev.vignetteDarkness === vignetteDarkness &&
      prev.w === size.width &&
      prev.h === size.height
    ) {
      return;
    }
    seen.current = {
      bloomStrength,
      bloomRadius,
      bloomThreshold,
      noiseIntensity,
      vignetteOffset,
      vignetteDarkness,
      w: size.width,
      h: size.height,
    };
    rebuild();
  }, [
    rebuild,
    bloomStrength,
    bloomRadius,
    bloomThreshold,
    noiseIntensity,
    vignetteOffset,
    vignetteDarkness,
    size.width,
    size.height,
  ]);

  return null;
}
