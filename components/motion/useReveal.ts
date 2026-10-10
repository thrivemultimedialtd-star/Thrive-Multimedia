'use client';

import { useEffect, type RefObject } from 'react';
import { onceInView, page, whenFontsReady } from '@/lib/motion';

export type RevealTrigger = 'view' | 'load';

/**
 * Sets data-revealed on the element when it should play its entrance:
 * on load (after fonts) or when scrolled into view, and never while
 * the page transition is covering the screen.
 */
export function useReveal(
  ref: RefObject<HTMLElement | null>,
  { trigger = 'view', delay = 0, rootMargin }: { trigger?: RevealTrigger; delay?: number; rootMargin?: string } = {},
  onReveal?: () => void,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    let cancelVisible = () => {};
    let timer = 0;

    const fire = () => {
      cancelVisible = page.whenVisible(() => {
        timer = window.setTimeout(() => {
          if (cancelled) return;
          el.dataset.revealed = 'true';
          onReveal?.();
        }, delay);
      });
    };

    let stopView = () => {};
    if (trigger === 'load') {
      whenFontsReady().then(() => !cancelled && fire());
    } else {
      stopView = onceInView(el, fire, rootMargin);
    }
    return () => {
      cancelled = true;
      stopView();
      cancelVisible();
      clearTimeout(timer);
    };
    // onReveal is intentionally excluded; it is read once when the reveal fires.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, trigger, delay, rootMargin]);
}
