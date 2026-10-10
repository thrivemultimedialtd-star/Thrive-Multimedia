// Assets extracted from THRIVE MULTIMEDIA BROCHURE.pdf — Thrive's own work and its clients' logos.
// Alt text describes only what is visible in each image.

export interface BrochureImage {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** object-position for cropping */
  position?: string;
  /** 'contain' shows the whole image on the frame's tone (used for logos). Defaults to cover. */
  fit?: 'cover' | 'contain';
}

const img = (name: string, width: number, height: number, alt: string, position?: string): BrochureImage => ({
  src: `/brochure/${name}.jpg`,
  width,
  height,
  alt,
  position,
});

export const images = {
  // Captioned projects
  'huriya-air': img('huriya-air', 1294, 1155, 'Huriya Air logo printed on a green t-shirt', '50% 45%'),
  'the-place': img('the-place', 1294, 1671, 'Illuminated “The Place Barbershop, Laundry & Carwash” sign above a shopfront', '50% 25%'),
  'market-monie': img('market-monie', 1294, 1062, 'Market Monie training presentation shown on a tablet', '50% 45%'),
  'philip-bechi': img('philip-bechi', 756, 650, 'Book cover for “The Man, The Music, The Ministry” by Philip Bechi', '40% 50%'),
  'phd-consulting': img('phd-consulting', 1294, 1070, 'PHD Consulting website open on a laptop', '45% 50%'),
  'switch-music': img('switch-music', 1292, 1062, 'Switch Music & Entertainment video on a living-room television', '50% 35%'),
  sencillo: img('sencillo', 1294, 1070, 'Sencillo website on a phone held in a hand', '50% 45%'),
  'medicaid-book': img('medicaid-book', 519, 517, 'Printed booklet carrying the 1CallAway.ng mark'),
  'medicaid-flyer': img('medicaid-flyer', 259, 258, 'Detail of an orange “1 Call Away” application-form design'),
  // Detail crops of the same brochure images, for project galleries
  'the-place-sign': img('the-place-sign', 944, 802, 'Close-up of the illuminated The Place Barbershop, Laundry & Carwash sign'),
  'philip-bechi-cover': img('philip-bechi-cover', 526, 802, 'The Philip Bechi book cover: a silhouette in a hat with a bass clef, above guitar shapes'),
  'phd-consulting-screen': img('phd-consulting-screen', 1096, 856, 'PHD Consulting homepage headline: “Looking to start your Business Analysis career?”'),
  'sencillo-screen': img('sencillo-screen', 601, 654, 'Sencillo homepage on a phone: “The perfect getaway”'),
  'switch-music-screen': img('switch-music-screen', 829, 506, 'Switch Music & Entertainment title on screen'),
  'market-monie-screen': img('market-monie-screen', 1134, 937, 'Market Monie presentation frame: “Upgrade your business”'),
  // Uncaptioned work shown in the brochure
  'cokee-perfume': img('cokee-perfume', 675, 537, 'Cokee Exclusive Perfume bottle on a green background'),
  'foreign-policy-flyer': img('foreign-policy-flyer', 1347, 887, 'Foreign Policy School flyer: United Nations Immersion Programme, 26–30 August 2024, UNITAR HQ Geneva'),
  'foreign-policy-billboard': img('foreign-policy-billboard', 494, 522, 'Foreign Policy School billboard', '50% 30%'),
  'onesite-cap': img('onesite-cap', 546, 406, 'Navy cap with an OnSite Archery logo'),
  'dtimes-magazine': img('dtimes-magazine', 546, 407, 'DTIMES magazine cover announcing Digivant'),
  'finventory-eid': img('finventory-eid', 592, 576, 'Finventory Eid al-Adha greeting with a ram illustration'),
  'farm-alert-van': img('farm-alert-van', 721, 419, 'Van in Farm Alert Logistics livery'),
  'market-monie-banner': img('market-monie-banner', 430, 479, 'Market Monie roll-up banner'),
} satisfies Record<string, BrochureImage>;

