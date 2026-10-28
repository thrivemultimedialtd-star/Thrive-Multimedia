'use client';

import { useRef, type ReactNode } from 'react';
import { animation } from '@/content/animation';
import { gsap } from './gsap';
import { useLoop } from './loops';
import { morph } from './icons';
import styles from './MotionShowcase.module.css';

// Each chip is 160 × 64 of SVG art with its own loop. The markup is a good resting frame.

// ── Video & Film: rolling film strip, REC light, timeline with keyframes ──
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

// ── Audio & Podcast: bouncing EQ bars and a flowing waveform ──
const bars = [18, 30, 22, 38, 26, 34, 16];
const wave = Array.from({ length: 33 }, (_, i) => `${i ? 'L' : 'M'}${82 + i * 2.4} ${32 + Math.sin(i * 0.8) * 12 * Math.sin((i / 32) * Math.PI)}`).join(' ');
const AudioArt = () => (
  <>
    {bars.map((h, i) => (
      <rect key={i} data-bar x={4 + i * 10} y={58 - h} width="6" height={h} rx="2" fill={i % 2 ? '#6a9a36' : '#7fb53f'} />
    ))}
    <path data-wave d={wave} fill="none" stroke="#7fb53f" strokeWidth="1.6" strokeLinecap="round" />
    <path d={wave} fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1" transform="translate(0 4)" />
  </>
);
function audio(root: Element) {
  const q = gsap.utils.selector(root);
  const tl = gsap.timeline();
  q('[data-bar]').forEach((bar, i) => {
    tl.to(bar, { scaleY: 0.25 + ((i * 37) % 10) / 14, transformOrigin: '50% 100%', duration: 0.28 + (i % 3) * 0.09, ease: 'sine.inOut', repeat: -1, yoyo: true }, 0);
  });
  tl.to(q('[data-wave]'), { scaleY: 0.35, transformOrigin: '50% 50%', duration: 0.6, ease: 'sine.inOut', repeat: -1, yoyo: true }, 0);
  return tl;
}

// ── Design & Digital Media: a path drawing itself, pixels assembling, canvas layers ──
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

// ── Broadcast & Motion: a play button morphing through media icons, emitting signal ──
const BroadcastArt = () => (
  <>
    {[0, 1, 2].map((i) => (
      <circle key={i} data-arc cx="40" cy="32" r="14" fill="none" stroke="#7fb53f" strokeWidth="1.4" opacity="0" />
    ))}
    <circle cx="40" cy="32" r="14" fill="#24391a" stroke="#7fb53f" />
    <svg x="29" y="21" width="22" height="22" viewBox="0 0 24 24">
      <path data-morph d={morph.play} fill="#f3f1ea" />
    </svg>
    <g fill="currentColor" fillOpacity="0.5">
      <rect x="70" y="24" width="82" height="3" rx="1.5" fillOpacity="0.2" />
      <rect data-bar2 x="70" y="24" width="82" height="3" rx="1.5" fill="#7fb53f" fillOpacity="1" />
      <rect x="70" y="36" width="54" height="3" rx="1.5" fillOpacity="0.2" />
    </g>
  </>
);
function broadcast(root: Element) {
  const q = gsap.utils.selector(root);
  const tl = gsap.timeline({ repeat: -1 });
  const shapes = [morph.camera, morph.mic, morph.headphones, morph.pen, morph.play];
  shapes.forEach((d, i) => tl.to(q('[data-morph]'), { morphSVG: d, duration: 0.6, ease: 'power3.inOut' }, i * 1.2 + 0.6));
  q('[data-arc]').forEach((arc, i) =>
    tl.fromTo(arc, { attr: { r: 14 }, opacity: 0.8 }, { attr: { r: 32 }, opacity: 0, duration: 2, ease: 'power1.out', repeat: 2 }, i * 0.66),
  );
  tl.fromTo(q('[data-bar2]'), { scaleX: 0 }, { scaleX: 1, transformOrigin: '0% 50%', duration: 6, ease: 'none' }, 0);
  return tl;
}

const chips: Array<{ Art: () => ReactNode; build: (root: Element) => gsap.core.Timeline }> = [
  { Art: VideoArt, build: video },
  { Art: AudioArt, build: audio },
  { Art: DesignArt, build: design },
  { Art: BroadcastArt, build: broadcast },
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

/** The four corners of the media ecosystem around the hub. */
export default function Satellites() {
  return (
    <div className={styles.satellites}>
      {animation.ecosystem.map((label, i) => (
        <Chip key={label} label={label} index={i} />
      ))}
    </div>
  );
}
