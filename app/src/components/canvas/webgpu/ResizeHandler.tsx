import { RefObject, useEffect } from "react";
import * as THREE from "three/webgpu";

export function ResizeHandler({
  quality,
  rendererRef,
}: {
  quality: any;
  rendererRef: RefObject<THREE.Renderer | null>;
}) {
  useEffect(() => {
    const handleResize = () => {
      if (rendererRef.current) {
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, [quality]);

  return null;
}
