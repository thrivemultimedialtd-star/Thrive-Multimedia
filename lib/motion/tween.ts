// Time-based tweens and a tiny timeline, both driven by the shared ticker.
import { clamp, ease as easings, type Easing } from './math';
import { subscribe } from './ticker';

export interface TweenOptions {
  duration: number; // ms
  delay?: number; // ms
  ease?: Easing;
  onUpdate: (v: number) => void;
  onComplete?: () => void;
}

/** Runs onUpdate with eased 0..1. Returns a cancel function. */
export function tween({ duration, delay = 0, ease = easings.outExpo, onUpdate, onComplete }: TweenOptions) {
  let elapsed = -delay;
  let done = false;
  const stop = subscribe((dt) => {
    elapsed += dt * 1000;
    if (elapsed < 0) return;
    const t = clamp(elapsed / duration);
    onUpdate(ease(t));
    if (t >= 1 && !done) {
      done = true;
      stop();
      onComplete?.();
    }
  });
  return () => {
    done = true;
    stop();
  };
}

export const tweenPromise = (opts: Omit<TweenOptions, 'onComplete'>) =>
  new Promise<void>((resolve) => tween({ ...opts, onComplete: resolve }));

export interface TimelineStep {
  at: number; // ms from start
  run: () => void;
}

/** Fires each step's run() at its time. Steps usually start their own tweens or CSS transitions. */
export function timeline(steps: TimelineStep[]) {
  const pending = [...steps].sort((a, b) => a.at - b.at);
  let elapsed = 0;
  const stop = subscribe((dt) => {
    elapsed += dt * 1000;
    while (pending.length && pending[0].at <= elapsed) pending.shift()!.run();
    if (!pending.length) stop();
  });
  return stop;
}
