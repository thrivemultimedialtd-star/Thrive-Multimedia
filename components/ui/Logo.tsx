/* eslint-disable @next/next/no-img-element */
import styles from './Logo.module.css';

/** The supplied Thrive logo PNG, unaltered. On dark themes it is knocked out to paper, as on the brochure cover. */
export default function Logo({ variant = 'full', className }: { variant?: 'full' | 'mark'; className?: string }) {
  return variant === 'full' ? (
    <img
      src="/brand/thrive-logo.png"
      alt="Thrive Multimedia"
      width={1882}
      height={589}
      className={`${styles.logo} ${className ?? ''}`}
    />
  ) : (
    <img src="/brand/thrive-mark.png" alt="" width={512} height={512} className={`${styles.logo} ${className ?? ''}`} />
  );
}
