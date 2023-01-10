import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { BoxGeometry, InstancedMesh, Matrix4, MeshBasicMaterial } from "three";
import { Lut } from "three/examples/jsm/math/Lut";
import {
  COORDINATE_TYPE,
  ICoordinateMapper,
  TWO_PI,
} from "../../coordinateMappers/common";

// const MAPPING_MODE_POLAR_2D = "polar_2d";
// const MAPPING_MODE_POLAR_PHI = "polar_phi";
// const MAPPING_MODE_POLAR_THETA = "polar_theta";

interface BaseSphereProps {
  coordinateMapper: ICoordinateMapper;
  radius?: number;
  nPoints?: number;
  cubeSideLength?: number;
  colorLut?: string;
}

const BaseSphere = ({
  coordinateMapper,
  radius = 2,
  nPoints = 800,
  cubeSideLength = 0.05,
  colorLut = "cooltowarm",
}: BaseSphereProps): JSX.Element => {
  const meshRef = useRef<InstancedMesh>(null!);
  const tmpMatrix = useMemo(() => new Matrix4(), []);

  // Recolor
  useEffect(() => {
    const lut = new Lut(colorLut);
    for (let i = 0; i < nPoints; i++) {
      meshRef.current.setColorAt(i, lut.getColor(i / nPoints));
    }
    meshRef.current.instanceColor!.needsUpdate = true;
  });

  useFrame(({ clock }) => {
    // in ms
    const elapsedTimeSec = clock.getElapsedTime();
    let k, phi, theta, x, y, z, effectiveRadius;
    for (let i = 0; i < nPoints; i++) {
      k = i + 0.5;
      // range 0:PI
      phi = Math.acos(1 - (2 * k) / nPoints) % Math.PI;
      // range 0:2PI
      theta = (Math.PI * (1 + Math.sqrt(5)) * k) % TWO_PI;
      x = Math.cos(theta) * Math.sin(phi);
      y = Math.sin(theta) * Math.sin(phi);
      z = Math.cos(phi);

      effectiveRadius =
        radius +
        0.25 *
          radius *
          coordinateMapper.map(
            COORDINATE_TYPE.POLAR,
            theta / TWO_PI, // normalize
            phi / Math.PI, // normalize
            0,
            elapsedTimeSec
          );

      meshRef.current.setMatrixAt(
        i,
        tmpMatrix.setPosition(
          x * effectiveRadius,
          y * effectiveRadius,
          z * effectiveRadius
        )
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
