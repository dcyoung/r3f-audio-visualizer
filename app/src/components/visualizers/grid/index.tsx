import { lazy, Suspense, useMemo } from "react";
import { Grid3x3 } from "lucide-react";

import { type VisualProps } from "../models";

const ReactiveComponent = (props: VisualProps) => {
  const VisualComponent = useMemo(
    () =>
      lazy(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        async () => await import(`./reactive`),
      ),
    [],
  );
  return (
    <Suspense fallback={null}>
      <VisualComponent {...props} />
    </Suspense>
  );
};

const ControlsComponent = () => {
  const ControlsComponent = useMemo(
    () =>
      lazy(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        async () => await import(`./controls`),
      ),
    [],
  );
  return (
    <Suspense fallback={null}>
      <ControlsComponent />
    </Suspense>
  );
};

export default {
  id: "grid",
  icon: Grid3x3,
  ReactiveComponent,
  ControlsComponent,
} as const;
