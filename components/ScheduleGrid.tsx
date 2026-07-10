"use client";

import { ScheduleEntry } from "@/lib/types";
import {
  GRID_END_MINUTES,
  GRID_START_MINUTES,
  SLOT_MINUTES,
  SCHOOL_DAYS,
  gridRow,
  isEntryNow,
  minutesToLabel,
  getTodayName,
} from "@/lib/time-utils";
import EntryChip from "./EntryChip";

export default function ScheduleGrid({ entries, now }: { entries: ScheduleEntry[]; now: Date }) {
  const totalRows = (GRID_END_MINUTES - GRID_START_MINUTES) / SLOT_MINUTES;
  const timeLabels = Array.from({ length: totalRows + 1 }, (_, i) => GRID_START_MINUTES + i * SLOT_MINUTES);
  const today = getTodayName(now);

  const timed = entries.filter((e) => e.start && e.end);

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm scrollbar-thin dark:border-slate-800 dark:bg-slate-900">
      <div className="min-w-[820px]">
        <div
          className="grid"
          style={{ gridTemplateColumns: `64px repeat(${SCHOOL_DAYS.length}, minmax(0, 1fr))` }}
        >
          <div className="sticky left-0 z-10 border-b border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
          {SCHOOL_DAYS.map((day) => (
            <div
              key={day}
              className={`border-b border-slate-200 py-2 text-center text-xs font-semibold uppercase tracking-wide dark:border-slate-800 ${
                day === today ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        <div
          className="relative grid"
          style={{
            gridTemplateColumns: `64px repeat(${SCHOOL_DAYS.length}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${totalRows}, 2.75rem)`,
          }}
        >
          {timeLabels.slice(0, -1).map((minutes, i) => (
            <div
              key={minutes}
              className="border-b border-r border-slate-100 pr-2 text-right text-[10px] text-slate-400 dark:border-slate-800 dark:text-slate-500"
              style={{ gridColumn: 1, gridRow: i + 1 }}
            >
              <span className="relative -top-2">{minutesToLabel(minutes)}</span>
            </div>
          ))}

          {SCHOOL_DAYS.map((day, dayIdx) =>
            Array.from({ length: totalRows }, (_, i) => (
              <div
                key={`${day}-${i}`}
                className={`border-b border-r border-slate-100 dark:border-slate-800 ${
                  day === today ? "bg-emerald-50/40 dark:bg-emerald-950/10" : ""
                }`}
                style={{ gridColumn: dayIdx + 2, gridRow: i + 1 }}
              />
            ))
          )}

          {timed.map((entry) => {
            const dayIdx = SCHOOL_DAYS.indexOf(entry.day);
            if (dayIdx === -1) return null;
            const rowStart = gridRow(entry.start!);
            const rowEnd = gridRow(entry.end!);
            return (
              <div
                key={entry.id}
                className="p-0.5"
                style={{
                  gridColumn: dayIdx + 2,
                  gridRow: `${rowStart} / ${rowEnd}`,
                }}
              >
                <EntryChip entry={entry} isNow={isEntryNow(entry, now)} compact />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
