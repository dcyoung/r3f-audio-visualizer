import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";

export interface WaveGeneratorConfig {
  maxAmplitude: number;
  waveformFrequenciesHz: [number, ...number[]];
  amplitudeSplitRatio: number;
}

export const WaveGeneratorContext = createContext<{
  config: WaveGeneratorConfig;
  setters: {
    setMaxAmplitude: Dispatch<SetStateAction<number>>;
    setWaveformFrequenciesHz: Dispatch<SetStateAction<[number, ...number[]]>>;
    setAmplitudeSplitRatio: Dispatch<SetStateAction<number>>;
    reset: Dispatch<void>;
  };
} | null>(null);

export const WaveGeneratorContextProvider = ({
  initial = undefined,
  children,
}: PropsWithChildren<{
  initial?: Partial<WaveGeneratorConfig>;
}>) => {
  const [maxAmplitude, setMaxAmplitude] = useState<number>(
    initial?.maxAmplitude ?? 1.0,
  );
  const [waveformFrequenciesHz, setWaveformFrequenciesHz] = useState<
    [number, ...number[]]
  >(initial?.waveformFrequenciesHz ?? [2.0]);

  const [amplitudeSplitRatio, setAmplitudeSplitRatio] = useState<number>(
    initial?.amplitudeSplitRatio ?? 0.75,
  );

  return (
    <WaveGeneratorContext.Provider
      value={{
        config: {
          maxAmplitude: maxAmplitude,
          waveformFrequenciesHz: [...waveformFrequenciesHz],
          amplitudeSplitRatio: amplitudeSplitRatio,
        },
        setters: {
          setMaxAmplitude: setMaxAmplitude,
          setWaveformFrequenciesHz: setWaveformFrequenciesHz,
          setAmplitudeSplitRatio: setAmplitudeSplitRatio,
          reset: () => {
            setMaxAmplitude(initial?.maxAmplitude ?? 1.0);
            setWaveformFrequenciesHz(initial?.waveformFrequenciesHz ?? [2.0]);
            setAmplitudeSplitRatio(initial?.amplitudeSplitRatio ?? 0.75);
          },
        },
      }}
    >
      {children}
    </WaveGeneratorContext.Provider>
  );
};

export function useWaveGeneratorContext() {
  const context = useContext(WaveGeneratorContext);
  if (!context) {
    throw new Error(
      "useWaveGeneratorContext must be used within a WaveGeneratorContextProvider",
    );
  }
  return context.config;
}

export function useWaveGeneratorContextSetters() {
  const context = useContext(WaveGeneratorContext);
  if (!context) {
    throw new Error(
      "useWaveGeneratorContext must be used within a WaveGeneratorContextProvider",
    );
  }
  return context.setters;
}
