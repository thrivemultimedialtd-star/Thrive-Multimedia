import type { Metadata } from 'next';
import { projects } from '@/content/projects';
import { clients, identities } from '@/content/clients';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import ProjectGrid from '@/components/work/ProjectGrid/ProjectGrid';
import Reveal from '@/components/motion/Reveal/Reveal';
import ContactSection from '@/components/sections/Contact/ContactSection';
import StudioGallery from '@/components/work/StudioGallery/StudioGallery';
import { logoHeight, type Logo } from '@/content/brochure';
import styles from './work.module.css';

export const metadata: Metadata = {
  title: 'Work',
  description: 'Selected branding, graphic design, website and motion work by Thrive Multimedia, Abuja.',
};

function LogoGrid({ logos }: { logos: Logo[] }) {
  return (
    <ul className={styles.logoGrid}>
      {logos.map((l) => (
        <li key={l.name}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={l.src} alt="" width={l.width} height={l.height} style={{ height: `${logoHeight(l, 3.8)}rem` }} loading="lazy" />
          <span>{l.name}</span>
        </li>
      ))}
    </ul>
  );
}

export default function WorkPage() {
  return (
    <>
      <PageHeader
        eyebrow="Work"
        meta={`${String(projects.length).padStart(2, '0')} projects`}
        title="Work"
        lede="Identities, signage, websites, book covers and films, made across print, web and multimedia."
      />

      <section className="wrap" data-section-theme="paper" aria-label="Projects">
        <ProjectGrid projects={projects} headingLevel="h2" />
      </section>

      <section className={`wrap section ${styles.lists}`} data-section-theme="paper" aria-labelledby="clients-title">
        <Reveal variant="rule" className="section-head">
          <span className="t-meta" id="clients-title">
            Clients &amp; identities
          </span>
          <span className="t-meta">From the Thrive brochure</span>
        </Reveal>
        <div className={styles.columns}>
          <Reveal className={styles.col}>
            <h2 className="t-heading-sm">Who we’ve worked for</h2>
            <LogoGrid logos={clients} />
          </Reveal>
          <Reveal className={styles.col} delay={150}>
            <h2 className="t-heading-sm">Identities we’ve shaped</h2>
            <LogoGrid logos={identities} />
          </Reveal>
        </div>
      </section>

      <StudioGallery />

      <ContactSection />
    </>
  );
}
