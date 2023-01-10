import create from "zustand";

interface IAppState {
  data: number[];
  resizeData: (newSize: number) => void;
}

export const useAppState = create<IAppState>((set, get) => ({
  data: new Array<number>(121).fill(0),
  resizeData: (newSize: number) =>
    set((state) => {
      return { data: new Array<number>(newSize).fill(0) };
    }),
}));
