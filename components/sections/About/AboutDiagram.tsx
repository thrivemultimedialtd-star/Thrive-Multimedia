'use client';

import { useEffect, useRef, useState } from 'react';
import { about } from '@/content/story';
import { clamp, damp, ease, env, observe, pointer, progressThrough, subscribe } from '@/lib/motion';
import styles from './AboutDiagram.module.css';

// Where each circle sits when apart, and when overlapping (fractions of the stage).
const apart = [
  { x: 0.2, y: 0.24 },
  { x: 0.8, y: 0.24 },
  { x: 0.2, y: 0.76 },
  { x: 0.8, y: 0.76 },
];
const together = [
  { x: 0.4, y: 0.4 },
  { x: 0.6, y: 0.4 },
  { x: 0.4, y: 0.6 },
  { x: 0.6, y: 0.6 },
];

/**
 * An abstract Venn of CREATIVE / BRAND / DIGITAL / MEDIA. Scroll brings the circles
 * together (reversibly); the pointer nudges them; hovering one lifts it and names its skills.
 * Decorative: the same information is in the text list beside it.
 */
export default function AboutDiagram() {
  const stage = useRef<HTMLDivElement>(null);
  const circles = useRef<Array<HTMLDivElement | null>>([]);
  const [focus, setFocus] = useState<number | null>(null);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const state = apart.map(() => ({ px: 0, py: 0 }));
    let box = el.getBoundingClientRect();
    const ro = new ResizeObserver(() => {
      box = el.getBoundingClientRect();
    });
    ro.observe(el);

    const place = (p: number, dt: number) => {
      const t = ease.inOutCubic(p);
      box = el.getBoundingClientRect();
      circles.current.forEach((c, i) => {
        if (!c) return;
        const x = apart[i].x + (together[i].x - apart[i].x) * t;
        const y = apart[i].y + (together[i].y - apart[i].y) * t;
        // Pointer pushes each circle a little away, with damping.
        const cx = box.left + x * box.width;
        const cy = box.top + y * box.height;
        const dx = cx - pointer.x;
        const dy = cy - pointer.y;
        const d = Math.hypot(dx, dy) || 1;
        const f = pointer.active && !env.touch ? clamp(1 - d / (box.width * 0.6)) ** 2 : 0;
        const s = state[i];
        s.px = damp(s.px, (dx / d) * f * 28, 4, dt);
        s.py = damp(s.py, (dy / d) * f * 28, 4, dt);
        // Transform only: offsets from the centre in px, so nothing triggers layout.
        const ox = (x - 0.5) * box.width + s.px;
        const oy = (y - 0.5) * box.height + s.py;
        c.style.translate = `${ox.toFixed(2)}px ${oy.toFixed(2)}px`;
      });
      el.style.setProperty('--together', t.toFixed(3));
    };

    if (env.reducedMotion) {
      place(1, 1);
      return () => ro.disconnect();
    }

    let stop: (() => void) | null = null;
    const tick = (dt: number) => {
      // Fully together by the time the diagram reaches the middle of the screen.
      const p = clamp((progressThrough(el) - 0.15) / 0.4);
      place(p, dt);
    };
    const stopObs = observe(el, (e) => {
      if (e.isIntersecting && !stop) stop = subscribe(tick);
      else if (!e.isIntersecting && stop) {
        stop();
        stop = null;
      }
    }, '10% 0px 10% 0px');
    return () => {
      ro.disconnect();
      stopObs();
      stop?.();
    };
  }, []);

  return (
    <div ref={stage} className={styles.stage} aria-hidden="true" onMouseLeave={() => setFocus(null)}>
      {about.venn.map((v, i) => (
        <div
          key={v.id}
          ref={(n) => {
            circles.current[i] = n;
          }}
          className={`${styles.circle} ${styles[v.id]}`}
          data-focus={focus === i || undefined}
          data-dim={focus !== null && focus !== i ? '' : undefined}
          onMouseEnter={() => setFocus(i)}
        >
          <span className={styles.label}>{v.label}</span>
          <span className={styles.skills}>{v.skills.join(' · ')}</span>
        </div>
      ))}
      <span className={styles.core}>
        <span>Thrive</span>
      </span>
    </div>
  );
}
