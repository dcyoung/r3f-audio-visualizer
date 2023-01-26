import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  Vector2,
  ShaderMaterial,
  DataTexture,
  RGBAFormat,
  Points,
} from "three";

import vertexShader from "./shader/vertex";
import fragmentShader from "./shader/fragment";

const N = 512;
const maxAmplitude = 4.0;
const B = (1 << 16) - 1;
const M = 4;

export class TextureMapper {
  public samplesX: Float32Array;
  public samplesY: Float32Array;

  constructor(samplesX: Float32Array, samplesY: Float32Array) {
    this.samplesX = samplesX;
    this.samplesY = samplesY;
  }

  public updateTextureData(data: Uint8Array): void {
    let j, x, y;
    for (let i = 0; i < N; i++) {
      x = Math.max(
        0,
        Math.min(
          2 * maxAmplitude,
          0.5 + (0.5 * this.samplesX[i]) / maxAmplitude
        )
      );
      y = Math.max(
        0,
        Math.min(
          2 * maxAmplitude,
          0.5 + (0.5 * this.samplesY[i]) / maxAmplitude
        )
      );

      x = (x * B) | 0;
      y = (y * B) | 0;
      j = i * M;
      data[j + 0] = x >> 8;
      data[j + 1] = x & 0xff;
      data[j + 2] = y >> 8;
      data[j + 3] = y & 0xff;
    }
  }
}

interface AudioScopeVisualProps {
  textureMapper: TextureMapper;
}
const ScopeVisual = ({ textureMapper }: AudioScopeVisualProps): JSX.Element => {
  const textureData = new Uint8Array(N * M);
  const tex = new DataTexture(textureData, N, 1, RGBAFormat);
  tex.needsUpdate = true;
  const matRef = useRef<ShaderMaterial>(null!);
  const refPoints = useRef<Points>(null!);
  const nParticles = N;
  const particlesIndices = useMemo(() => {
    return new Float32Array(nParticles).fill(0).map((_, i) => i);
  }, [nParticles]);
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(nParticles * 3);
    for (let i = 0; i < nParticles; i++) {
      let x = (Math.random() - 0.5) * 2;
      let y = (Math.random() - 0.5) * 2;
      let z = (Math.random() - 0.5) * 2;
      positions.set([x, y, z], i * 3);
    }
    return positions;
  }, [nParticles]);

  const size = useThree((state) => state.size);
  const uniforms = useMemo(
    () => ({
      maxAmplitude: {
        value: maxAmplitude,
      },
      sampleScale: {
        value: new Vector2(N, 1),
      },
      samples: {
        type: "t",
        value: tex,
      },
      time: {
        value: 0.0,
      },
      resolution: { value: new Vector2(size.width, size.height) },
    }),
    []
  );

  useFrame(({ clock }) => {
    // update the texture data
    textureMapper.updateTextureData(textureData);
    tex.needsUpdate = true;
    // update the uniforms
    matRef.current.uniforms.time.value = clock.elapsedTime;
    matRef.current.uniforms.resolution.value.x = size.width;
    matRef.current.uniforms.resolution.value.y = size.height;
    matRef.current.uniforms.sampleScale.value.x = N;
    matRef.current.uniforms.sampleScale.value.y = 1;
    matRef.current.uniforms.maxAmplitude.value = maxAmplitude;
    matRef.current.uniforms.samples.value = tex;
  });

  useEffect(() => {
    if (matRef.current?.uniforms) {
      matRef.current.uniforms.resolution.value.x = size.width;
      matRef.current.uniforms.resolution.value.y = size.height;
    }
  }, [size]);

  return (
    <points ref={refPoints}>
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
        // attach={"material"}
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
      />
    </points>
  );
};

export default ScopeVisual;
