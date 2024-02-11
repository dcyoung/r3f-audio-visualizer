import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";

export interface GridVisualConfig {
  nRows: number;
  nCols: number;
  unitSideLength: number;
  unitSpacingScalar: number;
}

export const GridVisualConfigContext = createContext<{
  config: GridVisualConfig;
  setters: {
    setNRows: Dispatch<SetStateAction<number>>;
    setNCols: Dispatch<SetStateAction<number>>;
    setUnitSideLength: Dispatch<SetStateAction<number>>;
    setUnitSpacingScalar: Dispatch<SetStateAction<number>>;
  };
} | null>(null);

export const GridVisualConfigContextProvider = ({
  initial = undefined,
  children,
}: PropsWithChildren<{
  initial?: Partial<GridVisualConfig>;
}>) => {
  const [nCols, setNCols] = useState<number>(initial?.nCols ?? 100);
  const [nRows, setNRows] = useState<number>(initial?.nRows ?? 100);
  const [unitSideLength, setUnitSideLength] = useState<number>(
    initial?.unitSideLength ?? 0.025,
  );
  const [unitSpacingScalar, setUnitSpacingScalar] = useState<number>(
    initial?.unitSpacingScalar ?? 5,
  );

  return (
    <GridVisualConfigContext.Provider
      value={{
        config: {
          nCols: nCols,
          nRows: nRows,
          unitSideLength: unitSideLength,
          unitSpacingScalar: unitSpacingScalar,
        },
        setters: {
          setNCols: setNCols,
          setNRows: setNRows,
          setUnitSideLength: setUnitSideLength,
          setUnitSpacingScalar: setUnitSpacingScalar,
        },
      }}
    >
      {children}
    </GridVisualConfigContext.Provider>
  );
};

export function useGridVisualConfigContext() {
  const context = useContext(GridVisualConfigContext);
  if (!context) {
    throw new Error(
      "useGridVisualConfigContext must be used within a GridVisualConfigContextProvider",
    );
  }
  return context.config;
}

export function useGridVisualConfigContextSetters() {
  const context = useContext(GridVisualConfigContext);
  if (!context) {
    throw new Error(
      "useGridVisualConfigContextSetters must be used within a GridVisualConfigContextProvider",
    );
  }
  return context.setters;
}
