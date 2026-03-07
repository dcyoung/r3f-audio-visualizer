import { Fragment, useMemo, useRef } from "react";
import { usePalette } from "@/lib/appState";
import { type TextureMapper } from "@/lib/mappers/textureMappers/textureMapper";
import { ColorPalette } from "@/lib/palettes";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector2, Vector3, type ShaderMaterial } from "three";

import fragmentShader from "./shaders/fragment";
import vertexShader from "./shaders/vertex";

const BaseScopeVisual = ({
  textureMapper,
  nParticles = 512,
  usePoints = true,
  interpolate = false,
}: {
  textureMapper: TextureMapper;
  nParticles?: number;
  usePoints?: boolean;
  interpolate?: boolean;
}) => {
  const palette = usePalette();
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

  const colorVec = useMemo(() => {
    const c = ColorPalette.getPalette(palette).lerpColor(0.5);
    return new Vector3(c.r, c.g, c.b);
  }, [palette]);

  const resolution = useMemo(
    () => new Vector2(size.width, size.height),
    [size.width, size.height],
  );

  const sampleScale = useMemo(() => new Vector2(nParticles, 1), [nParticles]);

  const uniforms = useMemo(
    () => ({
      color: { value: colorVec },
      max_amplitude: { value: textureMapper.maxAmplitude },
      sample_scale: { value: sampleScale },
      samples: { type: "t", value: tex },
      resolution: { value: resolution },
      b_should_interpolate: { value: interpolate },
    }),
    // Only recreate on mount-level changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [textureMapper, tex],
  );

  useFrame(() => {
    textureMapper.updateTextureData(textureData);
    tex.needsUpdate = true;
    if (!matRef.current) return;
    matRef.current.uniforms.max_amplitude.value = textureMapper.maxAmplitude;
    matRef.current.uniforms.samples.value = tex;
  });

  const internals = (
    <Fragment>
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
        depthWrite={false}
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
        uniforms-color-value={colorVec}
        uniforms-resolution-value={resolution}
        uniforms-sample_scale-value={sampleScale}
        uniforms-b_should_interpolate-value={interpolate}
      />
    </Fragment>
  );
  return usePoints ? <points>{internals}</points> : <line>{internals}</line>;
};

export default BaseScopeVisual;
