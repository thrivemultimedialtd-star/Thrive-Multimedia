'use client';

import { useRef, type ReactNode } from 'react';
import { animation } from '@/content/animation';
import { gsap } from './gsap';
import { useLoop } from './loops';
import { morph } from './icons';
import styles from './MotionShowcase.module.css';

// Each chip is 160 × 64 of SVG art with its own loop. The markup is a good resting frame.

// ── Filming & editing: rolling film strip, REC light, timeline with keyframes ──
const keys = [44, 88, 126];
const VideoArt = () => (
  <>
    <rect x="0" y="4" width="160" height="20" rx="3" fill="#1d2a17" />
    <g data-perfs fill="#121212">
      {Array.from({ length: 22 }, (_, i) => (
        <rect key={i} x={i * 14 + 3} y="7" width="7" height="4" rx="1" />
      ))}
      {Array.from({ length: 22 }, (_, i) => (
        <rect key={`b${i}`} x={i * 14 + 3} y="17" width="7" height="4" rx="1" />
      ))}
    </g>
    <circle data-rec cx="10" cy="40" r="3.5" fill="#7fb53f" />
    <text x="18" y="43.5" fontSize="9" fontWeight="700" letterSpacing="1.5" fill="currentColor">
      REC
    </text>
    <line x1="8" y1="54" x2="152" y2="54" stroke="currentColor" strokeOpacity="0.3" />
    {keys.map((x) => (
      <rect key={x} data-key x={x - 3.5} y="50.5" width="7" height="7" transform={`rotate(45 ${x} 54)`} fill="#24391a" stroke="#7fb53f" />
    ))}
    <g data-head>
      <line x1="8" y1="44" x2="8" y2="62" stroke="#7fb53f" strokeWidth="1.5" />
      <path d="M4.5 44h7l-3.5 4z" fill="#7fb53f" />
    </g>
  </>
);
function video(root: Element) {
  const q = gsap.utils.selector(root);
  const tl = gsap.timeline({ repeat: -1 });
  tl.to(q('[data-perfs]'), { x: -14, duration: 0.35, ease: 'none', repeat: 11 }, 0);
  tl.to(q('[data-rec]'), { opacity: 0.15, duration: 0.5, ease: 'steps(1)', repeat: 3, yoyo: true }, 0);
  tl.fromTo(q('[data-head]'), { x: 0 }, { x: 144, duration: 4.2, ease: 'none' }, 0);
  keys.forEach((x, i) =>
    tl.to(q('[data-key]')[i], { fill: '#7fb53f', duration: 0.12, yoyo: true, repeat: 1 }, ((x - 8) / 144) * 4.2),
  );
  return tl;
}

// ── Responsive sites: a desktop and a phone frame whose pages load in, block by block ──
const SitesArt = () => (
  <>
    <rect x="3.5" y="4.5" width="96" height="55" rx="4" fill="#161f12" stroke="currentColor" strokeOpacity="0.25" />
    <path d="M3.5 12.5h96" stroke="currentColor" strokeOpacity="0.25" />
    <g fill="currentColor" fillOpacity="0.35">
      <circle cx="9" cy="8.5" r="1.4" />
      <circle cx="13.5" cy="8.5" r="1.4" />
      <circle cx="18" cy="8.5" r="1.4" />
    </g>
    <g data-desk>
      <rect x="9" y="17" width="44" height="4" rx="2" fill="#7fb53f" />
      <rect x="9" y="25" width="30" height="3" rx="1.5" fill="currentColor" fillOpacity="0.3" />
      <rect x="62" y="17" width="31" height="17" rx="2" fill="#6a9a36" />
      <rect x="9" y="39" width="25" height="15" rx="2" fill="#24391a" stroke="#6a9a36" />
      <rect x="38.5" y="39" width="25" height="15" rx="2" fill="#24391a" stroke="#6a9a36" />
      <rect x="68" y="39" width="25" height="15" rx="2" fill="#24391a" stroke="#6a9a36" />
    </g>
    <rect x="115.5" y="2.5" width="33" height="59" rx="6" fill="#161f12" stroke="currentColor" strokeOpacity="0.25" />
    <rect x="127" y="6" width="10" height="2" rx="1" fill="currentColor" fillOpacity="0.3" />
    <g data-phone>
      <rect x="120" y="12" width="20" height="3" rx="1.5" fill="#7fb53f" />
      <rect x="120" y="18" width="24" height="13" rx="2" fill="#6a9a36" />
      <rect x="120" y="34" width="24" height="9" rx="2" fill="#24391a" stroke="#6a9a36" />
      <rect x="120" y="46" width="24" height="9" rx="2" fill="#24391a" stroke="#6a9a36" />
    </g>
    <g data-pointer>
      <circle data-click cx="77" cy="26" r="4" fill="none" stroke="#7fb53f" opacity="0" />
      <path d="M77 26v10l3-3 2.4 4.4 1.8-1-2.4-4.3h4.2z" fill="#f3f1ea" />
    </g>
  </>
);
function sites(root: Element) {
  const q = gsap.utils.selector(root);
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });
  tl.from(q('[data-desk] > *'), { opacity: 0, scale: 0.85, transformOrigin: '50% 50%', duration: 0.4, ease: 'power2.out', stagger: 0.12 }, 0);
  tl.from(q('[data-phone] > *'), { opacity: 0, y: 6, duration: 0.4, ease: 'power2.out', stagger: 0.12 }, 0.5);
  tl.fromTo(q('[data-pointer]'), { x: -30, y: 20 }, { x: 0, y: 0, duration: 0.9, ease: 'power2.inOut' }, 0.6);
  tl.fromTo(q('[data-click]'), { attr: { r: 2 }, opacity: 0.9 }, { attr: { r: 10 }, opacity: 0, duration: 0.5, ease: 'power1.out' }, 1.5);
  tl.to(q('[data-desk] > *, [data-phone] > *'), { opacity: 0, duration: 0.3, stagger: 0.02 }, 2.8);
  tl.to(q('[data-pointer]'), { x: -30, y: 20, duration: 0.5, ease: 'power2.in' }, 2.8);
  return tl;
}

