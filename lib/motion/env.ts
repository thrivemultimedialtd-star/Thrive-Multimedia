// Environment flags, kept live through matchMedia.

const listeners = new Set<() => void>();

const state = {
  reducedMotion: false,
  touch: false,
  mobile: false,
};

/** Read-only flags. Initialises lazily so layout effects can read them before MotionProvider runs. */
export const env = {
  get reducedMotion() {
    initEnv();
    return state.reducedMotion;
  },
  get touch() {
    initEnv();
    return state.touch;
  },
  get mobile() {
    initEnv();
    return state.mobile;
  },
};

let initialised = false;

export function initEnv() {
  if (initialised || typeof window === 'undefined') return;
  initialised = true;
  const rm = matchMedia('(prefers-reduced-motion: reduce)');
  const touch = matchMedia('(hover: none), (pointer: coarse)');
  const mobile = matchMedia('(max-width: 768px)');
  const update = () => {
    state.reducedMotion = rm.matches;
    state.touch = touch.matches;
    state.mobile = mobile.matches;
    document.documentElement.dataset.motion = rm.matches ? 'reduced' : 'full';
    listeners.forEach((fn) => fn());
  };
  [rm, touch, mobile].forEach((m) => m.addEventListener('change', update));
  update();
}

export function onEnvChange(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
