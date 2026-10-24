import type { ReactNode } from 'react';
import { contact } from '@/content/site';
import Reveal from '@/components/motion/Reveal/Reveal';
import CopyEmail from '@/components/motion/CopyEmail';
import styles from './ContactSection.module.css';

// Simple line glyphs (generic, not brand logos), drawn on a 24px grid.
const icon = {
  chat: (
    <path d="M4 5.5h16v10H9.5L5 19v-3.5H4z M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01" />
  ),
  phone: (
    <path d="M6.6 3.5h3l1.5 4-2 1.3a10 10 0 0 0 6.1 6.1l1.3-2 4 1.5v3a2 2 0 0 1-2 2A16.5 16.5 0 0 1 4.6 5.5a2 2 0 0 1 2-2z" />
  ),
  mail: <path d="M3.5 6h17v12h-17z M3.5 6.5l8.5 6.5 8.5-6.5" />,
};

function Action({ href, label, value, sub, glyph, external, children, delay }: {
  href: string;
  label: string;
  value: ReactNode;
  sub?: string;
  glyph: ReactNode;
  external?: boolean;
  children?: ReactNode;
  delay: number;
}) {
  return (
    <Reveal as="li" delay={delay} distance={16} className={styles.action}>
      <a href={href} className={styles.actionLink} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        <span className={styles.actionIcon} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            {glyph}
          </svg>
        </span>
        <span className={styles.actionText}>
          <span className={styles.actionLabel}>{label}</span>
          <span className={styles.actionValue}>{value}</span>
          {sub && <span className={styles.actionSub}>{sub}</span>}
        </span>
        <span className={styles.actionArrow} aria-hidden="true">
          →
        </span>
      </a>
      {children}
    </Reveal>
  );
}

/** One-tap ways to reach the studio: WhatsApp, a call or an email. */
export default function QuickActions() {
  const [first, second] = contact.phones;
  // Let a long address wrap after the @ rather than mid-word.
  const [user, domain] = contact.email.split('@');
  return (
    <ul className={styles.actions} aria-label="Contact the studio">
      <Action href={`https://wa.me/${contact.whatsapp}`} label="WhatsApp" value={first.display} glyph={icon.chat} external delay={0} />
      <Action href={first.href} label="Call" value={first.display} sub={second ? `or ${second.display}` : undefined} glyph={icon.phone} delay={60} />
      <Action href={`mailto:${contact.email}`} label="Email" value={<>{user}@<wbr />{domain}</>} glyph={icon.mail} delay={120}>
        <CopyEmail email={contact.email} className={styles.copy} />
      </Action>
    </ul>
  );
}
