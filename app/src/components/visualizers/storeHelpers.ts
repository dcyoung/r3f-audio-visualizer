import { create } from "zustand";

export function createVisualConfigStore<T>(defaults: T) {
  const useStore = create<{
    visualParams: T;
    actions: {
      setVisualParams: (newParams: Partial<T>) => void;
    };
  }>()((set) => ({
    visualParams: {
      ...defaults,
    },
    actions: {
      setVisualParams: (newParams: Partial<T>) =>
        set((state) => {
          return {
            visualParams: { ...state.visualParams, ...newParams },
          };
        }),
      reset: () =>
        set(() => {
          return {
            visualParams: { ...defaults },
          };
        }),
    },
  }));
  return {
    useStore,
    useVisualParams: () => useStore((state) => state.visualParams),
    useActions: () => useStore((state) => state.actions),
  };
}
