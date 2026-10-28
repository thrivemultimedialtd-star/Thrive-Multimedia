import { gsap } from '../gsap';

// A logo taking shape: construction circles draw in, the mark builds from simple forms, then
// its palette and guideline bars arrive. An abstract mark, not any client's. viewBox 320 × 220.
const CX = 104;
const CY = 104;

export function BrandArt() {
  return (
    <>
      {/* Construction grid */}
      <g fill="none" stroke="#f3f1ea" strokeOpacity="0.22" strokeWidth="1">
        <circle data-guide cx={CX} cy={CY} r="62" pathLength="1" />
        <circle data-guide cx={CX - 22} cy={CY} r="40" pathLength="1" />
        <circle data-guide cx={CX + 22} cy={CY} r="40" pathLength="1" />
        <path data-guide d={`M${CX - 78} ${CY}H${CX + 78}M${CX} ${CY - 78}V${CY + 78}`} pathLength="1" />
      </g>
      {/* The mark */}
      <g data-mark>
        <path data-part d={`M${CX} ${CY - 54}L${CX + 46} ${CY}L${CX} ${CY + 54}L${CX - 46} ${CY}z`} fill="#24391a" stroke="#7fb53f" strokeWidth="2" strokeLinejoin="round" />
        <path data-part d={`M${CX} ${CY - 54}L${CX + 46} ${CY}H${CX}z`} fill="#7fb53f" />
        <path data-part d={`M${CX} ${CY + 54}L${CX - 46} ${CY}H${CX}z`} fill="#6a9a36" />
        <circle data-part cx={CX} cy={CY} r="9" fill="#f3f1ea" />
      </g>
      {/* Palette */}
      {['#7fb53f', '#6a9a36', '#24391a', '#f3f1ea'].map((c, i) => (
        <rect key={c} data-swatch x={196 + (i % 2) * 52} y={44 + Math.floor(i / 2) * 52} width="44" height="44" rx="6" fill={c} stroke="#f3f1ea" strokeOpacity="0.15" />
      ))}
      {/* Guidelines */}
      <g fill="#f3f1ea">
        <rect data-rule x="196" y="160" width="96" height="5" rx="2.5" fillOpacity="0.5" />
        <rect data-rule x="196" y="172" width="70" height="5" rx="2.5" fillOpacity="0.3" />
        <rect data-rule x="196" y="184" width="82" height="5" rx="2.5" fillOpacity="0.3" />
      </g>
    </>
  );
}

export function brand(root: Element) {
  const q = gsap.utils.selector(root);
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.15 });
  tl.fromTo(q('[data-guide]'), { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1, ease: 'power2.inOut', stagger: 0.12 }, 0);
  tl.from(q('[data-part]'), { scale: 0, opacity: 0, svgOrigin: `${CX} ${CY}`, duration: 0.6, ease: 'back.out(1.8)', stagger: 0.15 }, 0.7);
  tl.to(q('[data-mark]'), { rotation: 360, svgOrigin: `${CX} ${CY}`, duration: 1.2, ease: 'power3.inOut' }, 2.6);
  tl.from(q('[data-swatch]'), { scale: 0, transformOrigin: '50% 50%', duration: 0.45, ease: 'back.out(2)', stagger: 0.1 }, 1.4);
  tl.from(q('[data-rule]'), { scaleX: 0, transformOrigin: '0% 50%', duration: 0.5, ease: 'power2.out', stagger: 0.1 }, 1.9);
  // Hold the finished logo, then clear quickly; the guides stay and redraw over themselves.
  tl.to(q('[data-part], [data-swatch], [data-rule]'), { opacity: 0, duration: 0.25, stagger: 0.015 }, 5.2);
  return tl;
}
