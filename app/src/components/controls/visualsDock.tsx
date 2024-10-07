import { type HTMLAttributes } from "react";
import { VISUAL_REGISTRY } from "@/components/visualizers/registry";
import { useVisualContext, useVisualContextSetters } from "@/context/visual";

import { Dock, DockItem, DockNav } from "./dock";

export const VisualsDock = ({ ...props }: HTMLAttributes<HTMLDivElement>) => {
  const { visual: activeVisual } = useVisualContext();
  const { setVisualId } = useVisualContextSetters();

  return (
    <Dock {...props}>
      <DockNav>
        {Object.values(VISUAL_REGISTRY).map((visual) => (
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
