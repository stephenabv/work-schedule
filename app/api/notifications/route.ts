import { NextRequest, NextResponse } from "next/server";
import { sendSms } from "@/lib/semaphore";
import { buildScheduleReminderMessage } from "@/lib/notify-message";

// SMS reminders via Semaphore (https://semaphore.co). Configure
// SEMAPHORE_API_KEY and NOTIFY_PHONE_NUMBER (see .env.example) — this route
// works standalone via the "Send SMS now" button, and can also be wired to
// a scheduler (e.g. Vercel Cron) for automatic reminders before class.
// NOTIFY_PHONE_NUMBER (and the "phone" override) accept one number or
// several comma-separated numbers; the message body is always the real
// schedule reminder, never placeholder/test text.

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    configured: Boolean(process.env.SEMAPHORE_API_KEY) && Boolean(process.env.NOTIFY_PHONE_NUMBER),
    hasApiKey: Boolean(process.env.SEMAPHORE_API_KEY),
    hasPhoneNumber: Boolean(process.env.NOTIFY_PHONE_NUMBER),
  });
}

export async function POST(request: NextRequest) {
  let phone: string | undefined;
  let message: string | undefined;

  try {
    const body = await request.json();
    phone = typeof body?.phone === "string" ? body.phone : undefined;
    message = typeof body?.message === "string" ? body.message : undefined;
  } catch {
    // No/invalid JSON body — fall back to the default reminder message.
  }

  const finalMessage = message ?? buildScheduleReminderMessage();
  const result = await sendSms(finalMessage, phone);

  if (!result.success) {
    return NextResponse.json({ status: "error", error: result.error }, { status: 502 });
  }
  return NextResponse.json({ status: "sent", recipients: result.accepted, message: finalMessage });
}
