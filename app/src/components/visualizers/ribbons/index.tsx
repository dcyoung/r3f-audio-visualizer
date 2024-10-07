import { lazy, Suspense, useMemo } from "react";
import { Ribbon } from "lucide-react";

import { type VisualProps } from "../common";

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
  id: "ribbons",
  icon: Ribbon,
  ReactiveComponent,
  ControlsComponent: null,
} as const;
