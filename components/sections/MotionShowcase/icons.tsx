// Line icons for the media ecosystem, drawn on a 24-unit grid in currentColor.
// They render as <g> so they can sit inside any SVG (the hub poster) or alone via <Icon>.
import type { SVGProps } from 'react';

const line = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

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

export const Lens = () => (
  <g {...line}>
    <circle cx="12" cy="12" r="9.5" />
    <circle cx="12" cy="12" r="6.5" />
    <circle cx="12" cy="12" r="3" />
    <path d="M9.6 9.3a3.4 3.4 0 0 1 2.4-.9" />
  </g>
);

export const Mic = () => (
  <g {...line}>
    <rect x="8.5" y="2.5" width="7" height="12" rx="3.5" />
    <path d="M8.5 7.5h7M8.5 10.5h7" opacity="0.5" />
    <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5v4M8.5 21.5h7" />
  </g>
);

export const Headphones = () => (
  <g {...line}>
    <path d="M3.5 15v-3a8.5 8.5 0 0 1 17 0v3" />
    <rect x="2.5" y="14" width="5" height="7" rx="1.6" />
    <rect x="16.5" y="14" width="5" height="7" rx="1.6" />
  </g>
);

export const Play = () => (
  <g {...line}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M10 8.2v7.6l6-3.8z" fill="currentColor" />
  </g>
);

export const Eq = () => (
  <g {...line}>
    <path d="M4 20v-6M8 20V8M12 20v-9M16 20V5M20 20v-8" />
  </g>
);

export function Icon({ children, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...rest}>
      {children}
    </svg>
  );
}

/** Filled shapes the broadcast play button morphs between (MorphSVG). */
export const morph = {
  play: 'M8 5v14l11-7z',
  pause: 'M7 5h3.5v14H7zM13.5 5H17v14h-3.5z',
  camera: 'M3 7h10.5A2.5 2.5 0 0 1 16 9.5v1.2l5-3.2v9l-5-3.2v1.2a2.5 2.5 0 0 1-2.5 2.5H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z',
  mic: 'M12 2a3.2 3.2 0 0 1 3.2 3.2v6.2a3.2 3.2 0 0 1-6.4 0V5.2A3.2 3.2 0 0 1 12 2zM11.1 17h1.8v4h-1.8z',
  headphones: 'M3 14v-2a9 9 0 0 1 18 0v2h-2v-2a7 7 0 0 0-14 0v2zM2.5 14H7v7H4a1.5 1.5 0 0 1-1.5-1.5zM17 14h4.5v5.5A1.5 1.5 0 0 1 20 21h-3z',
  pen: 'M12 2l6.5 9L14 21h-4L5.5 11z',
};
