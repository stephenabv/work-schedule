"use client";

import { ScheduleEntry } from "@/lib/types";
import { formatTime, getTodayName, isEntryNow, minutesUntil } from "@/lib/time-utils";
import { CalendarClock } from "lucide-react";

export default function NowBanner({ entries, now }: { entries: ScheduleEntry[]; now: Date }) {
  const today = getTodayName(now);
  const todaysReal = entries.filter(
    (e) => e.day === today && e.start && e.end && e.type !== "break" && e.type !== "available"
  );

  const current = todaysReal.find((e) => isEntryNow(e, now));
  const upcoming = todaysReal
    .filter((e) => !current && minutesUntil(e, now) !== null)
    .sort((a, b) => (minutesUntil(a, now) ?? 0) - (minutesUntil(b, now) ?? 0))[0];

  let message: string;
  if (current) {
    message = `Happening now: ${current.title}${current.room ? ` · ${current.room}` : ""} — until ${formatTime(current.end)}`;
  } else if (upcoming) {
    const mins = minutesUntil(upcoming, now) ?? 0;
    message = `Up next: ${upcoming.title} at ${formatTime(upcoming.start)} (in ${mins} min)`;
  } else if (today === "Sunday") {
    message = "No classes on Sunday — enjoy your day off.";
  } else {
    message = "No more classes scheduled for today.";
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
      <CalendarClock size={16} className="shrink-0" />
      <span>{message}</span>
    </div>
  );
}
