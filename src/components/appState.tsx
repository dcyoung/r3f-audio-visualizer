import create from "zustand";

interface IAppState {
  data: number[];
  resizeData: (n: number) => void;
}

export const useAppState = create<IAppState>((set, get) => ({
  data: new Array<number>(121).fill(0),
  resizeData: (n: number) =>
    set(() => {
      return { data: new Array<number>(n).fill(0) };
    }),
}));
