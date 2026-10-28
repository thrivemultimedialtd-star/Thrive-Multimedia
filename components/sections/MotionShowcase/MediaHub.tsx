'use client';

import { useEffect, useRef } from 'react';
import { env, observe, onceInView } from '@/lib/motion';
import { ScrollTrigger } from './gsap';
import type { HubScene } from './hubScene';
import { Browser, FilmReel, Mark, Pen } from './icons';
import styles from './MotionShowcase.module.css';

// Poster positions on the two orbits (viewBox 800 × 600), matching the 3D layout loosely.
const posterIcons = [
  { Art: Pen, x: 160, y: 250 },
  { Art: Browser, x: 560, y: 175 },
  { Art: Mark, x: 640, y: 330 },
  { Art: FilmReel, x: 300, y: 430 },
];

const webgl = () => {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
};

/**
 * The central stage. An SVG poster is always there (first paint, reduced motion, no WebGL);
 * just before the stage scrolls into view the three.js hub loads and fades in over it.
 */
export default function MediaHub() {
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = stage.current;
    const cv = canvas.current;
    if (!el || !cv || env.reducedMotion || !webgl()) return;
    let hub: HubScene | null = null;
    let cancelled = false;
    const cleanups: Array<() => void> = [];

    const stopLoad = onceInView(
      el,
      async () => {
        const { createHubScene } = await import('./hubScene');
        if (cancelled) return;
        hub = createHubScene(cv, { lite: env.mobile || (navigator.hardwareConcurrency || 8) <= 4 });
        if (!hub) return;
        const h = hub;
        el.dataset.live = 'true';
        cleanups.push(observe(el, (e) => (e.isIntersecting ? h.start() : h.stop()), '10% 0px 10% 0px'));
        const st = ScrollTrigger.create({
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (s) => h.setProgress(s.progress),
        });
        h.setProgress(st.progress);
        cleanups.push(() => st.kill());
        if (!env.touch) {
          const move = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            h.setPointer(
              Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1)),
              Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1)),
            );
          };
          window.addEventListener('pointermove', move, { passive: true });
          cleanups.push(() => window.removeEventListener('pointermove', move));
        }
      },
      '0px 0px 40% 0px',
    );

    return () => {
      cancelled = true;
      stopLoad();
      cleanups.forEach((fn) => fn());
      hub?.dispose();
      delete el.dataset.live;
    };
  }, []);

  return (
    <div ref={stage} className={styles.hub}>
      <svg className={styles.poster} viewBox="0 0 800 600" aria-hidden="true" focusable="false">
        <g fill="none" stroke="currentColor">
          <ellipse cx="400" cy="300" rx="300" ry="120" transform="rotate(-8 400 300)" opacity="0.28" />
          <ellipse cx="400" cy="300" rx="220" ry="88" transform="rotate(-8 400 300)" opacity="0.28" />
          {[90, 130, 175].map((r, i) => (
            <circle key={r} cx="400" cy="300" r={r} opacity={0.32 - i * 0.09} />
          ))}
        </g>
        <circle cx="400" cy="300" r="120" fill="url(#hub-glow)" />
        {/* The core: an icosahedron seen face-on. */}
        <g transform="translate(400 300)" strokeLinejoin="round">
          <polygon points="0,-62 54,-31 54,31 0,62 -54,31 -54,-31" fill="#24391a" stroke="#7fb53f" strokeWidth="1.5" />
          <polygon points="0,-62 54,31 -54,31" fill="#6a9a36" fillOpacity="0.35" stroke="#7fb53f" strokeWidth="1" />
          <polygon points="0,62 54,-31 -54,-31" fill="none" stroke="#7fb53f" strokeOpacity="0.5" />
        </g>
        {posterIcons.map(({ Art, x, y }) => (
          <svg key={`${x}-${y}`} x={x - 22} y={y - 22} width="44" height="44" viewBox="0 0 24 24" className={styles.posterIcon}>
            <Art />
          </svg>
        ))}
        <defs>
          <radialGradient id="hub-glow">
            <stop offset="0" stopColor="#7fb53f" stopOpacity="0.45" />
            <stop offset="1" stopColor="#7fb53f" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
      <canvas ref={canvas} className={styles.canvas} aria-hidden="true" />
    </div>
  );
}
