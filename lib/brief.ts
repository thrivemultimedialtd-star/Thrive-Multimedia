// The project brief: options, validation and plain-text formatting.
// Shared by the form (client), the server action (email) and the WhatsApp / mailto fallbacks.
import { services } from '@/content/services';
import { markets } from '@/content/story';

export const briefOptions = {
  services: services.map((s) => s.title),
  goals: [...markets.goals, 'Something else'],
  // Generic choices for the form, not brochure claims. Edit freely.
  timelines: ['As soon as possible', 'Within a month', 'Within three months', 'Just exploring'],
  budgets: ['Under ₦500k', '₦500k to ₦2m', '₦2m to ₦5m', 'Over ₦5m', 'Not sure yet'],
};

export interface Brief {
  services: string[];
  goal: string;
  message: string;
  timeline: string;
  budget: string;
  name: string;
  email: string;
  phone: string;
  company: string;
}

export type BriefErrors = Partial<Record<keyof Brief, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Validates the fields belonging to one step (1–4), or every step when step is omitted. */
export function validateBrief(b: Brief, step?: number): BriefErrors {
  const e: BriefErrors = {};
  const check = (n: number) => step === undefined || step === n;
  if (check(1)) {
    if (!b.services.length) e.services = 'Choose at least one service.';
    else if (b.services.some((s) => !briefOptions.services.includes(s))) e.services = 'Choose from the list.';
  }
  if (check(2) && !briefOptions.goals.includes(b.goal)) e.goal = 'Choose the goal that fits best.';
  if (check(3)) {
    const m = b.message.trim();
    if (m.length < 20) e.message = 'A sentence or two about the project, please (20+ characters).';
    else if (m.length > 3000) e.message = 'Please keep it under 3,000 characters.';
    if (b.timeline && !briefOptions.timelines.includes(b.timeline)) e.timeline = 'Choose from the list.';
    if (b.budget && !briefOptions.budgets.includes(b.budget)) e.budget = 'Choose from the list.';
  }
  if (check(4)) {
    if (b.name.trim().length < 2) e.name = 'Your name, please.';
    else if (b.name.length > 120) e.name = 'That name is too long.';
    if (!EMAIL.test(b.email.trim())) e.email = 'A valid email address, please.';
    if (b.phone && !/^[+\d\s()-]{7,20}$/.test(b.phone.trim())) e.phone = 'That phone number looks off.';
    if (b.company.length > 160) e.company = 'That company name is too long.';
  }
  return e;
}

/** The brief as readable plain text: blocks separated by blank lines, empty fields left out. */
export function formatBrief(b: Brief) {
  const block = (...lines: (string | false)[]) => lines.filter(Boolean).join('\n');
  const company = b.company.trim() ? ` (${b.company.trim()})` : '';
  return [
    'NEW PROJECT BRIEF',
    block(
      `Services: ${b.services.join(', ')}`,
      `Goal: ${b.goal}`,
      !!b.timeline && `Timeline: ${b.timeline}`,
      !!b.budget && `Budget: ${b.budget}`,
    ),
    block('About the project:', b.message.trim()),
    block(`From: ${b.name.trim()}${company}`, `Email: ${b.email.trim()}`, !!b.phone.trim() && `Phone: ${b.phone.trim()}`),
  ].join('\n\n');
}

export const emptyBrief = (): Brief => ({
  services: [],
  goal: '',
  message: '',
  timeline: '',
  budget: '',
  name: '',
  email: '',
  phone: '',
  company: '',
});
