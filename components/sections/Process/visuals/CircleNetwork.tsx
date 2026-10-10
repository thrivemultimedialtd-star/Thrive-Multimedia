'use client';

import { useEffect, useRef } from 'react';
import { clamp, damp, env, pointer, subscribe } from '@/lib/motion';
import { fitCanvas, type RegisterVisual } from './types';
import styles from './visuals.module.css';

interface Node {
  angle: number;
  reach: number; // 0..1 of the max radius
  size: number;
  green: boolean;
  glow: boolean;
  speed: number;
  phase: number;
}

/**
 * LISTEN: a field of circles connected to one centre by hairlines, like many voices
 * feeding a single point. It opens outward as the stage arrives and leans away from the pointer.
 */
export default function CircleNetwork({ register }: { register: RegisterVisual }) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvas.current;
    const el = root.current;
    if (!c || !el) return;
    const ctx = c.getContext('2d')!;
    const count = env.mobile ? 34 : 70;
    // Deterministic pseudo-random so the composition is stable between visits.
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const nodes: Node[] = Array.from({ length: count }, () => {
      const big = rand() < 0.12;
      return {
        angle: rand() * Math.PI * 2,
        reach: 0.18 + Math.pow(rand(), 0.7) * 0.85,
        size: big ? 18 + rand() * 26 : 2 + rand() * 7,
        green: rand() < 0.3,
        glow: rand() < 0.1,
        speed: (rand() - 0.5) * 0.05,
        phase: rand() * Math.PI * 2,
      };
    });

    let w = 0;
    let h = 0;
    let ready = false;
    const stopFit = fitCanvas(c, env.mobile ? 1 : 1.5, (nw, nh) => {
      w = nw;
      h = nh;
      if (env.reducedMotion && ready) draw();
    });

    const state = { v: 0, l: 0, t: 0, lean: { x: 0, y: 0 } };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h * 0.55;
      const R = Math.hypot(w, h) * 0.55 * (0.45 + 0.55 * state.l);
      const pts = nodes.map((n) => {
        const a = n.angle + state.t * n.speed;
        const wob = Math.sin(state.t * 0.6 + n.phase) * 8;
        return {
          x: cx + Math.cos(a) * R * n.reach + state.lean.x * n.reach + wob,
          y: cy + Math.sin(a) * R * n.reach * 0.62 + state.lean.y * n.reach,
          n,
        };
      });
      // Hairlines to the centre.
      ctx.lineWidth = 0.6;
      for (const p of pts) {
        ctx.strokeStyle = `rgba(243, 241, 234, ${0.05 + 0.1 * (1 - p.n.reach)})`;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      for (const p of pts) {
        if (p.n.glow) {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.n.size * 2.2);
          g.addColorStop(0, 'rgba(243, 241, 234, 0.55)');
          g.addColorStop(1, 'rgba(243, 241, 234, 0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.n.size * 2.2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = p.n.green ? '#7fb53f' : '#f3f1ea';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.n.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // The centre: where everything is heard.
      ctx.fillStyle = '#f3f1ea';
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();
    };

    let stop: (() => void) | null = null;
    const tick = (dt: number) => {
      state.t += dt;
      const tx = pointer.active && !env.touch ? -(pointer.x / window.innerWidth - 0.5) * 60 : 0;
      const ty = pointer.active && !env.touch ? -(pointer.y / window.innerHeight - 0.5) * 40 : 0;
      state.lean.x = damp(state.lean.x, tx, 2.5, dt);
      state.lean.y = damp(state.lean.y, ty, 2.5, dt);
      draw();
    };

    register({
      update(v, l) {
        state.v = v;
        state.l = clamp(l);
        el.style.opacity = v.toFixed(3);
        if (env.reducedMotion) {
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
