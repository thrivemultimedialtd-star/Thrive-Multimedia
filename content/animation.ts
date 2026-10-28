// The motion showcase on the homepage. It depicts only the four services the brochure names
// (content/services.ts). The headline was chosen by Thrive (Oct 28 2026) to cover all four:
// paper (graphic design), screen (web), brands, motion. The sub is the /services lede, and
// every card tag and chip label is one of a service's brochure capabilities.
import type { Service } from './services';

export interface MotionCard {
  service: Service['id'];
  tags: string[];
}

export const animation = {
  headline: 'Bringing Brands to Life on Paper, on Screen and in Motion',
  // Shown in green in the headline.
  accent: 'Motion',
  sub: 'Four disciplines under one roof, so a brand looks and sounds the same everywhere it appears.',
  // One capability per service, in service order, on the chips around the hub.
  chips: ['Print & editorial', 'Responsive sites', 'Corporate identity', 'Filming & editing'],
  cards: [
    { service: 'graphic-design', tags: ['Print & editorial', 'Illustration', 'Campaign design'] },
    { service: 'website-design', tags: ['Responsive sites', 'E-commerce', 'SEO'] },
    { service: 'branding', tags: ['Logo design', 'Corporate identity', 'Brand guidelines'] },
    { service: 'motion-design', tags: ['Animation', 'Filming', 'Editing'] },
  ] satisfies MotionCard[],
};
