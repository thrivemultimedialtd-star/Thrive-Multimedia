import type { CSSProperties } from 'react';

/**
 * The hand-drawn swirl-and-peak pattern from the brochure's cover and back cover,
 * extracted as line art. It is used as a mask, so it takes the current text colour
 * and can sit on any background, as on the printed covers. `fade` is an optional
 * gradient that is intersected with the pattern (e.g. to let it dissolve downward).
 */
export default function Texture({
  className,
  size = '1100px auto',
  fade,
}: {
  className?: string;
  id?: string;
  size?: string;
  fade?: string;
}) {
  const image = fade ? `url(/brochure/pattern.png), ${fade}` : 'url(/brochure/pattern.png)';
  const maskSize = fade ? `${size}, 100% 100%` : size;
  const repeat = fade ? 'repeat, no-repeat' : 'repeat';
  const style: CSSProperties = {
    backgroundColor: 'currentColor',
    WebkitMaskImage: image,
    maskImage: image,
    WebkitMaskSize: maskSize,
    maskSize,
    WebkitMaskRepeat: repeat,
    maskRepeat: repeat,
    ...(fade ? { WebkitMaskComposite: 'source-in', maskComposite: 'intersect' } : null),
  };
  return <div className={className} aria-hidden="true" style={style} />;
}
