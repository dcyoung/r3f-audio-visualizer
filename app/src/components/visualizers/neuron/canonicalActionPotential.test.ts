import { describe, expect, test } from "bun:test";

import {
  alphaKernel,
  DEFAULT_APPROX_AP_PARAMS,
  evaluateApproximateAp,
} from "./canonicalActionPotential";

describe("alphaKernel", () => {
  test("is zero at t<=0", () => {
    expect(alphaKernel(0, 1)).toBe(0);
    expect(alphaKernel(-1, 1)).toBe(0);
  });

  test("peaks at 1 when t equals tau", () => {
    expect(alphaKernel(2, 2)).toBeCloseTo(1, 5);
  });
});

describe("evaluateApproximateAp", () => {
  test("returns rest outside waveform window within period", () => {
    const p = {
      ...DEFAULT_APPROX_AP_PARAMS,
      repeatPeriodMs: 100,
      waveformDurationMs: 12,
    };
    const r = evaluateApproximateAp(50, p);
    expect(r.INa).toBe(0);
    expect(r.IK).toBe(0);
    expect(r.VM).toBe(p.vRest);
  });

  test("Na is non-positive during active window", () => {
    const p = DEFAULT_APPROX_AP_PARAMS;
    for (let t = 0; t < p.waveformDurationMs; t += 0.25) {
      const s = evaluateApproximateAp(t, p);
      expect(s.INa).toBeLessThanOrEqual(0);
    }
  });

  test("K is non-negative during active window", () => {
    const p = DEFAULT_APPROX_AP_PARAMS;
    for (let t = 0; t < p.waveformDurationMs; t += 0.25) {
      const s = evaluateApproximateAp(t, p);
      expect(s.IK).toBeGreaterThanOrEqual(0);
    }
  });

  test("propagation delay shifts phase: efflux-style lag matches later sample", () => {
    const p = DEFAULT_APPROX_AP_PARAMS;
    const phase = 3.2;
    const delay = 0.5;
    const lag = 0.9;
    const influx = evaluateApproximateAp(phase - delay, p);
    const efflux = evaluateApproximateAp(phase - delay - lag, p);
    expect(influx.VM).not.toBe(efflux.VM);
  });

  test("wraps repeat period", () => {
    const p = { ...DEFAULT_APPROX_AP_PARAMS, repeatPeriodMs: 50 };
    const a = evaluateApproximateAp(3, p);
    const b = evaluateApproximateAp(3 + 50, p);
    expect(a.VM).toBeCloseTo(b.VM, 5);
    expect(a.INa).toBeCloseTo(b.INa, 5);
  });
});
