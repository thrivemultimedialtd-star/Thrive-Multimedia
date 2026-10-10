import { studioGallery } from '@/content/brochure';
import IrisReveal from '@/components/motion/IrisReveal/IrisReveal';
import Reveal from '@/components/motion/Reveal/Reveal';
import TextReveal from '@/components/motion/TextReveal/TextReveal';
import Placeholder from '@/components/ui/Placeholder/Placeholder';
import styles from './StudioGallery.module.css';

/**
 * Further pieces shown in the brochure without captions. Each is labelled only with the
 * brand and medium visible in the image; no case-study detail is implied.
 */
export default function StudioGallery() {
  return (
    <section className={`wrap section ${styles.gallery}`} data-section-theme="paper" aria-labelledby="studio-title">
      <Reveal variant="rule" className="section-head">
        <span className="t-meta">More from the studio</span>
        <span className="t-meta">{String(studioGallery.length).padStart(2, '0')} pieces</span>
      </Reveal>
      <TextReveal as="h2" id="studio-title" text={['Print, packaging,', 'livery and more.']} split="lines" className={`t-heading ${styles.title}`} />
      <ul className={styles.grid}>
        {studioGallery.map((item, i) => (
          <li key={item.image.src} className={`${styles.item} ${styles[`i${i % 8}`]}`}>
            <figure>
              <div className={styles.frame} style={{ aspectRatio: `${item.image.width} / ${item.image.height}` }}>
                <IrisReveal delay={(i % 3) * 80}>
                  <Placeholder label={item.brand} image={item.image} sizes="(max-width: 768px) 100vw, 40vw" parallax={0.06} />
                </IrisReveal>
              </div>
              <Reveal as="figcaption" delay={180} distance={10} className={styles.caption}>
                <span className={styles.brand}>{item.brand}</span>
                <span className="t-meta">{item.medium}</span>
              </Reveal>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
