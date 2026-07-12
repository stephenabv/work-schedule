import { SCHEDULE } from "./schedule-data";
import { DayName, ScheduleEntry } from "./types";
import { DAY_ORDER, parseTimeToMinutes } from "./time-utils";

/**
 * Targeted reminder "ticks" for the SMS cron.
 *
 * Instead of pinging /api/notifications/cron on a fixed interval, the GitHub
 * Actions workflow fires once per reminder: before every class start and
 * before every class end, Monday–Saturday. Each cron entry is generated from
 * the schedule below (see scripts/generate-reminder-crons.ts), and the route
 * maps the firing cron expression back to the exact class(es) it was
 * scheduled for — so each class gets exactly one start SMS and one end SMS,
 * even when GitHub delivers the cron event late.
 *
 * Ticks are scheduled a little ahead of the notification target because
 * GitHub's schedule triggers are best-effort and usually run a few minutes
 * late: an 8:00–10:00 class is pinged at 7:45 and 9:50, so the SMS lands
 * roughly 10 minutes before start and 5 minutes before end.
 */
export const START_TICK_LEAD_MINUTES = 15;
export const END_TICK_LEAD_MINUTES = 10;

// Schedule times in lib/schedule-data.ts are Philippine local time (UTC+8,
// no DST), while GitHub Actions cron runs in UTC.
export const SCHEDULE_UTC_OFFSET_MINUTES = 8 * 60;

// A cron fire older than this is ignored rather than matched to a tick —
// guards against a stray retry re-sending a long-past reminder.
const MAX_FIRE_AGE_MS = 3 * 60 * 60 * 1000;

const MINUTES_PER_DAY = 24 * 60;

export type ReminderKind = "start" | "end";

export interface TickReminder {
  entry: ScheduleEntry;
  kind: ReminderKind;
}

export interface ReminderTick {
  day: DayName;
  /** Minutes since local (UTC+8) midnight. */
  minutes: number;
}

function isNotifiable(e: ScheduleEntry): e is ScheduleEntry & { start: string; end: string } {
  return e.type !== "break" && e.type !== "available" && Boolean(e.start) && Boolean(e.end);
}

/** All unique local-time ticks the workflow needs, derived from the schedule. */
export function getReminderTicks(): ReminderTick[] {
  const seen = new Set<string>();
  const ticks: ReminderTick[] = [];
  for (const entry of SCHEDULE) {
    if (!isNotifiable(entry)) continue;
    const candidates = [
      parseTimeToMinutes(entry.start) - START_TICK_LEAD_MINUTES,
      parseTimeToMinutes(entry.end) - END_TICK_LEAD_MINUTES,
    ];
    for (const minutes of candidates) {
      const key = `${entry.day}@${minutes}`;
      if (seen.has(key)) continue;
      seen.add(key);
      ticks.push({ day: entry.day, minutes });
    }
  }
  return ticks;
}

/** The class reminders a given tick was scheduled for. */
export function getRemindersForTick(tick: ReminderTick): TickReminder[] {
  const due: TickReminder[] = [];
  for (const entry of SCHEDULE) {
    if (entry.day !== tick.day || !isNotifiable(entry)) continue;
    if (parseTimeToMinutes(entry.start) - START_TICK_LEAD_MINUTES === tick.minutes) {
      due.push({ entry, kind: "start" });
    }
    if (parseTimeToMinutes(entry.end) - END_TICK_LEAD_MINUTES === tick.minutes) {
      due.push({ entry, kind: "end" });
    }
  }
  return due;
}

interface UtcTick {
  dow: number; // 0 = Sunday … 6 = Saturday, in UTC
  hour: number;
  minute: number;
}

function toUtc(tick: ReminderTick): UtcTick {
  const localDow = DAY_ORDER.indexOf(tick.day);
  const shifted = tick.minutes - SCHEDULE_UTC_OFFSET_MINUTES;
  const utcMinutes = ((shifted % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const dayShift = Math.floor(shifted / MINUTES_PER_DAY);
  return {
    dow: (localDow + dayShift + 7) % 7,
    hour: Math.floor(utcMinutes / 60),
    minute: utcMinutes % 60,
  };
}

/**
 * The UTC cron expressions for every reminder tick, one line per distinct
 * time of day (days of week sharing a time are grouped). This is the source
 * of truth for the `schedule:` block in .github/workflows/sms-reminders.yml.
 */
export function buildCronExpressions(): string[] {
  const byTime = new Map<string, Set<number>>();
  for (const tick of getReminderTicks()) {
    const utc = toUtc(tick);
    const key = `${utc.minute} ${utc.hour}`;
    if (!byTime.has(key)) byTime.set(key, new Set());
    byTime.get(key)!.add(utc.dow);
  }
  return Array.from(byTime.entries())
    .map(([key, dows]) => {
      const [minute, hour] = key.split(" ").map(Number);
      const dowList = Array.from(dows).sort((a, b) => a - b).join(",");
      return { minute, hour, expr: `${minute} ${hour} * * ${dowList}` };
    })
    .sort((a, b) => a.hour - b.hour || a.minute - b.minute)
    .map((c) => c.expr);
}

/**
 * Given the cron expression that triggered a workflow run
 * (github.event.schedule), work out when that fire was actually scheduled
 * for, in UTC. Returns null when the expression is malformed or the
 * scheduled moment isn't in the recent past.
 */
export function resolveCronFire(expression: string, now: Date): Date | null {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return null;
  const minute = Number(parts[0]);
  const hour = Number(parts[1]);
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) return null;
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return null;
  if (parts[2] !== "*" || parts[3] !== "*") return null;

  const dows = new Set<number>();
  if (parts[4] === "*") {
    for (let d = 0; d < 7; d++) dows.add(d);
  } else {
    for (const piece of parts[4].split(",")) {
      const dow = Number(piece);
      if (!Number.isInteger(dow) || dow < 0 || dow > 6) return null;
      dows.add(dow);
    }
  }

  // The scheduled moment is today or yesterday at hour:minute UTC — whichever
  // is the most recent one not in the future (fires near midnight UTC can be
  // delivered after the UTC date has rolled over).
  for (const daysBack of [0, 1]) {
    const candidate = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - daysBack,
      hour,
      minute
    ));
    const age = now.getTime() - candidate.getTime();
    if (age >= 0 && age <= MAX_FIRE_AGE_MS && dows.has(candidate.getUTCDay())) {
      return candidate;
    }
  }
  return null;
}

/** Convert a UTC fire time back to the local (UTC+8) schedule tick. */
export function tickFromCronFire(fire: Date): ReminderTick {
  const local = new Date(fire.getTime() + SCHEDULE_UTC_OFFSET_MINUTES * 60 * 1000);
  return {
    day: DAY_ORDER[local.getUTCDay()],
    minutes: local.getUTCHours() * 60 + local.getUTCMinutes(),
  };
}
