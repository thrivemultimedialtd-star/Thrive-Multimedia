'use client';

import Link from 'next/link';
import { useRef, type ComponentProps } from 'react';
import { page } from '@/lib/motion';

type Props = ComponentProps<typeof Link> & { href: string };

/**
 * A Next Link that routes through the circle transition. Modified clicks
 * (new tab, etc.) never reach onNavigate, so they keep native behaviour.
 */
export default function TransitionLink({ href, onNavigate, onClick, ...rest }: Props) {
  const origin = useRef<{ x: number; y: number } | undefined>(undefined);
  return (
    <Link
      href={href}
      scroll={false}
      onClick={(e) => {
        // Keyboard activation reports 0,0; fall back to the centre in that case.
        origin.current = e.clientX || e.clientY ? { x: e.clientX, y: e.clientY } : undefined;
        onClick?.(e);
      }}
      onNavigate={(e) => {
        onNavigate?.(e);
        e.preventDefault();
        page.navigate(href, { origin: origin.current });
      }}
      {...rest}
    />
  );
}
