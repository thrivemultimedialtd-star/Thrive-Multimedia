import type { Metadata } from 'next';
import TransitionLink from '@/components/motion/TransitionLink';
import styles from './not-found.module.css';

export const metadata: Metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <section className={`wrap ${styles.nf}`} data-section-theme="paper">
      <p className="t-meta">404</p>
      <h1 className="t-display">Lost?</h1>
      <p className="t-lead">This page doesn’t exist, but plenty of other things do.</p>
      <TransitionLink href="/" className={styles.link}>
        Back to the studio →
      </TransitionLink>
    </section>
  );
}
