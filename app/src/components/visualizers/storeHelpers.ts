import { create } from "zustand";

export function createVisualConfigStore<T>(
  presets: { default: T } & Record<string, T>,
) {
  const useStore = create<{
    visualParams: T;
    presets: {
      active: keyof typeof presets | undefined;
      options: typeof presets;
    };
    actions: {
      setVisualParams: (newParams: Partial<T>) => void;
      setPreset: (preset: keyof typeof presets | undefined) => void;
    };
  }>()((set) => ({
    presets: {
      active: "default",
      options: presets,
    },
    visualParams: {
      ...presets.default,
    },
    actions: {
      setVisualParams: (newParams: Partial<T>) =>
        set((state) => {
          return {
            visualParams: { ...state.visualParams, ...newParams },
          };
        }),
      setPreset: (preset: keyof typeof presets | undefined) =>
        set((state) => {
          return {
            presets: { ...state.presets, active: preset },
            ...(!!preset && {
              visualParams: {
                ...state.visualParams,
                ...state.presets.options[preset],
              },
            }),
          };
        }),
      reset: () =>
        set((state) => {
          return {
            presets: { ...state.presets, active: "default" },
            visualParams: { ...state.presets.options.default },
          };
        }),
    },
  }));
  return {
    useStore,
    usePresets: () => useStore((state) => state.presets),
    useVisualParams: () => useStore((state) => state.visualParams),
    useActions: () => useStore((state) => state.actions),
  };
}
