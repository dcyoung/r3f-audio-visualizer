import { MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";

interface GroundProps {
  position?: THREE.Vector3;
  size?: number;
}
const Ground = ({
  position = new THREE.Vector3(0, 0, 0),
  size = 250
}: GroundProps): JSX.Element => {
  return (
    <mesh
      position={position}
    >
      <planeGeometry
        args={[size, size]}
      />
      <MeshReflectorMaterial
        mirror={1}
        blur={[500, 100]}
        resolution={1024}
        mixBlur={12}
        mixStrength={1.5}
        roughness={1}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
      />
    </mesh>
  );
}

export default Ground;
