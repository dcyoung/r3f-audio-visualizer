import { useMemo, useRef } from "react";
import { type TextureMapper } from "@/lib/mappers/textureMappers/textureMapper";
import { useFrame, useThree } from "@react-three/fiber";
import {
  AdditiveBlending,
  Vector2,
  type ShaderMaterial,
} from "three";

import { type IScopeSettings } from "./reactive";
import fragmentShader from "./shaders/fragment";
import vertexShader from "./shaders/vertex";

const BaseScopeVisual = ({
  textureMapper,
  nParticles,
  pointScale,
  baseHue,
  decay,
  desaturation,
  minSaturation,
}: {
  textureMapper: TextureMapper;
} & IScopeSettings) => {
  const { tex, textureData } = useMemo(
    () => textureMapper.generateSupportedTextureAndData(),
    [textureMapper],
  );
  const matRef = useRef<ShaderMaterial>(null);
  const size = useThree((state) => state.size);

  const particlesIndices = useMemo(
    () => new Float32Array(nParticles).fill(0).map((_, i) => i),
    [nParticles],
  );
  const particlesPosition = useMemo(
    () => new Float32Array(nParticles * 3).fill(0),
    [nParticles],
  );

  const resolution = useMemo(
    () => new Vector2(size.width, size.height),
    [size.width, size.height],
  );

  const uniformsRef = useRef({
    samples: { value: tex },
    n_samples: { value: nParticles },
    resolution: { value: resolution },
    u_point_scale: { value: pointScale },
    u_base_hue: { value: baseHue },
    u_decay: { value: decay },
    u_desaturation: { value: desaturation },
    u_min_saturation: { value: minSaturation },
  });

  const uniforms = uniformsRef.current;
  uniforms.samples.value = tex;
  uniforms.n_samples.value = nParticles;
  uniforms.resolution.value = resolution;
  uniforms.u_point_scale.value = pointScale;
  uniforms.u_base_hue.value = baseHue;
  uniforms.u_decay.value = decay;
  uniforms.u_desaturation.value = desaturation;
  uniforms.u_min_saturation.value = minSaturation;

  useFrame(() => {
    textureMapper.updateTextureData(textureData);
    tex.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particlesPosition, 3]}
        />
        <bufferAttribute
          attach="attributes-index"
          args={[particlesIndices, 1]}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
      />
    </points>
  );
};

export default BaseScopeVisual;
