'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import { process as stages } from '@/content/story';
import Reveal from '@/components/motion/Reveal/Reveal';
import Texture from '@/components/ui/Texture';
import styles from './Process.module.css';

const pad = (n: number) => String(n).padStart(2, '0');
const corner = 'radial-gradient(ellipse 80% 80% at 100% 0%, #000 0%, transparent 100%)';

/**
 * "Our approach": the four stages on soft sage. Desktop lists the steps beside one large card;
 * hovering, clicking or arrowing to a step shows it (a quick crossfade, nothing moves on its own).
 * Phones get a compact grid of four cards with everything visible.
 */
export default function Process({ id = 'process' }: { id?: string }) {
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const [active, setActive] = useState(0);

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
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <section id={id} className={`wrap section ${styles.process}`} data-section-theme="sage" aria-labelledby={`${id}-title`}>
      <div className="section-head">
        <h2 id={`${id}-title`} className="t-meta">
          Our approach
        </h2>
      </div>

      {/* Desktop: step list + one large card (hidden on phones, so read only once). */}
      <div className={styles.stepper}>
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
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                >
                  <span className={`t-meta ${styles.tabNum}`}>{pad(i + 1)}</span>
                  <span className={`t-condensed ${styles.tabWord}`}>{st.word}</span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <Reveal delay={100} className={styles.stage}>
          <Texture className={styles.texture} size="900px auto" fade={corner} />
          <div className={styles.panels}>
            {stages.map((st, i) => {
              const on = i === active;
              return (
                <div
                  key={st.word}
                  id={`${id}-panel-${i}`}
                  role="tabpanel"
                  aria-labelledby={`${id}-tab-${i}`}
                  aria-hidden={!on || undefined}
                  inert={!on || undefined}
                  className={styles.panel}
                  data-active={on || undefined}
                >
                  <span className={styles.numeral} aria-hidden="true">
                    {pad(i + 1)}
                  </span>
                  <p className={`t-meta ${styles.count}`}>
                    Step {i + 1} of {stages.length}
                  </p>
                  <p className={`t-heading-sm ${styles.line}`}>{st.line}</p>
                  <p className={`t-body ${styles.body}`}>{st.body}</p>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>

      {/* Phones: four compact cards, everything visible. */}
      <ol className={styles.cards}>
        {stages.map((st, i) => (
          <Reveal as="li" key={st.word} delay={i * 40} className={styles.card}>
            <Texture className={styles.cardTexture} size="520px auto" fade={corner} />
            <span className={`t-meta ${styles.cardNum}`}>{pad(i + 1)}</span>
            <h3 className={`t-condensed ${styles.cardWord}`}>{st.word}</h3>
            <p className={styles.cardLine}>{st.line}</p>
            <p className={styles.cardBody}>{st.body}</p>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
