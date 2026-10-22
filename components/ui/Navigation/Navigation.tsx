'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { nav, contact, site } from '@/content/site';
import TransitionLink from '@/components/motion/TransitionLink';
import Logo from '../Logo';
import styles from './Navigation.module.css';

export default function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  // Close the menu whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  // The nav always stays visible; it only gains a soft backing once the page has scrolled.
  useEffect(() => {
    const onScroll = () => header.current?.toggleAttribute('data-scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header ref={header} className={styles.header} data-open={open || undefined}>
      <div className={styles.bar}>
        <TransitionLink href="/" className={styles.logo} aria-label="Thrive Multimedia, home">
          <Logo />
        </TransitionLink>

        <nav aria-label="Primary" className={styles.desktop}>
          <ul>
            {nav.map((item) => (
              <li key={item.href}>
                <TransitionLink
                  href={item.href}
                  className={styles.link}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  {item.label}
                </TransitionLink>
              </li>
            ))}
          </ul>
        </nav>

        <button
          ref={toggle}
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="visually-hidden">{open ? 'Close menu' : 'Open menu'}</span>
          <span className={styles.burger} aria-hidden="true" />
        </button>
      </div>

      <div id="mobile-menu" className={styles.menu} hidden={!open}>
        <nav aria-label="Mobile">
          <ul>
            {nav.map((item, i) => (
              <li key={item.href} style={{ '--i': i } as React.CSSProperties}>
                <TransitionLink href={item.href} className={styles.menuLink}>
                  {item.label}
                </TransitionLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.menuMeta}>
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
          <span>{site.location}</span>
        </div>
      </div>
    </header>
  );
}
