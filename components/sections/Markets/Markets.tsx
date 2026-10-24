import type { CSSProperties } from 'react';
import { markets } from '@/content/story';
import { clients, identities } from '@/content/clients';
import Reveal from '@/components/motion/Reveal/Reveal';
import Texture from '@/components/ui/Texture';
import Marquee from './Marquee';
import LogoWall from './LogoWall';
import styles from './Markets.module.css';

// One solid brand colour per goal; ink text reads on every one (5.7:1 or better).
const tiles = ['#7fb53f', '#f3f1ea', '#c9b79c', '#6a9a36', '#8a8f86'];

/**
 * Markets: the goals Thrive helps with, as a bento of bold colour tiles, then the closing
 * statement, the clients marquee and a still wall of the identities Thrive has shaped.
 */
export default function Markets() {
  // "Any industry. Same enthusiasm." → the second sentence carries the green accent.
  const [lead, ...rest] = markets.closer.split('. ');
  const tail = rest.join('. ');

  return (
    <section id="markets" className={`section ${styles.markets}`} data-section-theme="charcoal" aria-labelledby="markets-title">
      <div className="wrap">
        <Reveal variant="rule" className="section-head">
          <span className="t-meta">{markets.eyebrow}</span>
          <span className="t-meta">Giving you the creative edge</span>
        </Reveal>
        <Reveal>
          <h2 id="markets-title" className={styles.title}>
            {markets.title}
            <span className={styles.dot} aria-hidden="true">
              .
            </span>
          </h2>
        </Reveal>

        <ul className={styles.bento}>
          {markets.goals.map((g, i) => (
            <Reveal
              as="li"
              key={g}
              variant="fade"
              className={styles.tile}
              style={{ '--tile': tiles[i], '--i': i } as CSSProperties}
            >
              <Texture className={styles.tileTexture} size="520px auto" />
              <span className={styles.goal}>{g}</span>
            </Reveal>
          ))}
        </ul>

        <div className={styles.copy}>
          <Reveal as="p" className={styles.closer}>
            {lead}.{' '}
            <span className={styles.accent}>{tail}</span>
          </Reveal>
          <Reveal delay={100} className={styles.body}>
            <p>{markets.body}</p>
          </Reveal>
        </div>
      </div>

      <div className={styles.walls}>
        <Marquee label="Who we’ve worked for" items={clients} direction={-1} />
        <LogoWall label="Identities we’ve shaped" items={identities} />
      </div>
    </section>
  );
}
