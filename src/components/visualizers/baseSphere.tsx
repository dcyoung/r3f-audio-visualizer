import { useFrame } from "@react-three/fiber";
import { folder, useControls } from "leva";
import { useEffect, useMemo, useRef } from "react";
import { BoxGeometry, InstancedMesh, Matrix4, MeshBasicMaterial } from "three";
import { Lut } from "three/examples/jsm/math/Lut";

const MAPPING_MODE_POLAR_2D = "polar_2d";
const MAPPING_MODE_POLAR_PHI = "polar_phi";
const MAPPING_MODE_POLAR_THETA = "polar_theta";
const NORM_QUADRANT_HYPOTENUSE = Math.hypot(0.5, 0.5);

const getNorm1DTargetForNorm2DCoord = (
  normTheta: number,
  normPhi: number,
  mapMode: string = MAPPING_MODE_POLAR_2D
): number => {
  switch (mapMode) {
    case MAPPING_MODE_POLAR_PHI:
      return normPhi;
    case MAPPING_MODE_POLAR_THETA:
      return normTheta;
    case MAPPING_MODE_POLAR_2D:
    default:
      return (
        Math.hypot(normTheta - 0.5, normPhi - 0.5) / NORM_QUADRANT_HYPOTENUSE
      );
  }
};

interface BaseSphereProps {
  getValueForNormalizedCoord: (
    theta: number,
    phi: number,
    mapMode: string,
    elapsedTimeSec?: number
  ) => number;
}

const BaseSphere = ({
  getValueForNormalizedCoord,
}: BaseSphereProps): JSX.Element => {
  const { radius, nPoints, cubeSideLength, mapMode } = useControls({
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
        mapMode: {
          value: MAPPING_MODE_POLAR_2D,
          options: [
            MAPPING_MODE_POLAR_2D,
            MAPPING_MODE_POLAR_PHI,
            MAPPING_MODE_POLAR_THETA,
          ],
        },
      },
      { collapsed: true }
    ),
  });

  const meshRef = useRef<InstancedMesh>(null!);
  const tmpMatrix = useMemo(() => new Matrix4(), []);

  useEffect(() => {
    const lut = new Lut("cooltowarm");
    for (let i = 0; i < nPoints; i++) {
      meshRef.current.setColorAt(i, lut.getColor(i / nPoints));
    }
    meshRef.current.instanceColor!.needsUpdate = true;
  }, [nPoints, radius, cubeSideLength, mapMode, getValueForNormalizedCoord]);

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
        radius +
        0.25 *
          radius *
          getValueForNormalizedCoord(
            theta / (2 * Math.PI), // normalize
            phi / Math.PI, // normalize
            mapMode,
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

export {
  BaseSphere as default,
  MAPPING_MODE_POLAR_2D,
  MAPPING_MODE_POLAR_PHI,
  MAPPING_MODE_POLAR_THETA,
  getNorm1DTargetForNorm2DCoord,
};
