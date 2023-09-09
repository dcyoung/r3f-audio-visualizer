import { Box, CircleDashed, Dna, Globe, Grid3x3, Pin } from "lucide-react";
import { type HTMLAttributes } from "react";

import { AVAILABLE_VISUALS } from "@/components/canvas/Visual3D";
import { ToolbarItem } from "@/components/controls/common";
import { useVisualContextSetters } from "@/context/visual";
import { cn } from "@/lib/utils";


const VisualIcon = ({
  visual,
}: {
  visual: (typeof AVAILABLE_VISUALS)[number];
}) => {
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
    case "pinGrid":
      return <Pin />;
    default:
      return visual satisfies never;
  }
};

const VisualSelectButton = ({
  visual,
}: {
  visual: (typeof AVAILABLE_VISUALS)[number];
}) => {
  const { setVisual } = useVisualContextSetters();
  return (
    <ToolbarItem onClick={() => setVisual(visual)}>
      <VisualIcon visual={visual} />
    </ToolbarItem>
  );
};

export const VisualsToolbar = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "pointer-events-none flex flex-row items-center justify-center gap-4",
        className
      )}
      {...props}
    >
      {AVAILABLE_VISUALS.map((visual) => (
        <VisualSelectButton visual={visual} key={visual} />
      ))}
    </div>
  );
};

export default VisualsToolbar;
