import { folder, useControls } from "leva";
import BaseDoubleHelix from "./base";
import { VisualProps } from "../common";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Group, MathUtils, Vector3 } from "three";

const DNAVisual = ({ coordinateMapper }: VisualProps): JSX.Element => {
  const {
    helixLength,
    helixRadius,
    helixWindingSeparation,
    strandRadius,
    baseSpacing,
    strandOffsetRad,
    mirrorEffects,
  } = useControls({
    "Visual - DNA": folder(
      {
        helixLength: { value: 15, min: 5, max: 100, step: 5 },
        helixRadius: { value: 1, min: 1, max: 5, step: 1 },
        helixWindingSeparation: { value: 10, min: 5, max: 50, step: 1 },
        strandRadius: { value: 0.1, min: 0.1, max: 0.3, step: 0.1 },
        baseSpacing: { value: 0.35, min: 0.1, max: 2.0, step: 0.05 },
        strandOffsetRad: {
          value: Math.PI / 2,
          min: Math.PI / 4,
          max: Math.PI,
          step: Math.PI / 8,
        },
        mirrorEffects: true,
      },
      { collapsed: true }
    ),
  });

  const bounds = 15;
  const strandCount = 12;
  const strandRefs = Array.from({ length: strandCount }).map((x) =>
    useRef<Group>(null!)
  );
  const strandPositions = Array.from({ length: strandCount }).map((x, i) => {
    return new Vector3()
      .fromArray(
        Array.from({ length: 3 }).map(
          (_, j) => 2 * MathUtils.seededRandom(i + j) - 1
        )
      )
      .normalize()
      .multiplyScalar(bounds);
  });

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const amplitude = 0.0005;
    const speed = 0.05;
    let tmpVec;
    let norm = 0;
    strandRefs.forEach((strandRef, strandIdx) => {
      if (!strandRef.current) {
        return;
      }
      tmpVec = strandPositions[strandIdx];
      norm = Math.sin(
        speed * (0.5 + 0.5 * MathUtils.seededRandom(strandIdx)) * t +
          MathUtils.seededRandom(strandIdx) / speed
      );
      strandRef.current.position.set(
        tmpVec.x * norm,
        tmpVec.y * norm,
        tmpVec.z * norm
      );
      strandRef.current.rotation.z +=
        amplitude *
        Math.cos((0.5 + 0.5 * MathUtils.seededRandom(strandIdx)) * t);
      strandRef.current.rotation.y +=
        amplitude *
        Math.cos((0.5 + 0.5 * MathUtils.seededRandom(strandIdx)) * t);
    });
  });

  return (
    <>
      {strandRefs.map((ref, i) => (
        <group
          key={i}
          ref={ref}
          position={strandPositions[i]}
          rotation={Array.from({ length: 3 }).map(
            (_, j) => Math.PI * (2 * MathUtils.seededRandom(i + j) - 1)
          )}
        >
          <BaseDoubleHelix
            coordinateMapper={coordinateMapper}
            helixLength={helixLength}
            helixRadius={helixRadius}
            helixWindingSeparation={helixWindingSeparation}
            strandRadius={strandRadius}
            baseSpacing={baseSpacing}
            strandOffsetRad={strandOffsetRad}
            mirrorEffects={mirrorEffects}
          />
        </group>
      ))}
    </>
  );
};

export default DNAVisual;
