import Scope from "./audioScopeTSL";
import Cube from "./cube";
import DiffusedRing from "./diffusedRing";
import Dna from "./dna";
import FluidBall from "./fluidBall";
import FluidBox from "./fluidBox";
import FluidSpeaker from "./fluidSpeaker";
import Grid from "./grid";
import MovingBoxes from "./movingBoxes";
import Neuron from "./neuron";
import Ribbons from "./ribbons";
import Sphere from "./sphere";
import Swarm from "./swarm";
import Treadmill from "./treadmill";
import WaveHistory from "./waveHistory";

export const VISUAL_REGISTRY = {
  [Scope.id]: Scope,
  [Grid.id]: Grid,
  [Cube.id]: Cube,
  [Sphere.id]: Sphere,
  [DiffusedRing.id]: DiffusedRing,
  [Dna.id]: Dna,
  [Neuron.id]: Neuron,
  [MovingBoxes.id]: MovingBoxes,
  [Ribbons.id]: Ribbons,
  [Treadmill.id]: Treadmill,
  [Swarm.id]: Swarm,
  [FluidBox.id]: FluidBox,
  [FluidSpeaker.id]: FluidSpeaker,
  [FluidBall.id]: FluidBall,
  [WaveHistory.id]: WaveHistory,
} as const;

export type TVisual = (typeof VISUAL_REGISTRY)[keyof typeof VISUAL_REGISTRY];
export type TVisualId = TVisual["id"];
