import { process as stages } from '@/content/story';
import Reveal from '@/components/motion/Reveal/Reveal';
import styles from './Process.module.css';

/** "Our approach": the four stages of how Thrive works, as a simple dark grid of cards. */
export default function Process({ id = 'process' }: { id?: string }) {
  return (
    <section id={id} className={`wrap section ${styles.process}`} data-section-theme="ink" aria-labelledby={`${id}-title`}>
      <div className={`section-head ${styles.head}`}>
        <h2 id={`${id}-title`} className="t-meta">
          Our approach
        </h2>
        <span className="t-meta">{String(stages.length).padStart(2, '0')} steps</span>
      </div>

      <ol className={styles.grid}>
        {stages.map((st, i) => (
          <Reveal as="li" key={st.word} delay={i * 50} className={styles.card}>
            <span className={`t-meta ${styles.num}`}>{String(i + 1).padStart(2, '0')}</span>
            <h3 className={`t-condensed ${styles.word}`}>{st.word}</h3>
            <p className={styles.line}>{st.line}</p>
            <p className={styles.body}>{st.body}</p>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
