import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";

export interface StencilVisualConfig {
  bounds: [number, number];
  power: number;
  useNoise: boolean;
  pointSize: number;
  transitionSpeed: number;
}

export const StencilVisualConfigContext = createContext<{
  config: StencilVisualConfig;
  setters: {
    setBounds: Dispatch<SetStateAction<[number, number]>>;
    setPower: Dispatch<SetStateAction<number>>;
    setUseNoise: Dispatch<SetStateAction<boolean>>;
    setPointSize: Dispatch<SetStateAction<number>>;
    setTransitionSpeed: Dispatch<SetStateAction<number>>;
  };
} | null>(null);

export const StencilVisualConfigContextProvider = ({
  initial = undefined,
  children,
}: PropsWithChildren<{
  initial?: Partial<StencilVisualConfig>;
}>) => {
  const [bounds, setBounds] = useState<[number, number]>(
    initial?.bounds ?? [0.15, 0.73],
  );
  const [power, setPower] = useState<number>(initial?.power ?? 1.0);
  const [useNoise, setUseNoise] = useState<boolean>(initial?.useNoise ?? false);
  const [pointSize, setPointSize] = useState<number>(initial?.pointSize ?? 0.2);
  const [transitionSpeed, setTransitionSpeed] = useState<number>(
    initial?.transitionSpeed ?? 10,
  );

  return (
    <StencilVisualConfigContext.Provider
      value={{
        config: {
          bounds,
          power,
          useNoise,
          pointSize,
          transitionSpeed,
        },
        setters: {
          setBounds,
          setPower,
          setUseNoise,
          setPointSize,
          setTransitionSpeed,
        },
      }}
    >
      {children}
    </StencilVisualConfigContext.Provider>
  );
};

export function useStencilVisualConfigContext() {
  const context = useContext(StencilVisualConfigContext);
  if (!context) {
    throw new Error(
      "useStencilVisualConfigContext must be used within a StencilVisualConfigContextProvider",
    );
  }
  return context.config;
}

export function useStencilVisualConfigContextSetters() {
  const context = useContext(StencilVisualConfigContext);
  if (!context) {
    throw new Error(
      "useStencilVisualConfigContextSetters must be used within a StencilVisualConfigContextProvider",
    );
  }
  return context.setters;
}
