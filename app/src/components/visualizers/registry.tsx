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
  },
  cube: {
    icon: Boxes,
    ReactiveComponent: (props: VisualProps) => LazyVisual("cube", props),
  },
  sphere: {
    icon: Globe,
    ReactiveComponent: (props: VisualProps) => LazyVisual("sphere", props),
  },
  diffusedRing: {
    icon: CircleDashed,
    ReactiveComponent: (props: VisualProps) =>
      LazyVisual("diffusedRing", props),
  },
  dna: {
    icon: Dna,
    ReactiveComponent: (props: VisualProps) => LazyVisual("dna", props),
  },
  boxes: {
    icon: Boxes,
    ReactiveComponent: (props: VisualProps) => LazyVisual("boxes", props),
  },
  ribbons: {
    icon: Ribbon,
    ReactiveComponent: (props: VisualProps) => LazyVisual("ribbons", props),
  },
  treadmill: {
    icon: Footprints,
    ReactiveComponent: (props: VisualProps) => LazyVisual("treadmill", props),
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
