'use client';

import { useEffect, useRef } from 'react';
import type { Project } from '@/content/projects';
import { clamp, ease, env, observe, page, progressPinned, scroll, subscribe, type CircleGrid } from '@/lib/motion';
import TransitionGrid from '@/components/motion/TransitionGrid/TransitionGrid';
import TransitionLink from '@/components/motion/TransitionLink';
import styles from './NextProject.module.css';

/**
 * Scroll past the end of a project and the circle grid fills the screen, driven by scroll
 * (so it reverses if you scroll back). Once fully covered it hands straight to the page
 * transition, which is already covered, and the next project opens from the centre.
 */
export default function NextProject({ project }: { project: Project }) {
  const track = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const grid = useRef<CircleGrid | null>(null);

  useEffect(() => {
    const el = track.current;
    if (!el || env.reducedMotion) return;
    let fired = false;
    let last = -1;
    const href = `/work/${project.slug}`;
    const tick = () => {
      const raw = progressPinned(el);
      const p = clamp(raw * 1.12);
      if (p !== last) {
        last = p;
        grid.current?.setProgress(p);
        panel.current?.style.setProperty('--p', p.toFixed(3));
        panel.current?.toggleAttribute('data-covered', p > 0.55);
      }
      if (!fired && p >= 1 && scroll.direction === 1) {
        fired = true;
        page.navigate(href, { fromCovered: true });
      }
    };
    let stop: (() => void) | null = null;
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
  }, [project.slug]);

  return (
    <section ref={track} className={styles.track} data-section-theme="paper" aria-label="Next project">
      <div ref={panel} className={styles.panel}>
        <TransitionGrid
          fixed={false}
          cols={15}
          rows={17}
          color="#0b120a"
          ramp={{ from: '#7fb53f', to: '#0b120a', start: 0.3 }}
          spread={0.7}
          ease={ease.outBack}
          onReady={(g) => {
            grid.current = g;
          }}
        />
        <TransitionLink href={`/work/${project.slug}`} className={styles.link} data-cursor="next" data-cursor-label="Next">
          <span className="t-meta">Next project · {project.number}</span>
          <span className={styles.name}>{project.name}</span>
          <span className={`t-meta ${styles.hint}`}>Keep scrolling</span>
        </TransitionLink>
      </div>
    </section>
  );
}
