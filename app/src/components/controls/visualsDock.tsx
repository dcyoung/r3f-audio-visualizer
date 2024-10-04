import { type HTMLAttributes } from "react";
import { useVisualContext, useVisualContextSetters } from "@/context/visual";

import { VisualRegistry } from "../visualizers/registry";
import { Dock, DockItem, DockNav } from "./dock";

export const VisualsDock = ({ ...props }: HTMLAttributes<HTMLDivElement>) => {
  const { visual: activeVisual } = useVisualContext();
  const { setVisual } = useVisualContextSetters();

  return (
    <Dock {...props}>
      <DockNav>
        {VisualRegistry.visuals.map((visual) => (
          <DockItem
            key={`dock_item_${visual.id}`}
            aria-selected={visual.id === activeVisual}
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
