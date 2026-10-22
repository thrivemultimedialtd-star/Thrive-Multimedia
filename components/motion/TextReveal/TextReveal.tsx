'use client';

import { useRef, type ElementType } from 'react';
import { useReveal, type RevealTrigger } from '../useReveal';
import styles from './TextReveal.module.css';

interface Props {
  /** A string, or explicit lines (each on its own line). */
  text: string | string[];
  as?: ElementType;
  /** Kept for compatibility; text is no longer split for animation. */
  split?: 'lines' | 'words' | 'chars';
  trigger?: RevealTrigger;
  delay?: number;
  /** Kept for compatibility; ignored. */
  stagger?: number;
  /** Kept for compatibility; ignored. */
  duration?: number;
  className?: string;
  id?: string;
  rootMargin?: string;
}

/** A heading or line that fades up quickly as it comes into view. */
export default function TextReveal({ text, as = 'p', trigger = 'view', delay = 0, className, id, rootMargin }: Props) {
  const ref = useRef<HTMLElement>(null);
  // Short, capped delays: content should never wait long to appear.
  useReveal(ref, { trigger, delay: Math.min(delay, 200), rootMargin });
  const lines = Array.isArray(text) ? text : [text];
  const Tag = as as 'p';
  return (
    <Tag ref={ref as React.RefObject<HTMLParagraphElement>} id={id} className={`${styles.root} ${className ?? ''}`}>
      {lines.map((line, i) => (
        <span key={i} className={styles.line}>
          {line}
        </span>
      ))}
    </Tag>
  );
}
