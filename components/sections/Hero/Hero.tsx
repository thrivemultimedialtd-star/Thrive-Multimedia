'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { hero } from '@/content/story';
import { projects } from '@/content/projects';
import { clamp, damp, env, page, pointer, scroll, subscribe, timeline, whenFontsReady } from '@/lib/motion';
import TextReveal from '@/components/motion/TextReveal/TextReveal';
import IrisReveal from '@/components/motion/IrisReveal/IrisReveal';
import Magnetic from '@/components/motion/Magnetic';
import TransitionLink from '@/components/motion/TransitionLink';
import Placeholder from '@/components/ui/Placeholder/Placeholder';
import Reveal from '@/components/motion/Reveal/Reveal';
import RotatingWord from './RotatingWord';
import CircleBurst from './CircleBurst';
import styles from './Hero.module.css';

// Brochure work: Huriya Air leads, Market Monie overlaps it, The Place tucks underneath (desktop only).
const collage = [
  { p: projects[0], sizes: '(max-width: 768px) 64vw, 24vw', priority: true },
  { p: projects[2], sizes: '(max-width: 768px) 42vw, 16vw', priority: false },
  { p: projects[1], sizes: '12vw', priority: false },
];
const depths = [0.6, 1.1, 1.5];

/**
 * Staged entrance: (nav, via CSS) → THRIVE → MULTIMEDIA → line → collage → meta + actions.
 * On scroll the type lifts faster than the page and the collage lags behind, handing over to the intro.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const type = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const collageRef = useRef<HTMLDivElement>(null);
  const layers = useRef<Array<HTMLDivElement | null>>([]);
  // Set once the entrance has finished: the playful layer (rotating word, living letters, burst tip) starts then.
  const [alive, setAlive] = useState(false);
  const [burstUsed, setBurstUsed] = useState(false);

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

  // Entrance timeline. Type itself is handled by TextReveal delays; this stages everything else.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let stop = () => {};
    let cancelled = false;
    const cancelVisible = page.whenVisible(() => {
      whenFontsReady().then(() => {
        if (cancelled) return;
        stop = timeline([
          { at: 1150, run: () => el.setAttribute('data-collage', '') },
          { at: 1500, run: () => el.setAttribute('data-meta', '') },
          { at: 2300, run: () => setAlive(true) },
        ]);
      });
    });
    return () => {
      cancelled = true;
      cancelVisible();
      stop();
    };
  }, []);

  // Scroll hand-off, plus drift: from the pointer on desktop, from scroll velocity on touch.
  useEffect(() => {
    const el = root.current;
    if (!el || env.reducedMotion) return;
    const drift = depths.map(() => ({ x: 0, y: 0 }));
    return subscribe((dt) => {
      const vh = scroll.vh || window.innerHeight;
      if (scroll.y > vh * 1.2) return;
      const p = clamp(scroll.y / vh);
      if (type.current) type.current.style.transform = `translate3d(0, ${(-p * (env.mobile ? 8 : 22)).toFixed(2)}vh, 0)`;
      if (collageRef.current) collageRef.current.style.transform = `translate3d(0, ${(-p * 6).toFixed(2)}vh, 0)`;

      const touch = env.touch;
      const nx = !touch && pointer.active ? pointer.x / window.innerWidth - 0.5 : 0;
      const ny = !touch && pointer.active ? pointer.y / window.innerHeight - 0.5 : 0;
      const sv = touch ? clamp(scroll.velocity / 2500, -1, 1) : 0;
      layers.current.forEach((layer, i) => {
        if (!layer) return;
        const d = drift[i];
        d.x = damp(d.x, -nx * 22 * depths[i], 3.5, dt);
        d.y = damp(d.y, (touch ? -sv * 18 : -ny * 16) * depths[i], 3.5, dt);
        layer.style.translate = `${d.x.toFixed(2)}px ${d.y.toFixed(2)}px`;
      });
    });
  }, []);

  // Living THRIVE letters. A gentle wave always travels across the word (green on its crest) and
  // MULTIMEDIA's spacing breathes. On top: letters lift, stretch and turn green near the pointer;
  // on touch, a tap sends a ripple and scrolling sways them slightly.
  useEffect(() => {
    const h = title.current;
    if (!alive || !h || env.reducedMotion) return;
    const thrive = h.querySelector<HTMLElement>(`.${styles.thrive}`);
    if (!thrive) return;
    const masks = [...thrive.querySelectorAll<HTMLElement>('[aria-hidden="true"] > span > span')];
    if (!masks.length) return;
    const st = masks.map(() => ({ f: 0, k: 0 }));
    let centres: number[] = [];
    const measure = () => {
      centres = masks.map((m) => m.offsetLeft + m.offsetWidth / 2);
    };
    measure();
    window.addEventListener('resize', measure);

    let rippleAt = -1;
    let clock = 0;
    const onTap = () => {
      rippleAt = clock;
    };
    thrive.addEventListener('pointerdown', onTap);

    const C = [35, 35, 35];
    const G = [106, 154, 54];
    const WAVE_PERIOD = 3.6; // seconds for the crest to travel round
    const BREATH_PERIOD = 6;
    h.dataset.alive = '';
    const stop = subscribe((dt) => {
      clock += dt;
      const vh = scroll.vh || window.innerHeight;
      if (scroll.y > vh * 1.2 || document.hidden) return;
      // The wave fades in over ~1.2s after the entrance.
      const amp = clamp(clock / 1.2);
      h.style.setProperty('--mm-breath', (Math.sin((clock * Math.PI * 2) / BREATH_PERIOD) * 0.06 * amp).toFixed(4));
      const box = thrive.getBoundingClientRect();
      const cy = box.top + box.height / 2;
      const size = parseFloat(getComputedStyle(thrive).fontSize) || 100;
      const sway = env.touch ? clamp(scroll.velocity / 3000, -1, 1) * 4 : 0;
      masks.forEach((m, i) => {
        const cx = box.left + (centres[i] ?? 0);
        let target = 0;
        let lean = 0;
        if (!env.touch && pointer.active) {
          const dx = pointer.x - cx;
          const d = Math.hypot(dx, pointer.y - cy);
          target = clamp(1 - d / 260) ** 2;
          lean = clamp(dx / 260, -1, 1);
        }
        if (rippleAt >= 0) {
          const t = clock - rippleAt - i * 0.06;
          if (t > 0 && t < 0.5) target = Math.max(target, Math.sin((t / 0.5) * Math.PI));
        }
        const s = st[i];
        s.f = damp(s.f, target, target > s.f ? 14 : 6, dt);
        s.k = damp(s.k, lean * s.f * -6 + sway, 8, dt);
        const w = Math.sin((clock * Math.PI * 2) / WAVE_PERIOD - i * 0.7);
        const waveLift = (w * 0.5 + 0.5) * amp;
        const waveGlow = Math.max(0, w) ** 2 * 0.7 * amp;
        const tint = Math.max(s.f, waveGlow);
        const mix = (a: number, b: number) => Math.round(a + (b - a) * tint);
        m.style.transform = `translateY(${(-(s.f * 0.14 + waveLift * 0.085) * size).toFixed(2)}px) scaleY(${(1 + s.f * 0.12).toFixed(4)}) skewX(${s.k.toFixed(2)}deg)`;
        m.style.color = tint > 0.002 ? `rgb(${mix(C[0], G[0])},${mix(C[1], G[1])},${mix(C[2], G[2])})` : '';
      });
      if (rippleAt >= 0 && clock - rippleAt > 0.5 + masks.length * 0.06) rippleAt = -1;
    });
    return () => {
      stop();
      window.removeEventListener('resize', measure);
      thrive.removeEventListener('pointerdown', onTap);
      delete h.dataset.alive;
      h.style.removeProperty('--mm-breath');
      masks.forEach((m) => {
        m.style.transform = '';
        m.style.color = '';
      });
    };
  }, [alive]);

  return (
    <section ref={root} id="top" className={styles.hero} data-section-theme="paper" aria-labelledby="hero-title">

      <div className={styles.metaTop}>
        <span className="t-meta">{hero.meta[0]}</span>
        <span className={`t-meta ${styles.metaAlt}`}>{hero.meta[1]}</span>
      </div>

      <div ref={collageRef} className={styles.collage} aria-hidden="true">
        {collage.map(({ p, sizes, priority }, i) => (
          <div
            key={p.slug}
            ref={(n) => {
              layers.current[i] = n;
            }}
            className={`${styles.frame} ${styles[`f${i}`]}`}
          >
            <IrisReveal trigger="load" delay={1150 + i * 140} duration={1300}>
              <Placeholder tone={p.visual.tone} label={p.visual.label} image={p.image} sizes={sizes} priority={priority} parallax={0} compact />
            </IrisReveal>
          </div>
        ))}
      </div>

      <div ref={type} className={styles.type}>
        <h1 ref={title} id="hero-title" className={styles.title}>
          <TextReveal
            as="span"
            text="Thrive"
            split="chars"
            trigger="load"
            delay={450}
            stagger={55}
            duration={1300}
            className={`t-display ${styles.thrive}`}
          />
          <TextReveal
            as="span"
            text="Multimedia"
            split="chars"
            trigger="load"
            delay={720}
            stagger={30}
            duration={1200}
            className={styles.multimedia}
          />
        </h1>
        <Reveal as="p" trigger="load" delay={1000} distance={14} className={`t-lead ${styles.line}`}>
          <span className="visually-hidden">{hero.line}</span>
          <span aria-hidden="true">
            {hero.lineLead} <RotatingWord words={hero.rotate} active={alive} /> {hero.lineTail}
          </span>
        </Reveal>
      </div>

      <CircleBurst area={root} className={styles.burst} onBurst={() => setBurstUsed(true)} />

      <div className={styles.foot}>
        <div className={styles.actions}>
          <Magnetic className={styles.ctaWrap}>
            <a
              href="#work"
              className={styles.cta}
              data-cursor="open"
              data-cursor-label="Work"
              onClick={(e) => {
                e.preventDefault();
                page.switchSection('work');
              }}
            >
              {hero.cta}
              <span aria-hidden="true">→</span>
            </a>
          </Magnetic>
          <TransitionLink href="/contact" className={styles.secondary}>
            {hero.secondary}
          </TransitionLink>
          <span className={`t-meta ${styles.tip}`} data-show={(alive && !burstUsed) || undefined} aria-hidden="true">
            ✦ <span className={styles.tipDesk}>Click</span>
            <span className={styles.tipTouch}>Tap</span> anywhere
          </span>
        </div>
      </div>
    </section>
  );
}
