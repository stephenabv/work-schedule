import { NextRequest, NextResponse } from "next/server";
import { sendSms } from "@/lib/semaphore";
import { buildReminderMessage, getDueReminders } from "@/lib/notify-message";

// Invoked every 10 minutes by the GitHub Actions workflow at
// .github/workflows/sms-reminders.yml (Vercel's Hobby plan only allows daily
// cron, so this runs outside Vercel instead). Checks lib/schedule-data.ts for
// any class starting within the reminder window and texts a reminder for
// each one via Semaphore.
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
  const due = getDueReminders(now);

  const results = await Promise.all(
    due.map(async (entry) => {
      const message = buildReminderMessage(entry, now);
      const result = await sendSms(message);
      return { entry: entry.title, message, success: result.success, error: result.error };
    })
  );

  return NextResponse.json({ checkedAt: now.toISOString(), sent: results.length, results });
}
