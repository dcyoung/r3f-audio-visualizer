import { useControls } from "leva";
import { useEffect } from "react";
import { useAppState } from "../appState";

export interface WaveformControlsProps {
  waveFrequenciesHz?: number[];
}

const WaveformControls = ({
  waveFrequenciesHz = [2.0],
}: WaveformControlsProps): JSX.Element => {
  const updateWaveformCount = useAppState((state) => state.updateWaveformCount);
  const updateAmplitude = useAppState((state) => state.updateAmplitude);
  const updateFrequencyHzAt = useAppState((state) => state.updateFrequencyHzAt);
  const [, set] = useControls(
    "Wave Generator",
    () => ({
      nWaves: {
        value: Math.max(1, Math.min(3, waveFrequenciesHz.length)),
        min: 1,
        max: 3,
        step: 1,
        onChange: (v) => {
          updateWaveformCount(v);
        },
      },
      amplitude: {
        value: 1.0,
        min: 0.0,
        max: 5.0,
        step: 0.01,
        onChange: (v) => {
          updateAmplitude(v);
        },
      },
      frequencyHz_1: {
        value: waveFrequenciesHz[0],
        min: 0.0,
        max: 30,
        step: 0.05,
        onChange: (v) => {
          updateFrequencyHzAt(0, v);
        },
      },
      frequencyHz_2: {
        value: waveFrequenciesHz.length > 1 ? waveFrequenciesHz[1] : 0,
        min: 0.0,
        max: 30,
        step: 0.05,
        render: (get) => get("Wave Generator.nWaves") > 1,
        onChange: (v) => {
          updateFrequencyHzAt(1, v);
        },
      },
      frequencyHz_3: {
        value: waveFrequenciesHz.length > 2 ? waveFrequenciesHz[1] : 0,
        min: 0.0,
        max: 30,
        step: 0.05,
        render: (get) => get("Wave Generator.nWaves") > 2,
        onChange: (v) => {
          updateFrequencyHzAt(2, v);
        },
      },
    }),
    { collapsed: true },
    [
      updateWaveformCount,
      updateAmplitude,
      updateFrequencyHzAt,
      waveFrequenciesHz,
    ]
  );

  useEffect(() => {
    set({ nWaves: waveFrequenciesHz.length });
    if (waveFrequenciesHz.length > 0) {
      set({ frequencyHz_1: waveFrequenciesHz[0] });
    }
    if (waveFrequenciesHz.length > 1) {
      set({ frequencyHz_2: waveFrequenciesHz[1] });
    }
    if (waveFrequenciesHz.length > 2) {
      set({ frequencyHz_3: waveFrequenciesHz[2] });
    }
  }, [waveFrequenciesHz]);

  return <></>;
};

export default WaveformControls;
