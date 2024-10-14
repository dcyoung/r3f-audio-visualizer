import { create } from "zustand";

export function createConfigStore<T>(
  presets: { default: T } & Record<string, T>,
) {
  const useStore = create<{
    params: T;
    presets: {
      active: keyof typeof presets | undefined;
      options: typeof presets;
    };
    actions: {
      setParams: (newParams: Partial<T>) => void;
      setPreset: (preset: keyof typeof presets | undefined) => void;
    };
  }>()((set) => ({
    presets: {
      active: "default",
      options: presets,
    },
    params: {
      ...presets.default,
    },
    actions: {
      setParams: (newParams: Partial<T>) =>
        set((state) => {
          return {
            params: { ...state.params, ...newParams },
          };
        }),
      setPreset: (preset: keyof typeof presets | undefined) =>
        set((state) => {
          return {
            presets: { ...state.presets, active: preset },
            ...(!!preset && {
              params: {
                ...state.params,
                ...state.presets.options[preset],
              },
            }),
          };
        }),
    },
  }));
  return {
    useStore,
    usePresets: () => useStore((state) => state.presets),
    useParams: () => useStore((state) => state.params),
    useActions: () => useStore((state) => state.actions),
  };
}

export function createConfigurableInstance<
  U extends {
    params: T;
    clone: (params: Partial<T>) => U;
  },
  T,
>(initialInstance: U, presets: { default: T } & Record<string, T>) {
  const useStore = create<{
    instance: U;
    presets: {
      active: keyof typeof presets | undefined;
      options: typeof presets;
    };
    actions: {
      setParams: (newParams: Partial<T>) => void;
      setPreset: (preset: keyof typeof presets | undefined) => void;
    };
  }>()((set) => ({
    presets: {
      active: "default",
      options: presets,
    },
    instance: initialInstance,
    actions: {
      setParams: (newParams: Partial<T>) =>
        set((state) => {
          return {
            instance: state.instance.clone(newParams),
          };
        }),
      setPreset: (preset: keyof typeof presets | undefined) =>
        set((state) => {
          return {
            presets: { ...state.presets, active: preset },
            ...(!!preset && {
              instance: state.instance.clone(state.presets.options[preset]),
            }),
          };
        }),
    },
  }));
  return {
    useStore,
    usePresets: () => useStore((state) => state.presets),
    useInstance: () => useStore((state) => state.instance),
    useActions: () => useStore((state) => state.actions),
  };
}
