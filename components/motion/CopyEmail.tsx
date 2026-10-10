'use client';

import { useState } from 'react';

/** Copies an address to the clipboard and confirms through a live region. */
export default function CopyEmail({ email, className }: { email: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <>
      <button
        type="button"
        className={className}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(email);
            setCopied(true);
            setTimeout(() => setCopied(false), 2200);
          } catch {
            window.location.href = `mailto:${email}`;
          }
        }}
      >
        {copied ? 'Copied' : 'Copy email'}
      </button>
      <span className="visually-hidden" aria-live="polite">
        {copied ? 'Email address copied to clipboard' : ''}
      </span>
    </>
  );
}
