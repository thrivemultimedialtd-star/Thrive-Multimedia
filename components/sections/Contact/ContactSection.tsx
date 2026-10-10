'use client';

import { useEffect, useRef } from 'react';
import { contact } from '@/content/site';
import { closing } from '@/content/story';
import { clamp, ease, env, observe, progressThrough, subscribe, type CircleGrid } from '@/lib/motion';
import TextReveal from '@/components/motion/TextReveal/TextReveal';
import Reveal from '@/components/motion/Reveal/Reveal';
import CopyEmail from '@/components/motion/CopyEmail';
import BriefForm from '@/components/contact/BriefForm/BriefForm';
import TransitionGrid from '@/components/motion/TransitionGrid/TransitionGrid';
import styles from './ContactSection.module.css';

/**
 * The final movement. Motion slows down here: longer staggers, a backdrop of circles that
 * fills in as you arrive (driven by scroll, so it reverses), then the details, then stillness.
 */
export default function ContactSection({ headingLevel = 'h2' }: { headingLevel?: 'h1' | 'h2' }) {
  const section = useRef<HTMLElement>(null);
  const grid = useRef<CircleGrid | null>(null);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    if (env.reducedMotion) {
      grid.current?.setProgress(1);
      return;
    }
    let stop: (() => void) | null = null;
    let last = -1;
    const tick = () => {
      const p = clamp((progressThrough(el) - 0.08) / 0.4);
      if (p === last) return;
      last = p;
      grid.current?.setProgress(p);
    };
    const stopObs = observe(el, (e) => {
      if (e.isIntersecting && !stop) stop = subscribe(tick);
      else if (!e.isIntersecting && stop) {
        stop();
        stop = null;
      }
    }, '0px');
    return () => {
      stopObs();
      stop?.();
    };
  }, []);

  return (
    <section ref={section} id="contact" className={styles.contact} data-section-theme="green" aria-labelledby="contact-title">
      <div className={styles.backdrop} aria-hidden="true">
        <TransitionGrid
          cols={15}
          rows={9}
          color="#2c4520"
          spread={0.75}
          ease={ease.outQuart}
          onReady={(g) => {
            grid.current = g;
          }}
        />
      </div>

      <div className={`wrap ${styles.inner}`}>
        <Reveal variant="rule" className={`section-head ${styles.head}`}>
          <span className="t-meta">Contact</span>
          <span className="t-meta">Abuja · Nigeria</span>
        </Reveal>

        <TextReveal
          as={headingLevel}
          id="contact-title"
          text={closing.title}
          split="lines"
          stagger={220}
          duration={1700}
          className={styles.title}
        />

        <div className={styles.grid}>
          <Reveal delay={700} distance={16} className={styles.formCol}>
            <BriefForm />
          </Reveal>

          <div className={styles.details}>
            <Reveal delay={900} distance={12} className={styles.block}>
              <h3 className="t-meta">Email</h3>
              <a href={`mailto:${contact.email}`} className={styles.big}>
                {contact.email}
              </a>
              <CopyEmail email={contact.email} className={styles.copy} />
            </Reveal>

            <Reveal delay={1000} distance={12} className={styles.block}>
              <h3 className="t-meta">Phone</h3>
              {contact.phones.map((p) => (
                <a key={p.href} href={p.href} className={`${styles.big} ${styles.nowrap}`}>
                  {p.display}
                </a>
              ))}
            </Reveal>

            <Reveal delay={1100} distance={12} className={styles.block}>
              <h3 className="t-meta">Studio</h3>
              <address className={styles.address}>
                {contact.address.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </address>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
