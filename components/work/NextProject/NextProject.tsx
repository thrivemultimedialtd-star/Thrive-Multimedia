import type { Project } from '@/content/projects';
import TransitionLink from '@/components/motion/TransitionLink';
import styles from './NextProject.module.css';

/** A plain link to the next project at the end of a project page. It opens instantly. */
export default function NextProject({ project }: { project: Project }) {
  return (
    <section className={styles.track} data-section-theme="paper" aria-label="Next project">
      <TransitionLink href={`/work/${project.slug}`} className={styles.link}>
        <span className="t-meta">Next project · {project.number}</span>
        <span className={styles.name}>{project.name}</span>
        <span className={`t-meta ${styles.hint}`}>
          View project <span aria-hidden="true">→</span>
        </span>
      </TransitionLink>
    </section>
  );
}
