import type { Project } from '@/content/projects';
import Reveal from '@/components/motion/Reveal/Reveal';
import TransitionLink from '@/components/motion/TransitionLink';
import Placeholder from '@/components/ui/Placeholder/Placeholder';
import styles from './SelectedWork.module.css';

/**
 * One project in Selected work: the image unveils like a curtain and settles as it scrolls in,
 * then a quiet caption (number, name, discipline, the brochure's line). The whole card is a link.
 */
export default function FeaturedCard({ project, slot, sizes }: { project: Project; slot: string; sizes: string }) {
  return (
    <Reveal as="article" variant="fade" className={`${styles.card} ${slot}`}>
      <TransitionLink href={`/work/${project.slug}`} className={styles.link} aria-label={`${project.name}: ${project.discipline}`}>
        <div className={styles.media}>
          <div className={styles.mediaInner}>
            <Placeholder
              tone={project.visual.tone}
              label={project.visual.label}
              image={project.image}
              sizes={sizes}
              ghost={project.name}
              className={styles.photo}
            />
          </div>
          <span className={styles.go} aria-hidden="true">
            →
          </span>
        </div>
        <div className={styles.caption}>
          <div className={styles.captionTop}>
            <h3 className={styles.name}>
              <span className={`t-meta ${styles.num}`}>{project.number}</span>
              <span className={styles.nameText}>{project.name}</span>
            </h3>
            <span className={`t-meta ${styles.pill}`}>{project.discipline}</span>
          </div>
          <p className={styles.brief}>{project.brief}</p>
        </div>
      </TransitionLink>
    </Reveal>
  );
}
