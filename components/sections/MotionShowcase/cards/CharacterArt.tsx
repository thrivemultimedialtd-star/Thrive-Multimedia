import { gsap } from '../gsap';

// A rigged figure in its idle loop: breathing, a head bob, swaying arms, with the bone rig
// (data-rig) that the card reveals on hover. viewBox 320 × 220.
const bone = { stroke: '#7fb53f', strokeWidth: 1.5, strokeLinecap: 'round' } as const;
const Joint = ({ x, y }: { x: number; y: number }) => <circle cx={x} cy={y} r="3.2" fill="#121212" stroke="#7fb53f" strokeWidth="1.5" />;

export function CharacterArt() {
  return (
    <>
      {/* Onion-skin ghosts: the previous and next poses */}
      <g opacity="0.1" fill="#7fb53f">
        <circle cx="146" cy="58" r="17" />
        <circle cx="174" cy="60" r="17" />
      </g>
      <ellipse data-shadow cx="160" cy="196" rx="44" ry="6" fill="#7fb53f" opacity="0.18" />
      {/* Legs */}
      <g fill="#24391a">
        <rect x="140" y="134" width="15" height="58" rx="7.5" />
        <rect x="165" y="134" width="15" height="58" rx="7.5" />
      </g>
      <g data-rig>
        <path d="M147 132v56M172 132v56" {...bone} />
        <Joint x={147} y={160} />
        <Joint x={172} y={160} />
      </g>
      {/* Upper body breathes from the hips */}
      <g data-body>
        <g data-arm-l>
          <rect x="108" y="86" width="14" height="58" rx="7" fill="#6a9a36" transform="rotate(14 120 90)" />
          <g data-rig>
            <path d="M120 90l-14 52" {...bone} />
            <Joint x={113} y={116} />
          </g>
        </g>
        <g data-arm-r>
          <rect x="198" y="86" width="14" height="58" rx="7" fill="#6a9a36" transform="rotate(-14 200 90)" />
          <g data-rig>
            <path d="M200 90l14 52" {...bone} />
            <Joint x={207} y={116} />
          </g>
        </g>
        <rect x="124" y="82" width="72" height="60" rx="22" fill="#7fb53f" />
        <g data-head>
          <circle cx="160" cy="56" r="20" fill="#7fb53f" />
          <g fill="#0b120a">
            <circle data-eye cx="153" cy="54" r="2.6" />
            <circle data-eye cx="167" cy="54" r="2.6" />
          </g>
          <g data-rig>
            <path d="M160 76V42" {...bone} />
            <Joint x={160} y={42} />
          </g>
        </g>
        <g data-rig>
          <path d="M160 136V78M120 90h80" {...bone} />
          <Joint x={160} y={78} />
          <Joint x={120} y={90} />
          <Joint x={200} y={90} />
          <Joint x={160} y={136} />
        </g>
      </g>
      {/* Frame counter */}
      <g fontSize="9" fontWeight="600" letterSpacing="1.4" fill="currentColor" opacity="0.5">
        <text x="16" y="24">IDLE · LOOP</text>
      </g>
    </>
  );
}

export function character(root: Element) {
  const q = gsap.utils.selector(root);
  const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'sine.inOut' } });
  tl.to(q('[data-body]'), { scaleY: 1.035, scaleX: 0.99, svgOrigin: '160 136', duration: 1.2, yoyo: true, repeat: 1 }, 0);
  tl.to(q('[data-head]'), { y: -4, rotation: 4, svgOrigin: '160 76', duration: 1.2, yoyo: true, repeat: 1 }, 0.1);
  tl.to(q('[data-arm-l]'), { rotation: 7, svgOrigin: '120 90', duration: 1.2, yoyo: true, repeat: 1 }, 0);
  tl.to(q('[data-arm-r]'), { rotation: -7, svgOrigin: '200 90', duration: 1.2, yoyo: true, repeat: 1 }, 0.15);
  tl.to(q('[data-shadow]'), { scaleX: 0.92, svgOrigin: '160 196', duration: 1.2, yoyo: true, repeat: 1 }, 0);
  tl.to(q('[data-eye]'), { scaleY: 0.1, svgOrigin: '160 54', duration: 0.08, yoyo: true, repeat: 1, ease: 'none' }, 1.9);
  return tl;
}
