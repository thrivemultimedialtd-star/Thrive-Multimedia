import { intro } from '@/content/story';
import TextReveal from '@/components/motion/TextReveal/TextReveal';
import Reveal from '@/components/motion/Reveal/Reveal';
import styles from './Intro.module.css';

// Start the reveals just before the section scrolls into view, so it never appears empty.
const EARLY = '0px 0px 10% 0px';

/**
 * The lede of the approach sequence: a calm, centred statement on ink that ends in a
 * colon and hands straight over to the pinned LISTEN → DEFINE → CREATE → DELIVER stages.
 */
export default function Intro() {
  return (
    <section id="intro" className={styles.intro} data-section-theme="ink" aria-labelledby="intro-title">
      <div className={styles.inner}>
        <Reveal variant="fade" rootMargin={EARLY} className={`t-meta ${styles.eyebrow}`}>
          {intro.eyebrow}
        </Reveal>
        <TextReveal
          as="h2"
          id="intro-title"
          text={intro.lede}
          split="lines"
          stagger={60}
          duration={900}
          rootMargin={EARLY}
          className={styles.lede}
        />
        <Reveal delay={250} distance={14} rootMargin={EARLY} className={styles.body}>
          <p>{intro.body}</p>
        </Reveal>
      </div>
    </section>
  );
}
