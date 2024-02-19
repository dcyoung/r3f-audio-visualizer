import { type HTMLAttributes } from "react";
import {
  AVAILABLE_VISUALS,
  VISUAL,
  type VisualType,
} from "@/components/visualizers/common";
import { useVisualContext, useVisualContextSetters } from "@/context/visual";
import {
  Box,
  Boxes,
  CircleDashed,
  Dna,
  Footprints,
  Globe,
  Grid3x3,
  HelpCircle,
  Ribbon,
} from "lucide-react";

import { Dock, DockItem, DockNav } from "./dock";

const VisualIcon = ({ visual }: { visual: VisualType }) => {
  switch (visual) {
    case VISUAL.GRID:
      return <Grid3x3 />;
    case VISUAL.CUBE:
      return <Box />;
    case VISUAL.SPHERE:
      return <Globe />;
    case VISUAL.DIFFUSED_RING:
      return <CircleDashed />;
    case VISUAL.DNA:
      return <Dna />;
    case VISUAL.BOXES:
      return <Boxes />;
    case VISUAL.RIBBONS:
      return <Ribbon />;
    case VISUAL.WALK:
      return <Footprints />;
    default:
      return <HelpCircle />;
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
