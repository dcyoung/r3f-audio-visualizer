import Cube from "./cube";
import DiffusedRing from "./diffusedRing";
import Dna from "./dna";
import Grid from "./grid";
import MovingBoxes from "./movingBoxes";
import Ribbons from "./ribbons";
import Sphere from "./sphere";
import Treadmill from "./treadmill";

export const VISUAL_REGISTRY = {
  [Grid.id]: Grid,
  [Cube.id]: Cube,
  [Sphere.id]: Sphere,
  [DiffusedRing.id]: DiffusedRing,
  [Dna.id]: Dna,
  [MovingBoxes.id]: MovingBoxes,
  [Ribbons.id]: Ribbons,
  [Treadmill.id]: Treadmill,
} as const;

export type TVisual = (typeof VISUAL_REGISTRY)[keyof typeof VISUAL_REGISTRY];
export type TVisualId = TVisual["id"];
