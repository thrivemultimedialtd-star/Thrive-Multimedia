'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { chatNodes, matchQuestion, type ChatOption } from '@/content/chat';
import { env, page, scroll, subscribe } from '@/lib/motion';
import styles from './ChatGuide.module.css';

type Message = { id: number; from: 'bot' | 'you'; text: string };

/**
 * The studio guide: a scripted chat built from the site's brochure content.
 * No AI and no network calls. Answers come from content/chat.ts.
 */
export default function ChatGuide() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [options, setOptions] = useState<ChatOption[]>([]);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState('');
  const launcher = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const thread = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);
  const run = useRef(0); // cancels an in-flight reply when a new one starts
  const started = useRef(false);

  const push = (from: Message['from'], text: string) =>
    setMessages((m) => [...m, { id: nextId.current++, from, text }]);

  // Play a node: its bubbles arrive one by one with a short "typing" pause, then its options.
  const say = useCallback(async (nodeId: string) => {
    const node = chatNodes[nodeId] ?? chatNodes.fallback;
    const token = ++run.current;
    setOptions([]);
    for (const text of node.says) {
      if (!env.reducedMotion) {
        setTyping(true);
        await new Promise((r) => setTimeout(r, Math.min(200 + text.length, 400)));
        if (token !== run.current) return;
        setTyping(false);
      }
      push('bot', text);
    }
    setTyping(false);
    setOptions(node.options);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    // On mobile the launcher is hidden while open; focus it once it is back.
    requestAnimationFrame(() => launcher.current?.focus({ preventScroll: true }));
  }, []);

  // First open: greet.
  useEffect(() => {
    if (open && !started.current) {
      started.current = true;
      say('start');
    }
  }, [open, say]);

  // Focus in on open, back to the launcher on close; Escape closes.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => input.current?.focus({ preventScroll: true }), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  // Keep the newest message in view.
  useEffect(() => {
    const t = thread.current;
    if (t) t.scrollTo({ top: t.scrollHeight, behavior: env.reducedMotion ? 'auto' : 'smooth' });
  }, [messages, typing, options]);

  // Compact launcher once the visitor starts scrolling; hide it while a transition covers the page.
  useEffect(() => {
    let compact = false;
    let hidden = false;
    return subscribe(() => {
      const el = root.current;
      if (!el) return;
      const c = scroll.y > 240;
      if (c !== compact) {
        compact = c;
        el.toggleAttribute('data-compact', c);
      }
      if (page.covered !== hidden) {
        hidden = page.covered;
        el.toggleAttribute('data-hidden', hidden);
      }
    });
  }, []);

  const choose = (o: ChatOption) => {
    if (o.action === 'brief') {
      push('you', o.label);
      setOpen(false);
      if (pathname === '/') page.switchSection('contact');
      else page.navigate('/contact');
      return;
    }
    // WhatsApp, call and email options render as plain links, so they never reach here.
    if (o.href) {
      push('you', o.label);
      setOpen(false);
      page.navigate(o.href);
      return;
    }
    if (o.to) {
      push('you', o.label.replace(/^↺ /, ''));
      say(o.to);
    }
  };

  const ask = () => {
    const q = draft.trim();
    if (!q) return;
    push('you', q);
    setDraft('');
    say(matchQuestion(q));
  };

  const restart = () => {
    run.current++;
    setMessages([]);
    setOptions([]);
    say('start');
  };

  return (
    <div ref={root} className={styles.root} data-open={open || undefined}>
      <div
        ref={panel}
        id="studio-guide"
        className={styles.panel}
        role="dialog"
        aria-modal="false"
        aria-label="Thrive studio guide"
        hidden={!open}
      >
        <header className={styles.head}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/thrive-mark.png" alt="" width={28} height={28} className={styles.headMark} />
          <div>
            <p className={styles.headTitle}>Studio guide</p>
            <p className={styles.headSub}>Answers about Thrive Multimedia</p>
          </div>
          <button type="button" className={styles.iconBtn} onClick={restart} aria-label="Restart conversation" title="Restart">
            ↺
          </button>
          <button type="button" className={styles.iconBtn} onClick={close} aria-label="Close studio guide">
            ✕
          </button>
        </header>

        <div ref={thread} className={styles.thread}>
          <div aria-live="polite" aria-relevant="additions">
            {messages.map((m) => (
              <p key={m.id} className={`${styles.bubble} ${m.from === 'you' ? styles.you : styles.bot}`}>
                {m.text}
              </p>
            ))}
          </div>
          {typing && (
            <p className={`${styles.bubble} ${styles.bot} ${styles.typing}`} aria-label="Typing">
              <span />
              <span />
              <span />
            </p>
          )}
          {options.length > 0 && (
            <div className={styles.options}>
              {options.map((o) =>
                o.action === 'whatsapp' || o.action === 'external' ? (
                  <a
                    key={o.label}
                    href={o.href}
                    className={styles.option}
                    {...(o.action === 'whatsapp' ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    {o.label}
                  </a>
                ) : (
                  <button key={o.label} type="button" className={styles.option} onClick={() => choose(o)}>
                    {o.label}
                  </button>
                ),
              )}
            </div>
          )}
        </div>

        <form
          className={styles.ask}
          onSubmit={(e) => {
            e.preventDefault();
            ask();
          }}
        >
          <label htmlFor="studio-guide-input" className="visually-hidden">
            Ask a question
          </label>
          <input
            ref={input}
            id="studio-guide-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a question…"
            autoComplete="off"
            maxLength={200}
          />
          <button type="submit" className={styles.send} aria-label="Send question" disabled={!draft.trim()}>
            →
          </button>
        </form>
      </div>

      <button
        ref={launcher}
        type="button"
        className={styles.launcher}
        aria-expanded={open}
        aria-controls="studio-guide"
        onClick={() => (open ? close() : setOpen(true))}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/thrive-mark.png" alt="" width={26} height={26} className={styles.launcherMark} />
        <span className={styles.launcherLabel}>{open ? 'Close' : 'Ask Thrive'}</span>
      </button>
    </div>
  );
}
