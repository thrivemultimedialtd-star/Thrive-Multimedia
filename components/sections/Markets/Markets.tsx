import type { CSSProperties } from 'react';
import { markets } from '@/content/story';
import { clients, identities } from '@/content/clients';
import Reveal from '@/components/motion/Reveal/Reveal';
import Marquee from './Marquee';
import LogoWall from './LogoWall';
import Bento from './Bento';
import styles from './Markets.module.css';

/**
 * Markets: the goals Thrive helps with, as a bento of bold colour tiles, then the closing
 * statement, the clients marquee and a wall of the identities Thrive has shaped. The heading's
 * words drop in and its full stop bounces; "Same enthusiasm." waves and gets a drawn squiggle.
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
        <Reveal replay>
          <h2 id="markets-title" className={styles.title}>
            {markets.title.split(' ').map((w, wi, arr) => (
              <span key={wi}>
                <span className={styles.drop} style={{ '--w': wi } as CSSProperties}>
                  {w}
                </span>
                {wi < arr.length - 1 ? ' ' : null}
              </span>
            ))}
            <span className={styles.dot} aria-hidden="true">
              .
            </span>
          </h2>
        </Reveal>

        <Bento goals={markets.goals} />

        <div className={styles.copy}>
          <Reveal as="p" replay className={styles.closer}>
            {lead}.{' '}
            <span className={styles.accent}>
              <span className="visually-hidden">{tail}</span>
              {/* A one-time wave through the letters, then a hand-drawn squiggle underneath. */}
              <span aria-hidden="true">
                {tail.split(' ').map((word, wi, arr) => {
                  const offset = arr.slice(0, wi).join(' ').length + (wi ? 1 : 0);
                  return (
                    <span key={wi}>
                      <span className={styles.waveWord}>
                        {[...word].map((ch, ci) => (
                          <span key={ci} className={styles.letter} style={{ '--c': offset + ci } as CSSProperties}>
                            {ch}
                          </span>
                        ))}
                      </span>
                      {wi < arr.length - 1 ? ' ' : null}
                    </span>
                  );
                })}
              </span>
              <svg className={styles.squiggle} viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true">
                <path d="M2 12 C 22 2, 42 2, 62 11 S 102 20, 122 11 S 162 2, 182 11 S 222 20, 242 11 S 282 2, 298 9" pathLength={1} />
              </svg>
            </span>
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
