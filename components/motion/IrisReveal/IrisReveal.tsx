'use client';

import { useRef, type ReactNode } from 'react';
import { useReveal, type RevealTrigger } from '../useReveal';
import styles from './IrisReveal.module.css';

interface Props {
  children: ReactNode;
  trigger?: RevealTrigger;
  delay?: number;
  /** Kept for compatibility; ignored. */
  duration?: number;
  /** Kept for compatibility; ignored. */
  color?: string;
  className?: string;
}

/** Images fade in quickly as they come into view. */
export default function IrisReveal({ children, trigger = 'view', delay = 0, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref, { trigger, delay: Math.min(delay, 200) });
  return (
    <div ref={ref} className={`${styles.iris} ${className ?? ''}`}>
      {children}
    </div>
  );
}
