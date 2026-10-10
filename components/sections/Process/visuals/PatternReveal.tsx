'use client';

import { useEffect, useRef } from 'react';
import { clamp, ease, env, type CircleGrid } from '@/lib/motion';
import TransitionGrid from '@/components/motion/TransitionGrid/TransitionGrid';
import Texture from '@/components/ui/Texture';
import type { RegisterVisual } from './types';
import styles from './visuals.module.css';

/**
 * CREATE: the brochure's hand-drawn cover pattern, opened up through the site's own
 * circle grid. Making something new, in Thrive's own marks.
 */
export default function PatternReveal({ register }: { register: RegisterVisual }) {
  const root = useRef<HTMLDivElement>(null);
  const grid = useRef<CircleGrid | null>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const handle = {
      update(v: number, l: number) {
        el.style.opacity = v.toFixed(3);
        // Driven directly by scroll; no ticking needed.
        grid.current?.setProgress(env.reducedMotion ? 1 : clamp(l * 1.15));
      },
    };
    register(handle);
    if (env.reducedMotion) requestAnimationFrame(() => handle.update(1, 1));
    return () => register(null);
  }, [register]);

  return (
    <div ref={root} className={styles.layer} aria-hidden="true">
      <Texture className={styles.pattern} size="cover" />
      <div className={styles.vignette} />
      <TransitionGrid
        cols={env.mobile ? 9 : 15}
        rows={env.mobile ? 13 : 9}
        mode="iris"
        color="#0b120a"
        spread={0.7}
        ease={ease.inOutCubic}
        initial={0}
        onReady={(g) => {
          grid.current = g;
        }}
      />
    </div>
  );
}
