/*

Rapid influx of sodium ---> Neg Current INa
followed by slower efflux of potassium ---> Pos Current IK


for a positive ion,
postitive current (+I) means 
    efflux of ion
    concentration of ion is higher inside the cell
negative current (-I) means influx of ion


At rest, neuron has 
    a higher concentration of sodium ions (Na+) outside the cell 
    a higher concentration of potassium ions (K+) inside the cell
*/
import { use, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  float,
  Fn,
  hash,
  If,
  instancedArray,
  instanceIndex,
  mix,
  sin,
  texture,
  uint,
  uniform,
  vec3,
  vec4,
} from "three/tsl";
import {
  AdditiveBlending,
  DoubleSide,
  InstancedMesh,
  MeshStandardNodeMaterial,
  PlaneGeometry,
  SpriteNodeMaterial,
} from "three/webgpu";

const useIonMaterial = (count: number) => {
  // Create uniform and shader calculations
  const uTime = uniform(float(0.0));
  const positionBuffer = instancedArray(count, "vec3");
  // const velocityBuffer = instancedArray(count, "vec3");
  // const init = Fn(() => {
  //   const position = positionBuffer.element(instanceIndex);
  //   const basePosition = vec3(
  //     hash(instanceIndex.add(uint(Math.random() * 0xffffff))),
  //     hash(instanceIndex.add(uint(Math.random() * 0xffffff))),
  //     hash(instanceIndex.add(uint(Math.random() * 0xffffff))),
  //   )
  //     .sub(0.5)
  //     .mul(vec3(5, 0.2, 5));
  //   position.assign(basePosition);
  // });

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

  // create uniforms and shader calculations
  const finalColor = Fn(() => {
    return vec4(1, 1, 1, 1);
  })();

  // Update time in animation frame
  useFrame((delta) => {
    uTime.value += delta * 0.5;
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
  particleSize: number;
}) => {
  const { colorNode, positionNode } = useIonMaterial(nParticles);
  const meshRef = useRef<InstancedMesh>(null!);
  // const material = new THREE.SpriteNodeMaterial({
  //   transparent: true,
  //   blending: THREE.AdditiveBlending,
  //   depthWrite: false,
  // });

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
        // new MeshStandardNodeMaterial({
        //   transparent: true,
        //   colorNode,
        //   blending: AdditiveBlending,
        //   depthWrite: false,
        //   side: DoubleSide,
        //   emissive: colorNode,
        // }),
        nParticles,
      ]}
    />
  );
  // return (
  //   <instancedMesh
  //     ref={meshRef}
  //     // castShadow={true}
  //     // receiveShadow={true}
  //     // args={[new BoxGeometry(), new MeshBasicMaterial(), nPerSide ** 3]}
  //   >
  //     <bufferGeometry>
  //       <bufferAttribute
  //         attach="attributes-position"
  //         array={new Float32Array(nParticles * 3)}
  //         count={nParticles}
  //         itemSize={3}
  //       />
  //     </bufferGeometry>
  //     <pointsMaterial attach="material" size={1} />
  //   </instancedMesh>
  // );
};
