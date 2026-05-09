import { type TVisualProps } from "@/components/visualizers/models";
import { createConfigStore } from "@/lib/storeHelpers";

import BaseWaveHistoryVisual from "./base";

export type WaveHistoryVisualConfig = {
  nSamples: number;
  historyDurationSec: number;
  captureIntervalMs: number;
  absoluteHeight: boolean;
  amplitudeScale: number;
  lineWidth: number;
  historyDepth: number;
  historyFlatten: number;
  historyAlphaPower: number;
};

const defaultConfig: WaveHistoryVisualConfig = {
  nSamples: 512,
  historyDurationSec: 2.5,
  captureIntervalMs: 33,
  absoluteHeight: true,
  amplitudeScale: 1,
  lineWidth: 1.8,
  historyDepth: 2.2,
  historyFlatten: 0.62,
  historyAlphaPower: 1.8,
};

export const { useParams, useActions, usePresets } =
  createConfigStore<WaveHistoryVisualConfig>({
    default: defaultConfig,
    dense: {
      ...defaultConfig,
      nSamples: 768,
      historyDurationSec: 3.5,
      captureIntervalMs: 24,
    },
    minimal: {
      ...defaultConfig,
      nSamples: 384,
      historyDurationSec: 1.8,
      captureIntervalMs: 50,
    },
  });

export default ({ coordinateMapper }: TVisualProps) => {
  const params = useParams();

  return (
    <>
      <ambientLight intensity={0.45} color="#7fefff" />
      <pointLight position={[0, -3.5, 4.5]} intensity={22} color="#9dfcff" />
      <pointLight position={[4, 2.5, 3]} intensity={10} color="#ffffff" />
      <BaseWaveHistoryVisual coordinateMapper={coordinateMapper} {...params} />
    </>
  );
};
