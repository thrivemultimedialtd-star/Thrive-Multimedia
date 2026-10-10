'use client';

import { useEffect, useRef } from 'react';
import { logoHeight, type Logo } from '@/content/brochure';
import { damp, env, observe, scroll, subscribe } from '@/lib/motion';
import styles from './Markets.module.css';

/**
 * A row of client logos that drifts continuously. Scrolling speeds it up (and follows the
 * scroll direction); hovering slows it to a stop so a name can be read.
 */
export default function Marquee({ label, items, direction = -1 }: { label: string; items: Logo[]; direction?: 1 | -1 }) {
  const row = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const r = row.current;
    const t = track.current;
    if (!r || !t || env.reducedMotion) return;
    let half = 0;
    const measure = () => {
      half = t.scrollWidth / 2;
    };
    const ro = new ResizeObserver(measure);
    ro.observe(t);
    measure();
    let x = 0;
    let speed = 0;
    let paused = false;
    const onEnter = () => (paused = true);
    const onLeave = () => (paused = false);
    r.addEventListener('pointerenter', onEnter);
    r.addEventListener('pointerleave', onLeave);

    const tick = (dt: number) => {
      const target = paused ? 0 : 40 + Math.min(Math.abs(scroll.velocity) * 0.35, 900);
      speed = damp(speed, target, paused ? 6 : 3, dt);
      const dir = direction * (scroll.direction === -1 ? -1 : 1);
      x += speed * dt * dir;
      if (half > 0) {
        x = ((x % half) + half) % half; // wrap into [0, half)
      }
      t.style.transform = `translate3d(${(-x).toFixed(2)}px, 0, 0)`;
    };
    let stop: (() => void) | null = null;
    const stopObs = observe(r, (e) => {
      if (e.isIntersecting && !stop) stop = subscribe(tick);
      else if (!e.isIntersecting && stop) {
        stop();
        stop = null;
      }
    }, '0px');
    return () => {
      ro.disconnect();
      stopObs();
      stop?.();
      r.removeEventListener('pointerenter', onEnter);
      r.removeEventListener('pointerleave', onLeave);
    };
  }, [direction]);

  return (
    <div ref={row} className={styles.marquee}>
      <h3 className={`t-meta ${styles.marqueeLabel}`}>{label}</h3>
      {/* Readable list for assistive tech; the moving copy is decorative. */}
      <ul className="visually-hidden">
        {items.map((n) => (
          <li key={n.name}>{n.name}</li>
        ))}
      </ul>
      <div className={styles.marqueeViewport} aria-hidden="true">
        <div ref={track} className={styles.marqueeTrack}>
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
