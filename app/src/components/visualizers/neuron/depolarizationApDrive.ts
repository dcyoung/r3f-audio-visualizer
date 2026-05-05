import {
  evaluateApproximateAp,
  type ApproxApParams,
} from "./canonicalActionPotential";
import { kEffluxDrive, naInfluxDrive } from "./hhModel";

/** 1×N RGBA float strip: R = Na influx drive, G = K efflux drive vs wrapped phase (same as CPU). */
export const AP_DRIVE_LUT_SIZE = 256;

export function fillApDriveLut(
  rgba: Float32Array,
  params: ApproxApParams,
  lutSize: number,
): void {
  const repeat = Math.max(1, params.repeatPeriodMs);
  for (let i = 0; i < lutSize; i += 1) {
    const phaseMs = (i / Math.max(1, lutSize - 1)) * repeat;
    const step = evaluateApproximateAp(phaseMs, params);
    const o = i * 4;
    rgba[o] = naInfluxDrive(step.INa);
    rgba[o + 1] = kEffluxDrive(step.IK);
    rgba[o + 2] = 0;
    rgba[o + 3] = 1;
  }
}
