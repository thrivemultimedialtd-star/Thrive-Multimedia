import { gsap } from '../gsap';

// Floating 3D shapes, drifting light leaks and a keyframed motion track. viewBox 320 × 220.
const TRACK = 'M34 172C104 62 204 222 290 78';
// Points on the curve at t = 0, .5 and 1, where the keyframes sit.
const keys: Array<[number, number]> = [
  [34, 172],
  [152.5, 136.25],
  [290, 78],
];

export function VfxArt() {
  return (
    <>
      <defs>
        <filter id="vfx-leak" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="22" />
        </filter>
      </defs>
      <g filter="url(#vfx-leak)">
        <ellipse data-leak cx="70" cy="60" rx="70" ry="38" fill="#7fb53f" opacity="0.35" />
        <ellipse data-leak cx="260" cy="170" rx="80" ry="34" fill="#6a9a36" opacity="0.3" />
      </g>
      {/* Isometric cube */}
      <g data-shape="0" strokeLinejoin="round">
        <path d="M228 40l26 15v30l-26 15-26-15V55z" fill="#24391a" />
        <path d="M228 40l26 15-26 15-26-15z" fill="#7fb53f" />
        <path d="M228 70l26-15v30l-26 15z" fill="#6a9a36" />
      </g>
      {/* Triangle and ring */}
      <path data-shape="1" d="M84 98l20 34H64z" fill="none" stroke="#7fb53f" strokeWidth="2" strokeLinejoin="round" />
      <circle data-shape="2" cx="196" cy="160" r="14" fill="none" stroke="#f3f1ea" strokeOpacity="0.7" strokeWidth="2" />
      {/* Motion track */}
      <path data-track d={TRACK} fill="none" stroke="#f3f1ea" strokeOpacity="0.4" strokeWidth="1.4" strokeDasharray="2 6" strokeLinecap="round" />
      <path d="M34 172L74 108M290 78L250 118" stroke="#7fb53f" strokeOpacity="0.5" />
      <circle cx="74" cy="108" r="3" fill="#7fb53f" />
      <circle cx="250" cy="118" r="3" fill="#7fb53f" />
      {keys.map(([x, y]) => (
        <rect key={x} data-key x={x - 5} y={y - 5} width="10" height="10" transform={`rotate(45 ${x} ${y})`} fill="#121212" stroke="#7fb53f" strokeWidth="1.5" />
      ))}
      <circle data-dot cx="34" cy="172" r="7" fill="#7fb53f" />
    </>
  );
}

export function vfx(root: Element) {
  const q = gsap.utils.selector(root);
  const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'sine.inOut' } });
  const track = root.querySelector<SVGPathElement>('[data-track]')!;
  // The dot rides the track and back.
  tl.to(q('[data-dot]'), { motionPath: { path: track, align: track, alignOrigin: [0.5, 0.5] }, duration: 2.4, ease: 'power2.inOut', yoyo: true, repeat: 1 }, 0);
  tl.to(q('[data-key]'), { fill: '#7fb53f', duration: 0.15, yoyo: true, repeat: 1, stagger: 1.15, ease: 'none' }, 0);
  q('[data-shape]').forEach((el, i) =>
    tl.to(el, { y: i % 2 ? 8 : -8, rotation: i === 0 ? 0 : i === 1 ? 20 : -15, transformOrigin: '50% 50%', duration: 2.4, yoyo: true, repeat: 1 }, i * 0.3),
  );
  tl.to(q('[data-leak]'), { x: (i: number) => (i ? -40 : 50), opacity: (i: number) => (i ? 0.5 : 0.55), duration: 2.4, yoyo: true, repeat: 1 }, 0);
  return tl;
}
