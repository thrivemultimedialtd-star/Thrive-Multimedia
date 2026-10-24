'use client';

import { useEffect, useRef } from 'react';
import { logoHeight, type Logo } from '@/content/brochure';
import { observe } from '@/lib/motion';
import styles from './Markets.module.css';

/**
 * A row of client logos that drifts slowly (pure CSS). It pauses on hover, while pressed on a
 * touch screen so a logo can be read, and whenever it is off screen to save battery.
 */
export default function Marquee({ label, items, direction = -1 }: { label: string; items: Logo[]; direction?: 1 | -1 }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    return observe(el, (e) => el.toggleAttribute('data-offscreen', !e.isIntersecting), '0px');
  }, []);

  return (
    <div ref={root} className={styles.marquee}>
      <h3 className={`t-meta ${styles.marqueeLabel}`}>{label}</h3>
      {/* Readable list for assistive tech; the moving copy is decorative. */}
      <ul className="visually-hidden">
        {items.map((n) => (
          <li key={n.name}>{n.name}</li>
        ))}
      </ul>
      <div className={styles.marqueeViewport} aria-hidden="true">
        <div
          className={styles.marqueeTrack}
          data-reverse={direction === 1 || undefined}
          style={{ '--marquee-duration': `${items.length * 4}s` } as React.CSSProperties}
        >
          {[0, 1].map((copy) =>
            items.map((n) => (
              <span key={`${copy}-${n.name}`} className={`${styles.name} ${copy ? styles.dup : ''}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={n.src}
                  alt=""
                  width={n.width}
                  height={n.height}
                  className={styles.logo}
                  style={{ height: `${logoHeight(n)}rem` }}
                  loading="lazy"
                  draggable={false}
                />
                <span className={styles.sep} />
              </span>
            )),
          )}
        </div>
      </div>
    </div>
  );
}
