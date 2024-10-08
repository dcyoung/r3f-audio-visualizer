import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";

export interface ModeConfig {
  showUI: boolean;
}

export const ModeContext = createContext<{
  config: ModeConfig;
  setters: {
    setShowUI: Dispatch<SetStateAction<boolean>>;
  };
} | null>(null);

export const ModeContextProvider = ({ children }: PropsWithChildren) => {
  const [showUI, setShowUI] = useState<boolean>(true);

  return (
    <ModeContext.Provider
      value={{
        config: {
          showUI,
        },
        setters: {
          setShowUI,
        },
      }}
    >
      {children}
    </ModeContext.Provider>
  );
};

export function useModeContext() {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error("useModeContext must be used within a ModeContextProvider");
  }
  return context.config;
}

export function useModeContextSetters() {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error("useModeContext must be used within a ModeContextProvider");
  }
  return context.setters;
}
