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
  octaveBandMode: OctaveBandMode;
  energyMeasure: EnergyMeasure;
}

export const FFTAnalyzerContext = createContext<{
  config: FFTAnalyzerConfig;
  setters: {
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
  const [octaveBandMode, setOctaveBandMode] = useState<OctaveBandMode>(
    initial?.octaveBandMode ?? 2,
  );
  const [energyMeasure, setEnergyMeasure] = useState<EnergyMeasure>(
    initial?.energyMeasure ?? "bass",
  );
  return (
    <FFTAnalyzerContext.Provider
      value={{
        config: {
          octaveBandMode: octaveBandMode,
          energyMeasure: energyMeasure,
        },
        setters: {
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
      "useFFTAnalyzerContext must be used within a FFTAnalyzerContextProvider",
    );
  }
  return context.config;
}

export function useFFTAnalyzerContextSetters() {
  const context = useContext(FFTAnalyzerContext);
  if (!context) {
    throw new Error(
      "useFFTAnalyzerContext must be used within a FFTAnalyzerContextProvider",
    );
  }
  return context.setters;
}
