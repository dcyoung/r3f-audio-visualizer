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

export const RingVisualConfigContext = createContext<{
  config: RingVisualConfig;
  setters: {
    setRadius: Dispatch<SetStateAction<number>>;
    setPointSize: Dispatch<SetStateAction<number>>;
    setMirrorEffects: Dispatch<SetStateAction<boolean>>;
  };
} | null>(null);

export const RingVisualConfigContextProvider = ({
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
    <RingVisualConfigContext.Provider
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
    </RingVisualConfigContext.Provider>
  );
};

export function useRingVisualConfigContext() {
  const context = useContext(RingVisualConfigContext);
  if (!context) {
    throw new Error(
      "useRingVisualConfigContext must be used within a RingVisualConfigContextProvider",
    );
  }
  return context.config;
}

export function useRingVisualConfigContextSetters() {
  const context = useContext(RingVisualConfigContext);
  if (!context) {
    throw new Error(
      "useRingVisualConfigContextSetters must be used within a RingVisualConfigContextProvider",
    );
  }
  return context.setters;
}
