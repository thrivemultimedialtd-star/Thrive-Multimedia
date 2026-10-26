import { pageMetadata } from '@/lib/metadata';
import { services } from '@/content/services';
import { projects } from '@/content/projects';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import ServiceList from '@/components/sections/ServiceList/ServiceList';
import Process from '@/components/sections/Process/Process';
import TextReveal from '@/components/motion/TextReveal/TextReveal';
import Reveal from '@/components/motion/Reveal/Reveal';
import ProjectCard from '@/components/work/ProjectCard/ProjectCard';
import ContactSection from '@/components/sections/Contact/ContactSection';
import styles from './services.module.css';

export const metadata = pageMetadata({
  path: '/services',
  title: 'Services',
  description:
    'Graphic design, website design & build, logo design & branding, and motion design & production, all in-house at Thrive Multimedia.',
});

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Services"
        meta="04 disciplines"
        title="Services"
        lede="Four disciplines under one roof, so a brand looks and sounds the same everywhere it appears."
      />

      <ServiceList />

      {services.map((s) => {
        const work = projects.filter((p) => p.serviceId === s.id);
        return (
          <section key={s.id} id={s.id} className={`wrap section ${styles.service}`} data-section-theme="paper" aria-labelledby={`${s.id}-title`}>
            <Reveal variant="rule" className="section-head">
              <span className="t-meta">{s.number}</span>
              <span className="t-meta">{s.short}</span>
            </Reveal>
            <div className={styles.layout}>
              <div className={styles.copy}>
                <TextReveal as="h2" id={`${s.id}-title`} text={s.title} split="words" className="t-heading" />
                <Reveal delay={150}>
                  <p className="t-lead">{s.lead}</p>
                </Reveal>
                <Reveal delay={250}>
                  <p className="t-body">{s.body}</p>
                </Reveal>
                <Reveal delay={350}>
                  <ul className={styles.caps}>
                    {s.capabilities.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </Reveal>
              </div>
              <div className={styles.work}>
                {work.map((p, i) => (
                  <ProjectCard key={p.slug} project={p} layout={i ? 'offset' : 'portrait'} variance={i} className={i ? styles.second : undefined} />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <Process id="services-process" />
      <ContactSection />
    </>
  );
}