// ── Print & editorial: a path drawing itself, pixels assembling, stacked pages ──
const pixels = Array.from({ length: 16 }, (_, i) => ({ x: 114 + (i % 4) * 9, y: 14 + Math.floor(i / 4) * 9, on: [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14].includes(i) }));
const DesignArt = () => (
  <>
    <g data-layers>
      <rect data-layer x="58" y="10" width="40" height="30" rx="3" fill="#24391a" opacity="0.6" />
      <rect data-layer x="64" y="18" width="40" height="30" rx="3" fill="#24391a" stroke="#6a9a36" opacity="0.8" />
      <rect data-layer x="70" y="26" width="40" height="30" rx="3" fill="#1b2a15" stroke="#7fb53f" />
    </g>
    <path data-draw d="M6 52C14 18 34 14 40 32S52 58 54 20" pathLength="1" fill="none" stroke="#7fb53f" strokeWidth="1.8" strokeLinecap="round" />
    <g fill="#121212" stroke="currentColor" strokeOpacity="0.6">
      <rect x="3.5" y="49.5" width="5" height="5" />
      <rect x="51.5" y="17.5" width="5" height="5" />
    </g>
    {pixels.map((p, i) => (
      <rect key={i} data-px x={p.x} y={p.y} width="7" height="7" fill={p.on ? '#7fb53f' : '#6a9a36'} opacity={p.on ? 1 : 0.25} />
    ))}
  </>
);
function design(root: Element) {
  const q = gsap.utils.selector(root);
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.4 });
  tl.fromTo(q('[data-draw]'), { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, 0);
  tl.from(q('[data-px]'), { x: () => gsap.utils.random(-40, 40), y: () => gsap.utils.random(-30, 30), opacity: 0, duration: 0.9, ease: 'power3.out', stagger: { each: 0.03, from: 'random' } }, 0.2);
  tl.to(q('[data-layer]'), { y: (i: number) => (i - 1) * -5, duration: 0.8, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0.4);
  tl.to(q('[data-draw]'), { opacity: 0, duration: 0.4 }, 2.6);
  tl.to(q('[data-px]'), { opacity: 0, duration: 0.3, stagger: 0.01 }, 2.6);
  return tl;
}

// ── Corporate identity: a mark sketched through shapes, with its palette and type ──
const swatches = ['#7fb53f', '#6a9a36', '#24391a', '#f3f1ea'];
const IdentityArt = () => (
  <>
    <circle cx="28" cy="32" r="24" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeDasharray="2 4" />
    <path d="M4 32h48M28 8v48" stroke="currentColor" strokeOpacity="0.12" />
    <svg x="12" y="16" width="32" height="32" viewBox="0 0 24 24">
      <path data-morph d={morph.circle} fill="#7fb53f" />
    </svg>
    <text x="64" y="28" fontSize="17" fontWeight="800" fill="currentColor">
      Aa
    </text>
    <rect x="94" y="17" width="54" height="3" rx="1.5" fill="currentColor" fillOpacity="0.3" />
    <rect x="94" y="24" width="38" height="3" rx="1.5" fill="currentColor" fillOpacity="0.2" />
    {swatches.map((c, i) => (
      <rect key={c} data-swatch x={64 + i * 21} y="38" width="17" height="17" rx="3" fill={c} stroke="#f3f1ea" strokeOpacity="0.15" />
    ))}
  </>
);
function identity(root: Element) {
  const q = gsap.utils.selector(root);
  const tl = gsap.timeline({ repeat: -1 });
  const shapes = [morph.hexagon, morph.diamond, morph.leaf, morph.circle];
  shapes.forEach((d, i) => tl.to(q('[data-morph]'), { morphSVG: d, duration: 0.7, ease: 'power3.inOut' }, i * 1.4 + 0.7));
  tl.from(q('[data-swatch]'), { scale: 0, transformOrigin: '50% 50%', duration: 0.45, ease: 'back.out(2.2)', stagger: 0.1 }, 0);
  tl.to(q('[data-swatch]'), { y: -3, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 1, stagger: 0.18 }, 2.6);
  return tl;
}

// In service order: Graphic Design, Website, Branding, Motion.
const chips: Array<{ Art: () => ReactNode; build: (root: Element) => gsap.core.Timeline }> = [
  { Art: DesignArt, build: design },
  { Art: SitesArt, build: sites },
  { Art: IdentityArt, build: identity },
  { Art: VideoArt, build: video },
];

function Chip({ label, index }: { label: string; index: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const { Art, build } = chips[index];
  useLoop(ref, build);
  return (
    <div className={styles.chipDepth} data-depth="0.6" data-pos={index}>
      <figure className={styles.chip} data-chip>
        <svg ref={ref} viewBox="0 0 160 64" aria-hidden="true" focusable="false">
          <Art />
        </svg>
        <figcaption className="t-meta">{label}</figcaption>
      </figure>
    </div>
  );
}

/** Four chips around the hub, one capability from each service. */
export default function Satellites() {
  return (
    <div className={styles.satellites}>
      {animation.chips.map((label, i) => (
        <Chip key={label} label={label} index={i} />
      ))}
    </div>
  );
}
