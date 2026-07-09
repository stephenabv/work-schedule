import { SCHEDULE } from "./schedule-data";
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
