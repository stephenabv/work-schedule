# WorkSched

A personal class schedule tracker for the 1st Semester, SY 2026–2027, built with Next.js (App Router), TypeScript, and Tailwind CSS.

## Features

- Responsive weekly grid view and a mobile-friendly agenda/list view (auto-selected by screen size, manually toggleable)
- Filters: by day, by session type (FabLab / Laboratory / NSTP / Available / Break), by time range, and free-text search (course, room, section)
- "Happening now" / "up next" banner that updates live
- Light/dark theme (persisted)
- Print-friendly layout
- Download the current schedule view (legend + grid/list, respecting active filters) as a PNG
- Placeholder notifications panel + `app/api/notifications/route.ts` stub for wiring up push/email/SMS reminders later

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

## Notification integration (future work)

`app/api/notifications/route.ts` currently returns `501 Not Implemented`. To wire up real reminders:

1. Pick a delivery channel (Web Push, email via Resend/SendGrid, SMS via Twilio).
2. Add a subscriptions store (KV/DB) for user preferences (which reminders, contact info).
3. Add a scheduler (e.g. Vercel Cron) that diffs `lib/schedule-data.ts` against the current time and dispatches through the chosen provider.
4. Replace the disabled toggles in `components/NotificationsPanel.tsx` with working ones once the backend exists.

## Deployment

Deployed on Vercel. Framework preset: Next.js (auto-detected).
