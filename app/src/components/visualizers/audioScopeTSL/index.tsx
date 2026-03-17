import { lazy, Suspense, useMemo } from "react";
import ScopeControls from "@/components/visualizers/audioScope/controls";
import { APPLICATION_MODE } from "@/lib/applicationModes";
import { Shell } from "lucide-react";

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

export default {
  id: "scope",
  icon: Shell,
  ReactiveComponent,
  ControlsComponent: ScopeControls,
  supportedApplicationModes: [APPLICATION_MODE.AUDIO_SCOPE],
} as const;
