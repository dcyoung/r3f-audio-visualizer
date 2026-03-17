import { useEffect, useMemo, useRef, type RefObject } from "react";
import { type TextureMapper } from "@/lib/mappers/textureMappers/textureMapper";
import { useFrame, useThree } from "@react-three/fiber";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { Line2 } from "three/addons/lines/webgpu/Line2.js";
import { instancedBufferAttribute, uniform as tslUniform } from "three/tsl";
import type { InterleavedBufferAttribute } from "three/webgpu";
import {
  AdditiveBlending,
  Color,
  InstancedBufferAttribute,
  Line2NodeMaterial,
  PointsNodeMaterial,
  type Mesh,
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

/**
 * Shared hook: computes positions (Float32Array, 3 per vertex) and
 * colors (Float32Array, 3 per vertex, RGB) each frame from the scope data.
 */
function useScopeData(
  textureMapper: TextureMapper,
  nParticles: number,
  settings: {
    baseHue: number;
    decay: number;
    desaturation: number;
    minSaturation: number;
  },
) {
  const { textureData } = useMemo(
    () => textureMapper.generateSupportedTextureAndData(),
    [textureMapper],
  );
  const size = useThree((state) => state.size);
  const tmpColor = useMemo(() => new Color(), []);
  const buffers = useMemo(
    () => ({
      positions: new Float32Array(nParticles * 3),
      colors: new Float32Array(nParticles * 3),
      alphas: new Float32Array(nParticles),
    }),
    [nParticles],
  );

  return {
    textureData,
    compute: () => {
      textureMapper.updateTextureData(textureData);
      const { positions, colors, alphas } = buffers;
      const N = Math.min(nParticles, textureMapper.samplesX.length);
      const { width, height } = size;
      const side = Math.min(width, height);
      const scaleX = side / width;
      const scaleY = side / height;
      const portrait = width < height;

      /* Intentionally mutate memoized buffers in place each frame for performance */
      /* eslint-disable react-hooks/immutability */
      for (let i = 0; i < N; i++) {
        const j = i * 4;
        const rawX = textureData[j];
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
          settings.minSaturation,
          1.0 / (1.0 + settings.desaturation * noise),
        );
        hsv2rgb(settings.baseHue + phase, sat, 1.0, tmpColor);

        colors[pi] = tmpColor.r;
        colors[pi + 1] = tmpColor.g;
        colors[pi + 2] = tmpColor.b;

        alphas[i] = 1.0 - settings.decay + settings.decay * (i / N);
      }
      /* eslint-enable react-hooks/immutability */

      return { positions, colors, alphas, N };
    },
  };
}

