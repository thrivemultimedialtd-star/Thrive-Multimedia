import { projects } from '@/content/projects';
import TextReveal from '@/components/motion/TextReveal/TextReveal';
import Reveal from '@/components/motion/Reveal/Reveal';
import TransitionLink from '@/components/motion/TransitionLink';
import ProjectGrid from '@/components/work/ProjectGrid/ProjectGrid';
import styles from './SelectedWork.module.css';

// Reveal just before the section scrolls in, so it never arrives empty.
const EARLY = '0px 0px 10% 0px';

export default function SelectedWork({ count = 5 }: { count?: number }) {
  return (
    <section id="work" className={`wrap section ${styles.work}`} data-section-theme="paper" aria-labelledby="work-title">
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

      <ProjectGrid projects={projects.slice(0, count)} />

      <div className={styles.more}>
        <TransitionLink href="/work" className={styles.moreLink}>
          <span>All work</span>
          <span className={styles.arrow} aria-hidden="true">
            →
          </span>
        </TransitionLink>
      </div>
    </section>
  );
}
