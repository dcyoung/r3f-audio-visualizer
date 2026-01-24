import { type ThreeElements } from "@react-three/fiber";

const Ground = ({
  size = 250,
  ...props
}: ThreeElements["mesh"] & {
  size?: number;
}) => {
  return (
    <mesh {...props} receiveShadow>
      <planeGeometry args={[size, size]} />
      <meshPhysicalMaterial
        color="black"
        metalness={1}
        roughness={0.01}
        // clearcoat={1}
      />
    </mesh>
  );
};

export default Ground;
