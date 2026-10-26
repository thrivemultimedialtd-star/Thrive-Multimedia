import type { MetadataRoute } from 'next';
import { site } from '@/content/site';
import { projects } from '@/content/projects';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['', '/work', '/services', '/about', '/contact'].map((path) => ({
    url: `${site.url}${path}`,
    priority: path ? 0.8 : 1,
  }));
  const work = projects.map((p) => ({ url: `${site.url}/work/${p.slug}`, priority: 0.6 }));
  return [...pages, ...work];
}
