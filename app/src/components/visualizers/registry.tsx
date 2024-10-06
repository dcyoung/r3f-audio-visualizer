import { lazy, Suspense, useMemo } from "react";
import {
  Box,
  Boxes,
  CircleDashed,
  Dna,
  Footprints,
  Globe,
  Grid3x3,
  Ribbon,
} from "lucide-react";

import { type VisualProps } from "./common";
import { CubeVisualConfigContextProvider } from "./cube/config";
import { CubeVisualSettingsControls } from "./cube/controls";
import { DiffusedRingVisualConfigContextProvider } from "./diffusedRing/config";
import { DiffusedRingVisualSettingsControls } from "./diffusedRing/controls";
import { DnaVisualConfigContextProvider } from "./dna/config";
import { GridVisualConfigContextProvider } from "./grid/config";
import { GridVisualSettingsControls } from "./grid/controls";
import { RibbonsVisualConfigContextProvider } from "./ribbons/config";
import { SphereVisualConfigContextProvider } from "./sphere/config";
import { SphereVisualSettingsControls } from "./sphere/sphere";

export type TVisualId = keyof typeof _REGISTRY;
export type TVisual = ReturnType<typeof VISUAL_REGISTRY.get>;
const LazyVisual = (visual: TVisualId, props: VisualProps) => {
  const VisualComponent = useMemo(
    () =>
      lazy(async () => {
        switch (visual) {
          case "grid":
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return await import(`./grid/reactive`);
          case "cube":
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return await import(`./cube/reactive`);
          case "sphere":
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return await import(`./sphere/reactive`);
          case "diffusedRing":
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return await import(`./diffusedRing/reactive`);
          case "dna":
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return await import(`./dna/reactive`);
          case "boxes":
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return await import(`./boxes/reactive`);
          case "ribbons":
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return await import(`./ribbons/reactive`);
          case "treadmill":
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return await import(`./treadmill/reactive`);
          default:
            return visual satisfies never;
        }
      }),
    [visual],
  );
  return (
    <Suspense fallback={null}>
      <VisualComponent {...props} />
    </Suspense>
  );
};
const _REGISTRY = {
  grid: {
    icon: Grid3x3,
    ReactiveComponent: (props: VisualProps) => LazyVisual("grid", props),
    configProvider: GridVisualConfigContextProvider,
    controls: GridVisualSettingsControls,
  },
  cube: {
    icon: Box,
    ReactiveComponent: (props: VisualProps) => LazyVisual("cube", props),
    configProvider: CubeVisualConfigContextProvider,
    controls: CubeVisualSettingsControls,
  },
  sphere: {
    icon: Globe,
    ReactiveComponent: (props: VisualProps) => LazyVisual("sphere", props),
    configProvider: SphereVisualConfigContextProvider,
    controls: SphereVisualSettingsControls,
  },
  diffusedRing: {
    icon: CircleDashed,
    ReactiveComponent: (props: VisualProps) =>
      LazyVisual("diffusedRing", props),
    configProvider: DiffusedRingVisualConfigContextProvider,
    controls: DiffusedRingVisualSettingsControls,
  },
  dna: {
    icon: Dna,
    ReactiveComponent: (props: VisualProps) => LazyVisual("dna", props),
    configProvider: DnaVisualConfigContextProvider,
    controls: null,
  },
  boxes: {
    icon: Boxes,
    ReactiveComponent: (props: VisualProps) => LazyVisual("boxes", props),
    configProvider: null,
    controls: null,
  },
  ribbons: {
    icon: Ribbon,
    ReactiveComponent: (props: VisualProps) => LazyVisual("ribbons", props),
    configProvider: RibbonsVisualConfigContextProvider,
    controls: null,
  },
  treadmill: {
    icon: Footprints,
    ReactiveComponent: (props: VisualProps) => LazyVisual("treadmill", props),
    configProvider: null,
    controls: null,
  },
  // stencil: {},
  // swarm: {},
} as const;

export class VISUAL_REGISTRY {
  public static get visuals() {
    return Object.entries(_REGISTRY).map(([id, other]) => ({
      id: id as TVisualId,
      ...other,
    }));
  }

  public static get(id: TVisualId) {
    return {
      id,
      ..._REGISTRY[id],
    };
  }
}
