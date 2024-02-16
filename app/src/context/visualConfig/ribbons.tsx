import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";

export interface RibbonsVisualConfig {
  nRibbons: number;
}

export const RibbonsVisualConfigContext = createContext<{
  config: RibbonsVisualConfig;
  setters: {
    setNRibbons: Dispatch<SetStateAction<number>>;
    reset: Dispatch<void>;
  };
} | null>(null);

export const RibbonsVisualConfigContextProvider = ({
  initial = undefined,
  children,
}: PropsWithChildren<{
  initial?: Partial<RibbonsVisualConfig>;
}>) => {
  const [nRibbons, setNRibbons] = useState<number>(initial?.nRibbons ?? 5);
  return (
    <RibbonsVisualConfigContext.Provider
      value={{
        config: {
          nRibbons,
        },
        setters: {
          setNRibbons,
          reset: () => {
            setNRibbons(initial?.nRibbons ?? 5);
          },
        },
      }}
    >
      {children}
    </RibbonsVisualConfigContext.Provider>
  );
};

export function useRibbonsVisualConfigContext() {
  const context = useContext(RibbonsVisualConfigContext);
  if (!context) {
    throw new Error(
      "useRibbonsVisualConfigContext must be used within a RibbonsVisualConfigContextProvider",
    );
  }
  return context.config;
}

export function useRibbonsVisualConfigContextSetters() {
  const context = useContext(RibbonsVisualConfigContext);
  if (!context) {
    throw new Error(
      "useRibbonsVisualConfigContextSetters must be used within a RibbonsVisualConfigContextProvider",
    );
  }
  return context.setters;
}
