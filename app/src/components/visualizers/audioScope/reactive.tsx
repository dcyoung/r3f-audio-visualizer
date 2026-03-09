import { createConfigStore } from "@/lib/storeHelpers";

export interface IScopeSettings {
  nParticles: number;
  pointScale: number;
  baseHue: number;
  decay: number;
  desaturation: number;
  minSaturation: number;
  useLines: boolean;
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
      useLines: false,
    },
    lines: {
      nParticles: 512,
      pointScale: 1.0,
      baseHue: 0.0,
      decay: 0.1,
      desaturation: 0.15,
      minSaturation: 0.65,
      useLines: true,
    },
  });
