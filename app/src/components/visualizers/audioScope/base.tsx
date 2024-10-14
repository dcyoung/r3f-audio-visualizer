import { Fragment, useEffect, useMemo, useRef } from "react";
import { type TextureMapper } from "@/lib/mappers/textureMappers/textureMapper";
import { useFrame, useThree } from "@react-three/fiber";
import { Color, Vector2, Vector3, type ShaderMaterial } from "three";

import fragmentShader from "./shaders/fragment";
import vertexShader from "./shaders/vertex";

const BaseScopeVisual = ({
  textureMapper,
  nParticles = 512,
  usePoints = true,
  interpolate = false,
  color = new Color("green"),
}: {
  textureMapper: TextureMapper;
  nParticles?: number;
  usePoints?: boolean;
  interpolate?: boolean;
  color?: Color;
}) => {
  const { tex, textureData } = textureMapper.generateSupportedTextureAndData();
  tex.needsUpdate = true;
  const matRef = useRef<ShaderMaterial>(null!);
  const size = useThree((state) => state.size);
  const particlesIndices = useMemo(() => {
    return new Float32Array(nParticles).fill(0).map((_, i) => i);
  }, [nParticles]);
  const particlesPosition = useMemo(() => {
    return new Float32Array(nParticles * 3).fill(0);
  }, [nParticles]);
  const uniforms = useMemo(
    () => ({
      // FRAGMENT
      color: {
        value: new Vector3(),
      },
      // VERTEX
      max_amplitude: {
        value: textureMapper.maxAmplitude,
      },
      sample_scale: {
        value: new Vector2(nParticles, 1),
      },
      samples: {
        type: "t",
        value: tex,
      },
      resolution: { value: new Vector2(size.width, size.height) },
      b_should_interpolate: { value: interpolate },
    }),
    [nParticles, textureMapper, interpolate, size, tex],
  );

  useFrame(() => {
    // update the texture data
    textureMapper.updateTextureData(textureData);
    tex.needsUpdate = true;
    // update the any changing uniforms
    matRef.current.uniforms.max_amplitude.value = textureMapper.maxAmplitude;
    matRef.current.uniforms.samples.value = tex;
  });

  useEffect(() => {
    if (matRef.current?.uniforms) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      matRef.current.uniforms.resolution.value.x = size.width;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      matRef.current.uniforms.resolution.value.y = size.height;
    }
  }, [size]);

  useEffect(() => {
    if (matRef.current?.uniforms) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      matRef.current.uniforms.b_should_interpolate.value = interpolate;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      matRef.current.uniforms.color.value.x = color.r;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      matRef.current.uniforms.color.value.y = color.g;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      matRef.current.uniforms.color.value.z = color.b;
    }
  }, [interpolate, color]);

  useEffect(() => {
    if (matRef.current?.uniforms) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      matRef.current.uniforms.sample_scale.value.x = nParticles;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      matRef.current.uniforms.sample_scale.value.y = 1;
    }
  }, [nParticles]);

  const internals = (
    <Fragment>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={nParticles}
          array={particlesPosition}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-index"
          count={nParticles}
          array={particlesIndices}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        depthWrite={false}
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
      />
    </Fragment>
  );
  return usePoints ? <points>{internals}</points> : <line>{internals}</line>;
};

export default BaseScopeVisual;
