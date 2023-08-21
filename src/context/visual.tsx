import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";

import { AVAILABLE_VISUALS } from "@/components/canvas/Visual3D";

type Visual = (typeof AVAILABLE_VISUALS)[number];
export interface VisualConfig {
  visual: Visual;
}

export const VisualContext = createContext<{
  config: VisualConfig;
  setters: {
    setVisual: Dispatch<SetStateAction<Visual>>;
  };
} | null>(null);

export const VisualContextProvider = ({ children }: PropsWithChildren) => {
  const [visual, setVisual] = useState<Visual>(AVAILABLE_VISUALS[0]);

  return (
    <VisualContext.Provider
      value={{
        config: {
          visual: visual,
        },
        setters: {
          setVisual: setVisual,
        },
      }}
    >
      {children}
    </VisualContext.Provider>
  );
};

export function useVisualContext() {
  const context = useContext(VisualContext);
  if (!context) {
    throw new Error(
      "useVisualContext must be used within a VisualContextProvider"
    );
  }
  return context.config;
}

export function useVisualContextSetters() {
  const context = useContext(VisualContext);
  if (!context) {
    throw new Error(
      "useVisualContext must be used within a VisualContextProvider"
    );
  }
  return context.setters;
}
