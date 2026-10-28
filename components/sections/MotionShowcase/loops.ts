'use client';

import { createContext, useContext, useEffect, useRef, type RefObject } from 'react';
import { gsap } from './gsap';

type Register = (tl: gsap.core.Timeline) => () => void;

/** The section collects every looping timeline, so all of them sleep while it is off screen. */
export const LoopRegistry = createContext<Register>(() => () => {});

/**
 * Builds a repeating timeline for one piece of SVG art and hands it to the section.
 * With reduced motion nothing is built: the art's markup is already a resting frame.
 */
export function useLoop<T extends Element>(
  ref: RefObject<T | null>,
  build: (root: T) => gsap.core.Timeline,
) {
  const register = useContext(LoopRegistry);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const t = build(root);
      tl.current = t;
      const unregister = register(t);
      return () => {
        unregister();
        tl.current = null;
      };
    }, root);
    return () => mm.revert();
    // build is a module-level function per art piece.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, register]);

  return tl;
}

/** Ease a loop's speed (hover makes the art run faster). */
export const setSpeed = (tl: gsap.core.Timeline | null, timeScale: number) => {
  if (tl) gsap.to(tl, { timeScale, duration: 0.45, ease: 'power2.out', overwrite: true });
};
