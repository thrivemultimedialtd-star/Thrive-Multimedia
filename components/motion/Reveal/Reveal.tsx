'use client';

import { useRef, type CSSProperties, type ElementType, type ReactNode } from 'react';
import { useReveal, type RevealTrigger } from '../useReveal';
import styles from './Reveal.module.css';

interface Props {
  children: ReactNode;
  as?: ElementType;
  variant?: 'up' | 'fade' | 'clip' | 'rule';
  trigger?: RevealTrigger;
  delay?: number;
  distance?: number; // px for 'up'
  className?: string;
  style?: CSSProperties;
  rootMargin?: string;
  /** Play the entrance every time the element scrolls into view, not just the first time. */
  replay?: boolean;
}

/** Generic in-view reveal for supporting content. Quieter than TextReveal by design. */
export default function Reveal({
  children,
  as = 'div',
  variant = 'up',
  trigger = 'view',
  delay = 0,
  distance = 28,
  className,
  style,
  rootMargin,
  replay,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref, { trigger, delay: Math.min(delay, 200), rootMargin, replay });
  const Tag = as as 'div';
  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`${styles.reveal} ${styles[variant]} ${className ?? ''}`}
      style={{ '--distance': `${distance}px`, ...style } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
