import { lazy, Suspense, useMemo } from "react";
import { APPLICATION_MODE } from "@/lib/applicationModes";
import ScopeControls from "@/components/visualizers/audioScope/controls";
import { Shell } from "lucide-react";

import { type TVisualProps } from "../models";

const ReactiveComponent = (props: TVisualProps) => {
  const VisualComponent = useMemo(
    () => lazy(async () => await import(`./reactive`)),
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
