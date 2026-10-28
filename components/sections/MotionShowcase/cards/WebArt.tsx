import { gsap } from '../gsap';

// A page assembling in a browser, then reflowing as the window narrows to phone width and
// widening back. Two layouts, one set of blocks. viewBox 320 × 220.

// Each block's place in the desktop and the phone layout: [x, y, width, height].
type Box = [number, number, number, number];
const blocks: Array<{ id: string; desk: Box; phone: Box; fill: string; stroke?: boolean }> = [
  { id: 'nav', desk: [52, 58, 216, 8], phone: [124, 58, 72, 8], fill: '#7fb53f' },
  { id: 'title', desk: [52, 76, 110, 10], phone: [124, 74, 72, 8], fill: '#f3f1ea' },
  { id: 'line', desk: [52, 92, 80, 5], phone: [124, 88, 56, 5], fill: '#8a8f86' },
  { id: 'hero', desk: [176, 76, 92, 48], phone: [124, 99, 72, 34], fill: '#6a9a36' },
  { id: 'c1', desk: [52, 134, 66, 34], phone: [124, 139, 72, 14], fill: '#24391a', stroke: true },
  { id: 'c2', desk: [127, 134, 66, 34], phone: [124, 157, 72, 14], fill: '#24391a', stroke: true },
  { id: 'c3', desk: [202, 134, 66, 34], phone: [124, 175, 72, 14], fill: '#24391a', stroke: true },
];
const DESK = { x: 40, w: 240 };
const PHONE = { x: 112, w: 96 };

export function WebArt() {
  return (
    <>
      <g data-frame>
        <rect data-window x={DESK.x} y="30" width={DESK.w} height="166" rx="10" fill="#141c11" stroke="#f3f1ea" strokeOpacity="0.2" />
        <path data-bar d={`M${DESK.x} 48h${DESK.w}`} stroke="#f3f1ea" strokeOpacity="0.2" />
        <g data-dots fill="#f3f1ea" fillOpacity="0.35">
          <circle cx={DESK.x + 12} cy="39" r="3" />
          <circle cx={DESK.x + 22} cy="39" r="3" />
          <circle cx={DESK.x + 32} cy="39" r="3" />
        </g>
      </g>
      {blocks.map((b) => (
        <rect
          key={b.id}
          data-block={b.id}
          x={b.desk[0]}
          y={b.desk[1]}
          width={b.desk[2]}
          height={b.desk[3]}
          rx="3"
          fill={b.fill}
          fillOpacity={b.id === 'title' ? 0.9 : 1}
          stroke={b.stroke ? '#6a9a36' : undefined}
        />
      ))}
      <g fontSize="9" fontWeight="600" letterSpacing="1.4" fill="currentColor" opacity="0.5">
        <text data-size x="16" y="20">
          1440 PX
        </text>
      </g>
    </>
  );
}

export function web(root: Element) {
  const q = gsap.utils.selector(root);
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.4, defaults: { ease: 'power3.inOut' } });
  const label = q('[data-size]')[0];
  // Build the page.
  tl.from(q('[data-block]'), { opacity: 0, y: 8, duration: 0.45, ease: 'power2.out', stagger: 0.1 }, 0);
  // Narrow to phone width: the window shrinks and every block moves to its phone place.
  const toLayout = (at: number, phone: boolean) => {
    const f = phone ? PHONE : DESK;
    tl.to(q('[data-window]'), { attr: { x: f.x, width: f.w }, duration: 0.9 }, at);
    tl.to(q('[data-bar]'), { attr: { d: `M${f.x} 48h${f.w}` }, duration: 0.9 }, at);
    tl.to(q('[data-dots]'), { x: f.x - DESK.x, duration: 0.9 }, at);
    blocks.forEach((b, i) => {
      const [x, y, width, height] = phone ? b.phone : b.desk;
      tl.to(q(`[data-block="${b.id}"]`), { attr: { x, y, width, height }, duration: 0.9 }, at + i * 0.03);
    });
    tl.call(() => label && (label.textContent = phone ? '390 PX' : '1440 PX'), undefined, at + 0.45);
  };
  toLayout(1.6, true);
  toLayout(3.6, false);
  tl.to(q('[data-block]'), { opacity: 0, duration: 0.3, stagger: 0.03 }, 5.2);
  return tl;
}
