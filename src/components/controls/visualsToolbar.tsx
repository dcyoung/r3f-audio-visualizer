import { Info } from "lucide-react";
import { ToolbarItem } from "./common";
import { AVAILABLE_VISUALS } from "../canvas/Visual3D";
import { useVisualContextSetters } from "@/context/visual";

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
    <div className="flex flex-row justify-center items-center gap-4 pointer-events-none">
      {AVAILABLE_VISUALS.map((visual) => (
        <VisualSelectButton visual={visual} key={visual} />
      ))}
    </div>
  );
};

export default VisualsToolbar;
