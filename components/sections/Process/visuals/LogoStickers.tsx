'use client';

import { useEffect, useRef } from 'react';
import { clients, identities } from '@/content/clients';
import { logoHeight } from '@/content/brochure';
import { clamp, ease, env } from '@/lib/motion';
import type { RegisterVisual } from './types';
import styles from './visuals.module.css';

// Real logos from the brochure, alternating clients and identities.
const picks = [
  identities[6], // Huriya Air
  clients[6], // UNITAR
  identities[1], // Market Monie
  clients[0], // Hair Label
  identities[3], // Digivant
  clients[9], // Lexicon
  identities[13], // Merci Foods
  clients[5], // PBDC
  identities[9], // Trailblazers
  clients[8], // Farm Alert
  identities[2], // Finventory
  identities[11], // Sim Jocelyn
];

// Resting spots around the edges, clear of the centred word and line (x, y in %, rotation in deg).
const spots = [
  [12, 22, -9],
  [86, 20, 7],
  [13, 62, 6],
  [90, 56, -6],
  [22, 82, -4],
  [76, 84, 9],
  [30, 14, 5],
  [68, 12, -7],
  [14, 40, 11],
  [84, 38, -10],
  [40, 88, 4],
  [58, 90, -5],
];

// On narrow screens the text fills the middle, so stickers rest only above and below it.
const mobileSpots = [
  [22, 20, -8],
  [76, 19, 7],
  [24, 82, 5],
  [76, 84, -6],
  [50, 13, 4],
  [50, 91, -4],
];

/**
 * DELIVER: the work out in the world. Real client logos toss in like stickers,
 * each on its own beat as the stage arrives, and settle at a jaunty angle.
 */
export default function LogoStickers({ register }: { register: RegisterVisual }) {
  const root = useRef<HTMLDivElement>(null);
  const stickers = useRef<Array<HTMLDivElement | null>>([]);
  // Always render every sticker (stable server markup); CSS hides the second half on mobile.
  const count = picks.length;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const handle = {
      update(v: number, l: number) {
        el.style.opacity = v.toFixed(3);
        const p = env.reducedMotion ? 1 : l;
        stickers.current.forEach((s, i) => {
          if (!s) return;
          const start = (i / count) * 0.55;
          const t = clamp((p - start) / 0.4);
          const e = ease.outBack(t);
          const spot = env.mobile && i < mobileSpots.length ? mobileSpots[i] : spots[i];
          const [x, y, rot] = spot;
          s.style.left = `${x}%`;
          s.style.top = `${y}%`;
          const fromY = 70 + (i % 3) * 15; // vh below the resting point
          const spin = (i % 2 ? 1 : -1) * (40 + i * 6);
          s.style.opacity = t > 0 ? '1' : '0';
          s.style.transform = `translate(-50%, -50%) translate3d(0, ${((1 - e) * fromY).toFixed(2)}vh, 0) rotate(${(rot + (1 - e) * spin).toFixed(2)}deg) scale(${(0.7 + 0.3 * Math.min(e, 1.1)).toFixed(3)})`;
        });
      },
    };
    register(handle);
    if (env.reducedMotion) requestAnimationFrame(() => handle.update(1, 1));
    return () => register(null);
  }, [register, count]);

  return (
    <div ref={root} className={styles.layer} aria-hidden="true">
      {picks.map((logo, i) => (
        <div
          key={logo.name}
          ref={(n) => {
            stickers.current[i] = n;
          }}
          className={styles.sticker}
          style={{ left: `${spots[i][0]}%`, top: `${spots[i][1]}%` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo.src} alt="" width={logo.width} height={logo.height} style={{ height: `${logoHeight(logo, 2.6)}rem` }} />
        </div>
      ))}
    </div>
  );
}
