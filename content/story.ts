// Website copy rewritten from brochure ideas. Source pages noted per block.

export const hero = {
  line: 'We turn ideas into brands people remember, across print, web and multimedia.', // p.2
  // The line is shown as lead + rotating word + tail. Each word is a brochure service.
  lineLead: 'We turn ideas into',
  rotate: ['brands', 'websites', 'films', 'signage', 'campaigns'],
  lineTail: 'people remember, across print, web and multimedia.',
  meta: ['Print · Web · Multimedia', 'Full-service design agency'], // p.2
  cta: 'See the work',
  secondary: 'Start a project',
};

export const intro = {
  // p.2 "A fresh perspective"
  eyebrow: 'A fresh perspective',
  // Sasha-style lede that leads straight into the approach stages. Brochure p.2.
  lede: ['We use creative imagination', 'across print, web and multimedia', 'to energise marketing and build', 'better brands. Real-world results take:'],
  body: 'Thrive Multimedia is a full-service design agency for businesses in any market, across all media. We work closely with clients to set new directions for their print and digital marketing and to unify their branding everywhere it appears: e-commerce websites, company brochures and stationery, magazine advertising campaigns in Nigeria and abroad, and video presentations.',
};

// Pinned sequence. Each stage maps to a brochure idea.
export const process = [
  {
    word: 'Listen',
    line: 'We start with you and your market.',
    body: 'Time spent understanding the business and the sector it competes in means the work lands with the audience it is meant for.', // p.12
  },
  {
    word: 'Define',
    line: 'Then we find what the brand stands for.',
    body: 'Core values first. A brand that expresses them clearly will serve the business goals behind it.', // p.8
  },
  {
    word: 'Create',
    line: 'Every concept is made fresh.',
    body: 'Off-the-shelf is off the table. Copywriting, design, illustration, video and code all happen in-house, so ideas move freely between them.', // pp.2, 4
  },
  {
    word: 'Deliver',
    line: 'One message, every medium.',
    body: 'We roll the work out across print, web and multimedia so it speaks consistently, and judge it by the results it brings back.', // pp.2, 10
  },
];

// p.12 "Giving you the creative edge". The goals the brochure names, in its order.
export const markets = {
  eyebrow: 'Markets',
  title: 'Whatever you’re building',
  goals: [
    'Launch a new brand',
    'Refresh an old one',
    'Raise your profile',
    'Market new products',
    'Promote your services',
  ],
  body: 'We take time to understand you and your sector, so the creative is focused on the audience you need to reach. Every project gets the same enthusiasm, original thinking and marketing knowledge, so the solutions are as unique as our clients. We’ve worked intensively in some markets and welcome every industry.',
  closer: 'Any industry. Same enthusiasm.',
};

// p.2 in-house skills; Venn labels are the site's own framing.
export const about = {
  eyebrow: 'About Thrive',
  title: 'A studio with every skill under one roof.',
  body: [
    'We’re an experienced, friendly studio team in Abuja. Between us we cover the widest range of design and production fields, so clients don’t have to stitch an agency together from parts.',
    'Having those skills in the same room means a brand speaks with one voice, whether it’s on a shop sign, a phone screen or a corporate film.',
  ],
  skills: ['Copywriting', 'Design', 'Illustration', 'Video editing', 'Programming'],
  venn: [
    { id: 'creative', label: 'Creative', skills: ['Copywriting', 'Illustration'] },
    { id: 'brand', label: 'Brand', skills: ['Identity', 'Guidelines'] },
    { id: 'digital', label: 'Digital', skills: ['Websites', 'Programming'] },
    { id: 'media', label: 'Media', skills: ['Video editing', 'Animation'] },
  ],
};

export const closing = {
  title: ['Now,', 'let’s make', 'something.'],
  body: 'Tell us what you’re building. We’ll bring the ideas.',
};
