import { NextResponse, type NextRequest } from 'next/server';
import { projects } from '@/content/projects';

const slugs = new Set(projects.map((p) => p.slug));

// An unknown project slug is sent to an unmatched path, so it gets the site's full 404 page and a
// real 404 status. Left to the project route, it only streams a bare shell.
export function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.split('/')[2];
  if (slugs.has(slug)) return;
  return NextResponse.rewrite(new URL('/not-found', request.url));
}

export const config = {
  matcher: '/work/:slug',
};
