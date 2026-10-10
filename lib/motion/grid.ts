// The Thrive circle grid. One implementation behind every circular transition on the site.
//
// Each circle knows its row, column, centre (x, y), distance from the origin and a
// normalised threshold. A single global progress (0 → 1) drives all of them: a circle
// starts moving once progress passes its threshold, so the wave spreads out from the
// origin as one continuous field rather than a set of fixed delays.
import { clamp, ease as easings, normalize, type Easing } from './math';

export type GridMode = 'cover' | 'iris';

export interface GridOptions {
  cols: number;
  rows: number;
  color?: string;
  mode?: GridMode;
  /** Share of the timeline used to stagger by distance (0 = all at once, ~0.6 = clear wave). */
  spread?: number;
  ease?: Easing;
  /** Optional different ease while opening (iris). Defaults to `ease`. */
  irisEase?: Easing;
  /** Origin as fractions of the grid box. Defaults to centre. */
  origin?: { x: number; y: number };
  /**
   * Per-circle colour ramp (hex colours). While covering, each circle starts at `from`
   * and deepens to `to` as its own progress passes `start`, so a bright front leads a
   * dark core. While opening (iris), circles brighten back from `to` to `from` as they shrink.
   */
  ramp?: { from: string; to: string; start?: number };
}

interface Cell {
  el: HTMLSpanElement;
  row: number;
  col: number;
  x: number;
  y: number;
  threshold: number;
  scale: number;
  tone: number;
}

export interface CircleGrid {
  setProgress(p: number): void;
  setMode(mode: GridMode): void;
  setOrigin(x: number, y: number): void;
  setColor(color: string): void;
  resize(): void;
  destroy(): void;
  readonly progress: number;
  readonly count: number;
}

/** Shared cell geometry: centres on a cols × rows grid plus a 0..1 distance threshold from the origin. */
export interface CellGeom {
  x: number;
  y: number;
  threshold: number;
}

/** Sets each cell's normalised threshold from its distance to the origin (fractions of w × h). */
export function computeThresholds(cells: { x: number; y: number; threshold: number }[], w: number, h: number, origin: { x: number; y: number }) {
  const ox = origin.x * w;
  const oy = origin.y * h;
  let max = 0;
  const d = cells.map((c) => {
    const v = Math.hypot(c.x - ox, c.y - oy);
    if (v > max) max = v;
    return v;
  });
  cells.forEach((c, i) => (c.threshold = normalize(d[i], 0, max)));
}

/** Builds cell centres for a grid filling w × h and computes their thresholds. */
export function buildCells(cols: number, rows: number, w: number, h: number, origin: { x: number; y: number }): CellGeom[] {
  const cw = w / cols;
  const ch = h / rows;
  const cells: CellGeom[] = [];
  for (let row = 0; row < rows; row++)
    for (let col = 0; col < cols; col++) cells.push({ x: (col + 0.5) * cw, y: (row + 0.5) * ch, threshold: 0 });
  computeThresholds(cells, w, h, origin);
  return cells;
}

/** A cell's own progress: zero until the global value reaches its threshold, then 0 → 1. */
export const cellLocal = (p: number, threshold: number, spread: number) => clamp((p - threshold * spread) / (1 - spread));