/** "More from the studio": captioned only with the brand and medium visible in each image. */
export const studioGallery: { image: BrochureImage; brand: string; medium: string }[] = [
  { image: images['farm-alert-van'], brand: 'Farm Alert Logistics', medium: 'Vehicle livery' },
  { image: images['cokee-perfume'], brand: 'Cokee Exclusive Perfume', medium: 'Packaging' },
  { image: images['foreign-policy-billboard'], brand: 'Foreign Policy School', medium: 'Billboard' },
  { image: images['finventory-eid'], brand: 'Finventory Limited', medium: 'Eid al-Adha greeting' },
  { image: images['dtimes-magazine'], brand: 'DTIMES · Digivant', medium: 'Magazine cover' },
  { image: images['foreign-policy-flyer'], brand: 'Foreign Policy School · UNITAR, NIIA & PBDC', medium: 'Flyer' },
  { image: images['onesite-cap'], brand: 'OnSite Archery', medium: 'Merchandise' },
  { image: images['market-monie-banner'], brand: 'Market Monie', medium: 'Roll-up banner' },
];

export interface Logo {
  name: string;
  src: string;
  width: number;
  height: number;
}

/** Height in rem that gives square seals and long wordmarks a similar visual weight. */
export const logoHeight = (l: Logo, base = 3.4) => +(base * Math.pow(1.6 / (l.width / l.height), 0.45)).toFixed(2);

/** A logo shown as a gallery image (whole mark, on the frame's tone). */
export const logoImage = (l: Logo, alt: string): BrochureImage => ({
  src: l.src,
  width: l.width,
  height: l.height,
  alt,
  fit: 'contain',
});

const logo = (slug: string, name: string, width: number, height: number): Logo => ({
  name,
  src: `/brochure/logos/${slug}.png`,
  width,
  height,
});

export const logos = {
  // p.3 "Who we've worked for"
  'hair-label': logo('hair-label', 'Hair Label', 212, 288),
  eems: logo('eems', 'EEMS Limited', 405, 111),
  holyhill: logo('holyhill', 'Holyhill Church', 182, 261),
  noa: logo('noa', 'National Orientation Agency', 203, 221),
  'quad-a': logo('quad-a', 'Quad A Strategic Communications', 254, 216),
  pbdc: logo('pbdc', 'Peace Building Development Consult', 401, 130),
  unitar: logo('unitar', 'UNITAR', 211, 206),
  niia: logo('niia', 'Nigerian Institute of International Affairs', 211, 205),
  'farm-alert': logo('farm-alert', 'Farm Alert', 303, 84),
  lexicon: logo('lexicon', 'Lexicon Multiconcept Media', 273, 99),
  drdb: logo('drdb', 'Defence Research and Development Bureau', 198, 182),
  // p.8 logo design & branding portfolio
  credlanche: logo('credlanche', 'Credlanche', 433, 225),
  'market-monie': logo('market-monie', 'Market Monie', 397, 141),
  finventory: logo('finventory', 'Finventory', 376, 202),
  digivant: logo('digivant', 'Digivant Microfinance Bank', 416, 245),
  '6th-element': logo('6th-element', '6th Element Analytics & Research', 341, 321),
  'capas-croft': logo('capas-croft', 'Capas Croft', 456, 336),
  'huriya-air': logo('huriya-air', 'Huriya Air', 472, 201),
  nox: logo('nox', 'Nox', 489, 205),
  onome: logo('onome', 'Onome Food Market', 312, 339),
  trailblazers: logo('trailblazers', 'Trailblazers Insurance Brokers', 378, 231),
  'croft-engineering': logo('croft-engineering', 'Croft Engineering & Project Management', 449, 181),
  'sim-jocelyn': logo('sim-jocelyn', 'Sim Jocelyn Hope Foundation', 370, 341),
  yooneek: logo('yooneek', 'Yooneek Gifts and Souvenirs', 508, 177),
  'merci-foods': logo('merci-foods', 'Merci Foods', 415, 279),
} satisfies Record<string, Logo>;
