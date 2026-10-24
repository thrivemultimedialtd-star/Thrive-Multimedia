'use client';

import { Fragment, type CSSProperties, type PointerEvent } from 'react';
import Reveal from '@/components/motion/Reveal/Reveal';
import Texture from '@/components/ui/Texture';
import styles from './Markets.module.css';

// One solid brand colour per goal; ink text reads on every one (5.7:1 or better).
const tiles = ['#7fb53f', '#f3f1ea', '#c9b79c', '#6a9a36', '#8a8f86'];
// The burst: bright green, paper and ink, as small Thrive stars and dots.
const sparkColours = ['#7fb53f', '#f3f1ea', '#0b120a', '#7fb53f'];

const reduced = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Sprays a handful of stars and dots out from where the tile was tapped, then cleans up. */
function burst(host: HTMLElement, x: number, y: number) {
  for (let k = 0; k < 14; k++) {
    const s = document.createElement('span');
    const angle = (Math.PI * 2 * k) / 14 + Math.random() * 0.45;
    const dist = 80 + Math.random() * 90;
    s.className = `${styles.spark} ${k % 3 === 0 ? styles.sparkDot : ''}`;
    s.style.cssText = `left:${x}px;top:${y}px;--dx:${(Math.cos(angle) * dist).toFixed(1)}px;--dy:${(Math.sin(angle) * dist).toFixed(1)}px;--rot:${Math.round(Math.random() * 360)}deg;--c:${sparkColours[k % sparkColours.length]};--sz:${(12 + Math.random() * 12).toFixed(1)}px`;
    s.addEventListener('animationend', () => s.remove(), { once: true });
    host.appendChild(s);
  }
}

/**
 * The goals as a bento of colour tiles that deal in like cards, their words bouncing up one by one.
 * Tap or click a tile: it squashes like jelly and throws out a burst of Thrive stars. On desktop the
 * tile tilts toward the pointer. While the bento scrolls past, the tiles drift at different speeds.
 */
export default function Bento({ goals }: { goals: string[] }) {
  const onDown = (e: PointerEvent<HTMLElement>) => {
    if (reduced()) return;
    const card = e.currentTarget;
    // The burst lives on the tile (not the clipped card) so it can fly past the edges.
    const host = card.parentElement;
    if (!host) return;
    const r = host.getBoundingClientRect();
    burst(host, e.clientX - r.left, e.clientY - r.top);
    // Restart the jelly bounce on every tap.
    card.removeAttribute('data-jelly');
    void card.offsetWidth;
    card.setAttribute('data-jelly', '');
  };

  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse' || reduced()) return;
    const card = e.currentTarget;
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.setProperty('--tilt-y', `${(px * 12).toFixed(2)}deg`);
    card.style.setProperty('--tilt-x', `${(-py * 12).toFixed(2)}deg`);
  };

  const onLeave = (e: PointerEvent<HTMLElement>) => {
    e.currentTarget.style.removeProperty('--tilt-x');
    e.currentTarget.style.removeProperty('--tilt-y');
  };

  return (
    <ul className={styles.bento}>
      {goals.map((g, i) => (
        <Reveal
          as="li"
          key={g}
          variant="fade"
          replay
          className={`${styles.tile} parallax`}
          style={{ '--tile': tiles[i], '--i': i } as CSSProperties}
        >
          <div className={styles.card} onPointerDown={onDown} onPointerMove={onMove} onPointerLeave={onLeave}>
            <Texture className={styles.tileTexture} size="520px auto" />
            <span className={styles.goal}>
              {g.split(' ').map((w, wi, arr) => (
                // The space sits outside the clipped word box, where it is kept.
                <Fragment key={wi}>
                  <span className={styles.word}>
                    <span className={styles.wordIn} style={{ '--w': wi } as CSSProperties}>
                      {w}
                    </span>
                  </span>
                  {wi < arr.length - 1 ? ' ' : null}
                </Fragment>
              ))}
            </span>
          </div>
        </Reveal>
      ))}
    </ul>
  );
}
