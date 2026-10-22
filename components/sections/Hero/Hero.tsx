'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { hero } from '@/content/story';
import { projects } from '@/content/projects';
import { page, whenFontsReady } from '@/lib/motion';
import TextReveal from '@/components/motion/TextReveal/TextReveal';
import IrisReveal from '@/components/motion/IrisReveal/IrisReveal';
import TransitionLink from '@/components/motion/TransitionLink';
import Placeholder from '@/components/ui/Placeholder/Placeholder';
import Reveal from '@/components/motion/Reveal/Reveal';
import RotatingWord from './RotatingWord';
import styles from './Hero.module.css';

// Brochure work: Huriya Air leads, Market Monie overlaps it, The Place tucks underneath (desktop only).
const collage = [
  { p: projects[0], sizes: '(max-width: 768px) 64vw, 24vw', priority: true },
  { p: projects[2], sizes: '(max-width: 768px) 42vw, 16vw', priority: false },
  { p: projects[1], sizes: '12vw', priority: false },
];

/** A calm hero: the wordmark, line, photos and buttons fade in together; the service word rotates. */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  // Set shortly after the entrance: the rotating word starts then.
  const [alive, setAlive] = useState(false);

  // "MULTIMEDIA" is justified to the exact width of "THRIVE", like the logo lockup.
  useLayoutEffect(() => {
    const h = title.current;
    if (!h) return;
    const thrive = h.querySelector<HTMLElement>(`.${styles.thrive}`);
    const mm = h.querySelector<HTMLElement>(`.${styles.multimedia}`);
    if (!thrive || !mm) return;
    const fit = () => {
      // Measure without tracking. The transition must be off, or the browser reports the old value.
      const prevLs = mm.style.letterSpacing;
      const prevTr = mm.style.transition;
      mm.style.transition = 'none';
      mm.style.letterSpacing = '0px';
      const natural = mm.getBoundingClientRect().width;
      mm.style.letterSpacing = prevLs;
      void mm.offsetWidth; // commit before restoring the transition
      mm.style.transition = prevTr;
      const target = thrive.getBoundingClientRect().width;
      // Spread the gap across the 9 spaces between the 10 letters (the trailing track is cancelled in CSS).
      const track = (target - natural) / 9;
      if (Number.isFinite(track) && track > 0) h.style.setProperty('--mm-track', `${track.toFixed(2)}px`);
    };
    const ro = new ResizeObserver(fit);
    ro.observe(thrive);
    whenFontsReady().then(fit);
    fit();
    return () => ro.disconnect();
  }, []);

  // Simple entrance: everything fades in together once fonts are ready; then the word starts rotating.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let cancelled = false;
    let timer = 0;
    whenFontsReady().then(() => {
      if (cancelled) return;
      el.setAttribute('data-meta', '');
      el.setAttribute('data-collage', '');
      timer = window.setTimeout(() => setAlive(true), 1500);
    });
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return (
    <section ref={root} id="top" className={styles.hero} data-section-theme="paper" aria-labelledby="hero-title">

      <div className={styles.metaTop}>
        <span className="t-meta">{hero.meta[0]}</span>
        <span className={`t-meta ${styles.metaAlt}`}>{hero.meta[1]}</span>
      </div>

      <div className={styles.collage} aria-hidden="true">
        {collage.map(({ p, sizes, priority }, i) => (
          <div key={p.slug} className={`${styles.frame} ${styles[`f${i}`]}`}>
            <IrisReveal trigger="load">
              <Placeholder tone={p.visual.tone} label={p.visual.label} image={p.image} sizes={sizes} priority={priority} compact />
            </IrisReveal>
          </div>
        ))}
      </div>

      <div className={styles.type}>
        <h1 ref={title} id="hero-title" className={styles.title}>
          <TextReveal as="span" text="Thrive" trigger="load" className={`t-display ${styles.thrive}`} />
          <TextReveal as="span" text="Multimedia" trigger="load" className={styles.multimedia} />
        </h1>
        <Reveal as="p" trigger="load" delay={100} className={`t-lead ${styles.line}`}>
          <span className="visually-hidden">{hero.line}</span>
          <span aria-hidden="true">
            {hero.lineLead} <RotatingWord words={hero.rotate} active={alive} /> {hero.lineTail}
          </span>
        </Reveal>
      </div>

      <div className={styles.foot}>
        <div className={styles.actions}>
          <span className={styles.ctaWrap}>
            <a
              href="#work"
              className={styles.cta}
              onClick={(e) => {
                e.preventDefault();
                page.switchSection('work');
              }}
            >
              {hero.cta}
              <span aria-hidden="true">→</span>
            </a>
          </span>
          <TransitionLink href="/contact" className={styles.secondary}>
            {hero.secondary}
          </TransitionLink>
        </div>
      </div>
    </section>
  );
}
