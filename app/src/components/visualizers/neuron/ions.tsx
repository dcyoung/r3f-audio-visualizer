import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  float,
  Fn,
  hash,
  instancedArray,
  instanceIndex,
  sin,
  uint,
  uniform,
  vec3,
  vec4,
} from "three/tsl";
import {
  AdditiveBlending,
  PlaneGeometry,
  SpriteNodeMaterial,
  type InstancedMesh,
} from "three/webgpu";

const useIonMaterial = (count: number) => {
  const uTime = uniform(float(0.0));
  const positionBuffer = instancedArray(count, "vec3");

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const update = Fn(() => {
    const position = positionBuffer.element(instanceIndex);
    const basePosition = vec3(
      hash(instanceIndex.add(uint(Math.random() * 0xffffff))),
      hash(instanceIndex.add(uint(Math.random() * 0xffffff))),
      hash(instanceIndex.add(uint(Math.random() * 0xffffff))),
    )
      .sub(0.5)
      .mul(vec3(5, 0.2, 5));
    basePosition.y = sin(uTime.add(basePosition.x));
    position.assign(basePosition);
  });

  const finalColor = Fn(() => {
    return vec4(1, 1, 1, 1);
  })();

  useFrame(({ elapsed }) => {
    uTime.value = elapsed * 0.5;
  });

  return {
    colorNode: finalColor,
    positionNode: positionBuffer.toAttribute(),
  };
};

export const IonsVisual = ({
  nParticles = 2 ** 10,
  particleSize = 0.1,
}: {
  nParticles?: number;
  particleSize?: number;
}) => {
  const { colorNode, positionNode } = useIonMaterial(nParticles);
  const meshRef = useRef<InstancedMesh>(null!);

  return (
    <instancedMesh
      ref={meshRef}
      args={[
        new PlaneGeometry(particleSize, particleSize),
        new SpriteNodeMaterial({
          positionNode,
          colorNode,
          transparent: true,
          blending: AdditiveBlending,
          depthWrite: false,
        }),
        nParticles,
      ]}
    />
  );
};
