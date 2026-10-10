/** Imperative handle each stage visual registers with the Process sequence. */
export interface StageVisual {
  /** v: how visible the stage is (0–1). l: its local progress (0 → 1 by the time it is active). */
  update(v: number, l: number): void;
}

export type RegisterVisual = (handle: StageVisual | null) => void;

/** Sizes a canvas to its parent at a capped pixel ratio. Returns a disconnect function. */
export function fitCanvas(canvas: HTMLCanvasElement, maxDpr: number, onResize: (w: number, h: number) => void) {
  const parent = canvas.parentElement!;
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.getContext('2d')!.setTransform(dpr, 0, 0, dpr, 0, 0);
    onResize(w, h);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(parent);
  resize();
  return () => ro.disconnect();
}
