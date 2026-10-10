'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Sections declare data-section-theme="paper|green|charcoal". Whichever section crosses
 * the middle of the viewport sets <body data-theme>, and the colours ease across in CSS.
 */
export default function SectionTheme() {
  const pathname = usePathname();

  useEffect(() => {
    const body = document.body;
    const active = new Set<Element>();
    const apply = () => {
      // Prefer the most recently entered section if two overlap the midline.
      const last = [...active].pop() as HTMLElement | undefined;
      body.dataset.theme = last?.dataset.sectionTheme ?? 'paper';
    };
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? active.add(e.target) : active.delete(e.target)));
        apply();
      },
      { rootMargin: '-50% 0px -50% 0px' },
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
