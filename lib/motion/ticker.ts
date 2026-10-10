// One requestAnimationFrame loop for the whole site.
// Subscribers receive (dt seconds, t ms). The loop sleeps when nobody listens.

type TickFn = (dt: number, t: number) => void;

const subscribers = new Set<TickFn>();
let rafId = 0;
let last = 0;

function frame(t: number) {
  // Cap dt so a backgrounded tab doesn't produce a giant jump on return.
  const dt = Math.min((t - (last || t)) / 1000, 1 / 20);
  last = t;
  subscribers.forEach((fn) => fn(dt, t));
  rafId = subscribers.size ? requestAnimationFrame(frame) : 0;
  if (!rafId) last = 0;
}

export function subscribe(fn: TickFn) {
  subscribers.add(fn);
  if (!rafId && typeof window !== 'undefined') rafId = requestAnimationFrame(frame);
  return () => {
    subscribers.delete(fn);
  };
}
