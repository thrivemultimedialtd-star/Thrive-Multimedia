// Pointer position (viewport px) and velocity, shared by cursor, physics and magnets.
export const pointer = {
  x: -9999,
  y: -9999,
  vx: 0,
  vy: 0,
  active: false,
};

let started = false;
let lastT = 0;

export function initPointer() {
  if (started || typeof window === 'undefined') return;
  started = true;
  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      const now = performance.now();
      const dt = Math.max((now - lastT) / 1000, 1 / 240);
      if (pointer.active) {
        pointer.vx = (e.clientX - pointer.x) / dt;
        pointer.vy = (e.clientY - pointer.y) / dt;
      }
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
      lastT = now;
    },
    { passive: true },
  );
  document.documentElement.addEventListener('pointerleave', () => {
    pointer.active = false;
  });
}
