import { Fn, mix, saturate, uniform, uniformArray } from "three/tsl";
import { Vector3 } from "three/webgpu";

import { HHModel, type TStepData } from "./model";

export class IonRingBuffer {
  public buffer;
  public size: number;
  public pos = uniform(0);

  constructor(size: number) {
    if (size < 0) {
      throw new RangeError("Invalid size.");
    }
    this.buffer = uniformArray(
      Array.from({ length: size }).map(() => new Vector3(0, 0, 0)),
    );
    this.size = size;
  }

  /**
   * TSL Fn: interpolate currents from the ring buffer at a normalized position.
   * Returns vec3 where x = total K current, y = total Na current.
   */
  /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
  public get_currents = Fn(({ alpha }: { alpha: any }) => {
    const idxFloat = (saturate(alpha) as any).mul(this.size - 1);
    const floorIdx = idxFloat.floor().add(this.pos).modInt(this.size);
    const ceilIdx = idxFloat.ceil().add(this.pos).modInt(this.size);
    const elemFloor: any = this.buffer.element(floorIdx);
    const elemCeil: any = this.buffer.element(ceilIdx);
    return mix(elemFloor, elemCeil, idxFloat.sub(idxFloat.floor())) as any;
  });
  /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */

  public add(item: TStepData): void {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any */
    (this.buffer as any).array[this.pos.value].x =
      item.IK + item.ILeak + item.IK_NaK_pump;
    (this.buffer as any).array[this.pos.value].y =
      item.INa + item.INa_NaK_pump;
    /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any */
    this.pos.value = (this.pos.value + 1) % this.size;
  }
}

export class NeuronSimulation {
  private model = new HHModel(0);
  private stimulusCurrent = 0;
  public readonly history = new IonRingBuffer(500);

  public step(tDeltaMs: number) {
    const data = this.model.step(tDeltaMs, this.stimulusCurrent);
    this.history.add(data);
  }

  public setStimulusCurrent(v: number) {
    this.stimulusCurrent = v;
  }
}
