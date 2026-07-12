# WorkSched

A personal class schedule tracker for the 1st Semester, SY 2026–2027, built with Next.js (App Router), TypeScript, and Tailwind CSS.

## Features

- Responsive weekly grid view and a mobile-friendly agenda/list view (auto-selected by screen size, manually toggleable)
- Filters: by day, by session type (FabLab / Laboratory / NSTP / Available / Break), by time range, and free-text search (course, room, section)
- "Happening now" / "up next" banner that updates live
- Light/dark theme (persisted)
- Print-friendly layout
- Download the current schedule view (legend + grid/list, respecting active filters) as a PNG
- SMS class reminders via [Semaphore](https://semaphore.co) — send a test SMS on demand from the UI, plus automatic reminders shortly before each class starts and before it ends (Mon–Sat) via a scheduled GitHub Actions workflow

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
   - `CRON_SECRET` — a random string that authorizes calls to the cron endpoint (see below). Required for the automatic reminders to work, since the GitHub Actions workflow sends it.
2. Redeploy after setting the variables in Vercel (env var changes only take effect on the next deployment).
3. Add the same `CRON_SECRET` value as a GitHub Actions secret on this repo: Settings → Secrets and variables → Actions → New repository secret, named `CRON_SECRET`.

**On-demand usage:**

- `GET /api/notifications` reports whether the integration is configured (`configured`, `hasApiKey`, `hasPhoneNumber`) — no secrets are exposed.
- `POST /api/notifications` sends an SMS. Optional JSON body `{ "phone": "...", "message": "..." }` overrides the recipient and/or message; otherwise it defaults to `NOTIFY_PHONE_NUMBER` and an auto-generated "current/next class" message (see `lib/notify-message.ts`).
- The **Class Reminders** panel in the UI shows configuration status and has a "Send test SMS" button wired to the same route.

**Automatic reminders:** Vercel's Hobby plan only allows daily cron runs, so instead of Vercel Cron, `.github/workflows/sms-reminders.yml` calls `GET /api/notifications/cron` with the `CRON_SECRET` as a bearer token. Rather than polling on an interval, the workflow fires once per reminder — Monday to Saturday, 15 minutes before each class starts and 10 minutes before each class ends (e.g. an 8:00–10:00 class is pinged at 7:45 and 9:50; since GitHub's schedule triggers usually run a few minutes late, the SMS lands roughly 10 / 5 minutes ahead). The workflow forwards the cron expression that triggered it (`X-Github-Schedule` header), and the route maps it back to the exact class(es) it was scheduled for (see `lib/reminder-ticks.ts`), so each class gets exactly one "starts soon" and one "ends soon" SMS — no message tokens are spent outside those moments, and a late-firing cron neither misses nor duplicates a reminder. Manual runs (`workflow_dispatch` or a plain request without the header) fall back to the old behavior: remind about any class starting within the next 6–10 minutes.

The cron entries in the workflow are **generated** from `lib/schedule-data.ts` — after changing the schedule, run `npm run generate:crons` and commit the updated workflow file.

Notes:
- The workflow hardcodes the production URL (`https://work-schedule-ivory.vercel.app`) — update it if the deployment domain ever changes.
- GitHub's schedule triggers are best-effort and can run a few minutes late, especially under high platform load; the ticks fire early on purpose so a typical delay still lands the SMS before class. In rare cases GitHub may skip a scheduled run entirely — that reminder is then skipped rather than sent late the next day.
- Cron times in the workflow are UTC; the schedule data is Philippine time (UTC+8). The conversion is handled by the generator and by the route's reverse mapping.
- GitHub disables scheduled workflows automatically after 60 days of repo inactivity — push a commit (or re-enable it manually under the Actions tab) if reminders stop firing after a long break.
- If you'd rather not depend on GitHub Actions, upgrading the Vercel project to Pro removes the daily-cron restriction; you'd add back a `vercel.json` with a `crons` entry pointing at the same route.

## Deployment

Deployed on Vercel. Framework preset: Next.js (auto-detected).
