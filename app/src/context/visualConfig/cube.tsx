import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";

export interface CubeVisualConfig {
  nPerSide: number;
  unitSideLength: number;
  unitSpacingScalar: number;
  volume: boolean;
}

export const CubeVisualConfigContext = createContext<{
  config: CubeVisualConfig;
  setters: {
    setNPerSide: Dispatch<SetStateAction<number>>;
    setUnitSideLength: Dispatch<SetStateAction<number>>;
    setUnitSpacingScalar: Dispatch<SetStateAction<number>>;
    setVolume: Dispatch<SetStateAction<boolean>>;
  };
} | null>(null);

export const CubeVisualConfigContextProvider = ({
  initial = undefined,
  children,
}: PropsWithChildren<{
  initial?: Partial<CubeVisualConfig>;
}>) => {
  const [nPerSide, setNPerSide] = useState<number>(initial?.nPerSide ?? 10);
  const [unitSideLength, setUnitSideLength] = useState<number>(
    initial?.unitSideLength ?? 0.5
  );
  const [unitSpacingScalar, setUnitSpacingScalar] = useState<number>(
    initial?.unitSpacingScalar ?? 0.1
  );
  const [volume, setVolume] = useState<boolean>(initial?.volume ?? true);

  return (
    <CubeVisualConfigContext.Provider
      value={{
        config: {
          nPerSide: nPerSide,
          unitSideLength: unitSideLength,
          unitSpacingScalar: unitSpacingScalar,
          volume: volume,
        },
        setters: {
          setNPerSide: setNPerSide,
          setUnitSideLength: setUnitSideLength,
          setUnitSpacingScalar: setUnitSpacingScalar,
          setVolume: setVolume,
        },
      }}
    >
      {children}
    </CubeVisualConfigContext.Provider>
  );
};

export function useCubeVisualConfigContext() {
  const context = useContext(CubeVisualConfigContext);
  if (!context) {
    throw new Error(
      "useCubeVisualConfigContext must be used within a CubeVisualConfigContextProvider"
    );
  }
  return context.config;
}

export function useCubeVisualConfigContextSetters() {
  const context = useContext(CubeVisualConfigContext);
  if (!context) {
    throw new Error(
      "useCubeVisualConfigContextSetters must be used within a CubeVisualConfigContextProvider"
    );
  }
  return context.setters;
}
