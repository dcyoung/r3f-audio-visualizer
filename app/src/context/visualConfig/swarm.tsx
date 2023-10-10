import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";

export interface SwarmVisualConfig {
  maxDim: number;
  pointSize: number;
}

export const SwarmVisualConfigContext = createContext<{
  config: SwarmVisualConfig;
  setters: {
    setMaxDim: Dispatch<SetStateAction<number>>;
    setPointSize: Dispatch<SetStateAction<number>>;
  };
} | null>(null);

export const SwarmVisualConfigContextProvider = ({
  initial = undefined,
  children,
}: PropsWithChildren<{
  initial?: Partial<SwarmVisualConfig>;
}>) => {
  const [maxDim, setMaxDim] = useState<number>(initial?.maxDim ?? 10);
  const [pointSize, setPointSize] = useState<number>(initial?.pointSize ?? 0.2);

  return (
    <SwarmVisualConfigContext.Provider
      value={{
        config: {
          maxDim: maxDim,
          pointSize: pointSize,
        },
        setters: {
          setMaxDim: setMaxDim,
          setPointSize: setPointSize,
        },
      }}
    >
      {children}
    </SwarmVisualConfigContext.Provider>
  );
};

export function useSwarmVisualConfigContext() {
  const context = useContext(SwarmVisualConfigContext);
  if (!context) {
    throw new Error(
      "useSwarmVisualConfigContext must be used within a SwarmVisualConfigContextProvider"
    );
  }
  return context.config;
}

export function useSwarmVisualConfigContextSetters() {
  const context = useContext(SwarmVisualConfigContext);
  if (!context) {
    throw new Error(
      "useSwarmVisualConfigContextSetters must be used within a SwarmVisualConfigContextProvider"
    );
  }
  return context.setters;
}
