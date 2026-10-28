import { gsap } from '../gsap';
import { morph } from '../icons';

// A camera iris opening and closing, with floating play/pause controls. viewBox 320 × 220.
const CX = 160;
const CY = 96;
const R = 64;
const BLADES = 8;
// One blade: a wide plate whose inner edge sits `d` from the centre. Eight of them, a
// 45° step apart, leave an octagonal aperture, the way a real iris does.
const blade = `M${-R * 1.3} 0H${R * 1.3}V${R * 1.6}H${-R * 1.3}Z`;

const irisTransform = (open: number) => `rotate(${(open * 28).toFixed(2)}) translate(0 ${(open * R * 0.72).toFixed(2)})`;

/** Places every blade for an aperture between 0 (closed) and 1 (wide open). */
export function setIris(root: Element, open: number) {
  root.querySelectorAll<SVGPathElement>('[data-blade]').forEach((b) => {
    b.setAttribute('transform', irisTransform(open));
  });
}

export function BroadcastArt() {
  return (
    <>
      <defs>
        <clipPath id="iris-clip">
          <circle cx={CX} cy={CY} r={R} />
        </clipPath>
      </defs>
      <circle cx={CX} cy={CY} r={R + 12} fill="#1b2a15" stroke="#7fb53f" strokeOpacity="0.5" />
      <circle cx={CX} cy={CY} r={R + 5} fill="none" stroke="#f3f1ea" strokeOpacity="0.15" strokeDasharray="1 5" />
      <circle cx={CX} cy={CY} r={R} fill="#0b120a" />
      <circle data-glint cx={CX} cy={CY} r="16" fill="#7fb53f" opacity="0.5" />
      <g clipPath="url(#iris-clip)">
        {Array.from({ length: BLADES }, (_, i) => (
          <g key={i} transform={`translate(${CX} ${CY}) rotate(${(i * 360) / BLADES})`}>
            {/* Resting frame: half open */}
            <path data-blade d={blade} fill="#24391a" stroke="#7fb53f" strokeWidth="1.2" strokeLinejoin="round" transform={irisTransform(0.5)} />
          </g>
        ))}
      </g>
      <circle data-rec cx={CX + R - 2} cy={CY - R + 6} r="5" fill="#7fb53f" />
      {/* Floating playback controls */}
      <g data-controls>
        <rect x="88" y="176" width="144" height="30" rx="15" fill="#121212" stroke="#f3f1ea" strokeOpacity="0.18" />
        <svg x="98" y="182" width="18" height="18" viewBox="0 0 24 24">
          <path data-toggle d={morph.play} fill="#f3f1ea" />
        </svg>
        <rect x="124" y="189.5" width="96" height="3" rx="1.5" fill="#f3f1ea" opacity="0.2" />
        <rect data-progress x="124" y="189.5" width="96" height="3" rx="1.5" fill="#7fb53f" />
      </g>
    </>
  );
}

export function broadcast(root: Element) {
  const q = gsap.utils.selector(root);
  const tl = gsap.timeline({ repeat: -1 });
  const iris = { open: 0.5 };
  const draw = () => setIris(root, iris.open);
  tl.to(iris, { open: 1, duration: 1.1, ease: 'power3.inOut', onUpdate: draw }, 0);
  tl.to(iris, { open: 0, duration: 1.3, ease: 'power3.inOut', onUpdate: draw }, 1.8);
  tl.to(iris, { open: 0.5, duration: 0.9, ease: 'power2.out', onUpdate: draw }, 3.4);
  tl.to(q('[data-glint]'), { attr: { r: 40 }, opacity: 0.2, duration: 1.1, ease: 'power3.inOut', yoyo: true, repeat: 1 }, 0);
  tl.to(q('[data-toggle]'), { morphSVG: morph.pause, duration: 0.35, ease: 'power2.inOut' }, 0);
  tl.to(q('[data-toggle]'), { morphSVG: morph.play, duration: 0.35, ease: 'power2.inOut' }, 2.8);
  tl.fromTo(q('[data-progress]'), { scaleX: 0 }, { scaleX: 1, transformOrigin: '0% 50%', duration: 2.8, ease: 'none' }, 0);
  tl.to(q('[data-progress]'), { scaleX: 0, duration: 0.6, ease: 'power2.inOut' }, 3.4);
  tl.to(q('[data-controls]'), { y: -6, duration: 2.1, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0);
  tl.to(q('[data-rec]'), { opacity: 0.15, duration: 0.5, ease: 'steps(1)', yoyo: true, repeat: 7 }, 0);
  return tl;
}
