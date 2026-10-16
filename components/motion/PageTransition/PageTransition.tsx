'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ease, env, onEnvChange, page, tweenPromise, type CircleGrid } from '@/lib/motion';
import TransitionGrid from '../TransitionGrid/TransitionGrid';
import styles from './PageTransition.module.css';

const COVER_MS = 1100;
const HOLD_MS = 280; // the screen rests in the dark, mark centred, before opening
const REVEAL_MS = 1200;
// The wave: a bright Thrive-green front that deepens to near-black behind it.
const RAMP = { from: '#7fb53f', to: '#0b120a', start: 0.3 };

// Project pages (/work/<slug>) open instantly, without the circle cover.
const isProject = (path: string) => /^\/work\/[^/]+\/?$/.test(path);

/**
 * Route transitions through the full-screen circle grid:
 * cover from the click point → swap route underneath → iris open from the centre.
 * Opening a project page skips the transition.
 */
export default function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const gridRef = useRef<CircleGrid | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const expected = useRef<string | null>(null);
  const arrived = useRef<(() => void) | null>(null);
  const lastPath = useRef(pathname);
  const instant = useRef<string | null>(null);
  const [dims, setDims] = useState({ cols: 15, rows: 17 });
  const [announce, setAnnounce] = useState('');

  useEffect(() => {
    const update = () => setDims(env.mobile ? { cols: 9, rows: 11 } : { cols: 15, rows: 17 });
    update();
    return onEnvChange(update);
  }, []);

  const setActive = (on: boolean) => {
    rootRef.current?.toggleAttribute('data-active', on);
  };

  const reveal = useCallback(async () => {
    const grid = gridRef.current;
    window.scrollTo(0, 0);
    // Focus the new page for keyboard and screen-reader users, without scrolling.
    document.getElementById('main')?.focus({ preventScroll: true });
    setAnnounce(document.title);
    if (grid && !env.reducedMotion) {
      grid.setMode('iris');
      grid.setOrigin(0.5, 0.5);
      grid.setProgress(0);
      rootRef.current?.removeAttribute('data-mark');
      rootRef.current?.removeAttribute('data-dark');
      page.setCovered(false); // entrances start as the circles open
      await tweenPromise({ duration: REVEAL_MS, ease: ease.linear, onUpdate: (p) => grid.setProgress(p) });
    } else {
      rootRef.current?.removeAttribute('data-fade');
      page.setCovered(false);
    }
    setActive(false);
    busy.current = false;
  }, []);

  // The route has rendered underneath the cover.
  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;
    if (instant.current === pathname) {
      // A project opened without the transition: start at the top and focus the new page.
      instant.current = null;
      window.scrollTo(0, 0);
      document.getElementById('main')?.focus({ preventScroll: true });
      setAnnounce(document.title);
      return;
    }
    if (expected.current !== null) {
      arrived.current?.();
      return;
    }
    // Back/forward or any navigation we didn't start: snap to covered, then open.
    // Project pages keep the browser's own behaviour, with no circles.
    if (busy.current || isProject(pathname)) return;
    busy.current = true;
    setActive(true);
    page.setCovered(true);
    const grid = gridRef.current;
    if (grid && !env.reducedMotion) {
      grid.setMode('iris');
      grid.setProgress(0);
    }
    requestAnimationFrame(() => reveal());
  }, [pathname, reveal]);

  const navigate = useCallback(
    async (href: string, opts?: { origin?: { x: number; y: number }; fromCovered?: boolean }) => {
      const target = new URL(href, window.location.href);
      if (target.pathname === window.location.pathname) {
        if (target.hash) document.querySelector(target.hash)?.scrollIntoView({ behavior: 'smooth' });
        else window.scrollTo({ top: 0, behavior: env.reducedMotion ? 'auto' : 'smooth' });
        return;
      }
      if (busy.current) return;
      if (isProject(target.pathname)) {
        instant.current = target.pathname;
        router.push(target.pathname + target.search + target.hash, { scroll: false });
        return;
      }
      busy.current = true;
      setActive(true);
      const grid = gridRef.current;

      if (grid && !env.reducedMotion) {
        grid.setMode('cover');
        const o = opts?.origin ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        grid.setOrigin(o.x / window.innerWidth, o.y / window.innerHeight);
        if (opts?.fromCovered) grid.setProgress(1);
        else
          await tweenPromise({
            duration: COVER_MS,
            ease: ease.linear,
            onUpdate: (p) => grid.setProgress(p),
          });
        rootRef.current?.setAttribute('data-mark', '');
        rootRef.current?.setAttribute('data-dark', '');
      } else {
        rootRef.current?.setAttribute('data-fade', '');
        await new Promise((r) => setTimeout(r, 220));
      }
      page.setCovered(true);

      expected.current = target.pathname;
      const hold = new Promise<void>((r) => setTimeout(r, env.reducedMotion ? 0 : HOLD_MS));
      const ready = new Promise<void>((resolve) => {
        arrived.current = resolve;
        setTimeout(resolve, 4000); // never leave the user stuck under the cover
      });
      router.push(target.pathname + target.search + target.hash, { scroll: false });
      await Promise.all([ready, hold]);
      expected.current = null;
      arrived.current = null;
      // Give the new route one frame to paint before opening.
      requestAnimationFrame(() => requestAnimationFrame(() => reveal()));
    },
    [router, reveal],
  );

  useEffect(() => {
    page.registerNavigator(navigate);
    return () => page.registerNavigator(null);
  }, [navigate]);

  return (
    <>
      <div ref={rootRef} className={styles.root}>
        <TransitionGrid
          key={`${dims.cols}x${dims.rows}`}
          cols={dims.cols}
          rows={dims.rows}
          fixed
          color={RAMP.to}
          ramp={RAMP}
          spread={0.7}
          ease={ease.outBack}
          irisEase={ease.inOutCubic}
          onReady={(g) => {
            gridRef.current = g;
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.mark} src="/brand/thrive-mark.png" alt="" width={56} height={56} />
        <div className={styles.fade} />
      </div>
      <p className="visually-hidden" aria-live="polite">
        {announce}
      </p>
    </>
  );
}
