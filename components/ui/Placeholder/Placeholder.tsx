import Image from 'next/image';
import type { CSSProperties } from 'react';
import type { BrochureImage } from '@/content/brochure';
import styles from './Placeholder.module.css';

export type Tone = 'green' | 'deep' | 'charcoal' | 'mist' | 'paper' | 'clay';

interface Props {
  label: string;
  tone?: Tone;
  ratio?: string;
  /** Large ghost word inside the frame, e.g. the project name (hidden when a photo is shown). */
  ghost?: string;
  /** A project image (from the Thrive brochure). When present it replaces the placeholder art. */
  image?: BrochureImage;
  /** next/image sizes hint for the photo. */
  sizes?: string;
  priority?: boolean;
  /** Shorter label for decorative uses (hero collage). */
  compact?: boolean;
  /** No visible label (only for decorative previews whose label is announced elsewhere). */
  bare?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Image frame for project work. It shows the project image when there is one, otherwise a
 * clearly labelled placeholder. It keeps the final aspect ratio, so either state
 * behaves identically in layout.
 */
export default function Placeholder({
  label,
  tone = 'mist',
  ratio,
  ghost,
  image,
  sizes = '(max-width: 768px) 100vw, 50vw',
  priority,
  compact,
  bare,
  className,
  style,
}: Props) {

  const tag = compact ? 'Placeholder' : `Placeholder · ${label}`;

  return (
    <div
      className={`${styles.frame} ${styles[tone]} ${image ? styles.hasImage : ''} ${className ?? ''}`}
      style={{ aspectRatio: ratio, ...style }}
      role={image ? undefined : 'img'}
      aria-label={image ? undefined : `Placeholder image: ${label}`}
    >
      {/* The inner layer drifts inside the frame as it scrolls past (contained images stay put). */}
      <div className={`${styles.inner} ${image?.fit === 'contain' ? '' : 'parallax'}`}>
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes={sizes}
            priority={priority}
            className={`${styles.photo} ${image.fit === 'contain' ? styles.contain : ''}`}
            style={{ objectPosition: image.position }}
          />
        ) : (
          <>
            <span className={styles.orb} />
            <span className={styles.orbSmall} />
            {ghost && <span className={styles.ghost}>{ghost}</span>}
          </>
        )}
      </div>
      {!bare && !image && (
        <span className={`t-meta ${styles.label}`}>
          <span className={styles.dot} />
          {tag}
        </span>
      )}
    </div>
  );
}
