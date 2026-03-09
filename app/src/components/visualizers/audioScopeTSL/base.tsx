import { useEffect, useMemo, useRef } from "react";
import { type TextureMapper } from "@/lib/mappers/textureMappers/textureMapper";
import { useFrame, useThree } from "@react-three/fiber";
import {
  instancedBufferAttribute,
  uniform as tslUniform,
} from "three/tsl";
import {
  AdditiveBlending,
  Color,
  InstancedBufferAttribute,
  PointsNodeMaterial,
  type Sprite,
} from "three/webgpu";

import { type IScopeSettings } from "../audioScope/reactive";

function hsv2rgb(h: number, s: number, v: number, out: Color): Color {
  h = ((h % 1) + 1) % 1;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      return out.setRGB(v, t, p);
    case 1:
      return out.setRGB(q, v, p);
    case 2:
      return out.setRGB(p, v, t);
    case 3:
      return out.setRGB(p, q, v);
    case 4:
      return out.setRGB(t, p, v);
    default:
      return out.setRGB(v, p, q);
  }
}

const BaseScopeTSLVisual = ({
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
  const { textureData } = useMemo(
    () => textureMapper.generateSupportedTextureAndData(),
    [textureMapper],
  );
  const size = useThree((state) => state.size);
  const spriteRef = useRef<Sprite>(null);
  const posAttrRef = useRef<InstancedBufferAttribute | null>(null);
  const colorAttrRef = useRef<InstancedBufferAttribute | null>(null);
  const sizeUniformRef = useRef(tslUniform(3.0 * pointScale));

  const settingsRef = useRef({
    pointScale,
    baseHue,
    decay,
    desaturation,
    minSaturation,
  });
  settingsRef.current = {
    pointScale,
    baseHue,
    decay,
    desaturation,
    minSaturation,
  };

  useEffect(() => {
    const sprite = spriteRef.current;
    if (!sprite) return;

    const positions = new Float32Array(nParticles * 3);
    const colors = new Float32Array(nParticles * 4);
    const posAttr = new InstancedBufferAttribute(positions, 3);
    const colorAttr = new InstancedBufferAttribute(colors, 4);
    posAttrRef.current = posAttr;
    colorAttrRef.current = colorAttr;

    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const mat = new PointsNodeMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending as any,
      sizeNode: sizeUniformRef.current as any,
    });
    (mat as any).positionNode = instancedBufferAttribute(posAttr);
    (mat as any).colorNode = instancedBufferAttribute(colorAttr, "vec4");
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

    sprite.material = mat;
    sprite.count = nParticles;
    sprite.frustumCulled = false;

    return () => {
      mat.dispose();
      posAttrRef.current = null;
      colorAttrRef.current = null;
    };
  }, [nParticles]);

  const tmpColor = useMemo(() => new Color(), []);

  useFrame(() => {
    const posAttr = posAttrRef.current;
    const colorAttr = colorAttrRef.current;
    if (!posAttr || !colorAttr) return;

    textureMapper.updateTextureData(textureData);

    const s = settingsRef.current;
    sizeUniformRef.current.value = 3.0 * s.pointScale;
    const positions = posAttr.array as Float32Array;
    const colors = colorAttr.array as Float32Array;
    const N = Math.min(nParticles, textureMapper.samplesX.length);
    const { width, height } = size;
    const side = Math.min(width, height);
    const scaleX = side / width;
    const scaleY = side / height;
    const portrait = width < height;

    for (let i = 0; i < N; i++) {
      const j = i * 4;
      const rawX = textureData[j + 0];
      const rawY = textureData[j + 1];
      const angVel = textureData[j + 2];
      const noise = textureData[j + 3];

      let px = rawX * scaleX;
      let py = rawY * scaleY;
      if (portrait) {
        const tmp = px;
        px = py;
        py = tmp;
      }

      const pi = i * 3;
      positions[pi] = px;
      positions[pi + 1] = py;
      positions[pi + 2] = 0;

      const phase = Math.log2(Math.max(angVel, 1e-10));
      const sat = Math.max(
        s.minSaturation,
        1.0 / (1.0 + s.desaturation * noise),
      );
      hsv2rgb(s.baseHue + phase, sat, 1.0, tmpColor);

      const norm = i / N;
      const alpha = (1.0 - s.decay) + s.decay * norm;

      const ci = i * 4;
      colors[ci] = tmpColor.r;
      colors[ci + 1] = tmpColor.g;
      colors[ci + 2] = tmpColor.b;
      colors[ci + 3] = alpha;
    }

    posAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
  return <sprite ref={spriteRef as any} frustumCulled={false} />;
};

export default BaseScopeTSLVisual;
