# Thrive Multimedia

Website for Thrive Multimedia, a full-service design agency in Abuja working across print, web and multimedia.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- CSS Modules, no UI or animation libraries
- A small custom motion system in `lib/motion/`: one shared requestAnimationFrame ticker, scroll and pointer tracking, and reveal helpers. Page changes are instant. The hero's entrance is pure CSS so it never waits for JavaScript, and every effect respects `prefers-reduced-motion`
- Resend for the project brief form (optional in development)

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

```bash
npm run build   # production build
npm run lint
```

## Environment variables

Copy `.env.example` to `.env.local`:

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Emails project briefs to thrivemultimedialtd@gmail.com. In development, briefs are logged to the console without it. **In production it is required**: without it the form shows an error with email and WhatsApp fallbacks, and the brief is only logged. |
| `BRIEF_FROM` | Sender address on a domain verified in Resend (e.g. `Thrive website <briefs@thrivemultimedialtd.com>`). Without it Resend's test sender is used, which only delivers to the Resend account owner. |

## Where things live

| Path | What |
| --- | --- |
| `content/` | All site copy: services, projects, clients, story, contact details, chat script |
| `public/brochure/` | Project images, client logos and the cover pattern, extracted from the Thrive brochure |
| `components/sections/` | Home page sections (hero, intro, approach, work, services, markets, about, contact) |
| `components/motion/` | Reusable motion primitives (Reveal, TextReveal, IrisReveal, PageTransition, SectionTheme…) |
| `components/contact/BriefForm/` | The four-step project brief |
| `components/chat/ChatGuide/` | The "Ask Thrive" studio guide (scripted, no AI) |
| `app/actions/sendBrief.ts` | Server action that validates and emails briefs |
| `lib/metadata.ts` | Per-page title, description, canonical URL and social preview tags |
| `app/sitemap.ts`, `app/robots.ts`, `app/opengraph-image.tsx` | Sitemap, robots rules and the default sharing card (all built from `content/`) |
| `proxy.ts` | Sends unknown `/work/<slug>` URLs to the 404 page with a real 404 status |
| `next.config.ts` | Security headers and caching for `/brochure` and `/brand` images |

Brief budget and timeline options are in `lib/brief.ts`. Chat answers and keyword rules are in `content/chat.ts`.

The production domain lives in `content/site.ts` (`site.url`); canonical URLs, the sitemap and structured data are built on it. Adding a project to `content/projects.ts` adds its page, sitemap entry and sharing image automatically.
