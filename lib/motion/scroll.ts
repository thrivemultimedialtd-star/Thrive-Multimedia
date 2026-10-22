// Native scroll, tracked once. Position, smoothed velocity and direction.
import { damp } from './math';
import { subscribe } from './ticker';

export const scroll = {
  y: 0,
  velocity: 0, // px per second, smoothed
  direction: 1 as 1 | -1,
  vh: 0,
  vw: 0,
};

let started = false;
let prevY = 0;

function readViewport() {
  scroll.vh = window.innerHeight;
  scroll.vw = window.innerWidth;
}

export function initScroll() {
  if (started || typeof window === 'undefined') return;
  started = true;
  readViewport();
  scroll.y = prevY = window.scrollY;
  window.addEventListener('resize', readViewport, { passive: true });
  // Velocity is the only thing that needs every frame; position reads are cheap.
  subscribe((dt) => {
    const y = window.scrollY;
    const raw = dt > 0 ? (y - prevY) / dt : 0;
    if (y !== prevY) scroll.direction = y > prevY ? 1 : -1;
    scroll.velocity = damp(scroll.velocity, raw, 8, dt);
    if (Math.abs(scroll.velocity) < 0.5) scroll.velocity = 0;
    prevY = y;
    scroll.y = y;
  });
}
