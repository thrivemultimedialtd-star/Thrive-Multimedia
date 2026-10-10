import { intro } from '@/content/story';
import TextReveal from '@/components/motion/TextReveal/TextReveal';
import Reveal from '@/components/motion/Reveal/Reveal';
import styles from './Intro.module.css';

/**
 * The lede of the approach sequence: a calm, centred statement on ink that ends in a
 * colon and hands straight over to the pinned LISTEN → DEFINE → CREATE → DELIVER stages.
 */
export default function Intro() {
  return (
    <section id="intro" className={styles.intro} data-section-theme="ink" aria-labelledby="intro-title">
      <div className={styles.inner}>
        <Reveal variant="fade" className={`t-meta ${styles.eyebrow}`}>
          {intro.eyebrow}
        </Reveal>
        <TextReveal
          as="h2"
          id="intro-title"
          text={intro.lede}
          split="lines"
          stagger={140}
          duration={1400}
          className={styles.lede}
        />
        <Reveal delay={700} distance={14} className={styles.body}>
          <p>{intro.body}</p>
        </Reveal>
      </div>
    </section>
  );
}
