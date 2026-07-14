import { NextRequest, NextResponse } from "next/server";
import { sendSms } from "@/lib/semaphore";
import {
  buildReminderMessage,
  buildScheduleReminderMessage,
  buildTickReminderMessage,
  getDueReminders,
} from "@/lib/notify-message";
import {
  END_TICK_LEAD_MINUTES,
  START_TICK_LEAD_MINUTES,
  ReminderKind,
  TickReminder,
  getRemindersForTick,
  resolveCronFire,
  tickFromCronFire,
} from "@/lib/reminder-ticks";

// Invoked by the GitHub Actions workflow at .github/workflows/sms-reminders.yml
// (Vercel's Hobby plan only allows daily cron, so this runs outside Vercel
// instead). Rather than polling on an interval, the workflow fires once per
// reminder — Monday to Saturday, shortly before each class starts and before
// each class ends — and forwards the cron expression that triggered it in the
// X-Github-Schedule header. That expression is mapped back to the exact
// class(es) it was scheduled for (see lib/reminder-ticks.ts), so each class
// gets exactly one "starts soon" and one "ends soon" SMS and no message is
// spent outside those moments.
//
// Requests without a cron expression (e.g. manual workflow_dispatch runs)
// always send an SMS: any class starting within the getDueReminders window
// if there is one, otherwise the current/next-class schedule summary — so
// manually triggering the workflow reliably delivers a real message instead
// of silently sending nothing outside a reminder window.
//
// If CRON_SECRET is set, only requests carrying a matching
// "Authorization: Bearer <CRON_SECRET>" header are accepted — the workflow
// sends this header via a GitHub Actions secret of the same name, which
// keeps this endpoint from being triggered by anyone who finds the URL.

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const cronExpression =
    request.headers.get("x-github-schedule")?.trim() ||
    request.nextUrl.searchParams.get("schedule")?.trim();

  if (cronExpression) {
    const fire = resolveCronFire(cronExpression, now);
    if (!fire) {
      return NextResponse.json(
        {
          error:
            `Could not parse cron expression "${cronExpression}" as a reminder tick. ` +
            "If the schedule changed, regenerate the workflow crons with `npm run generate:crons`.",
        },
        { status: 400 }
      );
    }

    const tick = tickFromCronFire(fire);
    const due = getRemindersForTick(tick);

    // GitHub delivers schedule events late — sometimes by hours. A reminder
    // is only worth an SMS while its class start/end is still ahead of us;
    // anything already in the past is reported as skipped, not sent, and the
    // run still counts as a success (a red workflow should mean
    // misconfiguration, not GitHub running behind).
    const timely: (TickReminder & { minutesLeft: number })[] = [];
    const skipped: { entry: string; kind: ReminderKind; minutesLate: number }[] = [];
    for (const { entry, kind } of due) {
      const lead = kind === "start" ? START_TICK_LEAD_MINUTES : END_TICK_LEAD_MINUTES;
      const target = fire.getTime() + lead * 60 * 1000;
      const minutesLeft = Math.round((target - now.getTime()) / 60_000);
      if (minutesLeft <= 0) {
        skipped.push({ entry: entry.title, kind, minutesLate: -minutesLeft });
      } else {
        timely.push({ entry, kind, minutesLeft });
      }
    }

    const results = await Promise.all(
      timely.map(async ({ entry, kind, minutesLeft }) => {
        const message = buildTickReminderMessage(entry, kind, minutesLeft);
        const result = await sendSms(message);
        return { entry: entry.title, kind, message, success: result.success, error: result.error };
      })
    );

    // A failed send (bad API key, unapproved sender name, invalid number,
    // no credits) is misconfiguration and should show up as a red workflow
    // run, unlike stale reminders which are merely skipped.
    const ok = results.every((r) => r.success);
    return NextResponse.json(
      {
        checkedAt: now.toISOString(),
        schedule: cronExpression,
        scheduledFor: fire.toISOString(),
        tick,
        sent: results.filter((r) => r.success).length,
        skipped,
        results,
      },
      { status: ok ? 200 : 502 }
    );
  }

  const due = getDueReminders(now);

  const results = await Promise.all(
    due.map(async (entry) => {
      const message = buildReminderMessage(entry, now);
      const result = await sendSms(message);
      return { entry: entry.title, message, success: result.success, error: result.error };
    })
  );

  // Manual runs with no class due still send the schedule summary, so
  // triggering the workflow always produces a text message.
  if (results.length === 0) {
    const message = buildScheduleReminderMessage(now);
    const result = await sendSms(message);
    results.push({ entry: "Schedule summary", message, success: result.success, error: result.error });
  }

  const sent = results.filter((r) => r.success).length;
  const ok = results.every((r) => r.success);
  return NextResponse.json(
    { checkedAt: now.toISOString(), sent, results },
    { status: ok ? 200 : 502 }
  );
}
