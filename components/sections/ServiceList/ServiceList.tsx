'use client';

import { useState } from 'react';
import { services } from '@/content/services';
import { projects } from '@/content/projects';
import { env } from '@/lib/motion';
import TextReveal from '@/components/motion/TextReveal/TextReveal';
import Reveal from '@/components/motion/Reveal/Reveal';
import TransitionLink from '@/components/motion/TransitionLink';
import styles from './ServiceList.module.css';

/**
 * Editorial service index. Hover, focus or tap a row to open its detail
 * (an accordion on touch).
 */
export default function ServiceList({ headingLevel = 'h2' }: { headingLevel?: 'h2' | 'h3' }) {
  const [active, setActive] = useState<number | null>(null);
  const H = headingLevel;

  return (
    <section
      id="services"
      className={`section ${styles.services}`}
      data-section-theme="paper"
      aria-labelledby="services-title"
      onMouseLeave={() => setActive(null)}
    >
      <div className="wrap">
        <Reveal variant="rule" className="section-head">
          <span className="t-meta">Services</span>
          <span className="t-meta">Print · Web · Multimedia</span>
        </Reveal>
        <TextReveal as="h2" id="services-title" text={['Everything a brand', 'needs, in one studio.']} split="lines" className={`t-heading ${styles.title}`} />

        <ul className={styles.list}>
          {services.map((s, i) => {
            const open = active === i;
            const related = projects.filter((p) => p.serviceId === s.id);
            return (
              <li
                key={s.id}
                className={styles.row}
                data-open={open || undefined}
                data-dim={active !== null && !open ? '' : undefined}
                // pointermove (not mouseenter) so rows only open when the mouse actually moves,
                // never because the list scrolled under a resting cursor.
                onPointerMove={(e) => e.pointerType === 'mouse' && !open && setActive(i)}
              >
                <H className={styles.rowHead}>
                  <button
                    type="button"
                    className={styles.trigger}
                    aria-expanded={open}
                    aria-controls={`svc-${s.id}`}
                    // Keyboard focus opens a row; a tap is handled by onClick alone.
                    onFocus={(e) => e.currentTarget.matches(':focus-visible') && setActive(i)}
                    onClick={() => setActive(open && env.touch ? null : i)}
                  >
                    <span className={`t-meta ${styles.num}`}>{s.number}</span>
                    <span className={styles.name}>{s.title}</span>
                    <span className={styles.plus} aria-hidden="true" />
                  </button>
                </H>
                <div id={`svc-${s.id}`} className={styles.detail} role="region" aria-label={s.title}>
                  <div className={styles.detailInner}>
                    <p className={`t-lead ${styles.lead}`}>{s.lead}</p>
                    <div className={styles.cols}>
                      <p className="t-body">{s.body}</p>
                      <ul className={styles.caps}>
                        {s.capabilities.map((c) => (
                          <li key={c}>{c}</li>
                        ))}
                      </ul>
                    </div>
                    {related.length > 0 && (
                      <p className={`t-meta ${styles.related}`}>
                        Seen in{' '}
                        {related.map((p, j) => (
                          <span key={p.slug}>
                            <TransitionLink href={`/work/${p.slug}`} tabIndex={open ? 0 : -1}>
                              {p.name}
                            </TransitionLink>
                            {j < related.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

    </section>
  );
}
