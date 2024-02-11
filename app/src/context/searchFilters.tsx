import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";

export interface SearchFilters {
  query: string | undefined;
}

export const SearchFiltersContext = createContext<{
  filters: SearchFilters;
  setters: {
    setQuery: Dispatch<SetStateAction<string | undefined>>;
  };
} | null>(null);

export const SearchFiltersContextProvider = ({
  initial = undefined,
  children,
}: PropsWithChildren<{
  initial?: Partial<SearchFilters>;
}>) => {
  const [query, setQuery] = useState<string | undefined>(initial?.query);

  return (
    <SearchFiltersContext.Provider
      value={{
        filters: {
          query: query,
        },
        setters: {
          setQuery: setQuery,
        },
      }}
    >
      {children}
    </SearchFiltersContext.Provider>
  );
};

export function useSearchFiltersContext() {
  const context = useContext(SearchFiltersContext);
  if (!context) {
    throw new Error(
      "useSearchFiltersContext must be used within a SearchFiltersContextProvider",
    );
  }
  return context.filters;
}

export function useSearchFiltersContextSetters() {
  const context = useContext(SearchFiltersContext);
  if (!context) {
    throw new Error(
      "useSearchFiltersContextSetters must be used within a SearchFiltersContextProvider",
    );
  }
  return context.setters;
}
