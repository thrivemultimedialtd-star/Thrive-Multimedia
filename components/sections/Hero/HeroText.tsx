'use client';

import type { CSSProperties, ElementType } from 'react';
import styles from './HeroText.module.css';

type Split = 'lines' | 'words' | 'chars';

interface Props {
  /** A string (split by words/chars) or explicit lines. */
  text: string | string[];
  as?: ElementType;
  split?: Split;
  delay?: number; // ms after first paint before the first unit moves
  stagger?: number; // ms between units
  duration?: number; // ms per unit
  className?: string;
  id?: string;
}

/**
 * The hero's masked type reveal (kept from the original design): each unit sits in an
 * overflow-hidden mask and rises into place. It is a CSS animation that starts with the first
 * paint, so the hero never waits for JavaScript to load before it appears.
 * Screen readers get one plain copy of the text; the split spans are aria-hidden.
 */
export default function HeroText({
  text,
  as = 'p',
  split = 'words',
  delay = 0,
  stagger,
  duration = 1100,
  className,
  id,
}: Props) {
  const lines = Array.isArray(text) ? text : [text];
  const full = lines.join(' ');
  const step = stagger ?? (split === 'chars' ? 28 : split === 'words' ? 45 : 110);

  let i = 0;
  const unit = (content: string, key: string, extra?: string) => (
    <span className={`${styles.mask} ${extra ?? ''}`} key={key}>
      <span className={styles.unit} style={{ '--i': i++ } as CSSProperties}>
        {content}
      </span>
    </span>
  );

  const children = lines.map((line, li) => {
    let inner;
    if (split === 'lines') inner = unit(line, `l${li}`, styles.line);
    else if (split === 'words')
      inner = line.split(' ').map((w, wi, arr) => (
        <span key={`w${li}-${wi}`}>
          {unit(w, `u${li}-${wi}`)}
          {wi < arr.length - 1 ? ' ' : null}
        </span>
      ));
    else
      inner = line.split(' ').map((w, wi, arr) => (
        <span className={styles.word} key={`w${li}-${wi}`}>
          {[...w].map((ch, ci) => unit(ch, `c${li}-${wi}-${ci}`))}
          {wi < arr.length - 1 ? <span className={styles.space}> </span> : null}
        </span>
      ));
    return (
      <span className={styles.lineWrap} key={li} aria-hidden="true">
        {inner}
      </span>
    );
  });

  const Tag = as as 'p';
  return (
    <Tag
      id={id}
      className={`${styles.root} ${className ?? ''}`}
      style={{ '--delay': `${delay}ms`, '--stagger': `${step}ms`, '--dur': `${duration}ms` } as CSSProperties}
    >
      <span className="visually-hidden">{full}</span>
      {children}
    </Tag>
  );
}
