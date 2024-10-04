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

const REGISTRY = {
  grid: {
    icon: Grid3x3,
    ReactiveComponent: (props: VisualProps) => {
      const VisualComponent = useMemo(
        () =>
          lazy(
            async () =>
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return
              await import(`./grid/reactive`),
          ),
        [],
      );
      return (
        <Suspense fallback={null}>
          <VisualComponent {...props} />
        </Suspense>
      );
    },
  },
  cube: {
    icon: Boxes,
    ReactiveComponent: (props: VisualProps) => {
      const VisualComponent = useMemo(
        () =>
          lazy(
            async () =>
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return
              await import(`./cube/reactive`),
          ),
        [],
      );
      return (
        <Suspense fallback={null}>
          <VisualComponent {...props} />
        </Suspense>
      );
    },
  },
  sphere: {
    icon: Globe,
    ReactiveComponent: (props: VisualProps) => {
      const VisualComponent = useMemo(
        () =>
          lazy(
            async () =>
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return
              await import(`./sphere/reactive`),
          ),
        [],
      );
      return (
        <Suspense fallback={null}>
          <VisualComponent {...props} />
        </Suspense>
      );
    },
  },
  diffusedRing: {
    icon: CircleDashed,
    ReactiveComponent: (props: VisualProps) => {
      const VisualComponent = useMemo(
        () =>
          lazy(
            async () =>
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return
              await import(`./diffusedRing/reactive`),
          ),
        [],
      );
      return (
        <Suspense fallback={null}>
          <VisualComponent {...props} />
        </Suspense>
      );
    },
  },
  dna: {
    icon: Dna,
    ReactiveComponent: (props: VisualProps) => {
      const VisualComponent = useMemo(
        () =>
          lazy(
            async () =>
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return
              await import(`./dna/reactive`),
          ),
        [],
      );
      return (
        <Suspense fallback={null}>
          <VisualComponent {...props} />
        </Suspense>
      );
    },
  },
  boxes: {
    icon: Boxes,
    ReactiveComponent: (props: VisualProps) => {
      const VisualComponent = useMemo(
        () =>
          lazy(
            async () =>
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return
              await import(`./boxes/reactive`),
          ),
        [],
      );
      return (
        <Suspense fallback={null}>
          <VisualComponent {...props} />
        </Suspense>
      );
    },
  },
  ribbons: {
    icon: Ribbon,
    ReactiveComponent: (props: VisualProps) => {
      const VisualComponent = useMemo(
        () =>
          lazy(
            async () =>
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return
              await import(`./ribbons/reactive`),
          ),
        [],
      );
      return (
        <Suspense fallback={null}>
          <VisualComponent {...props} />
        </Suspense>
      );
    },
  },
  walk: {
    icon: Footprints,
    ReactiveComponent: (props: VisualProps) => {
      const VisualComponent = useMemo(
        () =>
          lazy(
            async () =>
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return
              await import(`./walk/reactive`),
          ),
        [],
      );
      return (
        <Suspense fallback={null}>
          <VisualComponent {...props} />
        </Suspense>
      );
    },
  },
} as const;

type TVisualId = keyof typeof REGISTRY;

export class VisualRegistry {
  public static get visuals() {
    return Object.entries(REGISTRY).map(([id, other]) => ({
      id: id as TVisualId,
      ...other,
    }));
  }

  public static get(id: TVisualId) {
    return {
      id,
      ...REGISTRY[id],
    };
  }
}
