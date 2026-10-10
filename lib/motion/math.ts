// Shared math for every motion primitive on the site.

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Position of v between a and b, as 0..1 (unclamped). */
export const normalize = (v: number, a: number, b: number) => (b === a ? 0 : (v - a) / (b - a));

/** Map v from [inMin, inMax] to [outMin, outMax]. Clamped by default. */
export const mapRange = (
  v: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
  clamped = true,
) => {
  const t = normalize(v, inMin, inMax);
  return lerp(outMin, outMax, clamped ? clamp(t) : t);
};

export const distance = (x1: number, y1: number, x2: number, y2: number) =>
  Math.hypot(x2 - x1, y2 - y1);

/**
 * Frame-rate independent smoothing toward a target.
 * lambda ~ responsiveness (higher = snappier), dt in seconds.
 */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt));

export const ease = {
  linear: (t: number) => t,
  outQuart: (t: number) => 1 - Math.pow(1 - t, 4),
  outExpo: (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  inOutQuart: (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2),
  inQuart: (t: number) => t * t * t * t,
  /** Overshoots slightly past 1 before settling: gives each circle a little "pop". */
  outBack: (t: number) => {
    const c1 = 1.4;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
};

export type Easing = (t: number) => number;

/** Local 0..1 progress of a window [start, end] within a global progress. */
export const windowed = (p: number, start: number, end: number) => clamp(normalize(p, start, end));
