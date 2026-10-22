'use client';

import { useState } from 'react';
import { about } from '@/content/story';
import styles from './AboutDiagram.module.css';

// Where each circle sits (fractions of the stage): four overlapping circles.
const positions = [
  { x: 0.34, y: 0.34 },
  { x: 0.66, y: 0.34 },
  { x: 0.34, y: 0.66 },
  { x: 0.66, y: 0.66 },
];

/**
 * An abstract Venn of CREATIVE / BRAND / DIGITAL / MEDIA. Hovering a circle highlights
 * it and names its skills. Decorative: the same information is in the text list beside it.
 */
export default function AboutDiagram() {
  const [focus, setFocus] = useState<number | null>(null);

  return (
    <div className={styles.stage} aria-hidden="true" onMouseLeave={() => setFocus(null)}>
      {about.venn.map((v, i) => (
        <div
          key={v.id}
          className={`${styles.circle} ${styles[v.id]}`}
          style={{ left: `${positions[i].x * 100}%`, top: `${positions[i].y * 100}%` }}
          data-focus={focus === i || undefined}
          data-dim={focus !== null && focus !== i ? '' : undefined}
          onMouseEnter={() => setFocus(i)}
        >
          <span className={styles.label}>{v.label}</span>
          <span className={styles.skills}>{v.skills.join(' · ')}</span>
        </div>
      ))}
      <span className={styles.core}>
        <span>Thrive</span>
      </span>
    </div>
  );
}
