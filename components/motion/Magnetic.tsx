'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { damp, env, pointer, subscribe } from '@/lib/motion';

interface Props {
  children: ReactNode;
  strength?: number; // fraction of pointer offset to follow
  radius?: number; // px beyond the element where the pull begins
  className?: string;
}

/** Pulls its child toward the pointer when it comes close, then settles back. */
export default function Magnetic({ children, strength = 0.35, radius = 90, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || env.touch || env.reducedMotion) return;
    const s = { x: 0, y: 0 };
    return subscribe((dt) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = pointer.x - cx;
      const dy = pointer.y - cy;
      const near =
        pointer.active && Math.abs(dx) < r.width / 2 + radius && Math.abs(dy) < r.height / 2 + radius;
      const tx = near ? dx * strength : 0;
      const ty = near ? dy * strength : 0;
      if (!near && Math.abs(s.x) < 0.05 && Math.abs(s.y) < 0.05) {
        if (s.x || s.y) {
          s.x = s.y = 0;
          el.style.transform = '';
        }
        return;
      }
      s.x = damp(s.x, tx, 10, dt);
      s.y = damp(s.y, ty, 10, dt);
      el.style.transform = `translate3d(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px, 0)`;
    });
  }, [strength, radius]);

  return (
    <span ref={ref} className={className} style={{ display: 'inline-block', willChange: 'transform' }}>
      {children}
    </span>
  );
}
