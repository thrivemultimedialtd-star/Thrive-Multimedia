# Thrive Multimedia

Website for Thrive Multimedia, a full-service design agency in Abuja working across print, web and multimedia.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- CSS Modules, no UI or animation libraries
- A custom motion system in `lib/motion/`: one shared requestAnimationFrame ticker, scroll and pointer tracking, and a 15×17 circle grid behind the page transitions, image reveals and section switches
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
| `RESEND_API_KEY` | Emails project briefs to thrivemultimedialtd@gmail.com. Without it, briefs are logged to the server console. |
| `BRIEF_FROM` | Sender address once a domain is verified in Resend (e.g. `Thrive website <briefs@yourdomain.com>`). |

## Where things live

| Path | What |
| --- | --- |
| `content/` | All site copy: services, projects, clients, story, contact details, chat script |
| `public/brochure/` | Project images, client logos and the cover pattern, extracted from the Thrive brochure |
| `components/sections/` | Home page sections (hero, approach, work, services, markets, about, contact) |
| `components/motion/` | Reusable motion primitives (TextReveal, IrisReveal, TransitionGrid, PageTransition, SectionSwitch, Cursor…) |
| `components/contact/BriefForm/` | The four-step project brief |
| `components/chat/ChatGuide/` | The "Ask Thrive" studio guide (scripted, no AI) |
| `app/actions/sendBrief.ts` | Server action that validates and emails briefs |

Brief budget and timeline options are in `lib/brief.ts`. Chat answers and keyword rules are in `content/chat.ts`.
