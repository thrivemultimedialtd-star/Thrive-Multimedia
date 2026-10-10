'use client';

import { useEffect, useRef, useState } from 'react';
import { services } from '@/content/services';
import { projects } from '@/content/projects';
import { damp, env, pointer, subscribe } from '@/lib/motion';
import TextReveal from '@/components/motion/TextReveal/TextReveal';
import Reveal from '@/components/motion/Reveal/Reveal';
import Placeholder from '@/components/ui/Placeholder/Placeholder';
import TransitionLink from '@/components/motion/TransitionLink';
import styles from './ServiceList.module.css';

/**
 * Editorial service index. Hover or focus a row: the title grows, its detail opens,
 * a floating image follows the pointer and the section takes on the service's tint.
 * On touch it behaves as an accordion.
 */
export default function ServiceList({ headingLevel = 'h2' }: { headingLevel?: 'h2' | 'h3' }) {
  const [active, setActive] = useState<number | null>(null);
  const section = useRef<HTMLElement>(null);
  const float = useRef<HTMLDivElement>(null);
  const H = headingLevel;

  // The floating preview trails the pointer with damping (desktop only).
  useEffect(() => {
    const el = float.current;
    const sec = section.current;
    if (!el || !sec || env.touch || env.reducedMotion) return;
    const s = { x: 0, y: 0, r: 0 };
    let prevX = 0;
    let fresh = true;
    let stop: (() => void) | null = null;
    const tick = (dt: number) => {
      const box = sec.getBoundingClientRect();
      // Anchored in the open right-hand column so it never sits over the copy it illustrates.
      const anchor = box.width * 0.885;
      const tx = anchor + (pointer.x - box.left - anchor) * 0.12;
      const ty = pointer.y - box.top;
      // Start where the pointer is rather than flying in from the corner.
      s.x = fresh ? tx : damp(s.x, tx, 7, dt);
      s.y = fresh ? ty : damp(s.y, ty, 7, dt);
      if (fresh) prevX = s.x;
      fresh = false;
      // Lean into the direction of travel.
      s.r = damp(s.r, Math.max(-8, Math.min(8, (s.x - prevX) * 0.6)), 6, dt);
      prevX = s.x;
      el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0) translate(-50%, -50%) rotate(${s.r.toFixed(2)}deg)`;
    };
    const enter = () => {
      fresh = true;
      stop ??= subscribe(tick);
    };
    const leave = () => {
      stop?.();
      stop = null;
    };
    sec.addEventListener('pointerenter', enter);
    sec.addEventListener('pointerleave', leave);
    return () => {
      leave();
      sec.removeEventListener('pointerenter', enter);
      sec.removeEventListener('pointerleave', leave);
    };
  }, []);

  const tint = active !== null ? services[active].tint : 'transparent';

  return (
    <section
      id="services"
      ref={section}
      className={`section ${styles.services}`}
      data-section-theme="paper"
      aria-labelledby="services-title"
      style={{ '--tint': tint } as React.CSSProperties}
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
                onMouseEnter={() => !env.touch && setActive(i)}
              >
                <H className={styles.rowHead}>
                  <button
                    type="button"
                    className={styles.trigger}
                    aria-expanded={open}
                    aria-controls={`svc-${s.id}`}
                    onFocus={() => setActive(i)}
                    onClick={() => setActive(open && env.touch ? null : i)}
                    data-cursor="open"
                    data-cursor-label="Open"
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

      <div ref={float} className={styles.float} data-show={active !== null || undefined} aria-hidden="true">
        {services.map((s, i) => {
          const p = projects.find((pr) => pr.serviceId === s.id);
          return (
            <div key={s.id} className={styles.floatItem} data-active={active === i || undefined}>
              <Placeholder tone={p?.visual.tone ?? 'mist'} label={s.short} image={p?.image} sizes="320px" parallax={0} compact />
            </div>
          );
        })}
      </div>
    </section>
  );
}
