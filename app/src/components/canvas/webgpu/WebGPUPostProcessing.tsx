import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber/webgpu";
import { bloom } from "three/addons/tsl/display/BloomNode.js";
import { pass } from "three/tsl";
import * as THREE from "three/webgpu";

export function WebGPUPostProcessing({
  strength = 1.5,
  radius = 0.5,
  threshold = 0.1,
}: {
  strength?: number;
  radius?: number;
  threshold?: number;
}) {
  const { renderer, scene, camera, size } = useThree();
  const postProcessingRef = useRef<THREE.PostProcessing | null>(null);

  useEffect(() => {
    if (!renderer || !scene || !camera) return;

    const scenePass = pass(scene, camera);
    const scenePassColor = scenePass.getTextureNode("output");

    const bloomPass = bloom(scenePassColor, strength, radius, threshold);
    const outputNode = scenePassColor.add(bloomPass);

    const postProcessing = new THREE.PostProcessing(
      renderer as unknown as THREE.Renderer,
    );
    postProcessing.outputNode = outputNode;
    postProcessingRef.current = postProcessing;

    return () => {
      postProcessingRef.current = null;
    };
  }, [renderer, scene, camera, size, strength, radius, threshold]);

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
