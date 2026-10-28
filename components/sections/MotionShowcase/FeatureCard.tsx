'use client';

import { useRef, type PointerEvent, type ReactNode } from 'react';
import type { MotionCard } from '@/content/animation';
import { services } from '@/content/services';
import { setSpeed, useLoop } from './loops';
import { GraphicArt, graphic } from './cards/GraphicArt';
import { WebArt, web } from './cards/WebArt';
import { BrandArt, brand } from './cards/BrandArt';
import { CharacterArt, character } from './cards/CharacterArt';
import styles from './MotionShowcase.module.css';

// The art for each service (ids from content/services.ts).
const art: Record<string, { Art: () => ReactNode; build: (root: SVGSVGElement) => gsap.core.Timeline }> = {
  'graphic-design': { Art: GraphicArt, build: graphic },
  'website-design': { Art: WebArt, build: web },
  branding: { Art: BrandArt, build: brand },
  'motion-design': { Art: CharacterArt, build: character },
};

/**
 * One service card, a showcase rather than a link. Its title and number come from the
 * Services list; its art loops quietly, hover speeds the loop up and lights the card, and a
 * highlight follows the pointer.
 */
export default function FeatureCard({ card }: { card: MotionCard }) {
  const svg = useRef<SVGSVGElement>(null);
  const service = services.find((s) => s.id === card.service)!;
  const { Art, build } = art[card.service];
  const tl = useLoop(svg, build);
  const fast = () => setSpeed(tl.current, 2.5);
  const slow = () => setSpeed(tl.current, 1);
  const track = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${(e.clientX - r.left).toFixed(0)}px`);
    e.currentTarget.style.setProperty('--my', `${(e.clientY - r.top).toFixed(0)}px`);
  };

  return (
    <li className={styles.cardItem}>
      <div className={styles.card} data-card onPointerEnter={fast} onPointerLeave={slow} onPointerMove={track}>
        <span className={styles.cardArt}>
          <svg ref={svg} viewBox="0 0 320 220" aria-hidden="true" focusable="false">
            <Art />
          </svg>
        </span>
        <span className={styles.cardMeta}>
          <span className={`t-meta ${styles.cardNum}`}>{service.number}</span>
          <h3 className={styles.cardTitle}>{service.title}</h3>
          <span className={styles.tags}>
            {card.tags.map((t) => (
              <span key={t} className="t-meta">
                {t}
              </span>
            ))}
          </span>
        </span>
      </div>
    </li>
  );
}
