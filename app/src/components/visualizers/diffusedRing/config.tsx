import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";

export interface RingVisualConfig {
  radius: number;
  pointSize: number;
  mirrorEffects: boolean;
}

export const DiffusedRingVisualConfigContext = createContext<{
  config: RingVisualConfig;
  setters: {
    setRadius: Dispatch<SetStateAction<number>>;
    setPointSize: Dispatch<SetStateAction<number>>;
    setMirrorEffects: Dispatch<SetStateAction<boolean>>;
  };
} | null>(null);

export const DiffusedRingVisualConfigContextProvider = ({
  initial = undefined,
  children,
}: PropsWithChildren<{
  initial?: Partial<RingVisualConfig>;
}>) => {
  const [radius, setRadius] = useState<number>(initial?.radius ?? 2);
  const [pointSize, setPointSize] = useState<number>(initial?.pointSize ?? 0.2);
  const [mirrorEffects, setMirrorEffects] = useState<boolean>(
    initial?.mirrorEffects ?? false,
  );

  return (
    <DiffusedRingVisualConfigContext.Provider
      value={{
        config: {
          radius: radius,
          pointSize: pointSize,
          mirrorEffects: mirrorEffects,
        },
        setters: {
          setRadius: setRadius,
          setPointSize: setPointSize,
          setMirrorEffects: setMirrorEffects,
        },
      }}
    >
      {children}
    </DiffusedRingVisualConfigContext.Provider>
  );
};

export function useDiffusedRingVisualConfigContext() {
  const context = useContext(DiffusedRingVisualConfigContext);
  if (!context) {
    throw new Error(
      "useDiffusedRingVisualConfigContext must be used within a DiffusedRingVisualConfigContextProvider",
    );
  }
  return context.config;
}

export function useDiffusedRingVisualConfigContextSetters() {
  const context = useContext(DiffusedRingVisualConfigContext);
  if (!context) {
    throw new Error(
      "useDiffusedRingVisualConfigContextSetters must be used within a DiffusedRingVisualConfigContextProvider",
    );
  }
  return context.setters;
}
