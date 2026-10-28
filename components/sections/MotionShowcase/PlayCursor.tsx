'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from './gsap';
import styles from './MotionShowcase.module.css';

/**
 * Over the cards (with a mouse, and motion allowed) the pointer becomes a play button.
 * Rendered into <body> so no transformed ancestor can trap the fixed position.
 */
export default function PlayCursor({ scope }: { scope: React.RefObject<HTMLElement | null> }) {
  const el = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- portal target exists only after mount
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const cursor = el.current;
    const root = scope.current;
    if (!cursor || !root) return;
    const mm = gsap.matchMedia();
    mm.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const x = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3.out' });
      const y = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3.out' });
      const targets = [...root.querySelectorAll<HTMLElement>('[data-play-cursor]')];
      const move = (e: PointerEvent) => {
        x(e.clientX);
        y(e.clientY);
      };
      const enter = (e: PointerEvent) => {
        gsap.set(cursor, { x: e.clientX, y: e.clientY });
        gsap.to(cursor, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)', overwrite: 'auto' });
      };
      const leave = () => gsap.to(cursor, { scale: 0.3, opacity: 0, duration: 0.2, ease: 'power2.in', overwrite: 'auto' });
      gsap.set(cursor, { scale: 0.3, opacity: 0, xPercent: -50, yPercent: -50 });
      root.dataset.playCursor = 'on';
      targets.forEach((t) => {
        t.addEventListener('pointerenter', enter);
        t.addEventListener('pointermove', move);
        t.addEventListener('pointerleave', leave);
      });
      return () => {
        delete root.dataset.playCursor;
        targets.forEach((t) => {
          t.removeEventListener('pointerenter', enter);
          t.removeEventListener('pointermove', move);
          t.removeEventListener('pointerleave', leave);
        });
      };
    });
    return () => mm.revert();
  }, [scope, mounted]);

  if (!mounted) return null;
  return createPortal(
    <div ref={el} className={styles.cursor} aria-hidden="true">
      <svg viewBox="0 0 80 80">
        <circle className={styles.cursorRing} cx="40" cy="40" r="37" />
        <path d="M33 27v26l20-13z" />
      </svg>
      <span className="t-meta">Play</span>
    </div>,
    document.body,
  );
}
