'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { env, observe } from '@/lib/motion';
import styles from './RotatingWord.module.css';

/**
 * A word that cycles through a list with a short crossfade; the space eases to fit
 * the current word. Starts when `active` is set.
 */
export default function RotatingWord({ words, active, interval = 3000 }: { words: string[]; active: boolean; interval?: number }) {
  const [index, setIndex] = useState(0);
  const root = useRef<HTMLSpanElement>(null);
  const items = useRef<Array<HTMLSpanElement | null>>([]);
  const visible = useRef(true);

  // The mask takes the width of the current word (re-measured on resize).
  useLayoutEffect(() => {
    const el = root.current;
    const fit = () => {
      const w = items.current[index]?.getBoundingClientRect().width;
      if (el && w) el.style.width = `${w}px`;
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [index]);

  // Pause while off screen.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    return observe(el, (e) => (visible.current = e.isIntersecting), '0px');
  }, []);

  useEffect(() => {
    if (!active || env.reducedMotion) return;
    const t = setInterval(() => {
      if (visible.current && !document.hidden) setIndex((i) => (i + 1) % words.length);
    }, interval);
    return () => clearInterval(t);
  }, [active, interval, words.length]);

  return (
    <span ref={root} className={styles.mask} aria-hidden="true">
      {words.map((w, i) => (
        <span
          key={w}
          ref={(n) => {
            items.current[i] = n;
          }}
          className={styles.word}
          data-state={i === index ? 'in' : i === (index - 1 + words.length) % words.length ? 'out' : 'wait'}
        >
          {w}
        </span>
      ))}
    </span>
  );
}
