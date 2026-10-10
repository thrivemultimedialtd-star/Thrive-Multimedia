import TextReveal from '@/components/motion/TextReveal/TextReveal';
import Reveal from '@/components/motion/Reveal/Reveal';
import styles from './PageHeader.module.css';

interface Props {
  eyebrow: string;
  title: string;
  meta?: string;
  lede?: string;
}

/** Inner-page opener: meta rule, oversized masked title, short serif lede. */
export default function PageHeader({ eyebrow, title, meta, lede }: Props) {
  return (
    <header className={`wrap ${styles.header}`} data-section-theme="paper">
      <Reveal variant="rule" trigger="load" className="section-head">
        <span className="t-meta">{eyebrow}</span>
        {meta && <span className="t-meta">{meta}</span>}
      </Reveal>
      <TextReveal as="h1" text={title} split="chars" trigger="load" delay={100} stagger={40} duration={1300} className={`t-display ${styles.title}`} />
      {lede && (
        <Reveal trigger="load" delay={500} className={styles.lede}>
          <p className="t-lead">{lede}</p>
        </Reveal>
      )}
    </header>
  );
}
