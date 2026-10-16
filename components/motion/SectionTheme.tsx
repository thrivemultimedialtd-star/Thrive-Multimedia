'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Sections declare data-section-theme="paper|ink|green|charcoal" and paint their own colours
 * (globals.css). Whichever section is under the nav sets <body data-theme>, so the fixed nav,
 * logo and cursor always match what they sit on.
 */
export default function SectionTheme() {
  const pathname = usePathname();

  useEffect(() => {
    const body = document.body;
    const active = new Set<Element>();
    const apply = () => {
      // Prefer the most recently entered section if two overlap the band.
      const last = [...active].pop() as HTMLElement | undefined;
      body.dataset.theme = last?.dataset.sectionTheme ?? 'paper';
    };
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? active.add(e.target) : active.delete(e.target)));
        apply();
      },
      { rootMargin: '-6% 0px -93% 0px' }, // a thin band just under the nav
    );
    const sections = document.querySelectorAll('[data-section-theme]');
    sections.forEach((s) => io.observe(s));
    apply();
    // A section can change its own theme mid-scroll (e.g. the Process hand-off).
    window.addEventListener('thrive:theme', apply);
    return () => {
      io.disconnect();
      window.removeEventListener('thrive:theme', apply);
    };
  }, [pathname]);

  return null;
}
