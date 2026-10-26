import { about } from '@/content/story';
import TextReveal from '@/components/motion/TextReveal/TextReveal';
import Reveal from '@/components/motion/Reveal/Reveal';
import TransitionLink from '@/components/motion/TransitionLink';
import AboutDiagram from './AboutDiagram';
import styles from './AboutSection.module.css';

/** The quiet "exhale" after the busier sections: slower reveals, nothing pinned. */
export default function AboutSection({ teaser = true, headingLevel = 'h2' }: { teaser?: boolean; headingLevel?: 'h1' | 'h2' }) {
  return (
    <section id="about" className="wrap section" data-section-theme="paper" aria-labelledby="about-title">
      <Reveal variant="rule" className="section-head">
        <span className="t-meta">{about.eyebrow}</span>
        <span className="t-meta">Studio · Abuja</span>
      </Reveal>

      <div className={styles.layout}>
        <div className={styles.text}>
          <TextReveal as={headingLevel} id="about-title" text={about.title} split="words" stagger={60} duration={1400} className="t-heading" />
          {about.body.map((p, i) => (
            <Reveal key={i} delay={250 + i * 150} distance={18}>
              <p className="t-body">{p}</p>
            </Reveal>
          ))}
          <Reveal delay={550} distance={12}>
            <h3 className={`t-meta ${styles.skillsTitle}`}>In-house</h3>
            <ul className={styles.skills}>
              {about.skills.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </Reveal>
          {teaser && (
            <Reveal delay={650} distance={12}>
              <TransitionLink href="/about" className={styles.link}>
                More about the studio <span aria-hidden="true">→</span>
              </TransitionLink>
            </Reveal>
          )}
        </div>
        <Reveal variant="fade" delay={200} className={styles.diagram}>
          <AboutDiagram />
        </Reveal>
      </div>
    </section>
  );
}
