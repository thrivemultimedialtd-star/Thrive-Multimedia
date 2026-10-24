'use client';

import { useEffect, type RefObject } from 'react';
import { observe, onceInView, page, whenFontsReady } from '@/lib/motion';

export type RevealTrigger = 'view' | 'load';

/**
 * Sets data-revealed on the element when it should play its entrance:
 * on load (after fonts) or when scrolled into view, and never while
 * the page transition is covering the screen.
 *
 * With `replay`, the entrance plays every time the element arrives: data-revealed is removed
 * while the element is fully off screen (so the reset is never seen) and set again on return.
 */
export function useReveal(
  ref: RefObject<HTMLElement | null>,
  {
    trigger = 'view',
    delay = 0,
    rootMargin,
    replay = false,
  }: { trigger?: RevealTrigger; delay?: number; rootMargin?: string; replay?: boolean } = {},
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
    } else if (replay) {
      stopView = observe(
        el,
        (e) => {
          if (e.isIntersecting) {
            fire();
          } else {
            cancelVisible();
            clearTimeout(timer);
            delete el.dataset.revealed;
          }
        },
        rootMargin ?? '0px 0px 5% 0px',
      );
    } else {
      // Start just before the element is on screen, so content never waits to appear.
      stopView = onceInView(el, fire, rootMargin ?? '0px 0px 5% 0px');
    }
    return () => {
      cancelled = true;
      stopView();
      cancelVisible();
      clearTimeout(timer);
    };
    // onReveal is intentionally excluded; it is read once when the reveal fires.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, trigger, delay, rootMargin, replay]);
}
