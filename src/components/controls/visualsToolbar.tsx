import { Info } from "lucide-react";

import { useVisualContextSetters } from "@/context/visual";

import { ToolbarItem } from "./common";
import { AVAILABLE_VISUALS } from "../canvas/Visual3D";

const VisualSelectButton = ({
  visual,
}: {
  visual: (typeof AVAILABLE_VISUALS)[number];
}) => {
  const { setVisual } = useVisualContextSetters();
  return (
    <ToolbarItem onClick={() => setVisual(visual)}>
      <Info />
    </ToolbarItem>
  );
};
export const VisualsToolbar = () => {
  return (
    <div className="pointer-events-none flex flex-row items-center justify-center gap-4">
      {AVAILABLE_VISUALS.map((visual) => (
        <VisualSelectButton visual={visual} key={visual} />
      ))}
    </div>
  );
};

export default VisualsToolbar;
