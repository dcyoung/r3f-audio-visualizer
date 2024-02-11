import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";

export interface NoiseGeneratorConfig {
  amplitude: number;
  spatialScale: number;
  timeScale: number;
  nIterations: number;
}

export const NoiseGeneratorContext = createContext<{
  config: NoiseGeneratorConfig;
  setters: {
    setAmplitude: Dispatch<SetStateAction<number>>;
    setSpatialScale: Dispatch<SetStateAction<number>>;
    setTimeScale: Dispatch<SetStateAction<number>>;
    setNIterations: Dispatch<SetStateAction<number>>;
    reset: Dispatch<void>;
  };
} | null>(null);

export const NoiseGeneratorContextProvider = ({
  initial = undefined,
  children,
}: PropsWithChildren<{
  initial?: Partial<NoiseGeneratorConfig>;
}>) => {
  const [amplitude, setAmplitude] = useState<number>(initial?.amplitude ?? 1.0);
  const [spatialScale, setSpatialScale] = useState<number>(
    initial?.spatialScale ?? 2.0,
  );
  const [timeScale, setTimeScale] = useState<number>(initial?.timeScale ?? 0.5);
  const [nIterations, setNIterations] = useState<number>(
    initial?.nIterations ?? 10,
  );
  return (
    <NoiseGeneratorContext.Provider
      value={{
        config: {
          amplitude: amplitude,
          spatialScale: spatialScale,
          timeScale: timeScale,
          nIterations: nIterations,
        },
        setters: {
          setAmplitude: setAmplitude,
          setSpatialScale: setSpatialScale,
          setTimeScale: setTimeScale,
          setNIterations: setNIterations,
          reset: () => {
            setAmplitude(initial?.amplitude ?? 1.0);
            setSpatialScale(initial?.spatialScale ?? 2.0);
            setTimeScale(initial?.timeScale ?? 0.5);
            setNIterations(initial?.nIterations ?? 10);
          },
        },
      }}
    >
      {children}
    </NoiseGeneratorContext.Provider>
  );
};

export function useNoiseGeneratorContext() {
  const context = useContext(NoiseGeneratorContext);
  if (!context) {
    throw new Error(
      "useNoiseGeneratorContext must be used within a NoiseGeneratorContextProvider",
    );
  }
  return context.config;
}

export function useNoiseGeneratorContextSetters() {
  const context = useContext(NoiseGeneratorContext);
  if (!context) {
    throw new Error(
      "useNoiseGeneratorContext must be used within a NoiseGeneratorContextProvider",
    );
  }
  return context.setters;
}
