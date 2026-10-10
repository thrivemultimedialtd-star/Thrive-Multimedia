import { images, logoImage, logos, type BrochureImage } from './brochure';

// Only the 8 projects the brochure captions. `brief` is the brochure's own caption line.
// Anything not in the brochure is marked placeholder and must be supplied by Thrive.
export interface Project {
  slug: string;
  number: string;
  name: string;
  serviceId: 'graphic-design' | 'website-design' | 'branding' | 'motion-design' | 'markets';
  discipline: string;
  brief: string;
  subtitle?: string;
  summary: string;
  /** Placeholder image treatment until real assets arrive. */
  visual: { tone: 'green' | 'deep' | 'charcoal' | 'mist' | 'paper' | 'clay'; label: string; ratio: string };
  /** Project image from the Thrive brochure. */
  image?: BrochureImage;
  /** Further brochure images for the project page. */
  gallery?: BrochureImage[];
}

const base: Project[] = [
  {
    slug: 'huriya-air',
    number: '01',
    name: 'Huriya Air',
    serviceId: 'branding',
    discipline: 'Branding',
    brief: 'Logo design, branding and corporate merchandise',
    summary:
      'A brand identity carried from the logo itself through to corporate merchandise.',
    visual: { tone: 'deep', label: 'Brand identity / merchandise', ratio: '16 / 10' },
  },
  {
    slug: 'the-place',
    number: '02',
    name: 'The Place',
    subtitle: 'Barbershop, Laundry & Carwash',
    serviceId: 'graphic-design',
    discipline: 'Graphic Design',
    brief: 'Signage design and installation',
    summary:
      'Signage for a barbershop, laundry and carwash, from the design on screen to the installation on the street.',
    visual: { tone: 'charcoal', label: 'Signage / storefront', ratio: '4 / 5' },
  },
  {
    slug: 'market-monie',
    number: '03',
    name: 'Market Monie',
    serviceId: 'motion-design',
    discipline: 'Motion Design',
    brief: 'Training presentation storyboard, animation, editing and build',
    summary:
      'A training presentation for Market Monie (marketmonie.com), taken from storyboard to animation, edit and final build, carrying the line “Upgrade your business.”',
    visual: { tone: 'green', label: 'Training presentation / animation', ratio: '4 / 3' },
  },
  {
    slug: 'philip-bechi',
    number: '04',
    name: 'Philip Bechi',
    subtitle: 'The Man, The Music, The Ministry',
    serviceId: 'graphic-design',
    discipline: 'Graphic Design',
    brief: 'Book cover',
    summary: 'A book cover for “The Man, The Music, The Ministry”.',
    visual: { tone: 'mist', label: 'Book cover', ratio: '3 / 4' },
  },
  {
    slug: 'phd-consulting',
    number: '05',
    name: 'PHD Consulting',
    serviceId: 'website-design',
    discipline: 'Website Design',
    brief: 'Website design and build',
    summary:
      'A website designed and built for PHD Consulting (“Data | Digital | Disruption”), whose homepage leads with “Looking to start your Business Analysis career?”',
    visual: { tone: 'paper', label: 'Website / desktop', ratio: '16 / 10' },
  },
  {
    slug: 'switch-music',
    number: '06',
    name: 'Switch Music & Ent.',
    serviceId: 'motion-design',
    discipline: 'Motion Design',
    brief: 'Corporate video storyboard, scriptwriting, editing and build',
    summary:
      'A corporate video for Switch Music & Entertainment, from storyboard and script through edit and build.',
    visual: { tone: 'charcoal', label: 'Corporate video', ratio: '16 / 9' },
  },
  {
    slug: 'sencillo',
    number: '07',
    name: 'Sencillo',
    serviceId: 'website-design',
    discipline: 'Website Design',
    brief: 'Website design and build',
    summary: 'A website for Sencillo, billed on its own homepage as the best resort in Nigeria, selling “the perfect getaway” on any screen.',
    visual: { tone: 'clay', label: 'Website / mobile', ratio: '4 / 5' },
  },
  {
    slug: 'medicaid-cancer-foundation',
    number: '08',
    name: 'Medicaid Cancer Foundation',
    serviceId: 'markets',
    discipline: 'Campaign Design',
    brief: '1 Call Away design',
    summary: 'Booklet and application-form designs for the foundation’s “1 Call Away” work, carrying the 1CallAway.ng mark.',
    visual: { tone: 'green', label: '“1 Call Away” print', ratio: '4 / 3' },
  },
];

const projectImages: Record<string, BrochureImage> = {
  'huriya-air': images['huriya-air'],
  'the-place': images['the-place'],
  'market-monie': images['market-monie'],
  'philip-bechi': images['philip-bechi'],
  'phd-consulting': images['phd-consulting'],
  'switch-music': images['switch-music'],
  sencillo: images.sencillo,
  'medicaid-cancer-foundation': images['medicaid-book'],
};

// Every further image the brochure holds for each project (detail crops, related pieces, the logo).
const galleries: Record<string, BrochureImage[]> = {
  'huriya-air': [logoImage(logos['huriya-air'], 'The Huriya Air logo')],
  'the-place': [images['the-place-sign']],
  'market-monie': [images['market-monie-screen'], images['market-monie-banner']],
  'philip-bechi': [images['philip-bechi-cover']],
  'phd-consulting': [images['phd-consulting-screen']],
  'switch-music': [images['switch-music-screen']],
  sencillo: [images['sencillo-screen']],
  'medicaid-cancer-foundation': [images['medicaid-flyer']],
};

export const projects: Project[] = base.map((p) => ({
  ...p,
  image: projectImages[p.slug],
  gallery: galleries[p.slug],
}));

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

export const nextProject = (slug: string) => {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + 1) % projects.length];
};

export const relatedProjects = (slug: string, count = 2) => {
  const current = getProject(slug);
  const same = projects.filter((p) => p.slug !== slug && p.serviceId === current?.serviceId);
  const rest = projects.filter((p) => p.slug !== slug && p.serviceId !== current?.serviceId);
  return [...same, ...rest].filter((p) => p.slug !== nextProject(slug).slug).slice(0, count);
};
