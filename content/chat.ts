// The studio guide: a scripted chat (no AI). Every answer is assembled from the site's own
// content files, which come from the Thrive brochure, so nothing here can drift or be invented.
import { contact } from './site';
import { services } from './services';
import { projects } from './projects';
import { clients, identities } from './clients';
import { about, intro, markets, process } from './story';

export interface ChatOption {
  label: string;
  to?: string; // another node
  href?: string; // a page on the site
  action?: 'brief' | 'whatsapp' | 'external';
}

export interface ChatNode {
  says: string[];
  options: ChatOption[];
}

export const WHATSAPP_URL = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent('Hi Thrive, I’d like to talk about a project.')}`;

const home: ChatOption = { label: '↺ Back to start', to: 'start' };
const list = (items: string[]) => items.map((i) => `• ${i}`).join('\n');

const nodes: Record<string, ChatNode> = {
  start: {
    says: ['Hi! I’m Thrive’s studio guide.', 'Ask me anything about what we do, or pick a question below.'],
    options: [
      { label: 'What does Thrive do?', to: 'about' },
      { label: 'Your services', to: 'services' },
      { label: 'See your work', to: 'work' },
      { label: 'Who have you worked with?', to: 'clients' },
      { label: 'How do we start?', to: 'start-project' },
      { label: 'Talk to a person', to: 'human' },
    ],
  },
  about: {
    says: [intro.body, `Everything is done in-house: ${about.skills.join(', ').toLowerCase()}. So your brand speaks with one voice everywhere.`],
    options: [{ label: 'Your services', to: 'services' }, { label: 'Which markets?', to: 'markets' }, { label: 'See your work', to: 'work' }, home],
  },
  services: {
    says: ['We offer four services, all under one roof. Which would you like to hear about?'],
    options: [...services.map((s) => ({ label: s.title, to: `service:${s.id}` })), home],
  },
  work: {
    says: ['Here’s some of the work from our portfolio. Tap one to open it.'],
    options: [...projects.map((p) => ({ label: `${p.name} · ${p.discipline}`, href: `/work/${p.slug}` })), { label: 'All work', href: '/work' }, home],
  },
  clients: {
    says: [
      `We’ve worked with ${clients
        .slice(0, -1)
        .map((c) => c.name)
        .join(', ')} and ${clients[clients.length - 1].name}.`,
      `We’ve also shaped ${identities.length} brand identities, including ${identities
        .slice(0, 4)
        .map((i) => i.name)
        .join(', ')}.`,
    ],
    options: [{ label: 'See the logo wall', href: '/work' }, { label: 'See your work', to: 'work' }, home],
  },
  markets: {
    says: [markets.body, `Whether you want to:\n${list(markets.goals)}`, markets.closer],
    options: [{ label: 'How do we start?', to: 'start-project' }, { label: 'Your services', to: 'services' }, home],
  },
  'start-project': {
    says: ['Here’s how we work:', process.map((p) => `${p.word}: ${p.line}`).join('\n'), 'The easiest first step is a short project brief. It takes about two minutes.'],
    options: [
      { label: 'Fill in the brief', action: 'brief' },
      { label: 'WhatsApp us', action: 'whatsapp', href: WHATSAPP_URL },
      { label: 'Talk to a person', to: 'human' },
      home,
    ],
  },
  pricing: {
    says: [
      'Every project is bespoke, so we quote once we understand your brief.',
      'Tell us what you need in the project brief, or talk to the team directly.',
    ],
    options: [{ label: 'Fill in the brief', action: 'brief' }, { label: 'Talk to a person', to: 'human' }, home],
  },
  human: {
    says: [
      'Happy to connect you with the team:',
      `Phone: ${contact.phones.map((p) => p.display).join(', ')}\nEmail: ${contact.email}`,
      `Studio: ${contact.address.join(' ')}`,
    ],
    options: [
      { label: `WhatsApp ${contact.phones[0].display}`, action: 'whatsapp', href: WHATSAPP_URL },
      { label: `Call ${contact.phones[0].display}`, action: 'external', href: contact.phones[0].href },
      { label: 'Send an email', action: 'external', href: `mailto:${contact.email}` },
      { label: 'Fill in the brief', action: 'brief' },
      home,
    ],
  },
  fallback: {
    says: ['I’m a simple guide, so I might not understand that one. I can help with these:'],
    options: [
      { label: 'Your services', to: 'services' },
      { label: 'See your work', to: 'work' },
      { label: 'How do we start?', to: 'start-project' },
      { label: 'Talk to a person', to: 'human' },
    ],
  },
};

for (const s of services) {
  const related = projects.filter((p) => p.serviceId === s.id);
  nodes[`service:${s.id}`] = {
    says: [
      `${s.title}: ${s.lead}`,
      s.body,
      `What’s included:\n${list(s.capabilities)}`,
      ...(related.length ? [`You can see it in ${related.map((p) => p.name).join(' and ')}.`] : []),
    ],
    options: [
      ...related.map((p) => ({ label: `See ${p.name}`, href: `/work/${p.slug}` })),
      { label: `Start a ${s.short.toLowerCase()} brief`, action: 'brief' as const },
      { label: 'Other services', to: 'services' },
      home,
    ],
  };
}

export const chatNodes = nodes;

// Typed questions: first matching rule wins, so the more specific intents come first.
const rules: [RegExp, string][] = [
  [/\b(price|pricing|cost|costs|how much|budget|quote|rate|rates|fee|fees|charge)\b/i, 'pricing'],
  [/\b(contact|phone|call|whatsapp|email|talk|speak|human|person|address|office|where)\b/i, 'human'],
  [/\b(start|hire|begin|work with you|get started|brief|onboard)\b/i, 'start-project'],
  [/\b(logo|brand|branding|identity|guidelines|livery|merch|merchandise)\b/i, 'service:branding'],
  [/\b(website|web|site|app|apps|seo|e-?commerce|online store|intranet|booking|software)\b/i, 'service:website-design'],
  [/\b(video|animation|animated|motion|film|edit|editing|storyboard|sound)\b/i, 'service:motion-design'],
  [/\b(design|graphic|flyer|print|brochure|stationery|signage|book cover|poster|magazine|illustration)\b/i, 'service:graphic-design'],
  [/\b(services?|what do you do|offer)\b/i, 'services'],
  [/\b(work|portfolio|projects?|examples?|case)\b/i, 'work'],
  [/\b(clients?|worked (with|for)|customers?)\b/i, 'clients'],
  [/\b(industry|industries|market|markets|sector)\b/i, 'markets'],
  [/\b(about|who are you|thrive|team|studio|agency)\b/i, 'about'],
  [/\b(hi|hello|hey|good (morning|afternoon|evening))\b/i, 'start'],
];

export function matchQuestion(text: string): string {
  const t = text.trim();
  if (!t) return 'fallback';
  return rules.find(([re]) => re.test(t))?.[1] ?? 'fallback';
}
