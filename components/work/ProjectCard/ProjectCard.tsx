import type { CSSProperties } from 'react';
import type { Project } from '@/content/projects';
import TransitionLink from '@/components/motion/TransitionLink';
import IrisReveal from '@/components/motion/IrisReveal/IrisReveal';
import TextReveal from '@/components/motion/TextReveal/TextReveal';
import Reveal from '@/components/motion/Reveal/Reveal';
import Placeholder from '@/components/ui/Placeholder/Placeholder';
import styles from './ProjectCard.module.css';

export type CardLayout = 'full' | 'wide' | 'narrow' | 'portrait' | 'offset' | 'small';

interface Props {
  project: Project;
  layout?: CardLayout;
  /** Slight per-card variation so the reveals never feel mechanical. */
  variance?: number;
  headingLevel?: 'h2' | 'h3';
  className?: string;
  style?: CSSProperties;
}

/** One project as a small composition: image → title → metadata. Hover zooms the image slightly. */
export default function ProjectCard({ project, layout = 'wide', variance = 0, headingLevel = 'h3', className, style }: Props) {
  const baseDelay = 120 + variance * 60;

  return (
    <article className={`${styles.card} ${styles[layout]} ${className ?? ''}`} style={style}>
      <TransitionLink
        href={`/work/${project.slug}`}
        className={styles.link}
        aria-label={`${project.name}: ${project.discipline}`}
      >
        <div className={styles.frame}>
          <div className={styles.image}>
            <IrisReveal delay={variance * 40}>
              <div className={styles.inner}>
                <Placeholder
                  tone={project.visual.tone}
                  label={project.visual.label}
                  image={project.image}
                  sizes={layout === 'full' ? '100vw' : layout === 'wide' ? '(max-width: 768px) 100vw, 70vw' : '(max-width: 768px) 100vw, 45vw'}
                  ghost={project.name}
                />
              </div>
            </IrisReveal>
          </div>
        </div>
        <div className={styles.meta}>
          <span className={`t-meta ${styles.number}`}>{project.number}</span>
          <TextReveal
            as={headingLevel}
            text={project.name}
            split="words"
            delay={baseDelay}
            className={styles.title}
          />
          <Reveal className={styles.details} delay={baseDelay + 220} distance={12}>
            <span className="t-meta">{project.discipline}</span>
            <span className={styles.brief}>{project.brief}</span>
          </Reveal>
        </div>
      </TransitionLink>
    </article>
  );
}
