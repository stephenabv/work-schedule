import { SCHEDULE } from "./schedule-data";
import { ScheduleEntry } from "./types";
import { formatTime, getTodayName, isEntryNow, minutesUntil } from "./time-utils";

export function buildScheduleReminderMessage(now: Date = new Date()): string {
  const today = getTodayName(now);
  const todaysReal = SCHEDULE.filter(
    (e) => e.day === today && e.start && e.end && e.type !== "break" && e.type !== "available"
  );

  const current = todaysReal.find((e) => isEntryNow(e, now));
  if (current) {
    return `WorkSched: You're in ${current.title}${current.room ? ` (${current.room})` : ""} now, until ${formatTime(current.end)}.`;
  }

  const upcoming = todaysReal
    .filter((e) => minutesUntil(e, now) !== null)
    .sort((a, b) => (minutesUntil(a, now) ?? 0) - (minutesUntil(b, now) ?? 0))[0];

  if (upcoming) {
    const mins = minutesUntil(upcoming, now) ?? 0;
    return `WorkSched: Next class is ${upcoming.title}${upcoming.room ? ` (${upcoming.room})` : ""} at ${formatTime(upcoming.start)} (in ${mins} min).`;
  }

  return `WorkSched: No more classes scheduled for today (${today}).`;
}

export const REMINDER_LEAD_MINUTES = 10;
// Must be smaller than the cron interval (see vercel.json) so each class is
// only caught by exactly one tick — wide enough to absorb a bit of cron jitter.
const REMINDER_WINDOW_MINUTES = 5;

export function getDueReminders(now: Date = new Date()): ScheduleEntry[] {
  const today = getTodayName(now);
  return SCHEDULE.filter((e) => {
    if (e.day !== today || e.type === "break" || e.type === "available") return false;
    const mins = minutesUntil(e, now);
    if (mins === null) return false;
    return mins <= REMINDER_LEAD_MINUTES && mins > REMINDER_LEAD_MINUTES - REMINDER_WINDOW_MINUTES;
  });
}

export function buildReminderMessage(entry: ScheduleEntry, now: Date = new Date()): string {
  const mins = minutesUntil(entry, now) ?? REMINDER_LEAD_MINUTES;
  return `WorkSched reminder: ${entry.title}${entry.room ? ` (${entry.room})` : ""} starts in ${mins} min at ${formatTime(entry.start)}.`;
}
