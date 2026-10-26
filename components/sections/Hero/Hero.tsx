'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent } from 'react';
import { hero } from '@/content/story';
import { projects } from '@/content/projects';
import { site } from '@/content/site';
import { clients } from '@/content/clients';
import { logoHeight } from '@/content/brochure';
import { clamp, damp, env, page, pointer, scroll, subscribe, whenFontsReady } from '@/lib/motion';
import TransitionLink from '@/components/motion/TransitionLink';
import Placeholder from '@/components/ui/Placeholder/Placeholder';
import Texture from '@/components/ui/Texture';
import HeroText from './HeroText';
import RotatingWord from './RotatingWord';
import styles from './Hero.module.css';

// The work as three prints floating apart at different depths: Market Monie top right (back),
// The Place lower left, Huriya Air in front. `d` is each print's depth for the pointer parallax.
// Brochure images only. All three are above the fold, so all three load eagerly (Market Monie,
// the largest, is the LCP image on phones).
const stack = [
  { p: projects[1], slot: 'c0', sizes: '(max-width: 768px) 34vw, 15vw', chip: false, d: 0.6 },
  { p: projects[2], slot: 'c1', sizes: '(max-width: 768px) 52vw, 24vw', chip: true, d: 0.35 },
  { p: projects[0], slot: 'c2', sizes: '(max-width: 768px) 44vw, 20vw', chip: true, d: 1 },
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
  const type = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  // Set once the type has arrived: the living letters and the rotating word start then.
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

  // The entrance itself is CSS, timed from the first paint (Hero.module.css, HeroText): it never
  // waits for this script. The living letters take over once it has played.
  useEffect(() => {
    let cancelled = false;
    let timer = 0;
    whenFontsReady().then(() => {
      if (cancelled) return;
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

  // Desktop: the prints lean toward the pointer, and shift by their depth (nearer ones move more).
  const tilt = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || env.reducedMotion) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    const st = e.currentTarget.style;
    st.setProperty('--ty', `${(x * 6).toFixed(2)}deg`);
    st.setProperty('--tx', `${(-y * 6).toFixed(2)}deg`);
    st.setProperty('--px', `${(x * 28).toFixed(1)}px`);
    st.setProperty('--py', `${(y * 22).toFixed(1)}px`);
  };
  const untilt = (e: PointerEvent<HTMLDivElement>) => {
    for (const k of ['--tx', '--ty', '--px', '--py']) e.currentTarget.style.removeProperty(k);
  };

  // The prints float only while the hero is on screen.
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => el.toggleAttribute('data-offscreen', !e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="top" className={styles.hero} data-section-theme="paper" aria-labelledby="hero-title">

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
            delay={450}
            stagger={55}
            duration={1300}
            className={`t-display ${styles.thrive}`}
          />
          <HeroText
            as="span"
            text="Multimedia"
            split="chars"
            delay={720}
            stagger={30}
            duration={1200}
            className={styles.multimedia}
          />
        </h1>
        <p className={`t-lead ${styles.line}`}>
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
      <div ref={stage} className={styles.stage} aria-hidden="true">
        <span className={styles.glow} />
        <Texture className={styles.stageTexture} size="700px auto" fade="radial-gradient(closest-side, #000 0%, transparent 100%)" />
        <div className={styles.stack} onPointerMove={tilt} onPointerLeave={untilt}>
          {stack.map(({ p, slot, sizes, chip, d }, i) => (
            <div key={p.slug} className={`${styles.card} ${styles[slot]}`} style={{ '--k': i, '--d': d } as CSSProperties}>
              {/* The print itself: floats on its own rhythm and shifts with the pointer. */}
              <div className={styles.print}>
                <Placeholder tone={p.visual.tone} label={p.visual.label} image={p.image} sizes={sizes} priority compact />
                {chip && (
                  <span className={styles.chip}>
                    {p.name} · {p.discipline}
                  </span>
                )}
              </div>
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
