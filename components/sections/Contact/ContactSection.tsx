import { contact } from '@/content/site';
import { closing } from '@/content/story';
import TextReveal from '@/components/motion/TextReveal/TextReveal';
import Reveal from '@/components/motion/Reveal/Reveal';
import CopyEmail from '@/components/motion/CopyEmail';
import BriefForm from '@/components/contact/BriefForm/BriefForm';
import styles from './ContactSection.module.css';

/** The closing section: the heading, the project brief form and the studio's contact details. */
export default function ContactSection({ headingLevel = 'h2' }: { headingLevel?: 'h1' | 'h2' }) {
  return (
    <section id="contact" className={styles.contact} data-section-theme="green" aria-labelledby="contact-title">
      <div className={`wrap ${styles.inner}`}>
        <Reveal variant="rule" className={`section-head ${styles.head}`}>
          <span className="t-meta">Contact</span>
          <span className="t-meta">Abuja · Nigeria</span>
        </Reveal>

        <TextReveal
          as={headingLevel}
          id="contact-title"
          text={closing.title}
          split="lines"
          className={styles.title}
        />

        <div className={styles.grid}>
          <Reveal delay={100} distance={16} className={styles.formCol}>
            <BriefForm />
          </Reveal>

          <div className={styles.details}>
            <Reveal delay={150} distance={12} className={styles.block}>
              <h3 className="t-meta">Email</h3>
              <a href={`mailto:${contact.email}`} className={styles.big}>
                {contact.email}
              </a>
              <CopyEmail email={contact.email} className={styles.copy} />
            </Reveal>

            <Reveal delay={200} distance={12} className={styles.block}>
              <h3 className="t-meta">Phone</h3>
              {contact.phones.map((p) => (
                <a key={p.href} href={p.href} className={`${styles.big} ${styles.nowrap}`}>
                  {p.display}
                </a>
              ))}
            </Reveal>

            <Reveal delay={200} distance={12} className={styles.block}>
              <h3 className="t-meta">Studio</h3>
              <address className={styles.address}>
                {contact.address.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </address>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
