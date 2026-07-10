"use client";

import { ScheduleEntry } from "@/lib/types";
import { SCHOOL_DAYS, formatRange, getTodayName, isEntryNow } from "@/lib/time-utils";
import EntryChip from "./EntryChip";

export default function ScheduleList({ entries, now }: { entries: ScheduleEntry[]; now: Date }) {
  const today = getTodayName(now);
  const byDay = SCHOOL_DAYS.map((day) => ({
    day,
    items: entries.filter((e) => e.day === day),
  })).filter((group) => group.items.length > 0);

  if (byDay.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
        No sessions match the current filters.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {byDay.map(({ day, items }) => (
        <div
          key={day}
          className={`rounded-xl border bg-white shadow-sm dark:bg-slate-900 ${
            day === today ? "border-emerald-300 dark:border-emerald-800" : "border-slate-200 dark:border-slate-800"
          }`}
        >
          <div
            className={`flex items-center justify-between rounded-t-xl px-4 py-2 text-sm font-semibold ${
              day === today
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "bg-slate-50 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300"
            }`}
          >
            {day}
            {day === today && <span className="text-xs font-medium">Today</span>}
          </div>
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((entry) =>
              entry.type === "break" ? (
                <BreakRow key={entry.id} entry={entry} />
              ) : (
                <div key={entry.id} className="p-2">
                  <EntryChip entry={entry} isNow={isEntryNow(entry, now)} />
                </div>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function BreakRow({ entry }: { entry: ScheduleEntry }) {
  return (
    <div className="flex items-center gap-2 px-4 py-1.5 text-[11px] italic text-zinc-400 dark:text-zinc-500">
      <span className="h-px flex-1 border-t border-dashed border-zinc-300 dark:border-zinc-700" />
      {entry.title}
      {entry.start && entry.end ? ` · ${formatRange(entry.start, entry.end)}` : entry.note ? ` · ${entry.note}` : ""}
      <span className="h-px flex-1 border-t border-dashed border-zinc-300 dark:border-zinc-700" />
    </div>
  );
}
