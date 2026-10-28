// The motion showcase on the homepage. Supplied by Thrive (brief, Oct 28 2026), not the brochure.
export interface MotionCard {
  id: 'character' | 'vfx' | 'broadcast';
  number: string;
  title: string;
  tags: string[];
}

export const animation = {
  eyebrow: 'Animation',
  headline: 'Bringing Stories to Life Through Motion',
  // Shown in green in the headline.
  accent: 'Motion',
  sub: 'From 2D/3D animation and visual effects to dynamic motion graphics—we power the visual universe of Thrive Multimedia Ltd.',
  // The four corners of the media ecosystem around the hub.
  ecosystem: ['Video & Film', 'Audio & Podcast', 'Design & Digital Media', 'Broadcast & Motion'],
  cards: [
    { id: 'character', number: '01', title: '2D & 3D Character Animation', tags: ['Idle loops', 'Rigging'] },
    { id: 'vfx', number: '02', title: 'Motion Graphics & VFX', tags: ['Light leaks', 'Keyframes'] },
    { id: 'broadcast', number: '03', title: 'Commercial & Broadcast Motion', tags: ['Lens', 'Playback'] },
  ] satisfies MotionCard[],
};
