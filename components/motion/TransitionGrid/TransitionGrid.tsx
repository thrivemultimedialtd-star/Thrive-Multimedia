'use client';

import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import { createCircleGrid, type CircleGrid, type GridOptions } from '@/lib/motion';
import styles from './TransitionGrid.module.css';

interface Props extends Partial<GridOptions> {
  /** Receives the controller once circles exist; drive it with setProgress(). */
  onReady: (grid: CircleGrid) => void;
  /** Initial progress to apply before first paint (e.g. 0 for iris = fully covered). */
  initial?: number;
  fixed?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * React host for the circle grid. The component owns the DOM node; whoever renders it
 * owns the progress, so the same grid can be driven by a tween, by scroll or by a click.
 */
export default function TransitionGrid({
  onReady,
  initial = 0,
  fixed,
  className,
  style,
  cols = 15,
  rows = 17,
  ...options
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  // Options are read once at mount. A grid is rebuilt only when its dimensions change.
  const optsRef = useRef(options);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const grid = createCircleGrid(ref.current, { cols, rows, ...optsRef.current });
    grid.setProgress(initial);
    onReady(grid);
    return () => grid.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cols, rows]);

  return (
    <div
      ref={ref}
      className={`${styles.grid} ${fixed ? styles.fixed : ''} ${className ?? ''}`}
      style={style}
    />
  );
}
