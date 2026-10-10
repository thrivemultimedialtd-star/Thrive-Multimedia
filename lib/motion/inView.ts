// A shared IntersectionObserver per configuration.
type Cb = (entry: IntersectionObserverEntry) => void;

const observers = new Map<string, { io: IntersectionObserver; cbs: Map<Element, Cb> }>();

export function observe(el: Element, cb: Cb, rootMargin = '0px 0px -12% 0px', threshold = 0) {
  const key = `${rootMargin}|${threshold}`;
  let entry = observers.get(key);
  if (!entry) {
    const cbs = new Map<Element, Cb>();
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => cbs.get(e.target)?.(e)),
      { rootMargin, threshold },
    );
    entry = { io, cbs };
    observers.set(key, entry);
  }
  entry.cbs.set(el, cb);
  entry.io.observe(el);
  const { io, cbs } = entry;
  return () => {
    cbs.delete(el);
    io.unobserve(el);
  };
}

/** Fires once when the element first enters. */
export function onceInView(el: Element, cb: () => void, rootMargin?: string) {
  const stop = observe(
    el,
    (e) => {
      if (e.isIntersecting) {
        stop();
        cb();
      }
    },
    rootMargin,
  );
  return stop;
}
