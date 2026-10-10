'use client';

import { useRef, type CSSProperties } from 'react';
import type { Project } from '@/content/projects';
import TransitionLink from '@/components/motion/TransitionLink';
import IrisReveal from '@/components/motion/IrisReveal/IrisReveal';
import TextReveal from '@/components/motion/TextReveal/TextReveal';
import Reveal from '@/components/motion/Reveal/Reveal';
import Placeholder from '@/components/ui/Placeholder/Placeholder';
import { useProjectPhysics } from '@/components/motion/useProjectPhysics';
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

/**
 * One project as a small composition: image (iris + settle) → title → metadata.
 * The layers respond to the pointer through useProjectPhysics.
 */
export default function ProjectCard({ project, layout = 'wide', variance = 0, headingLevel = 'h3', className, style }: Props) {
  const card = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const meta = useRef<HTMLDivElement>(null);
  useProjectPhysics({ card, frame, image, inner, meta }, layout === 'small' ? 0.6 : 1);

  const baseDelay = 120 + variance * 60;

  return (
    <article ref={card} className={`${styles.card} ${styles[layout]} ${className ?? ''}`} style={style}>
      <TransitionLink
        href={`/work/${project.slug}`}
        className={styles.link}
        data-cursor="view"
        data-cursor-label="View"
        aria-label={`${project.name}: ${project.discipline}`}
      >
        <div ref={frame} className={styles.frame}>
          <div ref={image} className={styles.image}>
            <IrisReveal delay={variance * 40}>
              <div ref={inner} className={styles.inner}>
                <Placeholder
                  tone={project.visual.tone}
                  label={project.visual.label}
                  image={project.image}
                  sizes={layout === 'full' ? '100vw' : layout === 'wide' ? '(max-width: 768px) 100vw, 70vw' : '(max-width: 768px) 100vw, 45vw'}
                  ghost={project.name}
                  parallax={0.08 + variance * 0.02}
                />
              </div>
            </IrisReveal>
          </div>
        </div>
        <div ref={meta} className={styles.meta}>
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
