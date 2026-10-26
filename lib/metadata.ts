import type { Metadata } from 'next';
import { site } from '@/content/site';

/**
 * Per-page metadata with a canonical URL and matching social previews. Next merges `openGraph`
 * shallowly, so each page sets the whole object rather than relying on the layout's.
 */
export function pageMetadata({
  path,
  title,
  description,
  image,
}: {
  path: string;
  /** Short page title; the layout template adds "· Thrive Multimedia". Omit on the home page. */
  title?: string;
  description: string;
  /** A page-specific sharing image (public path). Defaults to the site card, app/opengraph-image. */
  image?: { url: string; width: number; height: number; alt: string };
}): Metadata {
  const card = image ?? { url: '/opengraph-image', width: 1200, height: 630, alt: `${site.name} logo` };
  const fullTitle = title ? `${title} · ${site.name}` : `${site.name}: Creative studio, Abuja`;
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName: site.name,
      locale: 'en_NG',
      url: path,
      title: fullTitle,
      description,
      images: [card],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [card.url],
    },
  };
}
