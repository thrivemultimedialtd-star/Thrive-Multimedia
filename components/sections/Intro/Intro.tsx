'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { intro } from '@/content/story';
import { clamp, env, observe, scroll, subscribe } from '@/lib/motion';
import Reveal from '@/components/motion/Reveal/Reveal';
import Texture from '@/components/ui/Texture';
import styles from './Intro.module.css';

// Split the statement into words once, marking those inside the accent phrase.
const words = (() => {
  let i = 0;
  return intro.lede.map((line) => {
    const start = line.indexOf(intro.accent);
    const end = start + intro.accent.length;
    let pos = 0;
    return line.split(' ').map((w) => {
      const at = pos;
      pos += w.length + 1;
      return { w, i: i++, accent: start >= 0 && at >= start && at < end };
    });
  });
})();
const total = words.flat().length;

/**
 * "A fresh perspective": a large statement whose words brighten one after another as it
 * scrolls through view, over the brochure pattern and the Thrive mark, then the studio
 * paragraph beside the media it names. It ends on a colon that hands over to Our approach.
 */
export default function Intro() {
  const root = useRef<HTMLElement>(null);
  const lede = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = root.current;
    const h = lede.current;
    if (!el || !h) return;
    if (env.reducedMotion) {
      el.style.setProperty('--p', '1');
      return;
    }
    let stop: (() => void) | null = null;
    let last = -1;
    const tick = () => {
      const vh = scroll.vh || window.innerHeight;
      const r = h.getBoundingClientRect();
      // 0 when the statement's top reaches 90% of the screen, 1 once it reaches 30%.
      const from = vh * 0.9;
      const to = vh * 0.3;
      const p = clamp((from - r.top) / (from - to));
      if (Math.abs(p - last) < 0.001) return;
      last = p;
      el.style.setProperty('--p', p.toFixed(4));
    };
    tick();
    const stopObs = observe(el, (e) => {
      if (e.isIntersecting && !stop) stop = subscribe(tick);
      else if (!e.isIntersecting && stop) {
        stop();
        stop = null;
      }
    }, '10% 0px 10% 0px');
    return () => {
      stopObs();
      stop?.();
    };
  }, []);

  return (
    <section ref={root} id="intro" className={styles.intro} data-section-theme="ink" aria-labelledby="intro-title">
      <div className={styles.backdrop} aria-hidden="true">
        <Texture className={`${styles.texture} parallax`} size="1000px auto" fade="radial-gradient(ellipse 85% 90% at 100% 0%, #000 0%, transparent 100%)" />
        <span className={`${styles.mark} parallax`} />
      </div>

      <div className={`wrap ${styles.inner}`}>
        <div className={`section-head ${styles.head}`}>
          <span className={`t-meta ${styles.eyebrow}`}>{intro.eyebrow}</span>
        </div>

        <h2 ref={lede} id="intro-title" className={styles.lede} style={{ '--n': total } as CSSProperties}>
          {words.map((line, li) => (
            <span key={li} className={styles.line}>
              {line.map(({ w, i, accent }, wi) => (
                <span key={i}>
                  <span className={`${styles.word} ${accent ? styles.accent : ''}`} style={{ '--i': i } as CSSProperties}>
                    {w}
                  </span>
                  {wi < line.length - 1 ? ' ' : null}
                </span>
              ))}
              {li < words.length - 1 ? ' ' : null}
            </span>
          ))}
        </h2>

        <div className={styles.foot}>
          <Reveal className={styles.body}>
            <p>{intro.body}</p>
          </Reveal>
          <ol className={styles.media}>
            {intro.media.map((m, i) => (
              <Reveal as="li" key={m} delay={i * 40} className={styles.medium}>
                <span className={`t-meta ${styles.num}`}>{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.name}>{m}</span>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
