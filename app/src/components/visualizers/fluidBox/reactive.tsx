import { type ComponentPropsWithoutRef } from "react";
import {
  type TOmitVisualProps,
  type TVisualProps,
} from "@/components/visualizers/models";
import { createConfigStore } from "@/lib/storeHelpers";

import BaseVisual from "./base";

export type TConfig = Required<
  TOmitVisualProps<ComponentPropsWithoutRef<typeof BaseVisual>>
>;

export const { useParams, useActions, usePresets } = createConfigStore<TConfig>(
  {
    default: {
      particleCount: 8192 * 9,
      stiffness: 50,
      restDensity: 1.5,
      dynamicViscosity: 0.1,
      wallAmplitude: 0.15,
      color: "#22CCBB",
      showWireframe: false,
    },
  },
);

const FluidBoxVisual = ({ coordinateMapper }: TVisualProps) => {
  const params = useParams();
  return <BaseVisual coordinateMapper={coordinateMapper} {...params} />;
};

export default (props: TVisualProps) => <FluidBoxVisual {...props} />;
