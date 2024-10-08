import { lazy, Suspense, useMemo } from "react";
import { Dna } from "lucide-react";

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
  id: "dna",
  icon: Dna,
  ReactiveComponent,
  ControlsComponent: null,
} as const;
