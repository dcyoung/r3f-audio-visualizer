import { lazy, Suspense, useMemo } from "react";
import {
  Boxes,
  CircleDashed,
  Dna,
  Footprints,
  Globe,
  Grid3x3,
  Ribbon,
} from "lucide-react";

import { type VisualProps } from "./common";
import {
  CubeVisualConfigContextProvider,
  useCubeVisualConfigContext,
  useCubeVisualConfigContextSetters,
} from "./cube/config";
import {
  DiffusedRingVisualConfigContextProvider,
  useDiffusedRingVisualConfigContext,
} from "./diffusedRing/config";
import {
  DnaVisualConfigContextProvider,
  useDnaVisualConfigContext,
  useDnaVisualConfigContextSetters,
} from "./dna/config";
import {
  GridVisualConfigContextProvider,
  useGridVisualConfigContext,
  useGridVisualConfigContextSetters,
} from "./grid/config";
import {
  RibbonsVisualConfigContextProvider,
  useRibbonsVisualConfigContext,
  useRibbonsVisualConfigContextSetters,
} from "./ribbons/config";
import {
  SphereVisualConfigContextProvider,
  useSphereVisualConfigContext,
  useSphereVisualConfigContextSetters,
} from "./sphere/config";

export type TVisualId = keyof typeof _REGISTRY;

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
    config: {
      provider: GridVisualConfigContextProvider,
      useConfig: useGridVisualConfigContext,
      useConfigSetters: useGridVisualConfigContextSetters,
    },
  },
  cube: {
    icon: Boxes,
    ReactiveComponent: (props: VisualProps) => LazyVisual("cube", props),
    config: {
      provider: CubeVisualConfigContextProvider,
      useConfig: useCubeVisualConfigContext,
      useConfigSetters: useCubeVisualConfigContextSetters,
    },
  },
  sphere: {
    icon: Globe,
    ReactiveComponent: (props: VisualProps) => LazyVisual("sphere", props),
    config: {
      provider: SphereVisualConfigContextProvider,
      useConfig: useSphereVisualConfigContext,
      useConfigSetters: useSphereVisualConfigContextSetters,
    },
  },
  diffusedRing: {
    icon: CircleDashed,
    ReactiveComponent: (props: VisualProps) =>
      LazyVisual("diffusedRing", props),
    config: {
      provider: DiffusedRingVisualConfigContextProvider,
      useConfig: useDiffusedRingVisualConfigContext,
      useConfigSetters: useDiffusedRingVisualConfigContext,
    },
  },
  dna: {
    icon: Dna,
    ReactiveComponent: (props: VisualProps) => LazyVisual("dna", props),
    config: {
      provider: DnaVisualConfigContextProvider,
      useConfig: useDnaVisualConfigContext,
      useConfigSetters: useDnaVisualConfigContextSetters,
    },
  },
  boxes: {
    icon: Boxes,
    ReactiveComponent: (props: VisualProps) => LazyVisual("boxes", props),
    config: null,
  },
  ribbons: {
    icon: Ribbon,
    ReactiveComponent: (props: VisualProps) => LazyVisual("ribbons", props),
    config: {
      provider: RibbonsVisualConfigContextProvider,
      useConfig: useRibbonsVisualConfigContext,
      useConfigSetters: useRibbonsVisualConfigContextSetters,
    },
  },
  treadmill: {
    icon: Footprints,
    ReactiveComponent: (props: VisualProps) => LazyVisual("treadmill", props),
    config: null,
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
