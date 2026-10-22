'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from 'react';
import { process as stages } from '@/content/story';
import { observe } from '@/lib/motion';
import Reveal from '@/components/motion/Reveal/Reveal';
import Texture from '@/components/ui/Texture';
import styles from './Process.module.css';

const pad = (n: number) => String(n).padStart(2, '0');

/** A media query as live state (`server` is used for the first, server-rendered pass). */
function useMedia(query: string, server: boolean) {
  return useSyncExternalStore(
    (cb) => {
      const mq = matchMedia(query);
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    },
    () => matchMedia(query).matches,
    () => server,
  );
}

/**
 * "Our approach": the four stages as a stepper. Desktop lists the steps on the left and shows the
 * active one large on the right; while on screen it moves on every few seconds (a green bar shows
 * the timing), pauses on hover or focus, and stops once a visitor picks a step. Phones get a
 * simple vertical timeline with every step visible.
 */
export default function Process({ id = 'process' }: { id?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [hidden, setHidden] = useState(false);
  // Stepper behaviour (tabs, autoplay) only on wide screens with motion allowed.
  const wide = useMedia('(min-width: 901px)', true);
  const motion = !useMedia('(prefers-reduced-motion: reduce)', true);

  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    const el = root.current;
    const stop = el ? observe(el, (e) => setInView(e.isIntersecting), '0px') : undefined;
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      stop?.();
    };
  }, []);

  const playing = auto && wide && motion;
  const running = playing && inView && !paused && !hidden;

  const pick = (i: number, focus = false) => {
    setAuto(false);
    setActive(i);
    if (focus) tabs.current[i]?.focus();
  };

  const onKey = (e: KeyboardEvent) => {
    const n = stages.length;
    const next =
      e.key === 'ArrowDown' || e.key === 'ArrowRight' ? (active + 1) % n
      : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? (active - 1 + n) % n
      : e.key === 'Home' ? 0
      : e.key === 'End' ? n - 1
      : null;
    if (next === null) return;
    e.preventDefault();
    pick(next, true);
  };

  return (
    <section id={id} className={`wrap section ${styles.process}`} data-section-theme="ink" aria-labelledby={`${id}-title`}>
      <div className={`section-head ${styles.head}`}>
        <h2 id={`${id}-title`} className="t-meta">
          Our approach
        </h2>
      </div>

      <div
        ref={root}
        className={styles.stepper}
        data-playing={playing || undefined}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
        }}
      >
        <Reveal className={styles.listWrap}>
          <div role="tablist" aria-orientation="vertical" aria-label="Our approach" className={styles.list} onKeyDown={onKey}>
            {stages.map((st, i) => {
              const on = i === active;
              return (
                <button
                  key={st.word}
                  ref={(n) => {
                    tabs.current[i] = n;
                  }}
                  type="button"
                  role="tab"
                  id={`${id}-tab-${i}`}
                  aria-selected={on}
                  aria-controls={`${id}-panel-${i}`}
                  tabIndex={on ? 0 : -1}
                  className={styles.tab}
                  data-active={on || undefined}
                  onClick={() => pick(i)}
                >
                  <span className={`t-meta ${styles.tabNum}`}>{pad(i + 1)}</span>
                  <span className={`t-condensed ${styles.tabWord}`}>{st.word}</span>
                  <span className={styles.track} aria-hidden="true">
                    {on && (
                      <span
                        key={active}
                        className={styles.fill}
                        data-running={running || undefined}
                        onAnimationEnd={() => setActive((a) => (a + 1) % stages.length)}
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <Reveal delay={100} className={styles.stage}>
          <Texture className={styles.texture} size="900px auto" fade="linear-gradient(to top, #000 0%, transparent 75%)" />
          <div className={styles.panels}>
            {stages.map((st, i) => {
              const on = i === active;
              const tucked = wide && !on;
              return (
                <div
                  key={st.word}
                  id={`${id}-panel-${i}`}
                  role={wide ? 'tabpanel' : undefined}
                  aria-labelledby={wide ? `${id}-tab-${i}` : undefined}
                  aria-hidden={tucked || undefined}
                  inert={tucked || undefined}
                  className={styles.panel}
                  data-active={on || undefined}
                >
                  <span className={styles.numeral} aria-hidden="true">
                    {pad(i + 1)}
                  </span>
                  <p className={`t-meta ${styles.count}`}>
                    Step {i + 1} of {stages.length}
                  </p>
                  <h3 className={`t-condensed ${styles.panelWord}`}>{st.word}</h3>
                  <p className={`t-heading-sm ${styles.line}`}>{st.line}</p>
                  <p className={`t-body ${styles.body}`}>{st.body}</p>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
