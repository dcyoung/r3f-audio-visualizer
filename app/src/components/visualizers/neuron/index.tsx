import { lazy, Suspense, useMemo } from "react";
import { APPLICATION_MODE } from "@/lib/applicationModes";
import { Network } from "lucide-react";

import { type TVisualProps } from "../models";

const ReactiveComponent = (props: TVisualProps) => {
  const VisualComponent = useMemo(
    () => lazy(async () => await import("./reactive")),
    [],
  );
  return (
    <Suspense fallback={null}>
      <VisualComponent {...props} />
    </Suspense>
  );
};

const ControlsComponent = () => {
  const Controls = useMemo(
    () => lazy(async () => await import("./controls")),
    [],
  );
  return (
    <Suspense fallback={null}>
      <Controls />
    </Suspense>
  );
};

export default {
  id: "neuron",
  icon: Network,
  ReactiveComponent,
  ControlsComponent,
  supportedApplicationModes: [APPLICATION_MODE.NEURON],
} as const;
