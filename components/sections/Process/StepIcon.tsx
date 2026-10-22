import styles from './Process.module.css';

// One simple line drawing per stage. Every shape uses pathLength="1" so CSS can draw it in.
const shapes = [
  // Listen: sound arcs reaching out from a point.
  <>
    <circle cx="5" cy="12" r="1.6" pathLength={1} />
    <path d="M9 8.5a5 5 0 0 1 0 7" pathLength={1} />
    <path d="M12.5 6a8.5 8.5 0 0 1 0 12" pathLength={1} />
    <path d="M16 3.5a12 12 0 0 1 0 17" pathLength={1} />
  </>,
  // Define: a target, narrowing to the centre.
  <>
    <circle cx="12" cy="12" r="9" pathLength={1} />
    <circle cx="12" cy="12" r="5" pathLength={1} />
    <circle cx="12" cy="12" r="1.4" pathLength={1} />
  </>,
  // Create: a four-point star, after the Thrive mark.
  <>
    <path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z" pathLength={1} />
  </>,
  // Deliver: an arrow leaving a frame.
  <>
    <path d="M10 4H4v16h16v-6" pathLength={1} />
    <path d="M12 12l9-9" pathLength={1} />
    <path d="M14 3h7v7" pathLength={1} />
  </>,
];

/** The line icon for a stage. It draws itself in when its container is revealed or becomes active. */
export default function StepIcon({ index, className }: { index: number; className?: string }) {
  return (
    <svg className={`${styles.icon} ${className ?? ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      {shapes[index]}
    </svg>
  );
}