const PointsMode = ({
  textureMapper,
  nParticles,
  pointScale,
  baseHue,
  decay,
  desaturation,
  minSaturation,
}: { textureMapper: TextureMapper } & IScopeSettings) => {
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

  const settings = useMemo(
    () => ({
      baseHue,
      decay,
      desaturation,
      minSaturation,
    }),
    [baseHue, decay, desaturation, minSaturation],
  );
  const { compute } = useScopeData(textureMapper, nParticles, settings);

  useEffect(() => {
    settingsRef.current = {
      pointScale,
      baseHue,
      decay,
      desaturation,
      minSaturation,
    };
  }, [pointScale, baseHue, decay, desaturation, minSaturation]);

  useEffect(() => {
    const sprite = spriteRef.current;
    if (!sprite) return;

    const posArr = new Float32Array(nParticles * 3);
    const colorArr = new Float32Array(nParticles * 4);
    const posAttr = new InstancedBufferAttribute(posArr, 3);
    const colorAttr = new InstancedBufferAttribute(colorArr, 4);
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

  useFrame(() => {
    const posAttr = posAttrRef.current;
    const colorAttr = colorAttrRef.current;
    if (!posAttr || !colorAttr) return;

    sizeUniformRef.current.value = 3.0 * settingsRef.current.pointScale;
    const { positions, colors, alphas, N } = compute();

    const posOut = posAttr.array as Float32Array;
    const colorOut = colorAttr.array as Float32Array;
    for (let i = 0; i < N; i++) {
      const pi = i * 3;
      posOut[pi] = positions[pi];
      posOut[pi + 1] = positions[pi + 1];
      posOut[pi + 2] = 0;

      const ci = i * 4;
      colorOut[ci] = colors[pi];
      colorOut[ci + 1] = colors[pi + 1];
      colorOut[ci + 2] = colors[pi + 2];
      colorOut[ci + 3] = alphas[i];
    }

    posAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;
  });

  return <sprite ref={spriteRef as RefObject<Sprite>} frustumCulled={false} />;
};

/**
 * Convert polyline points [p0,p1,...,pN-1] to the pairs format used by
 * LineSegmentsGeometry: [p0,p1, p1,p2, p2,p3, ...] where each segment
 * stores both start and end as 3 floats each (stride 6 per segment).
 */
function writePolylinePairs(
  src: Float32Array,
  dst: Float32Array,
  nPoints: number,
  components: number,
) {
  const nSegs = nPoints - 1;
  for (let i = 0; i < nSegs; i++) {
    const si = i * components;
    const di = i * components * 2;
    for (let c = 0; c < components; c++) {
      dst[di + c] = src[si + c];
      dst[di + components + c] = src[si + components + c];
    }
  }
}

const LinesMode = ({
  textureMapper,
  nParticles,
  pointScale,
  baseHue,
  decay,
  desaturation,
  minSaturation,
}: { textureMapper: TextureMapper } & IScopeSettings) => {
  const meshRef = useRef<Mesh>(null);
  const lineRef = useRef<Line2 | null>(null);
  const settingsRef = useRef({
    pointScale,
    baseHue,
    decay,
    desaturation,
    minSaturation,
  });

  const settings = useMemo(
    () => ({
      baseHue,
      decay,
      desaturation,
      minSaturation,
    }),
    [baseHue, decay, desaturation, minSaturation],
  );
  const { compute } = useScopeData(textureMapper, nParticles, settings);

  useEffect(() => {
    settingsRef.current = {
      pointScale,
      baseHue,
      decay,
      desaturation,
      minSaturation,
    };
  }, [pointScale, baseHue, decay, desaturation, minSaturation]);

  useEffect(() => {
    const container = meshRef.current;
    if (!container) return;

    const geom = new LineGeometry();
    const initPos = new Float32Array(nParticles * 3);
    const initCol = new Float32Array(nParticles * 3).fill(1);
    geom.setPositions(initPos);
    geom.setColors(initCol);

    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
    const mat = new Line2NodeMaterial({
      linewidth: 2,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending as any,
      alphaToCoverage: false,
    } as any);
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */

    const line = new Line2(geom, mat);
    line.frustumCulled = false;
    lineRef.current = line;
    container.add(line);

    return () => {
      container.remove(line);
      geom.dispose();
      mat.dispose();
      lineRef.current = null;
    };
  }, [nParticles]);

  useFrame(() => {
    const line = lineRef.current;
    if (!line) return;
    const geom = line.geometry;

    const s = settingsRef.current;
    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access */
    (line.material as any).linewidth = 1.5 * s.pointScale;
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access */

    const { positions, colors } = compute();

    const posAttr = geom.getAttribute(
      "instanceStart",
    ) as InterleavedBufferAttribute | null;
    const colAttr = geom.getAttribute(
      "instanceColorStart",
    ) as InterleavedBufferAttribute | null;
    if (!posAttr?.data?.array || !colAttr?.data?.array) return;

    writePolylinePairs(
      positions,
      posAttr.data.array as Float32Array,
      nParticles,
      3,
    );
    writePolylinePairs(
      colors,
      colAttr.data.array as Float32Array,
      nParticles,
      3,
    );

    posAttr.data.needsUpdate = true;
    colAttr.data.needsUpdate = true;
  });

  return <mesh ref={meshRef as RefObject<Mesh>} frustumCulled={false} />;
};

const BaseScopeTSLVisual = (
  props: { textureMapper: TextureMapper } & IScopeSettings,
) => {
  return props.useLines ? <LinesMode {...props} /> : <PointsMode {...props} />;
};

export default BaseScopeTSLVisual;