export function createCircleGrid(container: HTMLElement, options: GridOptions): CircleGrid {
  const { cols, rows } = options;
  let mode: GridMode = options.mode ?? 'cover';
  const spread = options.spread ?? 0.6;
  const easeFn = options.ease ?? easings.inOutCubic;
  const irisEaseFn = options.irisEase ?? easeFn;
  let origin = options.origin ?? { x: 0.5, y: 0.5 };
  let progress = -1;
  let visible = true;
  const hex = (h: string) => {
    const n = parseInt(h.replace('#', ''), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const ramp = options.ramp
    ? { a: hex(options.ramp.from), b: hex(options.ramp.to), start: options.ramp.start ?? 0.35 }
    : null;
  const TONE_STEPS = 24; // quantised so colours are only rewritten when they visibly change
  const toneColor = (t: number) => {
    const [a, b] = [ramp!.a, ramp!.b];
    const k = t / TONE_STEPS;
    return `rgb(${Math.round(a[0] + (b[0] - a[0]) * k)},${Math.round(a[1] + (b[1] - a[1]) * k)},${Math.round(a[2] + (b[2] - a[2]) * k)})`;
  };

  container.setAttribute('aria-hidden', 'true');
  const frag = document.createDocumentFragment();
  const cells: Cell[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const el = document.createElement('span');
      el.style.cssText =
        'position:absolute;left:0;top:0;border-radius:50%;transform-origin:50% 50%;pointer-events:none;';
      el.style.background = options.color ?? 'currentColor';
      frag.appendChild(el);
      cells.push({ el, row, col, x: 0, y: 0, threshold: 0, scale: -1, tone: -1 });
    }
  }
  container.appendChild(frag);

  function updateThresholds() {
    computeThresholds(cells, container.clientWidth, container.clientHeight, origin);
  }

  function layout() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    const cw = w / cols;
    const ch = h / rows;
    // Each circle's diameter equals the cell diagonal, so neighbours overlap and cover fully.
    const d = Math.ceil(Math.hypot(cw, ch)) + 1;
    for (const c of cells) {
      c.x = (c.col + 0.5) * cw;
      c.y = (c.row + 0.5) * ch;
      c.el.style.width = c.el.style.height = `${d}px`;
      c.el.style.left = `${c.x - d / 2}px`;
      c.el.style.top = `${c.y - d / 2}px`;
    }
    updateThresholds();
    const p = progress;
    progress = -1;
    if (p >= 0) setProgress(p);
  }

  function setVisible(v: boolean) {
    if (v === visible) return;
    visible = v;
    container.style.visibility = v ? 'visible' : 'hidden';
  }

  function setProgress(p: number) {
    p = clamp(p);
    if (p === progress) return;
    progress = p;
    let any = false;
    for (const c of cells) {
      // Local progress: zero until the global value reaches this circle's threshold.
      const local = cellLocal(p, c.threshold, spread);
      const e = (mode === 'cover' ? easeFn : irisEaseFn)(local);
      // Clamped at 0 so an overshooting ease can never flip a circle inside out.
      const s = Math.max(0, Math.round((mode === 'cover' ? e : 1 - e) * 1000) / 1000);
      if (s > 0) any = true;
      if (s !== c.scale) {
        c.scale = s;
        c.el.style.transform = `scale(${s})`;
      }
      if (ramp) {
        // Cover: green → dark as the circle grows. Iris: dark → green as it shrinks.
        const k = mode === 'cover' ? clamp((local - ramp.start) / (1 - ramp.start)) : 1 - clamp(local / 0.85);
        const tone = Math.round(k * TONE_STEPS);
        if (tone !== c.tone) {
          c.tone = tone;
          c.el.style.background = toneColor(tone);
        }
      }
    }
    setVisible(any);
  }

  const ro = new ResizeObserver(layout);
  ro.observe(container);
  layout();
  setProgress(0);

  return {
    setProgress,
    setMode(m) {
      if (m === mode) return;
      mode = m;
      const p = progress;
      progress = -1;
      setProgress(p);
    },
    setOrigin(x, y) {
      origin = { x: clamp(x), y: clamp(y) };
      updateThresholds();
      const p = progress;
      progress = -1;
      setProgress(p);
    },
    setColor(color) {
      for (const c of cells) c.el.style.background = color;
    },
    resize: layout,
    destroy() {
      ro.disconnect();
      for (const c of cells) c.el.remove();
    },
    get progress() {
      return progress;
    },
    count: cells.length,
  };
}

export interface HoleGrid {
  setProgress(p: number): void;
  setOrigin(x: number, y: number): void;
  resize(): void;
  destroy(): void;
}

/**
 * The same circle grid rendered as holes in a solid cover (canvas). At progress 0 the cover is
 * whole; circles open from the origin outward until, at 1, the content beneath is fully revealed.
 * Used for Blackbook-style section switches.
 */
export function createHoleGrid(
  canvas: HTMLCanvasElement,
  options: { cols: number; rows: number; color: string; spread?: number; ease?: Easing; origin?: { x: number; y: number } },
): HoleGrid {
  const ctx = canvas.getContext('2d')!;
  const spread = options.spread ?? 0.62;
  const easeFn = options.ease ?? easings.inOutCubic;
  let origin = options.origin ?? { x: 0.5, y: 0.5 };
  let cells: CellGeom[] = [];
  let w = 0;
  let h = 0;
  let r = 0;
  let progress = 0;

  function layout() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cells = buildCells(options.cols, options.rows, w, h, origin);
    // Half the cell diagonal, slightly over, so neighbouring holes merge into a clean full reveal.
    r = (Math.hypot(w / options.cols, h / options.rows) / 2) * 1.04;
    draw();
  }

  function draw() {
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, w, h);
    if (progress >= 1) return;
    ctx.fillStyle = options.color;
    ctx.fillRect(0, 0, w, h);
    if (progress <= 0) return;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    for (const c of cells) {
      const s = easeFn(cellLocal(progress, c.threshold, spread));
      if (s <= 0) continue;
      ctx.moveTo(c.x + r * s, c.y);
      ctx.arc(c.x, c.y, r * s, 0, Math.PI * 2);
    }
    ctx.fill();
  }

  const ro = new ResizeObserver(layout);
  ro.observe(canvas);
  layout();

  return {
    setProgress(p) {
      progress = clamp(p);
      draw();
    },
    setOrigin(x, y) {
      origin = { x: clamp(x), y: clamp(y) };
      computeThresholds(cells, w, h, origin);
      draw();
    },
    resize: layout,
    destroy() {
      ro.disconnect();
    },
  };
}
