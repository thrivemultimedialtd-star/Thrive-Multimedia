'use client';

import { useEffect, type RefObject } from 'react';
import { env, observe, progressThrough, subscribe } from '@/lib/motion';

/**
 * Moves `inner` vertically as `outer` travels through the viewport.
 * amount is the total travel as a fraction of the outer height (0.08 = ±4%).
 * Only ticks while the element is on screen.
 */
export function useParallax(
  outer: RefObject<HTMLElement | null>,
  inner: RefObject<HTMLElement | null>,
  amount = 0.1,
) {
  useEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i || env.reducedMotion) return;
    const travel = env.mobile ? amount * 0.3 : amount;
    let last = NaN;
    let stopTick: (() => void) | null = null;
    const tick = () => {
      const p = progressThrough(o);
      if (p === last) return;
      last = p;
      i.style.transform = `translate3d(0, ${((0.5 - p) * travel * 100).toFixed(3)}%, 0) scale(${1 + travel * 1.2})`;
    };
    const stopObs = observe(
      o,
      (e) => {
        if (e.isIntersecting && !stopTick) stopTick = subscribe(tick);
        else if (!e.isIntersecting && stopTick) {
          stopTick();
          stopTick = null;
        }
      },
      '10% 0px 10% 0px',
    );
    return () => {
      stopObs();
      stopTick?.();
    };
  }, [outer, inner, amount]);
}
