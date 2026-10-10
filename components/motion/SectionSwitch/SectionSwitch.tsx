'use client';

import { useEffect, useRef } from 'react';
import { homeSections } from '@/content/site';
import { createHoleGrid, ease, env, page, scroll, subscribe, tweenPromise, type HoleGrid } from '@/lib/motion';
import styles from './SectionSwitch.module.css';

const INK = '#0b120a';
const DISSOLVE_MS = 800;
const HOLD_MS = 1400;
const REVEAL_MS = 1800;
// Scrolling down: when the next section's top rises past this line, switch to it.
const DOWN_LINE = 0.62;
// Scrolling up: when the current section's top drops below this line, switch back.
const UP_LINE = 0.38;

/**
 * Blackbook-style switch between sections on the home page. It plays automatically
 * whenever you scroll from one section into the next (either direction) and when you
 * use the section index: the view dissolves into a fully dark screen, holds with the
 * Thrive mark and the destination's name, then the destination appears through
 * circular holes opening from the centre.
 */
export default function SectionSwitch() {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    let grid: HoleGrid | null = null;
    let busy = false;
    const main = document.getElementById('main');

    const ensureGrid = () => {
      if (grid) return grid;
      grid = createHoleGrid(cv, {
        cols: env.mobile ? 9 : 15,
        rows: env.mobile ? 11 : 17,
        color: INK,
        spread: 0.62,
        ease: ease.inOutCubic,
      });
      return grid;
    };

    // While switching, the page must not move under the user's wheel, finger or keys.
    const block = (e: Event) => e.preventDefault();
    const blockKeys = (e: KeyboardEvent) => {
      if ([' ', 'PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) e.preventDefault();
    };
    const lockInput = (on: boolean) => {
      const fn = on ? window.addEventListener : window.removeEventListener;
      fn('wheel', block, { passive: false } as AddEventListenerOptions);
      fn('touchmove', block, { passive: false } as AddEventListenerOptions);
      fn('keydown', blockKeys as EventListener);
    };

    const docTop = (node: Element) => node.getBoundingClientRect().top + window.scrollY;

    const switchTo = async (id: string, opts?: { top?: number }) => {
      const target = document.getElementById(id);
      if (!target || busy || page.covered) return;
      busy = true;
      lockInput(true);
      const name = homeSections.find((s) => s.id === id)?.label ?? '';
      if (label.current) label.current.textContent = name;
      el.dataset.active = '';

      // 1. Dissolve: the whole view fades into a dark screen.
      if (!env.reducedMotion) {
        ensureGrid().setProgress(0);
        main?.classList.add(styles.dissolving);
      }
      await tweenPromise({
        duration: env.reducedMotion ? 220 : DISSOLVE_MS,
        ease: ease.inOutCubic,
        onUpdate: (v) => (el.style.opacity = v.toFixed(3)),
      });
      page.setCovered(true);

      // 2. Hold in the dark: jump underneath while the mark and the destination's name rest in the centre.
      const top = opts?.top ?? (id === 'top' ? 0 : docTop(target));
      window.scrollTo({ top, behavior: 'instant' });
      const heading = target.querySelector<HTMLElement>('h1, h2');
      if (heading) {
        if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
      el.dataset.label = '';
      await new Promise((r) => setTimeout(r, env.reducedMotion ? 80 : HOLD_MS - 320));
      delete el.dataset.label;
      await new Promise((r) => setTimeout(r, env.reducedMotion ? 0 : 320));
      main?.classList.remove(styles.dissolving);

      // 3. Reveal: entrances start as the circles open onto the new section.
      page.setCovered(false);
      if (env.reducedMotion) {
        await tweenPromise({ duration: 220, ease: ease.linear, onUpdate: (v) => (el.style.opacity = (1 - v).toFixed(3)) });
      } else {
        const g = ensureGrid();
        await tweenPromise({ duration: REVEAL_MS, ease: ease.linear, onUpdate: (v) => g.setProgress(v) });
        el.style.opacity = '0';
      }
      delete el.dataset.active;
      // Let any leftover momentum scroll die away before listening for boundaries again.
      await new Promise((r) => setTimeout(r, 250));
      lockInput(false);
      busy = false;
      lastTops = null;
    };

    page.registerSectionSwitcher((id) => switchTo(id));

    // Auto-switch at section boundaries while scrolling.
    const sections = homeSections
      .map((s) => ({ id: s.id, el: document.getElementById(s.id) }))
      .filter((s): s is { id: string; el: HTMLElement } => !!s.el);
    let lastTops: number[] | null = null;

    const stopTick = env.reducedMotion
      ? () => {}
      : subscribe(() => {
          if (busy || page.covered) return;
          const vh = window.innerHeight;
          const tops = sections.map((s) => s.el.getBoundingClientRect().top);
          const prev = lastTops;
          lastTops = tops;
          if (!prev) return;
          for (let i = 1; i < sections.length; i++) {
            // Down: section i rose past the line → switch forward to it.
            if (scroll.direction === 1 && prev[i] > vh * DOWN_LINE && tops[i] <= vh * DOWN_LINE) {
              switchTo(sections[i].id);
              return;
            }
            // Up: section i dropped below the line → switch back to the last screen of section i-1.
            if (scroll.direction === -1 && prev[i] < vh * UP_LINE && tops[i] >= vh * UP_LINE) {
              const prevTop = docTop(sections[i - 1].el);
              const lastScreen = Math.max(prevTop, docTop(sections[i].el) - vh);
              switchTo(sections[i - 1].id, { top: lastScreen });
              return;
            }
          }
        });

    return () => {
      stopTick();
      lockInput(false);
      page.registerSectionSwitcher(null);
      grid?.destroy();
    };
  }, []);

  return (
    <div ref={root} className={styles.root} aria-hidden="true">
      <canvas ref={canvas} className={styles.canvas} />
      <div className={styles.center}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.mark} src="/brand/thrive-mark.png" alt="" width={64} height={64} />
        <span ref={label} className={styles.label} />
      </div>
    </div>
  );
}
