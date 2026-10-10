'use server';

import { headers } from 'next/headers';
import { Resend } from 'resend';
import { contact } from '@/content/site';
import { formatBrief, validateBrief, type Brief, type BriefErrors } from '@/lib/brief';

export type SendBriefResult = { ok: true } | { ok: false; error: string; fields?: BriefErrors };

// Light abuse protection: per-IP limit (in memory; resets when the server restarts).
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 5;
const hits = new Map<string, number[]>();

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export async function sendBrief(brief: Brief, meta: { startedAt: number; website: string }): Promise<SendBriefResult> {
  // Honeypot filled, or submitted faster than a person could: quietly accept and drop.
  if (meta.website || Date.now() - meta.startedAt < 3000) return { ok: true };

  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) return { ok: false, error: 'Too many briefs in a short time. Please try again in a few minutes.' };
  hits.set(ip, [...recent, now]);

  // Never trust the client: normalise and re-validate everything.
  const clean: Brief = {
    services: Array.isArray(brief.services) ? brief.services.map(String).slice(0, 4) : [],
    goal: String(brief.goal ?? ''),
    message: String(brief.message ?? '').slice(0, 3000),
    timeline: String(brief.timeline ?? ''),
    budget: String(brief.budget ?? ''),
    name: String(brief.name ?? '').slice(0, 120),
    email: String(brief.email ?? '').trim().slice(0, 200),
    phone: String(brief.phone ?? '').slice(0, 20),
    company: String(brief.company ?? '').slice(0, 160),
  };
  const fields = validateBrief(clean);
  if (Object.keys(fields).length) return { ok: false, error: 'Some answers need another look.', fields };

  const text = formatBrief(clean);
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    // Local development without a key: log the brief so the flow can still be tested.
    console.info(`[brief] RESEND_API_KEY not set; brief not emailed.\n${text}`);
    return { ok: true };
  }

  try {
    const { error } = await new Resend(key).emails.send({
      from: process.env.BRIEF_FROM ?? 'Thrive website <onboarding@resend.dev>',
      to: contact.email,
      replyTo: clean.email,
      subject: `New project brief: ${clean.name.trim()} (${clean.services.join(', ')})`,
      text,
      html: `<pre style="font:15px/1.6 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;white-space:pre-wrap">${escapeHtml(text)}</pre>`,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  } catch (err) {
    console.error('[brief] send failed', err);
    return { ok: false, error: 'The brief could not be sent just now.' };
  }
}
