import { useFrame } from "@react-three/fiber";
import { folder, useControls } from "leva";
import { useMemo, useRef } from "react";
import { BoxGeometry, InstancedMesh, Matrix4, MeshBasicMaterial } from "three";

interface BaseSphereProps {
  getValueForNormalizedCoord: (
    theta: number,
    phi: number,
    elapsedTimeSec?: number
  ) => number;
}

const BaseSphere = ({
  getValueForNormalizedCoord,
}: BaseSphereProps): JSX.Element => {
  const { radius, nPoints, cubeSideLength } = useControls({
    Sphere: folder(
      {
        radius: { value: 2, min: 0.25, max: 3, step: 0.25 },
        nPoints: { value: 800, min: 100, max: 2000, step: 25 },
        cubeSideLength: {
          value: 0.05,
          min: 0.01,
          max: 0.5,
          step: 0.005,
        },
      },
      { collapsed: true }
    ),
  });

  const meshRef = useRef<InstancedMesh>(null!);
  const tmpMatrix = useMemo(() => new Matrix4(), []);

  useFrame(({ clock }) => {
    // in ms
    const elapsedTimeSec = clock.getElapsedTime();
    let k, phi, theta, x, y, z, effectiveRadius;
    for (let i = 0; i < nPoints; i++) {
      k = i + 0.5;
      // range 0:PI
      phi = Math.acos(1 - (2 * k) / nPoints) % Math.PI;
      // range 0:2PI
      theta = (Math.PI * (1 + Math.sqrt(5)) * k) % (2 * Math.PI);
      x = Math.cos(theta) * Math.sin(phi);
      y = Math.sin(theta) * Math.sin(phi);
      z = Math.cos(phi);

      effectiveRadius =
        radius + getValueForNormalizedCoord(theta, phi, elapsedTimeSec);

      meshRef.current.setMatrixAt(
        i,
        tmpMatrix.setPosition(
          x * effectiveRadius,
          y * effectiveRadius,
          z * effectiveRadius
        )
        // tmpMatrix.setPosition(x, y, z)
      );
    }

    // Update the instance
    meshRef.current.instanceMatrix!.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      castShadow={true}
      receiveShadow={true}
      args={[new BoxGeometry(), new MeshBasicMaterial(), nPoints]}
    >
      <boxGeometry
        attach="geometry"
        args={[cubeSideLength, cubeSideLength, cubeSideLength, 1]}
      />
      <meshBasicMaterial attach="material" color={"white"} toneMapped={false} />
    </instancedMesh>
  );
};

export default BaseSphere;
