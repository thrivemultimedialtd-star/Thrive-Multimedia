import { markets } from '@/content/story';
import { clients, identities } from '@/content/clients';
import TextReveal from '@/components/motion/TextReveal/TextReveal';
import Reveal from '@/components/motion/Reveal/Reveal';
import Marquee from './Marquee';
import styles from './Markets.module.css';

export default function Markets() {
  return (
    <section id="markets" className={`section ${styles.markets}`} data-section-theme="charcoal" aria-labelledby="markets-title">
      <div className="wrap">
        <Reveal variant="rule" className="section-head">
          <span className="t-meta">{markets.eyebrow}</span>
          <span className="t-meta">Giving you the creative edge</span>
        </Reveal>
        <TextReveal as="h2" id="markets-title" text={markets.title} split="words" className="t-heading" />
      </div>

      <ul className={`wrap ${styles.band}`}>
        {markets.goals.map((g) => (
          <li key={g} className={styles.goal}>
            {g}
          </li>
        ))}
      </ul>

      <div className={`wrap ${styles.copy}`}>
        <Reveal className={styles.body}>
          <p className="t-body">{markets.body}</p>
        </Reveal>
        <TextReveal as="p" text={markets.closer} split="words" className={`t-heading-sm ${styles.closer}`} delay={150} />
      </div>

      <div className={styles.walls}>
        <Marquee label="Who we’ve worked for" items={clients} direction={-1} />
        <Marquee label="Identities we’ve shaped" items={identities} direction={1} />
      </div>
    </section>
  );
}
