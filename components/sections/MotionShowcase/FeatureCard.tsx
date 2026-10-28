'use client';

import Link from 'next/link';
import { useRef, type PointerEvent } from 'react';
import type { MotionCard } from '@/content/animation';
import { setSpeed, useLoop } from './loops';
import { CharacterArt, character } from './cards/CharacterArt';
import { VfxArt, vfx } from './cards/VfxArt';
import { BroadcastArt, broadcast } from './cards/BroadcastArt';
import styles from './MotionShowcase.module.css';

const art = {
  character: { Art: CharacterArt, build: character },
  vfx: { Art: VfxArt, build: vfx },
  broadcast: { Art: BroadcastArt, build: broadcast },
};

/**
 * One capability card. Its art loops quietly; hover or focus speeds the loop up and lights the
 * card, and a highlight follows the pointer. The whole card links to Motion Design on /services.
 * (A plain Link, so the browser lands on the #motion-design anchor.)
 */
export default function FeatureCard({ card }: { card: MotionCard }) {
  const svg = useRef<SVGSVGElement>(null);
  const { Art, build } = art[card.id];
  const tl = useLoop(svg, build);
  const fast = () => setSpeed(tl.current, 2.5);
  const slow = () => setSpeed(tl.current, 1);
  const track = (e: PointerEvent<HTMLAnchorElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${(e.clientX - r.left).toFixed(0)}px`);
    e.currentTarget.style.setProperty('--my', `${(e.clientY - r.top).toFixed(0)}px`);
  };

  return (
    <li className={styles.cardItem}>
      <Link
        href="/services#motion-design"
        className={styles.card}
        data-card
        data-play-cursor
        onPointerEnter={fast}
        onPointerLeave={slow}
        onPointerMove={track}
        onFocus={fast}
        onBlur={slow}
      >
        <span className={styles.cardArt}>
          <svg ref={svg} viewBox="0 0 320 220" aria-hidden="true" focusable="false">
            <Art />
          </svg>
        </span>
        <span className={styles.cardMeta}>
          <span className={`t-meta ${styles.cardNum}`}>{card.number}</span>
          <h3 className={styles.cardTitle}>{card.title}</h3>
          <span className={styles.tags}>
            {card.tags.map((t) => (
              <span key={t} className="t-meta">
                {t}
              </span>
            ))}
          </span>
        </span>
      </Link>
    </li>
  );
}
