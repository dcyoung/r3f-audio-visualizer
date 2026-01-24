import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { bloom } from "three/addons/tsl/display/BloomNode.js";
import { smaa } from "three/addons/tsl/display/SMAANode.js";
import { ssr } from "three/addons/tsl/display/SSRNode.js";
import {
  blendColor,
  depth,
  emissive,
  metalness,
  mrt,
  output,
  pass,
  transformedNormalView,
} from "three/tsl";
import * as THREE from "three/webgpu";

export function WebGPUPostProcessing({
  strength = 2.5,
  radius = 0.1,
  quality = "default",
}) {
  const { gl: renderer, scene, camera, size } = useThree();
  const postProcessingRef = useRef<THREE.PostProcessing | null>(null);

  useEffect(() => {
    if (!renderer || !scene || !camera) return;

    // Create post-processing setup with specific filters
    const scenePass = pass(scene, camera);

    // Setup Multiple Render Targets (MRT)
    scenePass.setMRT(
      mrt({
        output: output,
        normal: transformedNormalView,
        metalness: metalness,
        depth: depth,
        emissive: emissive,
      }),
    );

    // Get texture nodes
    const scenePassColor = scenePass.getTextureNode("output");
    const scenePassNormal = scenePass.getTextureNode("normal");
    const scenePassDepth = scenePass.getTextureNode("depth");
    const scenePassMetalness = scenePass.getTextureNode("metalness");
    const scenePassEmissive = scenePass.getTextureNode("emissive");

    // Create SSR pass
    const ssrPass = ssr(
      scenePassColor,
      scenePassDepth,
      scenePassNormal,
      scenePassMetalness,
      camera,
    );
    ssrPass.resolutionScale = 0.5;
    ssrPass.maxDistance.value = 1.5;
    ssrPass.opacity.value = 0.5;
    ssrPass.thickness.value = 0.015;

    // Create bloom pass
    const bloomPass = bloom(scenePassEmissive, strength, radius, 0.6);

    // Blend SSR over beauty with SMAA
    const outputNode = smaa(blendColor(scenePassColor.add(bloomPass), ssrPass));

    // Setup post-processing
    const postProcessing = new THREE.PostProcessing(
      renderer as unknown as THREE.Renderer,
    );
    postProcessing.outputNode = outputNode;
    postProcessingRef.current = postProcessing;

    // // Handle window resize
    // if (postProcessingRef.current?.setSize) {
    //   postProcessingRef.current?.setSize(size.width, size.height);
    //   postProcessingRef.current.needsUpdate = true;
    // }

    return () => {
      postProcessingRef.current = null;
    };
  }, [renderer, scene, camera, size, strength, radius, quality]);

  useFrame(({ gl }) => {
    if (postProcessingRef.current) {
      gl.clear();
      postProcessingRef.current.render();
    }
  }, 1);

  return null;
}
