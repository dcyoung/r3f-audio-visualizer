import { type HTMLAttributes } from "react";
import {
  AVAILABLE_VISUALS,
  type VisualType,
} from "@/components/visualizers/common";
import { useVisualContext, useVisualContextSetters } from "@/context/visual";
import { Box, Boxes, CircleDashed, Dna, Globe, Grid3x3 } from "lucide-react";

import { Dock, DockItem, DockNav } from "./dock";

const VisualIcon = ({ visual }: { visual: VisualType }) => {
  switch (visual) {
    case "grid":
      return <Grid3x3 />;
    case "cube":
      return <Box />;
    case "sphere":
      return <Globe />;
    case "diffusedRing":
      return <CircleDashed />;
    case "dna":
      return <Dna />;
    case "boxes":
      return <Boxes />;
    default:
      return visual satisfies never;
  }
};

export const VisualsDock = ({ ...props }: HTMLAttributes<HTMLDivElement>) => {
  const { visual: activeVisual } = useVisualContext();
  const { setVisual } = useVisualContextSetters();

  return (
    <Dock {...props}>
      <DockNav>
        {AVAILABLE_VISUALS.map((visual) => (
          <DockItem
            key={`dock_item_${visual}`}
            aria-selected={visual === activeVisual}
            onClick={() => setVisual(visual)}
          >
            <VisualIcon visual={visual} />
          </DockItem>
        ))}
      </DockNav>
    </Dock>
  );
};

export default VisualsDock;
