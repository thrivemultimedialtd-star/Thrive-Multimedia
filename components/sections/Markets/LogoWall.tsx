import { logoHeight, type Logo } from '@/content/brochure';
import styles from './Markets.module.css';

/** A still, hairline-ruled grid of logos (the page keeps a single moving marquee). */
export default function LogoWall({ label, items }: { label: string; items: Logo[] }) {
  return (
    <div className={styles.wallBlock}>
      <h3 className={`t-meta ${styles.marqueeLabel}`}>{label}</h3>
      <ul className={styles.wall}>
        {items.map((n) => (
          <li key={n.name} className={styles.cell}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={n.src}
              alt={n.name}
              width={n.width}
              height={n.height}
              className={styles.wallLogo}
              style={{ height: `${logoHeight(n, 2.6)}rem` }}
              loading="lazy"
              draggable={false}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
