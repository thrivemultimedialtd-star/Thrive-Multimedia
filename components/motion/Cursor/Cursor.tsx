'use client';

import { useEffect, useRef } from 'react';
import { damp, env, onEnvChange, pointer, subscribe } from '@/lib/motion';
import styles from './Cursor.module.css';

/**
 * Desktop cursor: a dot that tracks tightly and a ring that trails.
 * Elements opt in to a contextual state with data-cursor="view|open|drag|link"
 * (links and buttons get "link" automatically). Off for touch and reduced motion.
 */
export default function Cursor() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let stopTick: (() => void) | null = null;
    let state = '';

    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const t = e.target as Element | null;
      const ctx = t?.closest<HTMLElement>('[data-cursor]');
      const next = ctx?.dataset.cursor ?? (t?.closest('a, button, [role="button"], label') ? 'link' : '');
      if (next === state) return;
      state = next;
      const el = root.current!;
      el.dataset.state = next;
      label.current!.textContent = next && next !== 'link' ? ctx?.dataset.cursorLabel ?? next : '';
    };
    const onDown = () => root.current?.setAttribute('data-down', '');
    const onUp = () => root.current?.removeAttribute('data-down');

    const start = () => {
      if (stopTick) return;
      document.documentElement.dataset.cursor = 'on';
      const d = { x: pointer.x, y: pointer.y };
      const r = { x: pointer.x, y: pointer.y };
      stopTick = subscribe((dt) => {
        const el = root.current;
        if (!el) return;
        el.toggleAttribute('data-visible', pointer.active);
        d.x = damp(d.x, pointer.x, 40, dt);
        d.y = damp(d.y, pointer.y, 40, dt);
        r.x = damp(r.x, pointer.x, 13, dt);
        r.y = damp(r.y, pointer.y, 13, dt);
        dot.current!.style.transform = `translate3d(${d.x}px, ${d.y}px, 0)`;
        ring.current!.style.transform = `translate3d(${r.x}px, ${r.y}px, 0)`;
      });
      window.addEventListener('pointerover', onOver, { passive: true });
      window.addEventListener('pointerdown', onDown, { passive: true });
      window.addEventListener('pointerup', onUp, { passive: true });
    };
    const stop = () => {
      stopTick?.();
      stopTick = null;
      delete document.documentElement.dataset.cursor;
      window.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      root.current?.removeAttribute('data-visible');
    };
    const sync = () => (env.touch || env.reducedMotion ? stop() : start());
    sync();
    const off = onEnvChange(sync);
    return () => {
      off();
      stop();
    };
  }, []);

  return (
    <div ref={root} className={styles.cursor} aria-hidden="true">
      <div ref={ring} className={styles.ringPos}>
        <div className={styles.ring}>
          <span ref={label} className={styles.label} />
        </div>
      </div>
      <div ref={dot} className={styles.dotPos}>
        <div className={styles.dot} />
      </div>
    </div>
  );
}
