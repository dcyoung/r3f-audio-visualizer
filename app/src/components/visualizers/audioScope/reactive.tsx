import { createConfigStore } from "@/lib/storeHelpers";

import { type TVisualProps } from "../models";
import BaseScopeVisual from "./base";

export interface IScopeSettings {
  nParticles: number;
  pointScale: number;
  baseHue: number;
  decay: number;
  desaturation: number;
  minSaturation: number;
}

export const { useParams, useActions, usePresets } =
  createConfigStore<IScopeSettings>({
    default: {
      nParticles: 512,
      pointScale: 1.2,
      baseHue: 0.0,
      decay: 0.1,
      desaturation: 0.15,
      minSaturation: 0.65,
    },
  });

export default ({ textureMapper }: TVisualProps) => {
  const params = useParams();
  return <BaseScopeVisual textureMapper={textureMapper} {...params} />;
};
