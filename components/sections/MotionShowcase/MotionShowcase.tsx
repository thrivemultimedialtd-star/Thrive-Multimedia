'use client';

import { Fragment, useCallback, useEffect, useRef } from 'react';
import { animation } from '@/content/animation';
import { observe } from '@/lib/motion';
import Texture from '@/components/ui/Texture';
import { gsap } from './gsap';
import { LoopRegistry } from './loops';
import MediaHub from './MediaHub';
import Satellites from './Satellites';
import FeatureCard from './FeatureCard';
import PlayCursor from './PlayCursor';
import { FilmReel, Headphones, Icon, Lens } from './icons';
import styles from './MotionShowcase.module.css';

const words = animation.headline.split(' ');

// Media assets that float into place around the hub, nearest the viewer (fastest parallax).
const floaters = [
  { Art: FilmReel, pos: 'a', from: { x: -120, y: 60, rotation: -90 } },
  { Art: Headphones, pos: 'b', from: { x: 120, y: -40, rotation: 30 } },
  { Art: Lens, pos: 'c', from: { x: 60, y: 120, rotation: 60 } },
];

/**
 * The motion showcase: a 3D media hub with the four corners of the media ecosystem around it,
 * then three capability cards. Its entrance, depth and loops are GSAP-driven; every loop sleeps
 * while the section is off screen, and reduced motion gets the static frames.
 */
export default function MotionShowcase() {
  const root = useRef<HTMLElement>(null);
  const loops = useRef(new Set<gsap.core.Timeline>());
  const visible = useRef(false);

  const register = useCallback((tl: gsap.core.Timeline) => {
    loops.current.add(tl);
    if (!visible.current) tl.pause();
    return () => {
      loops.current.delete(tl);
    };
  }, []);

  // Wake and sleep the loops with the section.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    return observe(
      el,
      (e) => {
        visible.current = e.isIntersecting;
        loops.current.forEach((tl) => (e.isIntersecting ? tl.resume() : tl.pause()));
      },
      '5% 0px 5% 0px',
    );
  }, []);

  // Entrance and parallax.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(
      '(prefers-reduced-motion: no-preference)',
      () => {
        const q = gsap.utils.selector(el);
        const once = (trigger: Element, start = 'top 80%') => ({ trigger, start, once: true });

        gsap
          .timeline({ scrollTrigger: once(q('[data-head]')[0]) })
          .from(q('[data-word]'), { yPercent: 110, rotation: 4, duration: 1, ease: 'power4.out', stagger: 0.06 })
          .from(q('[data-sub]'), { y: 24, opacity: 0, duration: 0.8, ease: 'power3.out' }, 0.35);

        const stage = q('[data-stage]')[0];
        gsap
          .timeline({ scrollTrigger: once(stage, 'top 75%') })
          .from(q('[data-float]'), {
            x: (i: number) => floaters[i].from.x,
            y: (i: number) => floaters[i].from.y,
            rotation: (i: number) => floaters[i].from.rotation,
            scale: 0.4,
            opacity: 0,
            duration: 1.4,
            ease: 'power3.out',
            stagger: 0.08,
          })
          .from(q('[data-chip]'), { y: 40, opacity: 0, scale: 0.94, duration: 0.9, ease: 'power3.out', stagger: 0.08 }, 0.2);

        gsap.from(q('[data-card]'), {
          y: 60,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: once(q('[data-cards]')[0], 'top 85%'),
        });

        // Depth: the nearer a layer (higher data-depth), the faster it moves past.
        q('[data-depth]').forEach((layer) => {
          const d = Number((layer as HTMLElement).dataset.depth) * 70;
          gsap.fromTo(
            layer,
            { y: d },
            { y: -d, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } },
          );
        });
      },
      el,
    );
    return () => mm.revert();
  }, []);

  return (
    <LoopRegistry.Provider value={register}>
      <section ref={root} id="motion" className={styles.showcase} data-section-theme="night" aria-labelledby="motion-title">
        <div className={styles.backdrop} aria-hidden="true">
          <div className={styles.mesh}>
            <span className={styles.blobA} />
            <span className={styles.blobB} />
            <span className={styles.blobC} />
          </div>
          <div className={styles.grid} data-depth="0.15" />
          <Texture className={styles.texture} size="900px auto" fade="radial-gradient(ellipse 70% 60% at 0% 100%, #000 0%, transparent 100%)" />
        </div>

        <div className={`wrap ${styles.inner}`}>
          <div className={`section-head ${styles.sectionHead}`}>
            <span className={`t-meta ${styles.eyebrow}`}>{animation.eyebrow}</span>
          </div>

          <header className={styles.head} data-head>
            <h2 id="motion-title" className={styles.title}>
              {words.map((w, i) => (
                <Fragment key={i}>
                  <span className={styles.mask}>
                    <span data-word className={w === animation.accent ? styles.accent : undefined}>
                      {w}
                    </span>
                  </span>
                  {i < words.length - 1 ? ' ' : null}
                </Fragment>
              ))}
            </h2>
            <p className={`t-lead ${styles.sub}`} data-sub>
              {animation.sub}
            </p>
          </header>

          <div className={styles.stage} data-stage>
            <div className={styles.hubDepth} data-depth="0.3">
              <MediaHub />
            </div>
            {floaters.map(({ Art, pos }) => (
              <div key={pos} className={styles.floater} data-pos={pos} data-depth="1.1">
                <Icon data-float className={styles.floaterIcon}>
                  <Art />
                </Icon>
              </div>
            ))}
            <Satellites />
          </div>

          <ul className={styles.cards} data-cards>
            {animation.cards.map((c) => (
              <FeatureCard key={c.id} card={c} />
            ))}
          </ul>
        </div>
        <PlayCursor scope={root} />
      </section>
    </LoopRegistry.Provider>
  );
}
