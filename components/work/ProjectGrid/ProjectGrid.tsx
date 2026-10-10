import type { Project } from '@/content/projects';
import ProjectCard, { type CardLayout } from '../ProjectCard/ProjectCard';
import styles from './ProjectGrid.module.css';

// A repeating editorial rhythm: full → split → offset pair → inset wide → split.
const rhythm: { layout: CardLayout; slot: string }[] = [
  { layout: 'full', slot: 's1' },
  { layout: 'narrow', slot: 's2' },
  { layout: 'wide', slot: 's3' },
  { layout: 'portrait', slot: 's4' },
  { layout: 'offset', slot: 's5' },
  { layout: 'wide', slot: 's6' },
  { layout: 'narrow', slot: 's7' },
  { layout: 'offset', slot: 's8' },
];

export default function ProjectGrid({ projects, headingLevel = 'h3' }: { projects: Project[]; headingLevel?: 'h2' | 'h3' }) {
  return (
    <div className={`grid ${styles.grid}`}>
      {projects.map((p, i) => {
        const r = rhythm[i % rhythm.length];
        return (
          <ProjectCard
            key={p.slug}
            project={p}
            layout={r.layout}
            variance={i % 3}
            headingLevel={headingLevel}
            className={styles[r.slot]}
          />
        );
      })}
    </div>
  );
}
