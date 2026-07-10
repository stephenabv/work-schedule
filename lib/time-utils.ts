import { DayName, ScheduleEntry } from "./types";

export const DAY_ORDER: DayName[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const SCHOOL_DAYS: DayName[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const GRID_START_MINUTES = 7 * 60;
export const GRID_END_MINUTES = 18 * 60;
export const SLOT_MINUTES = 30;

export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToLabel(totalMinutes: number): string {
  const h24 = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}

export function formatTime(time: string | null): string {
  if (!time) return "~";
  return minutesToLabel(parseTimeToMinutes(time));
}

export function formatRange(start: string | null, end: string | null): string {
  if (!start || !end) return "Time varies";
  return `${formatTime(start)} – ${formatTime(end)}`;
}

export function gridRow(time: string): number {
  const minutes = parseTimeToMinutes(time) - GRID_START_MINUTES;
  return Math.round(minutes / SLOT_MINUTES) + 1;
}

export function getTodayName(now: Date): DayName {
  return DAY_ORDER[now.getDay()];
}

export function isEntryNow(entry: ScheduleEntry, now: Date): boolean {
  if (!entry.start || !entry.end) return false;
  if (entry.day !== getTodayName(now)) return false;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return (
    nowMinutes >= parseTimeToMinutes(entry.start) &&
    nowMinutes < parseTimeToMinutes(entry.end)
  );
}

export function minutesUntil(entry: ScheduleEntry, now: Date): number | null {
  if (!entry.start) return null;
  if (entry.day !== getTodayName(now)) return null;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const diff = parseTimeToMinutes(entry.start) - nowMinutes;
  return diff >= 0 ? diff : null;
}
