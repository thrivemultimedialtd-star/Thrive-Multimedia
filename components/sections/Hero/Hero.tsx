'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent } from 'react';
import { hero } from '@/content/story';
import { projects } from '@/content/projects';
import { site } from '@/content/site';
import { clients } from '@/content/clients';
import { logoHeight } from '@/content/brochure';
import { clamp, damp, env, page, pointer, scroll, subscribe, whenFontsReady } from '@/lib/motion';
import { useReveal } from '@/components/motion/useReveal';
import IrisReveal from '@/components/motion/IrisReveal/IrisReveal';
import TransitionLink from '@/components/motion/TransitionLink';
import Placeholder from '@/components/ui/Placeholder/Placeholder';
import Texture from '@/components/ui/Texture';
import HeroText from './HeroText';
import RotatingWord from './RotatingWord';
import styles from './Hero.module.css';

// The work, fanned like a stack of prints: The Place at the back left, Market Monie at the back
// right, Huriya Air in front. Brochure images only.
const stack = [
  { p: projects[1], slot: 'c0', sizes: '(max-width: 768px) 34vw, 16vw', chip: false },
  { p: projects[2], slot: 'c1', sizes: '(max-width: 768px) 52vw, 24vw', chip: true },
  { p: projects[0], slot: 'c2', sizes: '(max-width: 768px) 46vw, 22vw', chip: true },
];
// A quiet line of real clients from the brochure ("Who we've worked for"): Hair Label, EEMS,
// Holyhill, NOA, UNITAR and Farm Alert.
const proofLogos = [0, 1, 2, 3, 6, 8].map((i) => clients[i]).filter(Boolean);

/**
 * The hero, mobile first: an eyebrow, the THRIVE / MULTIMEDIA lockup, the line, two clear actions,
 * a fanned stack of real work and a quiet strip of clients. The type keeps its expressive motion
 * (letters rise, then THRIVE carries a gentle wave and MULTIMEDIA breathes); the work cards deal in
 * after it, and on desktop the stack tilts toward the pointer.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const type = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const line = useRef<HTMLParagraphElement>(null);
  // Set once the type has arrived: the living letters and the rotating word start then.
  const [alive, setAlive] = useState(false);
  useReveal(line, { trigger: 'load', delay: 1000 });

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

  // Entrance: photos and buttons fade in once fonts are ready; the type is staged by HeroText delays.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let cancelled = false;
    let timer = 0;
    whenFontsReady().then(() => {
      if (cancelled) return;
      el.setAttribute('data-meta', '');
      el.setAttribute('data-collage', '');
      timer = window.setTimeout(() => setAlive(true), 2300);
    });
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  // On scroll the type lifts a little faster than the page, handing over to the intro.
  useEffect(() => {
    if (env.reducedMotion) return;
    return subscribe(() => {
      const vh = scroll.vh || window.innerHeight;
      if (scroll.y > vh * 1.2) return;
      const p = clamp(scroll.y / vh);
      if (type.current) type.current.style.transform = `translate3d(0, ${(-p * (env.mobile ? 8 : 22)).toFixed(2)}vh, 0)`;
    });
  }, []);

  // Living THRIVE letters. A gentle wave always travels across the word (green on its crest) and
  // MULTIMEDIA's spacing breathes. On top: letters lift, stretch and turn green near the pointer;
  // on touch, scrolling sways them slightly.
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

    let clock = 0;

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
    });
    return () => {
      stop();
      window.removeEventListener('resize', measure);
      delete h.dataset.alive;
      h.style.removeProperty('--mm-breath');
      masks.forEach((m) => {
        m.style.transform = '';
        m.style.color = '';
      });
    };
  }, [alive]);

  // Desktop: the stack leans gently toward the pointer.
  const tilt = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || env.reducedMotion) return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--ty', `${(((e.clientX - r.left) / r.width - 0.5) * 8).toFixed(2)}deg`);
    e.currentTarget.style.setProperty('--tx', `${(-((e.clientY - r.top) / r.height - 0.5) * 8).toFixed(2)}deg`);
  };
  const untilt = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.removeProperty('--tx');
    e.currentTarget.style.removeProperty('--ty');
  };

  return (
    <section ref={root} id="top" className={styles.hero} data-section-theme="paper" aria-labelledby="hero-title">

      <div ref={type} className={styles.copy}>
        <p className={`t-meta ${styles.eyebrow}`}>
          <span className={styles.eyeDot} aria-hidden="true" />
          {hero.meta[1]} · {site.location.split(',')[0]}
        </p>
        <h1 ref={title} id="hero-title" className={styles.title}>
          <HeroText
            as="span"
            text="Thrive"
            split="chars"
            trigger="load"
            delay={450}
            stagger={55}
            duration={1300}
            className={`t-display ${styles.thrive}`}
          />
          <HeroText
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
        <p ref={line} className={`t-lead ${styles.line}`}>
          <span className="visually-hidden">{hero.line}</span>
          <span aria-hidden="true">
            {hero.lineLead} <RotatingWord words={hero.rotate} active={alive} /> {hero.lineTail}
          </span>
        </p>
        <div className={styles.actions}>
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
          <TransitionLink href="/contact" className={styles.secondary}>
            {hero.secondary}
          </TransitionLink>
        </div>
      </div>

      {/* The work: a fanned stack of prints over a soft green glow and the brochure pattern. */}
      <div className={styles.stage} aria-hidden="true">
        <span className={styles.glow} />
        <Texture className={styles.stageTexture} size="700px auto" fade="radial-gradient(closest-side, #000 0%, transparent 100%)" />
        <div className={styles.stack} onPointerMove={tilt} onPointerLeave={untilt}>
          {stack.map(({ p, slot, sizes, chip }, i) => (
            <div key={p.slug} className={`${styles.card} ${styles[slot]}`} style={{ '--k': i } as CSSProperties}>
              <IrisReveal trigger="load">
                <Placeholder tone={p.visual.tone} label={p.visual.label} image={p.image} sizes={sizes} priority={i === 2} compact />
              </IrisReveal>
              {chip && (
                <span className={styles.chip}>
                  {p.name} · {p.discipline}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Proof: real clients from the brochure. */}
      <div className={styles.proof}>
        <p className={`t-meta ${styles.proofLabel}`}>Who we’ve worked for</p>
        <ul className={styles.logos}>
          {proofLogos.map((n, i) => (
            <li key={n.name} style={{ '--k': i } as CSSProperties}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={n.src} alt={n.name} width={n.width} height={n.height} style={{ height: `${logoHeight(n, 1.9)}rem` }} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
