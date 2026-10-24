import { projects } from '@/content/projects';
import TextReveal from '@/components/motion/TextReveal/TextReveal';
import Reveal from '@/components/motion/Reveal/Reveal';
import TransitionLink from '@/components/motion/TransitionLink';
import FeaturedCard from './FeaturedCard';
import styles from './SelectedWork.module.css';

// Reveal just before the section scrolls in, so it never arrives empty.
const EARLY = '0px 0px 10% 0px';

// Balanced pairs, mirrored, then one wide closer. Each slot has a fixed ratio.
const slots = [
  { slot: 'a', sizes: '(max-width: 900px) 100vw, 58vw' },
  { slot: 'b', sizes: '(max-width: 900px) 100vw, 42vw' },
  { slot: 'c', sizes: '(max-width: 900px) 100vw, 42vw' },
  { slot: 'd', sizes: '(max-width: 900px) 100vw, 58vw' },
  { slot: 'e', sizes: '100vw' },
];

export default function SelectedWork({ count = 5 }: { count?: number }) {
  return (
    <section id="work" className="wrap section" data-section-theme="paper" aria-labelledby="work-title">
      <Reveal variant="rule" rootMargin={EARLY} className="section-head">
        <span className="t-meta">Selected work</span>
        <span className="t-meta">
          {String(count).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
        </span>
      </Reveal>
      <div className={styles.intro}>
        <TextReveal as="h2" id="work-title" text={['Made in Abuja,', 'built to be noticed.']} split="lines" rootMargin={EARLY} className="t-heading" />
        <Reveal delay={200} rootMargin={EARLY} className={styles.lede}>
          <p className="t-body">
            Identities, signage, websites, book covers and films. A cross-section of what the studio makes, for
            clients across very different markets.
          </p>
        </Reveal>
      </div>

      <div className={styles.grid}>
        {projects.slice(0, count).map((p, i) => {
          const s = slots[i % slots.length];
          return <FeaturedCard key={p.slug} project={p} slot={styles[s.slot]} sizes={s.sizes} />;
        })}
      </div>

      <div className={styles.more}>
        <TransitionLink href="/work" className={styles.moreLink}>
          <span>View all work</span>
          <span className={styles.arrow} aria-hidden="true">
            →
          </span>
        </TransitionLink>
      </div>
    </section>
  );
}
