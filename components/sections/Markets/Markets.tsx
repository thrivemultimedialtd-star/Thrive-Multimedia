'use client';

import { useEffect, useRef, useState } from 'react';
import { markets } from '@/content/story';
import { clients, identities } from '@/content/clients';
import { env, mapRange, observe, progressThrough, subscribe } from '@/lib/motion';
import TextReveal from '@/components/motion/TextReveal/TextReveal';
import Reveal from '@/components/motion/Reveal/Reveal';
import Placeholder, { type Tone } from '@/components/ui/Placeholder/Placeholder';
import { images } from '@/content/brochure';
import Marquee from './Marquee';
import styles from './Markets.module.css';

const tones: Tone[] = ['green', 'clay', 'deep', 'mist', 'paper'];
// Brochure work previewed on each goal.
const goalImages = [
  images['huriya-air'],
  images['the-place'],
  images['foreign-policy-billboard'],
  images['market-monie-banner'],
  images['farm-alert-van'],
];

export default function Markets() {
  const section = useRef<HTMLElement>(null);
  const band = useRef<HTMLUListElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  // The goals drift sideways as the section passes. Not pinned: the page keeps moving.
  useEffect(() => {
    const sec = section.current;
    const row = band.current;
    if (!sec || !row || env.reducedMotion) return;
    let width = 0;
    const measure = () => {
      width = row.scrollWidth;
    };
    const ro = new ResizeObserver(measure);
    ro.observe(row);
    measure();
    let last = -1;
    const tick = () => {
      const p = progressThrough(sec);
      if (p === last) return;
      last = p;
      const vw = window.innerWidth;
      const x = mapRange(p, 0.1, 0.75, vw * 0.25, -(width - vw * 0.75));
      row.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
    };
    let stop: (() => void) | null = null;
    const stopObs = observe(sec, (e) => {
      if (e.isIntersecting && !stop) stop = subscribe(tick);
      else if (!e.isIntersecting && stop) {
        stop();
        stop = null;
      }
    }, '10% 0px 10% 0px');
    return () => {
      ro.disconnect();
      stopObs();
      stop?.();
    };
  }, []);

  return (
    <section ref={section} id="markets" className={`section ${styles.markets}`} data-section-theme="charcoal" aria-labelledby="markets-title">
      <div className="wrap">
        <Reveal variant="rule" className="section-head">
          <span className="t-meta">{markets.eyebrow}</span>
          <span className="t-meta">Giving you the creative edge</span>
        </Reveal>
        <TextReveal as="h2" id="markets-title" text={markets.title} split="words" className="t-heading" />
      </div>

      <div className={styles.bandWrap} onMouseLeave={() => setHover(null)}>
        <ul ref={band} className={styles.band}>
          {markets.goals.map((g, i) => (
            <li
              key={g}
              className={styles.goal}
              data-active={hover === i || undefined}
              onMouseEnter={() => setHover(i)}
            >
              <span className={styles.goalIndex}>{String(i + 1).padStart(2, '0')}</span>
              {g}
            </li>
          ))}
        </ul>
        <div className={styles.preview} data-show={hover !== null || undefined} aria-hidden="true">
          {markets.goals.map((g, i) => (
            <div key={g} className={styles.previewItem} data-active={hover === i || undefined}>
              <Placeholder tone={tones[i]} label={g} image={goalImages[i]} sizes="220px" parallax={0} bare />
            </div>
          ))}
        </div>
      </div>

      <div className={`wrap ${styles.copy}`}>
        <Reveal className={styles.body}>
          <p className="t-body">{markets.body}</p>
        </Reveal>
        <TextReveal as="p" text={markets.closer} split="words" className={`t-heading-sm ${styles.closer}`} delay={150} />
      </div>

      <div className={styles.walls}>
        <Marquee label="Who we’ve worked for" items={clients} direction={-1} />
        <Marquee label="Identities we’ve shaped" items={identities} direction={1} />
      </div>
    </section>
  );
}
