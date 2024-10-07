import { lazy, Suspense, useMemo } from "react";
import { CircleDashed } from "lucide-react";

import { type VisualProps } from "../common";
import ControlsComponent from "./controls";

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
  id: "diffusedRing",
  icon: CircleDashed,
  ReactiveComponent,
  ControlsComponent,
} as const;
