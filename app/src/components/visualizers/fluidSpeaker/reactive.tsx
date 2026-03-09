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
      speakerAmplitude: 0.02,
      cylinderRadius: 0.35,
      cylinderHeight: 0.5,
      color: "#22CCBB",
      showWireframe: false,
    },
  },
);

const FluidSpeakerVisual = ({ coordinateMapper }: TVisualProps) => {
  const params = useParams();
  return <BaseVisual coordinateMapper={coordinateMapper} {...params} />;
};

export default (props: TVisualProps) => <FluidSpeakerVisual {...props} />;
