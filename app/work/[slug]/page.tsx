import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProject, nextProject, projects, relatedProjects } from '@/content/projects';
import { services } from '@/content/services';
import { markets } from '@/content/story';
import TextReveal from '@/components/motion/TextReveal/TextReveal';
import Reveal from '@/components/motion/Reveal/Reveal';
import IrisReveal from '@/components/motion/IrisReveal/IrisReveal';
import TransitionLink from '@/components/motion/TransitionLink';
import Placeholder from '@/components/ui/Placeholder/Placeholder';
import ProjectCard from '@/components/work/ProjectCard/ProjectCard';
import NextProject from '@/components/work/NextProject/NextProject';
import styles from './project.module.css';

// Navigations here are allowed to block: the circle transition covers the screen until the
// route is ready, so we never want the iris to open onto an empty Suspense fallback.
export const instant = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  return p ? { title: p.name, description: `${p.name}: ${p.brief}. ${p.discipline} by Thrive Multimedia.` } : {};
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const service = services.find((s) => s.id === project.serviceId);
  const next = nextProject(slug);
  const related = relatedProjects(slug);
  const gallery = (project.gallery ?? []).slice(0, 2);
  // The brochure's own description of how Thrive approaches this kind of work.
  const approach = service
    ? { title: `How we approach ${service.title.toLowerCase()}`, lead: service.lead, body: service.body }
    : { title: 'How we approach every market', lead: markets.title, body: markets.body };

  return (
    <article className={styles.project}>
      <header className={`wrap ${styles.header}`} data-section-theme="paper">
        <Reveal variant="rule" trigger="load" className="section-head">
          <span className="t-meta">
            Project {project.number} / {String(projects.length).padStart(2, '0')}
          </span>
          <TransitionLink href="/work" className="t-meta">
            ← All work
          </TransitionLink>
        </Reveal>
        <TextReveal as="h1" text={project.name} split="words" trigger="load" delay={100} stagger={70} duration={1300} className={`t-display ${styles.title}`} />
        <div className={styles.intro}>
          {project.subtitle && (
            <Reveal trigger="load" delay={450} className={styles.subtitle}>
              <p className="t-lead">{project.subtitle}</p>
            </Reveal>
          )}
          <Reveal trigger="load" delay={550} className={styles.facts}>
            <dl>
              <div>
                <dt className="t-meta">Discipline</dt>
                <dd>{project.discipline}</dd>
              </div>
              <div>
                <dt className="t-meta">Scope</dt>
                <dd>{project.brief}</dd>
              </div>
              {service && (
                <div>
                  <dt className="t-meta">Service</dt>
                  <dd>
                    <TransitionLink href="/services">{service.title}</TransitionLink>
                  </dd>
                </div>
              )}
            </dl>
          </Reveal>
        </div>
      </header>

      <div className={`wrap ${styles.heroVisual}`} data-section-theme="paper">
        <IrisReveal trigger="load" delay={350} duration={1400}>
          <Placeholder
            tone={project.visual.tone}
            label={`${project.name}: ${project.visual.label}`}
            ghost={project.name}
            image={project.image}
            sizes="100vw"
            priority
            ratio="16 / 9"
          />
        </IrisReveal>
      </div>

      <section className={`wrap section ${styles.body}`} data-section-theme="paper" aria-labelledby="overview-title">
        <div className={styles.overview}>
          <h2 id="overview-title" className="t-meta">
            Overview
          </h2>
          <div className={styles.overviewText}>
            <TextReveal text={project.summary} split="words" className="t-heading-sm" />
            <Reveal delay={200} className={styles.approach}>
              <h3 className="t-meta">{approach.title}</h3>
              <p className="t-lead">{approach.lead}</p>
              <p className="t-body">{approach.body}</p>
            </Reveal>
          </div>
        </div>

        {gallery.length > 0 && (
          <div className={styles.gallery}>
            {gallery.map((img, i) => (
              <figure
                key={img.src}
                className={i ? styles.g2 : styles.g1}
                // Brochure images are never upscaled beyond ~1.5× their native width.
                style={{ maxWidth: `${Math.round(img.width * 1.5)}px` }}
              >
                <IrisReveal delay={i * 120}>
                  <Placeholder
                    label={img.alt}
                    image={img}
                    tone="paper"
                    ratio={img.fit === 'contain' ? '4 / 3' : `${img.width} / ${img.height}`}
                    sizes="(max-width: 768px) 100vw, 45vw"
                  />
                </IrisReveal>
              </figure>
            ))}
          </div>
        )}
      </section>

      {related.length > 0 && (
        <section className={`wrap section ${styles.related}`} data-section-theme="paper" aria-labelledby="related-title">
          <Reveal variant="rule" className="section-head">
            <h2 id="related-title" className="t-meta">
              Related work
            </h2>
          </Reveal>
          <div className={styles.relatedGrid}>
            {related.map((p, i) => (
              <ProjectCard key={p.slug} project={p} layout={i ? 'offset' : 'narrow'} variance={i} />
            ))}
          </div>
        </section>
      )}

      <NextProject project={next} />
    </article>
  );
}
