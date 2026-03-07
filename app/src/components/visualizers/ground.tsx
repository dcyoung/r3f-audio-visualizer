import { useEffect, useRef } from "react";
import { color, reflector } from "three/tsl";
import { MeshPhongNodeMaterial } from "three/webgpu";
import type { Mesh as THREEMesh, Vector3 } from "three/webgpu";

const Ground = ({
  size = 250,
  position,
}: {
  size?: number;
  position?: Vector3;
}) => {
  const meshRef = useRef<THREEMesh>(null);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
    const groundReflector = reflector({ resolutionScale: 0.5 }) as any;

    const mat = new MeshPhongNodeMaterial({ color: 0x111111 });
    mat.colorNode = color(0x080808);
    // TODO: remove cast once @types/three adds emissiveNode to NodeMaterial / MeshPhongNodeMaterial
    (mat as any).emissiveNode = groundReflector.mul(0.25);

    const prevMat = mesh.material;
    mesh.material = mat;

    const target = groundReflector.target;
    mesh.add(target);
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */

    return () => {
      mesh.remove(target); // eslint-disable-line @typescript-eslint/no-unsafe-argument
      mesh.material = prevMat;
      mat.dispose();
    };
  }, [size]);

  return (
    <mesh
      ref={meshRef as any} // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
      position={position ? [position.x, position.y, position.z] : undefined}
    >
      <planeGeometry args={[size, size]} />
    </mesh>
  );
};

export default Ground;
