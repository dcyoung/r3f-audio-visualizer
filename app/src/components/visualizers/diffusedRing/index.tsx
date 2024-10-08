import { lazy, Suspense, useMemo } from "react";
import { APPLICATION_MODE } from "@/lib/applicationModes";
import { CircleDashed } from "lucide-react";

import { type TVisualProps } from "../models";

const ReactiveComponent = (props: TVisualProps) => {
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
  id: "diffusedRing",
  icon: CircleDashed,
  ReactiveComponent,
  ControlsComponent,
  supportedApplicationModes: [
    APPLICATION_MODE.WAVE_FORM,
    APPLICATION_MODE.NOISE,
    APPLICATION_MODE.AUDIO,
  ],
} as const;
