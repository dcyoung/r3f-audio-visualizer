import { useMemo, type HTMLAttributes } from "react";
import { VISUAL_REGISTRY } from "@/components/visualizers/registry";
import { useVisualContext, useVisualContextSetters } from "@/context/visual";
import { APPLICATION_MODE } from "@/lib/applicationModes";
import { useMode } from "@/lib/appState";

import { Dock, DockItem, DockNav } from "./dock";

export const VisualsDock = ({ ...props }: HTMLAttributes<HTMLDivElement>) => {
  const { visual: activeVisual } = useVisualContext();
  const { setVisualId } = useVisualContextSetters();
  const mode = useMode();

  const supportedVisuals = useMemo(() => {
    switch (mode) {
      case APPLICATION_MODE.AUDIO:
      case APPLICATION_MODE.NOISE:
      case APPLICATION_MODE.WAVE_FORM:
        return Object.values(VISUAL_REGISTRY);
      // case APPLICATION_MODE.AUDIO_SCOPE:
      default:
        return [];
    }
  }, [mode]);

  return (
    <Dock {...props}>
      <DockNav>
        {supportedVisuals.map((visual) => (
          <DockItem
            key={`dock_item_${visual.id}`}
            aria-selected={visual === activeVisual}
            onClick={() => setVisualId(visual.id)}
          >
            {<visual.icon />}
          </DockItem>
        ))}
      </DockNav>
    </Dock>
  );
};

export default VisualsDock;
