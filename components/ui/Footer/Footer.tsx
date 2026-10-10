import { contact, nav, site } from '@/content/site';
import TransitionLink from '@/components/motion/TransitionLink';
import Logo from '../Logo';
import Texture from '../Texture';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer} data-section-theme="green">
      <Texture className={styles.texture} fade="linear-gradient(to bottom, #000 0%, #000 40%, transparent 90%)" />
      <div className={`wrap ${styles.inner}`}>
        <div className={styles.brand}>
          <Logo className={styles.logo} />
          <p className={styles.tag}>Print · Web · Multimedia</p>
        </div>

        <nav aria-label="Footer" className={styles.col}>
          <h2 className="t-meta">Explore</h2>
          <ul>
            <li>
              <TransitionLink href="/">Home</TransitionLink>
            </li>
            {nav.map((n) => (
              <li key={n.href}>
                <TransitionLink href={n.href}>{n.label}</TransitionLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.col}>
          <h2 className="t-meta">Talk to us</h2>
          <ul>
            {contact.phones.map((p) => (
              <li key={p.href}>
                <a href={p.href}>{p.display}</a>
              </li>
            ))}
            <li>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </li>
          </ul>
        </div>

        <address className={styles.col}>
          <h2 className="t-meta">Studio</h2>
          {contact.address.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </address>
      </div>
      <div className={`wrap ${styles.base}`}>
        <span>© {site.name}</span>
        <span>{site.location}</span>
      </div>
    </footer>
  );
}
