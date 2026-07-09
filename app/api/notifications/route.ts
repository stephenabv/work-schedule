import { NextResponse } from "next/server";

// Placeholder for future class-reminder notifications (push / email / SMS).
// Wire this up to a scheduler (e.g. Vercel Cron) that reads lib/schedule-data.ts,
// diffs against the current time, and dispatches through whatever provider is
// chosen (web push, Resend/SendGrid email, Twilio SMS, etc.) plus a
// subscriptions store (KV/DB) for user preferences.

export async function GET() {
  return NextResponse.json(
    { status: "not_implemented", message: "Notification integration is not set up yet." },
    { status: 501 }
  );
}

export async function POST() {
  return NextResponse.json(
    { status: "not_implemented", message: "Notification integration is not set up yet." },
    { status: 501 }
  );
}
