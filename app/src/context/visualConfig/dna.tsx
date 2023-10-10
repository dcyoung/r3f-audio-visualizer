import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";

export interface DnaVisualConfig {
  multi: boolean;
  helixLength: number;
  helixRadius: number;
  helixWindingSeparation: number;
  strandRadius: number;
  baseSpacing: number;
  strandOffsetRad: number;
  mirrorEffects: boolean;
  fixedBaseGap: boolean;
}

export const DnaVisualConfigContext = createContext<{
  config: DnaVisualConfig;
  setters: {
    setMulti: Dispatch<SetStateAction<boolean>>;
    setHelixLength: Dispatch<SetStateAction<number>>;
    setHelixRadius: Dispatch<SetStateAction<number>>;
    setHelixWindingSeparation: Dispatch<SetStateAction<number>>;
    setStrandRadius: Dispatch<SetStateAction<number>>;
    setBaseSpacing: Dispatch<SetStateAction<number>>;
    setStrandOffsetRad: Dispatch<SetStateAction<number>>;
    setMirrorEffects: Dispatch<SetStateAction<boolean>>;
    setFixedBaseGap: Dispatch<SetStateAction<boolean>>;
  };
} | null>(null);

export const DnaVisualConfigContextProvider = ({
  initial = undefined,
  children,
}: PropsWithChildren<{
  initial?: Partial<DnaVisualConfig>;
}>) => {
  const [multi, setMulti] = useState<boolean>(initial?.multi ?? true);
  const [helixLength, setHelixLength] = useState<number>(
    initial?.helixLength ?? 50
  );
  const [helixRadius, setHelixRadius] = useState<number>(
    initial?.helixRadius ?? 1
  );
  const [helixWindingSeparation, setHelixWindingSeparation] = useState<number>(
    initial?.helixWindingSeparation ?? 10
  );
  const [strandRadius, setStrandRadius] = useState<number>(
    initial?.strandRadius ?? 0.1
  );
  const [baseSpacing, setBaseSpacing] = useState<number>(
    initial?.baseSpacing ?? 0.35
  );
  const [strandOffsetRad, setStrandOffsetRad] = useState<number>(
    initial?.strandOffsetRad ?? Math.PI / 2
  );
  const [mirrorEffects, setMirrorEffects] = useState<boolean>(
    initial?.mirrorEffects ?? true
  );
  const [fixedBaseGap, setFixedBaseGap] = useState<boolean>(
    initial?.fixedBaseGap ?? false
  );
  return (
    <DnaVisualConfigContext.Provider
      value={{
        config: {
          multi: multi,
          helixLength: helixLength,
          helixRadius: helixRadius,
          helixWindingSeparation: helixWindingSeparation,
          strandRadius: strandRadius,
          baseSpacing: baseSpacing,
          strandOffsetRad: strandOffsetRad,
          mirrorEffects: mirrorEffects,
          fixedBaseGap: fixedBaseGap,
        },
        setters: {
          setMulti: setMulti,
          setHelixLength: setHelixLength,
          setHelixRadius: setHelixRadius,
          setHelixWindingSeparation: setHelixWindingSeparation,
          setStrandRadius: setStrandRadius,
          setBaseSpacing: setBaseSpacing,
          setStrandOffsetRad: setStrandOffsetRad,
          setMirrorEffects: setMirrorEffects,
          setFixedBaseGap: setFixedBaseGap,
        },
      }}
    >
      {children}
    </DnaVisualConfigContext.Provider>
  );
};

export function useDnaVisualConfigContext() {
  const context = useContext(DnaVisualConfigContext);
  if (!context) {
    throw new Error(
      "useDnaVisualConfigContext must be used within a DnaVisualConfigContextProvider"
    );
  }
  return context.config;
}

export function useDnaVisualConfigContextSetters() {
  const context = useContext(DnaVisualConfigContext);
  if (!context) {
    throw new Error(
      "useDnaVisualConfigContextSetters must be used within a DnaVisualConfigContextProvider"
    );
  }
  return context.setters;
}
