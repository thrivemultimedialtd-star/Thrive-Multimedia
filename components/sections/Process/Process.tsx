'use client';

import { useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { process as stages } from '@/content/story';
import { useReveal } from '@/components/motion/useReveal';
import Reveal from '@/components/motion/Reveal/Reveal';
import Texture from '@/components/ui/Texture';
import StepIcon from './StepIcon';
import styles from './Process.module.css';

const pad = (n: number) => String(n).padStart(2, '0');
const corner = 'radial-gradient(ellipse 80% 80% at 100% 0%, #000 0%, transparent 100%)';

/**
 * "Our approach": the four stages on soft sage. Desktop lists the steps beside one large card:
 * a green rail shows how far through the sequence you are, and choosing a step (hover, click or
 * arrow keys) replays that card's entrance: its icon draws, the numeral rises, the text follows.
 * Phones get a grid of four cards that cascade in, each icon drawing as it arrives.
 * Nothing moves on its own; every motion answers a scroll into view or a choice.
 */
export default function Process({ id = 'process' }: { id?: string }) {
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const list = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  useReveal(list, { trigger: 'view' });

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
        <div className={styles.listWrap}>
          <div
            ref={list}
            role="tablist"
            aria-orientation="vertical"
            aria-label="Our approach"
            className={styles.list}
            style={{ '--progress': (active + 1) / stages.length } as CSSProperties}
            onKeyDown={onKey}
          >
            <span className={styles.rail} aria-hidden="true" />
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
                  style={{ '--i': i } as CSSProperties}
                  data-active={on || undefined}
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                >
                  <span className={`t-meta ${styles.tabNum}`}>{pad(i + 1)}</span>
                  <span className={`t-condensed ${styles.tabWord}`}>{st.word}</span>
                  <span className={styles.arrow} aria-hidden="true">
                    →
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <Reveal delay={100} className={styles.stage}>
          <Texture className={`${styles.texture} parallax`} size="900px auto" fade={corner} />
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
                  {/* Re-mounted whenever this step becomes active, so its entrance replays. */}
                  <div key={on ? 'on' : 'off'} className={styles.content}>
                    <StepIcon index={i} className={styles.panelIcon} />
                    <span className={styles.numeralMask} aria-hidden="true">
                      <span className={styles.numeral}>{pad(i + 1)}</span>
                    </span>
                    <p className={`t-meta ${styles.count}`} style={{ '--i': 0 } as CSSProperties}>
                      Step {i + 1} of {stages.length}
                    </p>
                    <p className={`t-heading-sm ${styles.line}`} style={{ '--i': 1 } as CSSProperties}>
                      {st.line}
                    </p>
                    <p className={`t-body ${styles.body}`} style={{ '--i': 2 } as CSSProperties}>
                      {st.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>

      {/* Phones: four compact cards, everything visible. */}
      <ol className={styles.cards}>
        {stages.map((st, i) => (
          <Reveal as="li" key={st.word} delay={i * 80} className={styles.card} style={{ '--i': i } as CSSProperties}>
            <Texture className={styles.cardTexture} size="520px auto" fade={corner} />
            <div className={styles.cardTop}>
              <span className={`t-meta ${styles.cardNum}`}>{pad(i + 1)}</span>
              <StepIcon index={i} className={styles.cardIcon} />
            </div>
            <h3 className={`t-condensed ${styles.cardWord}`}>{st.word}</h3>
            <p className={styles.cardLine}>{st.line}</p>
            <p className={styles.cardBody}>{st.body}</p>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
