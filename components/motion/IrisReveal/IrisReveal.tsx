'use client';

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { ease, env, tween, type CircleGrid } from '@/lib/motion';
import TransitionGrid from '../TransitionGrid/TransitionGrid';
import { useReveal, type RevealTrigger } from '../useReveal';
import styles from './IrisReveal.module.css';

interface Props {
  children: ReactNode;
  trigger?: RevealTrigger;
  delay?: number;
  duration?: number;
  /** Circle colour; defaults to the live page background so the image grows out of the page. */
  color?: string;
  className?: string;
}

/**
 * Image reveal using the shared circle grid in iris mode: the frame starts covered
 * and the circles shrink away from the centre. The content settles from a slight scale.
 */
export default function IrisReveal({
  children,
  trigger = 'view',
  delay = 0,
  duration = 1150,
  color = 'var(--bg)',
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const gridRef = useRef<CircleGrid | null>(null);
  const [dims, setDims] = useState<{ cols: number; rows: number } | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || env.reducedMotion) return;
    const cols = env.mobile ? 7 : 12;
    const ratio = el.clientHeight / Math.max(el.clientWidth, 1);
    setDims({ cols, rows: Math.max(3, Math.round(cols * ratio)) });
  }, []);

  useReveal(ref, { trigger, delay }, () => {
    const grid = gridRef.current;
    if (!grid) return;
    tween({
      duration,
      ease: ease.linear,
      onUpdate: (p) => grid.setProgress(p),
    });
  });

  return (
    <div ref={ref} className={`${styles.iris} ${className ?? ''}`}>
      <div className={styles.content}>{children}</div>
      {dims && (
        <TransitionGrid
          cols={dims.cols}
          rows={dims.rows}
          mode="iris"
          color={color}
          spread={0.7}
          ease={ease.inOutCubic}
          initial={0}
          onReady={(g) => {
            gridRef.current = g;
            ref.current?.setAttribute('data-grid', '');
          }}
        />
      )}
    </div>
  );
}
