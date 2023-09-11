import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";

export interface SphereVisualConfig {
  radius: number;
  nPoints: number;
  unitSideLength: number;
}

export const SphereVisualConfigContext = createContext<{
  config: SphereVisualConfig;
  setters: {
    setRadius: Dispatch<SetStateAction<number>>;
    setNPoints: Dispatch<SetStateAction<number>>;
    setUnitSideLength: Dispatch<SetStateAction<number>>;
  };
} | null>(null);

export const SphereVisualConfigContextProvider = ({
  initial = undefined,
  children,
}: PropsWithChildren<{
  initial?: Partial<SphereVisualConfig>;
}>) => {
  const [radius, setRadius] = useState<number>(initial?.radius ?? 2);
  const [nPoints, setNPoints] = useState<number>(initial?.nPoints ?? 800);
  const [unitSideLength, setUnitSideLength] = useState<number>(
    initial?.unitSideLength ?? 0.05
  );

  return (
    <SphereVisualConfigContext.Provider
      value={{
        config: {
          radius: radius,
          nPoints: nPoints,
          unitSideLength: unitSideLength,
        },
        setters: {
          setRadius: setRadius,
          setNPoints: setNPoints,
          setUnitSideLength: setUnitSideLength,
        },
      }}
    >
      {children}
    </SphereVisualConfigContext.Provider>
  );
};

export function useSphereVisualConfigContext() {
  const context = useContext(SphereVisualConfigContext);
  if (!context) {
    throw new Error(
      "useSphereVisualConfigContext must be used within a SphereVisualConfigContextProvider"
    );
  }
  return context.config;
}

export function useSphereVisualConfigContextSetters() {
  const context = useContext(SphereVisualConfigContext);
  if (!context) {
    throw new Error(
      "useSphereVisualConfigContextSetters must be used within a SphereVisualConfigContextProvider"
    );
  }
  return context.setters;
}
