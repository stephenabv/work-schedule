# WorkSched

A personal class schedule tracker for the 1st Semester, SY 2026–2027, built with Next.js (App Router), TypeScript, and Tailwind CSS.

## Features

- Responsive weekly grid view and a mobile-friendly agenda/list view (auto-selected by screen size, manually toggleable)
- Filters: by day, by session type (FabLab / Laboratory / NSTP / Available / Break), by time range, and free-text search (course, room, section)
- "Happening now" / "up next" banner that updates live
- Light/dark theme (persisted)
- Print-friendly layout
- Download the current schedule view (legend + grid/list, respecting active filters) as a PNG
- SMS class reminders via [Semaphore](https://semaphore.co) — send a test SMS on demand from the UI, or wire the API route to a scheduler for automatic reminders

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Schedule data & assumptions

All schedule data lives in `lib/schedule-data.ts`, transcribed from a handwritten timetable. Two ambiguities in the source note required an inference — both are documented as a comment directly above the data:

1. **Tue/Thu FabLab sessions** are explicitly labeled "every Thursday" in the source, so Tuesday is free during those slots.
2. **Mon/Wed/Fri FabLab sessions** only say "once a week" without naming a day. They're placed on **Monday** (`mon-*` entries) alongside the existing `(MW)`-tagged lab sessions. If the actual FabLab day differs, edit the `day` and `recurrence` fields in `lib/schedule-data.ts`.

If you'd rather show a single canonical day per event, or if a room/time was misread, `lib/schedule-data.ts` is the only file you need to touch — every view derives from it.

## SMS notifications (Semaphore)

`app/api/notifications/route.ts` sends class-reminder SMS through [Semaphore](https://semaphore.co).

**Setup:**

1. Copy `.env.example` to `.env.local` for local dev, or set the same keys directly in your Vercel project's Environment Variables (Settings → Environment Variables) for deployed use:
   - `SEMAPHORE_API_KEY` — from your Semaphore dashboard.
   - `SEMAPHORE_SENDER_NAME` — optional, a Semaphore-registered sender name (defaults to `SEMAPHORE`).
   - `NOTIFY_PHONE_NUMBER` — the PH-format number (e.g. `09171234567`) that receives reminders.
2. Redeploy after setting the variables in Vercel (env var changes only take effect on the next deployment).

**Usage:**

- `GET /api/notifications` reports whether the integration is configured (`configured`, `hasApiKey`, `hasPhoneNumber`) — no secrets are exposed.
- `POST /api/notifications` sends an SMS. Optional JSON body `{ "phone": "...", "message": "..." }` overrides the recipient and/or message; otherwise it defaults to `NOTIFY_PHONE_NUMBER` and an auto-generated "current/next class" message (see `lib/notify-message.ts`).
- The **Class Reminders** panel in the UI shows configuration status and has a "Send test SMS" button wired to the same route.

**Automatic reminders (next step):** this route sends on-demand; it isn't scheduled yet. To get reminders automatically before class, add a scheduler (e.g. [Vercel Cron](https://vercel.com/docs/cron-jobs)) that calls `POST /api/notifications` on an interval and compares against `lib/schedule-data.ts` to decide when to fire. Note Vercel's Hobby plan only allows daily cron runs — anything more frequent (e.g. every 10 minutes) needs a Pro plan or an external scheduler. A cron config isn't included here yet so it doesn't accidentally fail deployment on a plan that doesn't support it.

## Deployment

Deployed on Vercel. Framework preset: Next.js (auto-detected).
