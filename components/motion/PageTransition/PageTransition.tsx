'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { env, page } from '@/lib/motion';

/**
 * Page changes are instant (no transition). This keeps the navigation hook used by
 * TransitionLink and the chat, starts new pages at the top, moves focus to the new
 * page and announces it to screen readers.
 */
export default function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const lastPath = useRef(pathname);
  const pending = useRef<string | null>(null);
  const [announce, setAnnounce] = useState('');

  // The new route has rendered.
  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;
    // Our own navigations start at the top; back/forward keeps the browser's scroll restoration.
    if (pending.current === pathname) window.scrollTo(0, 0);
    pending.current = null;
    document.getElementById('main')?.focus({ preventScroll: true });
    setAnnounce(document.title);
  }, [pathname]);

  const navigate = useCallback(
    (href: string) => {
      const target = new URL(href, window.location.href);
      if (target.pathname === window.location.pathname) {
        if (target.hash) document.querySelector(target.hash)?.scrollIntoView({ behavior: env.reducedMotion ? 'auto' : 'smooth' });
        else window.scrollTo({ top: 0, behavior: env.reducedMotion ? 'auto' : 'smooth' });
        return;
      }
      pending.current = target.pathname;
      router.push(target.pathname + target.search + target.hash, { scroll: false });
    },
    [router],
  );

  useEffect(() => {
    page.registerNavigator(navigate);
    return () => page.registerNavigator(null);
  }, [navigate]);

  return (
    <p className="visually-hidden" aria-live="polite">
      {announce}
    </p>
  );
}
