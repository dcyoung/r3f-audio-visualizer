import { MeshReflectorMaterial } from "@react-three/drei";
import { type MeshProps } from "@react-three/fiber";

const Ground = ({
  size = 250,
  ...props
}: MeshProps & {
  size?: number;
}) => {
  return (
    <mesh {...props}>
      <planeGeometry args={[size, size]} />
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
};

export default Ground;
