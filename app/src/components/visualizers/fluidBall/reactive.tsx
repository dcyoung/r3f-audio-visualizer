import { type ComponentPropsWithoutRef } from "react";
import {
  type TOmitVisualProps,
  type TVisualProps,
} from "@/components/visualizers/models";
import { DEFAULT_SPHERICAL_MAPPING_MODE } from "@/lib/mappers/coordinateMappers/sphericalUtils";
import { createConfigStore } from "@/lib/storeHelpers";

import BaseVisual from "./base";

export type TConfig = Required<
  TOmitVisualProps<ComponentPropsWithoutRef<typeof BaseVisual>>
>;

export const { useParams, useActions, usePresets } = createConfigStore<TConfig>(
  {
    default: {
      particleCount: 8192 * 4,
      stiffness: 60,
      restDensity: 2.0,
      dynamicViscosity: 0.35,
      sphereRadius: 0.28,
      morphScale: 0.25,
      color: "#22CCBB",
      showMorphMesh: true,
      mappingMode: DEFAULT_SPHERICAL_MAPPING_MODE,
    },
  },
);

const FluidBallVisual = ({ coordinateMapper }: TVisualProps) => {
  const params = useParams();
  return <BaseVisual coordinateMapper={coordinateMapper} {...params} />;
};

export default (props: TVisualProps) => <FluidBallVisual {...props} />;
