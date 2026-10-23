'use client';

import { useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { whenFontsReady } from '@/lib/motion';
import styles from './SheetStack.module.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Stacked sheets: each section holds in place once its bottom reaches the bottom of the screen,
 * while the next section slides up over it in the normal flow; then it releases. The outgoing
 * sheet sinks back a little (scale + veil) as it is covered.
 *
 * pinSpacing is off, so page length and anchor positions are exactly as without the effect.
 * Reduced motion gets plain scrolling.
 */
export default function SheetStack({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const sheets = [...el.children] as HTMLElement[];
      sheets.forEach((s, i) => gsap.set(s, { zIndex: i + 1 }));

      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        sheets.slice(0, -1).forEach((sheet) => {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: sheet,
                // A section that fits the screen holds at its top; a taller one holds only once it
                // has been read to the end, so nothing is skipped.
                start: () => (sheet.offsetHeight > window.innerHeight ? 'bottom bottom' : 'top top'),
                end: '+=100%',
                pin: true,
                pinSpacing: false,
                scrub: true,
                invalidateOnRefresh: true,
              },
            })
            .to(sheet, { scale: 0.94, '--veil': 0.35, ease: 'none', transformOrigin: '50% 100%' }, 0);
        });
      });

      // Measurements change once the web fonts and images arrive.
      const refresh = () => ScrollTrigger.refresh();
      whenFontsReady().then(refresh);
      window.addEventListener('load', refresh);

      // A pin fixes its section's height inline, so a section that grows (e.g. the Services
      // accordion opening a row) would spill under the next sheet and its hand-off would come
      // too early. Watch each sheet's contents and re-measure once a change settles.
      let timer = 0;
      const ro = new ResizeObserver(() => {
        clearTimeout(timer);
        timer = window.setTimeout(refresh, 150);
      });
      sheets.forEach((s) => [...s.children].forEach((c) => ro.observe(c)));

      return () => {
        window.removeEventListener('load', refresh);
        ro.disconnect();
        clearTimeout(timer);
        mm.revert();
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className={styles.stack}>
      {children}
    </div>
  );
}
