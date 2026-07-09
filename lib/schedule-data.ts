import { LegendItem, ScheduleEntry } from "./types";

/**
 * Transcribed from the handwritten SY 2026-2027, 1st Semester schedule.
 *
 * Two inferences were needed where the source note left a day ambiguous:
 * 1. On the Tue/Thu block, FabLab sessions are explicitly "every Thursday" —
 *    Tuesday itself is free during those slots.
 * 2. On the Mon/Wed/Fri block, FabLab sessions only say "once a week" with
 *    no day named. Mon & Wed are already filled by (MW)-tagged lab sessions,
 *    so by analogy with the Thursday pattern above, they're placed on Friday
 *    (the day otherwise mostly free). Adjust `recurrence`/`day` below if the
 *    actual FabLab day differs.
 */
export const SCHEDULE: ScheduleEntry[] = [
  // ---- Monday ----
  { id: "mon-1", day: "Monday", start: "07:30", end: "09:30", type: "available", title: "Available" },
  { id: "mon-2", day: "Monday", start: "09:30", end: "10:30", type: "available", title: "Available" },
  { id: "mon-3", day: "Monday", start: "10:30", end: "11:30", type: "laboratory", title: "CCS101 E", room: "Laboratory 102C", recurrence: "MWF" },
  { id: "mon-4", day: "Monday", start: "11:30", end: "12:30", type: "available", title: "Available" },
  { id: "mon-5", day: "Monday", start: "12:30", end: "14:00", type: "laboratory", title: "WS101A C", room: "Laboratory 007-1B", recurrence: "MW" },
  { id: "mon-6", day: "Monday", start: null, end: null, type: "break", title: "Break", note: "~30 min (time approximate per source note)" },
  { id: "mon-7", day: "Monday", start: "14:00", end: "16:00", type: "laboratory", title: "CCS101 A", room: "Laboratory 007-1B", recurrence: "MW" },

  // ---- Tuesday ----
  { id: "tue-1", day: "Tuesday", start: "07:30", end: "08:00", type: "available", title: "Available" },
  { id: "tue-2", day: "Tuesday", start: "08:00", end: "09:00", type: "available", title: "Available" },
  { id: "tue-3", day: "Tuesday", start: "09:00", end: "10:30", type: "laboratory", title: "CCS101 C", room: "Laboratory 503", recurrence: "TTH" },
  { id: "tue-4", day: "Tuesday", start: "10:30", end: "11:00", type: "break", title: "Break" },
  { id: "tue-5", day: "Tuesday", start: "11:00", end: "12:00", type: "available", title: "Available" },
  { id: "tue-6", day: "Tuesday", start: "12:00", end: "13:30", type: "laboratory", title: "WS101A D", room: "Laboratory 102C", recurrence: "TTH" },
  { id: "tue-7", day: "Tuesday", start: "13:30", end: "15:00", type: "laboratory", title: "CCS101 D", room: "Laboratory 503C", recurrence: "TTH" },
  { id: "tue-8", day: "Tuesday", start: "15:00", end: "15:30", type: "break", title: "Break" },
  { id: "tue-9", day: "Tuesday", start: "15:30", end: "16:30", type: "available", title: "Available" },

  // ---- Wednesday (mirrors Monday) ----
  { id: "wed-1", day: "Wednesday", start: "07:30", end: "09:30", type: "available", title: "Available" },
  { id: "wed-2", day: "Wednesday", start: "09:30", end: "10:30", type: "available", title: "Available" },
  { id: "wed-3", day: "Wednesday", start: "10:30", end: "11:30", type: "laboratory", title: "CCS101 E", room: "Laboratory 102C", recurrence: "MWF" },
  { id: "wed-4", day: "Wednesday", start: "11:30", end: "12:30", type: "available", title: "Available" },
  { id: "wed-5", day: "Wednesday", start: "12:30", end: "14:00", type: "laboratory", title: "WS101A C", room: "Laboratory 007-1B", recurrence: "MW" },
  { id: "wed-6", day: "Wednesday", start: null, end: null, type: "break", title: "Break", note: "~30 min (time approximate per source note)" },
  { id: "wed-7", day: "Wednesday", start: "14:00", end: "16:00", type: "laboratory", title: "CCS101 A", room: "Laboratory 007-1B", recurrence: "MW" },

  // ---- Thursday ----
  { id: "thu-1", day: "Thursday", start: "07:30", end: "08:00", type: "available", title: "Available" },
  { id: "thu-2", day: "Thursday", start: "08:00", end: "09:00", type: "fablab", title: "CCS101 C", room: "FabLab", recurrence: "Every Thursday" },
  { id: "thu-3", day: "Thursday", start: "09:00", end: "10:30", type: "laboratory", title: "CCS101 C", room: "Laboratory 503", recurrence: "TTH" },
  { id: "thu-4", day: "Thursday", start: "10:30", end: "11:00", type: "break", title: "Break" },
  { id: "thu-5", day: "Thursday", start: "11:00", end: "12:00", type: "fablab", title: "WS101A D", room: "FabLab", recurrence: "Every Thursday" },
  { id: "thu-6", day: "Thursday", start: "12:00", end: "13:30", type: "laboratory", title: "WS101A D", room: "Laboratory 102C", recurrence: "TTH" },
  { id: "thu-7", day: "Thursday", start: "13:30", end: "15:00", type: "laboratory", title: "CCS101 D", room: "Laboratory 503C", recurrence: "TTH" },
  { id: "thu-8", day: "Thursday", start: "15:00", end: "15:30", type: "break", title: "Break" },
  { id: "thu-9", day: "Thursday", start: "15:30", end: "16:30", type: "fablab", title: "CCS101 D", room: "FabLab", recurrence: "Every Thursday" },

  // ---- Friday ----
  { id: "fri-1", day: "Friday", start: "07:30", end: "09:30", type: "available", title: "Available" },
  { id: "fri-2", day: "Friday", start: "09:30", end: "10:30", type: "fablab", title: "CCS101 E", room: "FabLab", recurrence: "Once a week" },
  { id: "fri-3", day: "Friday", start: "10:30", end: "11:30", type: "laboratory", title: "CCS101 E", room: "Laboratory 102C", recurrence: "MWF" },
  { id: "fri-4", day: "Friday", start: "11:30", end: "12:30", type: "fablab", title: "WS101A C", room: "FabLab", recurrence: "Once a week" },
  { id: "fri-5", day: "Friday", start: "12:30", end: "16:30", type: "available", title: "Available" },
  { id: "fri-6", day: "Friday", start: "16:30", end: "17:30", type: "fablab", title: "CCS101 A", room: "FabLab", recurrence: "Once a week" },

  // ---- Saturday ----
  { id: "sat-1", day: "Saturday", start: "08:00", end: "11:00", type: "nstp", title: "NSTP-CWTS", room: "214-B" },
  { id: "sat-2", day: "Saturday", start: "11:00", end: "12:00", type: "break", title: "Lunch Break" },
  { id: "sat-3", day: "Saturday", start: "12:00", end: "15:00", type: "nstp", title: "NSTP-CWTS", room: "209-B" },
];

export const LEGEND: LegendItem[] = [
  { type: "fablab", label: "FabLab", swatchClass: "bg-fablab" },
  { type: "laboratory", label: "Laboratory", swatchClass: "bg-lab" },
  { type: "nstp", label: "NSTP-CWTS", swatchClass: "bg-nstp" },
  { type: "available", label: "Available", swatchClass: "bg-slate-300 dark:bg-slate-600" },
  { type: "break", label: "Break", swatchClass: "bg-zinc-300 dark:bg-zinc-600" },
];
