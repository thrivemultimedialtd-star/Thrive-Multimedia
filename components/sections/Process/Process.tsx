'use client';

import { useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { process as stages } from '@/content/story';
import Reveal from '@/components/motion/Reveal/Reveal';
import Texture from '@/components/ui/Texture';
import styles from './Process.module.css';

const pad = (n: number) => String(n).padStart(2, '0');

// One bold Thrive colour per step; neighbours never share a tone.
const tones = [
  { bg: '#7fb53f', fg: '#0b120a', accent: '#0b120a', body: 0.9 }, // Listen: bright green
  { bg: '#24391a', fg: '#f3f1ea', accent: '#7fb53f', body: 0.82 }, // Define: deep green
  { bg: '#232323', fg: '#f3f1ea', accent: '#7fb53f', body: 0.82 }, // Create: charcoal
  { bg: '#6a9a36', fg: '#0b120a', accent: '#0b120a', body: 0.9 }, // Deliver: Thrive green
];
const toneStyle = (i: number) => {
  const t = tones[i];
  return { '--tone-bg': t.bg, '--tone-fg': t.fg, '--tone-accent': t.accent, '--tone-body': t.body } as CSSProperties;
};

/**
 * "Our approach": four steps as four bold colour panels.
 * Desktop: an expanding row. The chosen panel (hover, click or arrow keys) widens and tells its
 * step; the others fold to a vertical word. Phones: the panels stack full width, everything
 * visible, each rising in as it arrives. Nothing moves on its own.
 */
export default function Process({ id = 'process' }: { id?: string }) {
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const [active, setActive] = useState(0);

  const onKey = (e: KeyboardEvent) => {
    const n = stages.length;
    const next =
      e.key === 'ArrowRight' || e.key === 'ArrowDown' ? (active + 1) % n
      : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? (active - 1 + n) % n
      : e.key === 'Home' ? 0
      : e.key === 'End' ? n - 1
      : null;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <section id={id} className={`wrap section ${styles.process}`} data-section-theme="paper" aria-labelledby={`${id}-title`}>
      <div className="section-head">
        <h2 id={`${id}-title`} className="t-meta">
          Our approach
        </h2>
      </div>

      {/* Desktop: expanding panels (hidden on phones, so read only once). */}
      <Reveal className={styles.rowWrap}>
        <div role="tablist" aria-label="Our approach" className={styles.row} onKeyDown={onKey}>
          {stages.map((st, i) => {
            const on = i === active;
            return (
              <div key={st.word} className={styles.panel} style={toneStyle(i)} data-active={on || undefined}>
                <Texture className={styles.texture} size="700px auto" />
                <button
                  ref={(n) => {
                    tabs.current[i] = n;
                  }}
                  type="button"
                  role="tab"
                  id={`${id}-tab-${i}`}
                  aria-selected={on}
                  aria-controls={`${id}-panel-${i}`}
                  tabIndex={on ? 0 : -1}
                  className={styles.hit}
                  onClick={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onPointerMove={(e) => e.pointerType === 'mouse' && !on && setActive(i)}
                >
                  <span className="visually-hidden">
                    Step {i + 1}: {st.word}
                  </span>
                </button>

                <div className={styles.top} aria-hidden="true">
                  <span className={styles.numeral}>{pad(i + 1)}</span>
                </div>

                {/* Folded: the word runs up the panel. */}
                <span className={`t-condensed ${styles.wordV}`} aria-hidden="true">
                  {st.word}
                </span>

                {/* Open: the step told in full. Re-mounted when opened so its entrance replays. */}
                <div
                  key={on ? 'on' : 'off'}
                  id={`${id}-panel-${i}`}
                  role="tabpanel"
                  aria-labelledby={`${id}-tab-${i}`}
                  aria-hidden={!on || undefined}
                  className={styles.body}
                >
                  <h3 className={`t-condensed ${styles.word}`}>{st.word}</h3>
                  <p className={styles.line}>{st.line}</p>
                  <p className={styles.text}>{st.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>

      {/* Phones: the four panels stacked, everything visible. */}
      <ol className={styles.stack}>
        {stages.map((st, i) => (
          <Reveal as="li" key={st.word} delay={i * 60} distance={24} className={styles.card} style={toneStyle(i)}>
            <Texture className={styles.texture} size="520px auto" />
            <span className={styles.cardNumeral} aria-hidden="true">
              {pad(i + 1)}
            </span>
            <div className={styles.cardTop}>
              <span className={`t-meta ${styles.cardCount}`}>
                {pad(i + 1)} / {pad(stages.length)}
              </span>
            </div>
            <h3 className={`t-condensed ${styles.cardWord}`}>{st.word}</h3>
            <p className={styles.cardLine}>{st.line}</p>
            <p className={styles.cardText}>{st.body}</p>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
