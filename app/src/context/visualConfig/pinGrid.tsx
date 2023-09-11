import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";

export interface PinGridVisualConfig {
  nRows: number;
  nCols: number;
  unitSideLength: number;
}

export const PinGridVisualConfigContext = createContext<{
  config: PinGridVisualConfig;
  setters: {
    setNRows: Dispatch<SetStateAction<number>>;
    setNCols: Dispatch<SetStateAction<number>>;
    setUnitSideLength: Dispatch<SetStateAction<number>>;
  };
} | null>(null);

export const PinGridVisualConfigContextProvider = ({
  initial = undefined,
  children,
}: PropsWithChildren<{
  initial?: Partial<PinGridVisualConfig>;
}>) => {
  const [nCols, setNCols] = useState<number>(initial?.nCols ?? 50);
  const [nRows, setNRows] = useState<number>(initial?.nRows ?? 50);
  const [unitSideLength, setUnitSideLength] = useState<number>(
    initial?.unitSideLength ?? 0.3
  );

  return (
    <PinGridVisualConfigContext.Provider
      value={{
        config: {
          nCols: nCols,
          nRows: nRows,
          unitSideLength: unitSideLength,
        },
        setters: {
          setNCols: setNCols,
          setNRows: setNRows,
          setUnitSideLength: setUnitSideLength,
        },
      }}
    >
      {children}
    </PinGridVisualConfigContext.Provider>
  );
};

export function usePinGridVisualConfigContext() {
  const context = useContext(PinGridVisualConfigContext);
  if (!context) {
    throw new Error(
      "usePinGridVisualConfigContext must be used within a PinGridVisualConfigContextProvider"
    );
  }
  return context.config;
}

export function usePinGridVisualConfigContextSetters() {
  const context = useContext(PinGridVisualConfigContext);
  if (!context) {
    throw new Error(
      "usePinGridVisualConfigContextSetters must be used within a PinGridVisualConfigContextProvider"
    );
  }
  return context.setters;
}
