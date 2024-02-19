export const EASING_FUNCTION = {
  LINEAR: "LINEAR",
  QUADRATIC: "QUADRATIC",
  BEZIER: "BEZIER",
  PARAMETRIC: "PARAMETRIC",
} as const;
export type EasingFunction = keyof typeof EASING_FUNCTION;

export const easeInOut = (
  t: number,
  fxn: EasingFunction = EASING_FUNCTION.BEZIER,
) => {
  switch (fxn) {
    case "LINEAR":
      return t;
    case "QUADRATIC":
      return t <= 0.5 ? 2.0 * t * t : 2.0 * (t - 0.5) * (1.0 - (t - 0.5)) + 0.5;
    case "BEZIER":
      return t * t * (3.0 - 2.0 * t);
    case "PARAMETRIC":
      return (t * t) / (2.0 * (t * t - t) + 1.0);
    default:
      return fxn satisfies never;
  }
};

export const easeIn = (
  t: number,
  fxn: EasingFunction = EASING_FUNCTION.BEZIER,
) => {
  if (t >= 0.5) {
    return t;
  }
  return easeInOut(t, fxn);
};

export const easeOut = (
  t: number,
  fxn: EasingFunction = EASING_FUNCTION.BEZIER,
) => {
  if (t <= 0.5) {
    return t;
  }
  return easeInOut(t, fxn);
};

export const clip = (t: number, min = 0, max = 1) => {
  return Math.min(max, Math.max(min, t));
};

export const lerp = (from: number, to: number, alpha: number) => {
  return from + alpha * (to - from);
};
