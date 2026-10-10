'use client';

import { useEffect, useState } from 'react';
import { homeSections } from '@/content/site';
import { observe, page } from '@/lib/motion';
import styles from './SectionIndex.module.css';

/**
 * A Blackbook-style index of the home page sections. Choosing one plays the
 * section switch (dissolve → hold → circles opening onto the destination).
 */
export default function SectionIndex() {
  const [active, setActive] = useState('top');
  const [open, setOpen] = useState(false);

  // The section crossing the middle of the viewport is the active one.
  useEffect(() => {
    const stops = homeSections.map(({ id }) => {
      const el = document.getElementById(id);
      return el
        ? observe(el, (e) => e.isIntersecting && setActive(id), '-50% 0px -50% 0px')
        : () => {};
    });
    return () => stops.forEach((s) => s());
  }, []);

  const go = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setOpen(false);
    page.switchSection(id);
  };

  return (
    <nav className={styles.index} aria-label="Sections" data-hidden={active === 'top' || undefined} data-open={open || undefined}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls="section-index-list"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="t-meta">Sections</span>
      </button>
      <ol id="section-index-list" className={styles.list}>
        {homeSections.map((s, i) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className={styles.item}
              aria-current={active === s.id ? 'true' : undefined}
              onClick={(e) => go(e, s.id)}
            >
              <span className={styles.name}>{s.label}</span>
              <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
              <span className={styles.dot} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
