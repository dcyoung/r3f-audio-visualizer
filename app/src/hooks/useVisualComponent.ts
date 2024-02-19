import { lazy, useMemo } from "react";
import { type VisualType } from "@/components/visualizers/common";

export const useVisualComponent = (visual: VisualType) => {
  return useMemo(
    () =>
      lazy(
        async () =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          await import(`@/components/visualizers/${visual}/reactive.tsx`),
      ),
    [visual],
  );
};
