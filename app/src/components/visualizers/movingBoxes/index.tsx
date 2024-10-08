import { lazy, Suspense, useMemo } from "react";
import { Boxes } from "lucide-react";

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

export default {
  id: "movingBoxes",
  icon: Boxes,
  ReactiveComponent,
  ControlsComponent: null,
} as const;
