import { useEffect, useMemo, useRef, type RefObject } from "react";
import {
  COORDINATE_TYPE,
  type ICoordinateMapper,
} from "@/lib/mappers/coordinateMappers/common";
import { useFrame } from "@react-three/fiber";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { Line2 } from "three/addons/lines/webgpu/Line2.js";
import {
  Color,
  MathUtils,
  type InterleavedBufferAttribute,
} from "three";
import {
  AdditiveBlending,
  Line2NodeMaterial,
  type Mesh,
} from "three/webgpu";

import { type WaveHistoryVisualConfig } from "./reactive";

type WaveHistoryRenderConfig = WaveHistoryVisualConfig & {
  maxSnapshots: number;
};

type SnapshotHistory = {
  data: Float32Array;
  timesMs: Float32Array;
  maxSnapshots: number;
  nSamples: number;
  head: number;
  count: number;
  nextCaptureMs: number;
  serial: number;
};

type LineSlot = {
  line: Line2;
  geometry: LineGeometry;
  material: Line2NodeMaterial;
};

const SAMPLE_WIDTH = 9.2;
const HEIGHT_SCALE = 2.1;

const smoke = new Color("#6f7470");
const cyan = new Color("#7fefff");
const white = new Color("#ffffff");
const blue = new Color("#118dff");

function snapshotIndexForAge(history: SnapshotHistory, age: number): number {
  return (history.head - age + history.maxSnapshots) % history.maxSnapshots;
}

function colorForAge(ageNorm: number, out: Color): Color {
  if (ageNorm < 0.18) {
    return out.lerpColors(white, cyan, ageNorm / 0.18);
  }
  if (ageNorm < 0.72) {
    return out.lerpColors(cyan, blue, (ageNorm - 0.18) / 0.54);
  }
  return out.lerpColors(blue, smoke, (ageNorm - 0.72) / 0.28);
}

function makeHistory(nSamples: number, maxSnapshots: number): SnapshotHistory {
  return {
    data: new Float32Array(nSamples * maxSnapshots),
    timesMs: new Float32Array(maxSnapshots).fill(-1),
    maxSnapshots,
    nSamples,
    head: 0,
    count: 0,
    nextCaptureMs: 0,
    serial: 0,
  };
}

function sampleWaveform(
  coordinateMapper: ICoordinateMapper,
  params: WaveHistoryRenderConfig,
  history: SnapshotHistory,
  elapsedTimeSec: number,
  elapsedMs: number,
) {
  const nextHead = (history.head + 1) % history.maxSnapshots;
  const offset = nextHead * history.nSamples;
  const denom = Math.max(1, history.nSamples - 1);

  for (let i = 0; i < history.nSamples; i += 1) {
    const xNorm = i / denom;
    const raw = coordinateMapper.map(
      COORDINATE_TYPE.CARTESIAN_1D,
      xNorm,
      0,
      0,
      elapsedTimeSec,
    );
    history.data[offset + i] = params.absoluteHeight ? Math.abs(raw) : raw;
  }

  history.head = nextHead;
  history.timesMs[nextHead] = elapsedMs;
  history.count = Math.min(history.count + 1, history.maxSnapshots);
  history.serial += 1;
}

function linePositionForSample(
  history: SnapshotHistory,
  params: WaveHistoryRenderConfig,
  snapshotIndex: number,
  sampleIndex: number,
  ageNorm: number,
  out: Float32Array,
  outOffset: number,
) {
  const xNorm = sampleIndex / Math.max(1, history.nSamples - 1);
  const rawHeight = history.data[snapshotIndex * history.nSamples + sampleIndex];
  const flatten = MathUtils.lerp(1, params.historyFlatten, ageNorm);

  out[outOffset] = (xNorm - 0.5) * SAMPLE_WIDTH;
  out[outOffset + 1] = -ageNorm * params.historyDepth;
  out[outOffset + 2] = rawHeight * HEIGHT_SCALE * params.amplitudeScale * flatten;
}

function writePolylinePairs(
  src: Float32Array,
  dst: Float32Array,
  nPoints: number,
) {
  for (let i = 0; i < nPoints - 1; i += 1) {
    const si = i * 3;
    const di = i * 6;
    dst[di] = src[si];
    dst[di + 1] = src[si + 1];
    dst[di + 2] = src[si + 2];
    dst[di + 3] = src[si + 3];
    dst[di + 4] = src[si + 4];
    dst[di + 5] = src[si + 5];
  }
}

