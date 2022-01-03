import { useTexture, Reflector } from "@react-three/drei";
import * as THREE from "three";

function Ground(props) {
  const size = 250;
  const [floor, normal] = useTexture(
    [
      process.env.PUBLIC_URL + "/surface.jpg",
      process.env.PUBLIC_URL + "/surface_normal.jpg",
    ],
    {
      wrapS: THREE.MirroredRepeatWrapping,
      wrapT: THREE.MirroredRepeatWrapping,
      repeat: [size / 8, size / 8],
    }
  );
  return (
    <Reflector resolution={1024} args={[size, size]} {...props}>
      {(Material, props) => (
        <Material
          color="#f0f0f0"
          metalness={0}
          roughnessMap={floor}
          normalMap={normal}
          normalScale={[2, 2]}
          {...props}
        />
      )}
    </Reflector>
  );
}

export default Ground;
