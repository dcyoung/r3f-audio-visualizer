import { Suspense } from "react";
import { useVisualComponent } from "@/hooks/useVisualComponent";
import { type ICoordinateMapper } from "@/lib/mappers/coordinateMappers/common";
import { type IScalarTracker } from "@/lib/mappers/valueTracker/common";

import { type VisualType } from "./common";

export const Visual = ({
  visual,
  coordinateMapper,
  scalarTracker,
}: {
  visual: VisualType;
  coordinateMapper?: ICoordinateMapper;
  scalarTracker?: IScalarTracker;
}) => {
  const VisualComponent = useVisualComponent(visual);
  return (
    <Suspense fallback={null}>
      <VisualComponent
        coordinateMapper={coordinateMapper}
        scalarTracker={scalarTracker}
      />
    </Suspense>
  );
};
