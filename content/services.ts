// Source: brochure pp.4–11. Capabilities are only those the brochure names.
export interface Service {
  id: string;
  number: string;
  title: string;
  short: string;
  lead: string;
  body: string;
  capabilities: string[];
  tint: string; // background tint while this service is active
}

export const services: Service[] = [
  {
    id: 'graphic-design',
    number: '01',
    title: 'Graphic Design',
    short: 'Graphic Design',
    lead: 'Design sits under everything we make.',
    body: 'Flexible and responsive to whatever the brief and the medium demand. We don’t work to rigid boundaries: every concept is generated fresh for the client in front of us, with maximum visual impact backed by marketing strategy and sound technical knowledge. That extra pinch of creativity is what gives a client the edge in its market.',
    capabilities: [
      'Print & editorial',
      'Company brochures',
      'Stationery',
      'Magazine advertising',
      'Book covers',
      'Signage',
      'Campaign design',
      'Illustration',
      'Copywriting',
    ],
    tint: '#E6EBDB',
  },
  {
    id: 'website-design',
    number: '02',
    title: 'Website Design & Build',
    short: 'Website Design',
    lead: 'Easy to update. Difficult to ignore.',
    body: 'Bespoke websites built around how each business actually works, and flexible enough to change with it, because no one can predict exactly how a market will move. Every site is responsive on any device and has SEO built in, and with e-commerce, booking systems and bespoke software in the mix, the result can be a total online business platform.',
    capabilities: ['E-commerce', 'Apps', 'Intranets', 'Responsive sites', 'SEO', 'Booking systems', 'Bespoke software'],
    tint: '#E1E6E3',
  },
  {
    id: 'branding',
    number: '03',
    title: 'Logo Design & Branding',
    short: 'Branding',
    lead: 'Identity is where marketing starts.',
    body: 'Branding can radically change how people perceive an organisation, and a well-designed brand sets it apart from the competition. We work with clients to define their core values, then build a brand that expresses them and serves the business, applied consistently across print, web and multimedia.',
    capabilities: ['Logo design', 'Corporate identity', 'Brand guidelines', 'Signage schemes', 'Livery', 'Corporate merchandise'],
    tint: '#EDE9DC',
  },
  {
    id: 'motion-design',
    number: '04',
    title: 'Motion Design & Production',
    short: 'Motion Design',
    lead: 'Complex messages, made clear. Simple ideas, made exciting.',
    body: 'We start from your marketing objectives and target audience. Then filming, editing, animation and sound work together, and we guide every project from concept and storyboard through shooting and editing, so the final piece carries the right message on the right platforms.',
    capabilities: [
      'Storyboarding',
      'Scriptwriting',
      'Filming',
      'Editing',
      'Animation',
      'Sound',
      'Training presentations',
      'Online training workshops',
      'Video presentations',
      'Corporate & promotional films',
    ],
    tint: '#E3E7DA',
  },
];
