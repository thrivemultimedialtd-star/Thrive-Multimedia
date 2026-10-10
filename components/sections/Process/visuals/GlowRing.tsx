'use client';

import { useEffect, useRef } from 'react';
import { clamp, env, subscribe } from '@/lib/motion';
import { fitCanvas, type RegisterVisual } from './types';
import styles from './visuals.module.css';

/**
 * DEFINE: one glowing green ring whose edge is restless at first and settles into a
 * clean circle as the stage arrives, like a brand coming into definition.
 */
export default function GlowRing({ register }: { register: RegisterVisual }) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvas.current;
    const el = root.current;
    if (!c || !el) return;
    const ctx = c.getContext('2d')!;
    let w = 0;
    let h = 0;
    let ready = false;
    const stopFit = fitCanvas(c, 1, (nw, nh) => {
      w = nw;
      h = nh;
      if (env.reducedMotion && ready) draw();
    });
    const steps = env.mobile ? 120 : 200;
    const state = { l: 0, t: 0 };

    const ring = (base: number, amp: number, t: number, phase: number) => {
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const a = (i / steps) * Math.PI * 2;
        const n =
          Math.sin(3 * a + t * 0.9 + phase) * 0.5 +
          Math.sin(5 * a - t * 1.3 + phase * 2) * 0.3 +
          Math.sin(9 * a + t * 0.7) * 0.2;
        const r = base + amp * n;
        const portrait = h > w;
        const x = w / 2 + Math.cos(a) * r * (portrait ? 1.08 : 1.25);
        const y = h * 0.55 + Math.sin(a) * r * (portrait ? 1.55 : 0.82);
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      }
      ctx.closePath();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const base = Math.min(w, h) * (h > w ? 0.44 : 0.34);
      // Restless at first; settles as the stage becomes active.
      const amp = base * (0.04 + 0.2 * (1 - state.l));
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(127, 181, 63, 0.9)';
      ctx.shadowBlur = 48;
      ctx.strokeStyle = 'rgba(106, 154, 54, 0.85)';
      ctx.lineWidth = h > w ? 14 : 26;
      ring(base, amp, state.t, 0);
      ctx.stroke();
      ctx.shadowBlur = 18;
      ctx.strokeStyle = 'rgba(127, 181, 63, 0.95)';
      ctx.lineWidth = 9;
      ring(base, amp, state.t, 0.4);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(243, 241, 234, 0.75)';
      ctx.lineWidth = 2;
      ring(base, amp * 0.9, state.t, 0.8);
      ctx.stroke();
    };

    let stop: (() => void) | null = null;
    const tick = (dt: number) => {
      state.t += dt;
      draw();
    };

    register({
      update(v, l) {
        state.l = clamp(l);
        el.style.opacity = v.toFixed(3);
        if (env.reducedMotion) {
          state.l = 1;
          draw();
          return;
        }
        if (v > 0 && !stop) stop = subscribe(tick);
        else if (v === 0 && stop) {
          stop();
          stop = null;
        }
      },
    });
    // Reduced motion: no scroll engine runs, so show the settled frame straight away.
    ready = true;
    if (env.reducedMotion) {
      state.l = 1;
      el.style.opacity = '1';
      draw();
    }
    return () => {
      register(null);
      stop?.();
      stopFit();
    };
  }, [register]);

  return (
    <div ref={root} className={styles.layer} aria-hidden="true">
      <canvas ref={canvas} className={styles.canvas} />
    </div>
  );
}
