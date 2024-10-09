import { useMemo, type HTMLAttributes } from "react";
import { VISUAL_REGISTRY } from "@/components/visualizers/registry";
import { useAppStateActions, useMode, useVisual } from "@/lib/appState";

import { Dock, DockItem, DockNav } from "./dock";

export const VisualsDock = ({ ...props }: HTMLAttributes<HTMLDivElement>) => {
  const activeVisual = useVisual();
  const { setVisual } = useAppStateActions();
  const mode = useMode();

  const supportedVisuals = useMemo(() => {
    return Object.values(VISUAL_REGISTRY).filter((visual) =>
      [...visual.supportedApplicationModes].includes(mode),
    );
  }, [mode]);

  return (
    <Dock {...props}>
      <DockNav>
        {supportedVisuals.map((visual) => (
          <DockItem
            key={`dock_item_${visual.id}`}
            aria-selected={visual === activeVisual}
            onClick={() => setVisual(visual.id)}
          >
            {<visual.icon />}
          </DockItem>
        ))}
      </DockNav>
    </Dock>
  );
};

export default VisualsDock;