function updateLineSlot(
  slot: LineSlot,
  history: SnapshotHistory,
  params: WaveHistoryRenderConfig,
  displayAge: number,
  positions: Float32Array,
  colors: Float32Array,
  colorScratch: Color,
) {
  const visible = displayAge < history.count;
  const material = slot.material as Line2NodeMaterial & {
    opacity: number;
    linewidth: number;
  };

  if (!visible) {
    material.opacity = 0;
    return;
  }

  const ageNorm = displayAge / Math.max(1, history.maxSnapshots - 1);
  const snapshotIndex = snapshotIndexForAge(history, displayAge);
  const color = colorForAge(ageNorm, colorScratch);
  const alpha = Math.pow(1 - ageNorm, params.historyAlphaPower);

  for (let i = 0; i < history.nSamples; i += 1) {
    const offset = i * 3;
    linePositionForSample(
      history,
      params,
      snapshotIndex,
      i,
      ageNorm,
      positions,
      offset,
    );
    colors[offset] = color.r;
    colors[offset + 1] = color.g;
    colors[offset + 2] = color.b;
  }

  material.opacity = alpha;
  material.linewidth = MathUtils.lerp(
    params.lineWidth,
    params.lineWidth * 0.28,
    ageNorm,
  );

  const posAttr = slot.geometry.getAttribute(
    "instanceStart",
  ) as InterleavedBufferAttribute | null;
  const colAttr = slot.geometry.getAttribute(
    "instanceColorStart",
  ) as InterleavedBufferAttribute | null;
  if (!posAttr?.data?.array || !colAttr?.data?.array) return;

  writePolylinePairs(
    positions,
    posAttr.data.array as Float32Array,
    history.nSamples,
  );
  writePolylinePairs(colors, colAttr.data.array as Float32Array, history.nSamples);
  posAttr.data.needsUpdate = true;
  colAttr.data.needsUpdate = true;
}

function WaveHistoryLines({
  historyRef,
  params,
}: {
  historyRef: RefObject<SnapshotHistory | null>;
  params: WaveHistoryRenderConfig;
}) {
  const meshRef = useRef<Mesh>(null);
  const linesRef = useRef<LineSlot[]>([]);
  const scratch = useMemo(
    () => ({
      positions: new Float32Array(params.nSamples * 3),
      colors: new Float32Array(params.nSamples * 3),
      color: new Color(),
    }),
    [params.nSamples],
  );

  useEffect(() => {
    const container = meshRef.current;
    if (!container) return;

    const lineSlots: LineSlot[] = [];
    const initPositions = new Float32Array(params.nSamples * 3);
    const initColors = new Float32Array(params.nSamples * 3).fill(1);

    for (let i = 0; i < params.maxSnapshots; i += 1) {
      const geometry = new LineGeometry();
      geometry.setPositions(initPositions);
      geometry.setColors(initColors);

      /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
      const material = new Line2NodeMaterial({
        linewidth: params.lineWidth,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending as any,
        alphaToCoverage: false,
      } as any);
      /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */

      const line = new Line2(geometry, material);
      line.frustumCulled = false;
      container.add(line);
      lineSlots.push({ line, geometry, material });
    }

    linesRef.current = lineSlots;

    return () => {
      for (const slot of lineSlots) {
        container.remove(slot.line);
        slot.geometry.dispose();
        slot.material.dispose();
      }
      linesRef.current = [];
    };
  }, [params.lineWidth, params.maxSnapshots, params.nSamples]);

  useFrame(() => {
    const history = historyRef.current;
    if (!history) return;
    const lines = linesRef.current;
    for (let i = 0; i < lines.length; i += 1) {
      updateLineSlot(
        lines[i],
        history,
        params,
        i,
        scratch.positions,
        scratch.colors,
        scratch.color,
      );
    }
  });

  return <mesh ref={meshRef as RefObject<Mesh>} frustumCulled={false} />;
}

export default function BaseWaveHistoryVisual({
  coordinateMapper,
  ...params
}: { coordinateMapper: ICoordinateMapper } & WaveHistoryVisualConfig) {
  const maxSnapshots = Math.max(
    2,
    Math.ceil((params.historyDurationSec * 1000) / params.captureIntervalMs),
  );
  const renderParams = { ...params, maxSnapshots };
  const historyRef = useRef<SnapshotHistory | null>(null);

  useEffect(() => {
    historyRef.current = makeHistory(params.nSamples, maxSnapshots);
  }, [maxSnapshots, params.nSamples]);

  useFrame(({ elapsed }) => {
    const history = historyRef.current;
    if (!history) return;
    const elapsedTimeSec = elapsed;
    const elapsedMs = elapsedTimeSec * 1000;
    if (history.count === 0 || elapsedMs >= history.nextCaptureMs) {
      sampleWaveform(coordinateMapper, renderParams, history, elapsedTimeSec, elapsedMs);
      history.nextCaptureMs = elapsedMs + params.captureIntervalMs;
    }
  });

  return (
    <group rotation={[-0.18, 0, 0]}>
      <WaveHistoryLines historyRef={historyRef} params={renderParams} />
    </group>
  );
}
