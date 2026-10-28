// Line icons for the four services, drawn on a 24-unit grid in currentColor.
// They render as <g> so they can sit inside any SVG (the hub poster).
const line = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/** Graphic design: a pen nib. */
export const Pen = () => (
  <g {...line}>
    <path d="M12 2.5l6 8.5-3.5 10h-5L6 11z" />
    <path d="M12 2.5v8" />
    <circle cx="12" cy="12.5" r="1.8" />
  </g>
);

/** Website design & build: a browser window. */
export const Browser = () => (
  <g {...line}>
    <rect x="2.5" y="4" width="19" height="16" rx="2.2" />
    <path d="M2.5 8.5h19" />
    <path d="M5.5 12h8M5.5 15h5" opacity="0.6" />
    <rect x="15" y="11.5" width="4" height="5.5" rx="0.8" />
  </g>
);

/** Logo design & branding: an abstract mark in a ring. */
export const Mark = () => (
  <g {...line}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M12 5.5l5.5 6.5L12 18.5 6.5 12z" />
    <path d="M12 5.5v13" opacity="0.6" />
  </g>
);

/** Motion design & production: a film reel. */
export const FilmReel = () => (
  <g {...line}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="12" cy="6.6" r="2" />
    <circle cx="12" cy="17.4" r="2" />
    <circle cx="6.6" cy="12" r="2" />
    <circle cx="17.4" cy="12" r="2" />
  </g>
);

/** Filled logo-mark sketches the Corporate identity chip morphs between (MorphSVG). */
export const morph = {
  circle: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z',
  hexagon: 'M12 2.5l8.2 4.75v9.5L12 21.5l-8.2-4.75v-9.5z',
  diamond: 'M12 2l10 10-10 10L2 12z',
  leaf: 'M4 20C4 10 10 4 20 4c0 10-6 16-16 16z',
};
