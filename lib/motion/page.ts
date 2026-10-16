// Page-level state shared between the transition system and the content it reveals.
// While a transition (the home page section switch) covers the screen, entrance animations
// wait so they play in view rather than behind it.

type Navigate = (href: string, opts?: { origin?: { x: number; y: number }; fromCovered?: boolean }) => void;

let covered = false;
let waiters: Array<() => void> = [];
let navigator: Navigate | null = null;
let sectionSwitcher: ((id: string) => void) | null = null;
let fontsReady: Promise<void> | null = null;

export const page = {
  get covered() {
    return covered;
  },
  setCovered(v: boolean) {
    covered = v;
    if (!v) {
      const run = waiters;
      waiters = [];
      run.forEach((fn) => fn());
    }
  },
  /** Run cb once the page is visible (immediately if it already is). Returns a cancel. */
  whenVisible(cb: () => void) {
    if (!covered) {
      cb();
      return () => {};
    }
    waiters.push(cb);
    return () => {
      waiters = waiters.filter((w) => w !== cb);
    };
  },
  registerNavigator(fn: Navigate | null) {
    navigator = fn;
  },
  registerSectionSwitcher(fn: ((id: string) => void) | null) {
    sectionSwitcher = fn;
  },
  /** Switch to a section on the current page (Blackbook-style). Falls back to a plain jump. */
  switchSection(id: string) {
    if (sectionSwitcher) sectionSwitcher(id);
    else document.getElementById(id)?.scrollIntoView();
  },
  /** Navigate through the circle transition. Falls back to a normal navigation. */
  navigate(href: string, opts?: Parameters<Navigate>[1]) {
    if (navigator) navigator(href, opts);
    else window.location.href = href;
  },
};

/** Resolves when web fonts are ready (or after a short timeout), so type reveals don't reflow mid-flight. */
export function whenFontsReady() {
  if (!fontsReady) {
    fontsReady = Promise.race([
      document.fonts?.ready.then(() => undefined) ?? Promise.resolve(),
      new Promise<void>((r) => setTimeout(r, 1200)),
    ]);
  }
  return fontsReady;
}
