import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { useRenderPipeline } from "@react-three/tsl";
import { bloom } from "three/addons/tsl/display/BloomNode.js";

export function WebGPUPostProcessing({
  strength = 1.5,
  radius = 0.5,
  threshold = 0.1,
}: {
  strength?: number;
  radius?: number;
  threshold?: number;
}) {
  const size = useThree((s) => s.size);
  const seen = useRef({
    strength,
    radius,
    threshold,
    w: size.width,
    h: size.height,
  });
  const { rebuild } = useRenderPipeline(({ renderPipeline, passes }) => {
    const scenePassColor = passes.scenePass.getTextureNode("output");
    const bloomPass = bloom(scenePassColor, strength, radius, threshold);
    renderPipeline.outputNode = scenePassColor.add(bloomPass);
  });

  useEffect(() => {
    const prev = seen.current;
    if (
      prev.strength === strength &&
      prev.radius === radius &&
      prev.threshold === threshold &&
      prev.w === size.width &&
      prev.h === size.height
    ) {
      return;
    }
    seen.current = {
      strength,
      radius,
      threshold,
      w: size.width,
      h: size.height,
    };
    rebuild();
  }, [rebuild, strength, radius, threshold, size.width, size.height]);

  return null;
}
