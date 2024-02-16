import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Euler, MathUtils, Vector3, type Group } from "three";

import BaseDoubleHelix, { type BaseDoubleHelixProps } from "./base";

const MultiStrand = (props: BaseDoubleHelixProps) => {
  const strandRefs = [
    useRef<Group>(null!),
    useRef<Group>(null!),
    useRef<Group>(null!),
    useRef<Group>(null!),
    useRef<Group>(null!),
  ];
  const strandCount = strandRefs.length;
  const bounds = 15;

  const strandPositions = Array.from({ length: strandCount }).map((_, i) => {
    return new Vector3()
      .fromArray(
        Array.from({ length: 3 }).map(
          (_, j) => 2 * MathUtils.seededRandom(i + j) - 1,
        ),
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
          MathUtils.seededRandom(strandIdx) / speed,
      );
      strandRef.current.position.set(
        tmpVec.x * norm,
        tmpVec.y * norm,
        tmpVec.z * norm,
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
        <BaseDoubleHelix
          key={i}
          ref={ref}
          position={strandPositions[i]}
          rotation={
            new Euler(
              ...Array.from({ length: 3 }).map(
                (_, j) => Math.PI * (2 * MathUtils.seededRandom(i + j) - 1),
              ),
            )
          }
          {...props}
        />
      ))}
    </>
  );
};

export default MultiStrand;
