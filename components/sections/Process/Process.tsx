'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { process as stages } from '@/content/story';
import { clamp, ease, env, observe, progressPinned, subscribe, type CircleGrid } from '@/lib/motion';
import TransitionGrid from '@/components/motion/TransitionGrid/TransitionGrid';
import CircleNetwork from './visuals/CircleNetwork';
import GlowRing from './visuals/GlowRing';
import PatternReveal from './visuals/PatternReveal';
import LogoStickers from './visuals/LogoStickers';
import type { StageVisual } from './visuals/types';
import styles from './Process.module.css';

const DWELL = 0.9; // the last 10% of the track holds DELIVER before the panel scrolls away
const visualsFor = [CircleNetwork, GlowRing, PatternReveal, LogoStickers];

/**
 * The approach sequence, after sashamartynchuk.com: one pinned, reversible run through
 * LISTEN → DEFINE → CREATE → DELIVER. A single condensed word holds the centre at a time,
 * with its line beneath and its own full-screen visual behind it.
 */
export default function Process({ id = 'process' }: { id?: string }) {
  const track = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const words = useRef<Array<HTMLElement | null>>([]);
  const copies = useRef<Array<HTMLElement | null>>([]);
  const counter = useRef<HTMLSpanElement>(null);
  const grid = useRef<CircleGrid | null>(null);
  const visuals = useRef<Array<StageVisual | null>>([]);
  // Stable register callbacks so each visual mounts once.
  const [registers] = useState(() =>
    stages.map((_, i) => (handle: StageVisual | null) => {
      visuals.current[i] = handle;
    }),
  );

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    if (env.reducedMotion) {
      // Stacked, unpinned: every visual shows its settled frame behind its own stage.
      visuals.current.forEach((v) => v?.update(1, 1));
      return;
    }
    const n = stages.length;
    let last = -1;
    let shown = -1;

    // Each stage dwells, then crosses to the next over ~16% of its segment.
    const stepped = (q: number) => {
      const f = clamp(q) * (n - 1);
      const base = Math.min(Math.floor(f), n - 2);
      const frac = f - base;
      return base + ease.inOutCubic(clamp((frac - 0.42) / 0.16));
    };

    const tick = () => {
      const p = progressPinned(el);
      if (p === last) return;
      last = p;
      const q = clamp(p / DWELL);
      const f = q * (n - 1);
      const s = stepped(q);
      const sCopy = stepped(clamp(q - 0.02));

      for (let i = 0; i < n; i++) {
        const off = s - i; // 0 = active, >0 = leaving upward, <0 = arriving from below
        const a = Math.abs(off);
        const w = words.current[i];
        if (w) {
          w.style.opacity = clamp(1 - a * 1.6).toFixed(3);
          w.style.transform = `translate3d(0, ${(-off * 45).toFixed(2)}%, 0)`;
        }
        const c = copies.current[i];
        if (c) {
          const oc = sCopy - i;
          c.style.opacity = clamp(1 - Math.abs(oc) * 2.6).toFixed(3);
          c.style.transform = `translate3d(0, ${(-oc * 30).toFixed(1)}px, 0)`;
        }
        visuals.current[i]?.update(clamp(1 - a * 1.4), clamp(f - i + 1));
      }

      const active = Math.round(s);
      if (active !== shown && counter.current) {
        shown = active;
        counter.current.textContent = String(active + 1).padStart(2, '0');
      }
      grid.current?.setProgress(q);
    };

    let stopTick: (() => void) | null = null;
    const stopObs = observe(
      el,
      (e) => {
        if (e.isIntersecting && !stopTick) stopTick = subscribe(tick);
        else if (!e.isIntersecting && stopTick) {
          stopTick();
          stopTick = null;
          // Park every visual so none keeps ticking off-screen.
          visuals.current.forEach((v) => v?.update(0, 0));
          last = -1;
        }
      },
      '20% 0px 20% 0px',
    );
    tick();
    return () => {
      stopObs();
      stopTick?.();
    };
  }, []);

  return (
    <section
      id={id}
      ref={track}
      className={styles.track}
      data-section-theme="ink"
      aria-labelledby={`${id}-title`}
      style={{ '--stages': stages.length } as CSSProperties}
    >
      <div ref={panel} className={styles.panel}>
        <div className={styles.head}>
          <h2 id={`${id}-title`} className="t-meta">
            Our approach
          </h2>
          <span className="t-meta" aria-hidden="true">
            <span ref={counter}>01</span> / {String(stages.length).padStart(2, '0')}
          </span>
        </div>

        <ol className={styles.stages}>
          {stages.map((st, i) => {
            const Visual = visualsFor[i];
            return (
              <li key={st.word} className={styles.stage}>
                {Visual && <Visual register={registers[i]} />}
                <div className={styles.text}>
                  <h3
                    className={`t-condensed ${styles.word}`}
                    ref={(node) => {
                      words.current[i] = node;
                    }}
                  >
                    {st.word}
                  </h3>
                  <div
                    className={styles.copy}
                    ref={(node) => {
                      copies.current[i] = node;
                    }}
                  >
                    <p className={styles.line}>{st.line}</p>
                    <p className={styles.body}>{st.body}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className={styles.marker} aria-hidden="true">
          <TransitionGrid
            cols={1}
            rows={18}
            color="var(--green-bright)"
            spread={0.85}
            origin={{ x: 0.5, y: 0 }}
            ease={ease.linear}
            onReady={(g) => {
              grid.current = g;
            }}
          />
        </div>
      </div>
    </section>
  );
}
