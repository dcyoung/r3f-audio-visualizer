import { APPLICATION_MODE } from "@/lib/applicationModes";

import { type ICoordinateMapper } from "./common";
import { CoordinateMapper_Data } from "./data";
import { CoordinateMapper_Noise } from "./noise";
import { CoordinateMapper_WaveformSuperposition } from "./waveform";

type TRegistry = {
  [APPLICATION_MODE.AUDIO]: CoordinateMapper_Data;
  [APPLICATION_MODE.WAVE_FORM]: CoordinateMapper_WaveformSuperposition;
  [APPLICATION_MODE.NOISE]: CoordinateMapper_Noise;
  [APPLICATION_MODE.AUDIO_SCOPE]: ICoordinateMapper;
  [APPLICATION_MODE.PARTICLE_NOISE]: ICoordinateMapper;
};
export class CoordinateMapper_Modal implements ICoordinateMapper {
  private _registry: TRegistry;
  private _activeMode: keyof TRegistry;
  private get _active(): ICoordinateMapper {
    return this._registry[this._activeMode];
  }

  constructor(initialMode: keyof TRegistry = APPLICATION_MODE.WAVE_FORM) {
    this._registry = {
      [APPLICATION_MODE.WAVE_FORM]: new CoordinateMapper_WaveformSuperposition(
        [2.0],
        1.0,
        0.75,
      ),
      [APPLICATION_MODE.NOISE]: new CoordinateMapper_Noise(1.0, 2.0, 0.5, 10),
      [APPLICATION_MODE.AUDIO]: new CoordinateMapper_Data(
        1.0,
        new Float32Array(121).fill(0),
      ),
      [APPLICATION_MODE.AUDIO_SCOPE]: { amplitude: 0, map: () => 0 },
      [APPLICATION_MODE.PARTICLE_NOISE]: { amplitude: 0, map: () => 0 },
    };
    this._activeMode = initialMode;
  }

  public update<T extends keyof TRegistry>(key: T, mapper: TRegistry[T]): void {
    this._registry[key] = mapper;
  }

  public setMode(mode: keyof TRegistry): void {
    this._activeMode = mode;
  }

  public get<T extends keyof TRegistry>(mode: T): TRegistry[T] {
    return this._registry[mode];
  }

  public get amplitude(): number {
    return this._active.amplitude;
  }

  public map(...params: Parameters<ICoordinateMapper["map"]>) {
    return this._active.map(...params);
  }
}
