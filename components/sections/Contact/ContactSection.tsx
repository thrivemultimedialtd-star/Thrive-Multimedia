import { contact } from '@/content/site';
import { closing } from '@/content/story';
import TextReveal from '@/components/motion/TextReveal/TextReveal';
import Reveal from '@/components/motion/Reveal/Reveal';
import BriefForm from '@/components/contact/BriefForm/BriefForm';
import QuickActions from './QuickActions';
import styles from './ContactSection.module.css';

const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address.join(' ').replace(/,\s*$/, ''))}`;

/**
 * The closing section. The heading and three one-tap ways to reach the studio (WhatsApp, call,
 * email) come first; the project brief sits beside them on a light card; the studio address last.
 */
export default function ContactSection({ headingLevel = 'h2' }: { headingLevel?: 'h1' | 'h2' }) {
  return (
    <section id="contact" className={styles.contact} data-section-theme="green" aria-labelledby="contact-title">
      <div className={`wrap ${styles.inner}`}>
        <Reveal variant="rule" className={`section-head ${styles.head}`}>
          <span className="t-meta">Contact</span>
          <span className="t-meta">Abuja · Nigeria</span>
        </Reveal>

        <div className={styles.layout}>
          {/* Left column: heading, one-tap actions, studio (pinned to the bottom on desktop). */}
          <div className={styles.side}>
            <TextReveal as={headingLevel} id="contact-title" text={closing.title} split="lines" className={styles.title} />

            <div className={styles.quick}>
              <QuickActions />
            </div>

            <Reveal delay={150} distance={12} className={styles.studio}>
              <h3 className="t-meta">Studio</h3>
              <address className={styles.address}>
                {contact.address.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </address>
              <a href={mapsHref} target="_blank" rel="noopener noreferrer" className={styles.maps}>
                Open in Maps <span aria-hidden="true">↗</span>
              </a>
            </Reveal>
          </div>

          <Reveal delay={100} distance={20} className={styles.formCard}>
            <BriefForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
