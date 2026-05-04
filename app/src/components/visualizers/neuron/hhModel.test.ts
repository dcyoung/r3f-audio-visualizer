import { describe, expect, test } from "bun:test";

import { HHModel, kEffluxDrive, naInfluxDrive } from "./hhModel";

describe("HHModel", () => {
  test("stays finite under strong stimulus with 0.05 ms steps", () => {
    const m = new HHModel(0);
    for (let i = 0; i < 8000; i++) {
      const d = m.step(0.05, 22);
      expect(Number.isFinite(d.VM)).toBe(true);
      expect(Number.isFinite(d.INa)).toBe(true);
    }
  });

  test("membrane voltage rises under sustained stimulus then decays", () => {
    const m = new HHModel(0);
    let peak = -1e9;
    for (let i = 0; i < 6000; i++) {
      const d = m.step(0.025, i < 4000 ? 18 : 0);
      peak = Math.max(peak, d.VM);
    }
    expect(peak).toBeGreaterThan(40);
  });
});

describe("ion drive helpers", () => {
  test("naInfluxDrive is larger for inward Na (negative I_Na)", () => {
    expect(naInfluxDrive(-55)).toBeGreaterThan(naInfluxDrive(20));
  });

  test("kEffluxDrive is larger for outward K (positive I_K)", () => {
    expect(kEffluxDrive(35)).toBeGreaterThan(kEffluxDrive(-20));
  });
});
