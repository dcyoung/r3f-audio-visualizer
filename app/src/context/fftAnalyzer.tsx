import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";

import { type EnergyMeasure, type OctaveBandMode } from "@/lib/analyzers/fft";

interface FFTAnalyzerConfig {
  // TODO: Find a better place to put amplitude for audio visuals
  amplitude: number;
  octaveBandMode: OctaveBandMode;
  energyMeasure: EnergyMeasure;
}

export const FFTAnalyzerContext = createContext<{
  config: FFTAnalyzerConfig;
  setters: {
    setAmplitude: Dispatch<SetStateAction<number>>;
    setOctaveBand: Dispatch<SetStateAction<OctaveBandMode>>;
    setEnergyMeasure: Dispatch<SetStateAction<EnergyMeasure>>;
  };
} | null>(null);

export const FFTAnalyzerContextProvider = ({
  initial = undefined,
  children,
}: PropsWithChildren<{
  initial?: Partial<FFTAnalyzerConfig>;
}>) => {
  const [amplitude, setAmplitude] = useState<number>(initial?.amplitude ?? 1.0);
  const [octaveBandMode, setOctaveBandMode] = useState<OctaveBandMode>(
    initial?.octaveBandMode ?? 2
  );
  const [energyMeasure, setEnergyMeasure] = useState<EnergyMeasure>(
    initial?.energyMeasure ?? "bass"
  );
  return (
    <FFTAnalyzerContext.Provider
      value={{
        config: {
          amplitude: amplitude,
          octaveBandMode: octaveBandMode,
          energyMeasure: energyMeasure,
        },
        setters: {
          setAmplitude: setAmplitude,
          setOctaveBand: setOctaveBandMode,
          setEnergyMeasure: setEnergyMeasure,
        },
      }}
    >
      {children}
    </FFTAnalyzerContext.Provider>
  );
};

export function useFFTAnalyzerContext() {
  const context = useContext(FFTAnalyzerContext);
  if (!context) {
    throw new Error(
      "useFFTAnalyzerContext must be used within a FFTAnalyzerContextProvider"
    );
  }
  return context.config;
}

export function useFFTAnalyzerContextSetters() {
  const context = useContext(FFTAnalyzerContext);
  if (!context) {
    throw new Error(
      "useFFTAnalyzerContext must be used within a FFTAnalyzerContextProvider"
    );
  }
  return context.setters;
}
