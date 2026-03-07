import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber/webgpu";
import { bloom } from "three/addons/tsl/display/BloomNode.js";
import { film } from "three/addons/tsl/display/FilmNode.js";
import { float, pass, screenUV, smoothstep, vec4 } from "three/tsl";
import * as THREE from "three/webgpu";

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
  const { renderer, scene, camera, size } = useThree();
  const postProcessingRef = useRef<THREE.PostProcessing | null>(null);

  useEffect(() => {
    if (!renderer || !scene || !camera) return;

    const scenePass = pass(scene, camera);
    const scenePassColor = scenePass.getTextureNode("output");

    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
    let result: any = scenePassColor;

    if (bloomStrength > 0) {
      const bloomPass = bloom(
        scenePassColor,
        bloomStrength,
        bloomRadius,
        bloomThreshold,
      );
      result = result.add(bloomPass);
    }

    if (noiseIntensity > 0) {
      result = film(result, float(noiseIntensity));
    }

    if (vignetteDarkness > 0) {
      const uv = screenUV;
      const dist = uv.sub(0.5).length();
      const vignette = smoothstep(float(0.8), float(vignetteOffset), dist);
      result = vec4(result.rgb.mul(vignette), result.a);
    }

    const postProcessing = new THREE.PostProcessing(
      renderer as unknown as THREE.Renderer,
    );
    postProcessing.outputNode = result;
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
    postProcessingRef.current = postProcessing;

    return () => {
      postProcessingRef.current = null;
    };
  }, [
    renderer,
    scene,
    camera,
    size,
    bloomStrength,
    bloomRadius,
    bloomThreshold,
    noiseIntensity,
    vignetteOffset,
    vignetteDarkness,
  ]);

  useFrame(
    ({ renderer: r }) => {
      if (postProcessingRef.current) {
        r.clear();
        postProcessingRef.current.render();
      }
    },
    { phase: "render" },
  );

  return null;
}
