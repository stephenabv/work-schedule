"use client";

import { DayName, SessionType } from "@/lib/types";
import { LEGEND } from "@/lib/schedule-data";
import { SCHOOL_DAYS } from "@/lib/time-utils";
import { LayoutGrid, List, RotateCcw, Search } from "lucide-react";

const DAY_ABBR: Record<DayName, string> = {
  Sunday: "Sun",
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
};

export interface Filters {
  days: DayName[];
  types: SessionType[];
  search: string;
  from: string;
  to: string;
}

export const DEFAULT_FILTERS: Filters = {
  days: [...SCHOOL_DAYS],
  types: LEGEND.map((l) => l.type),
  search: "",
  from: "07:00",
  to: "18:00",
};

export default function FilterBar({
  filters,
  onChange,
  view,
  onViewChange,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  view: "grid" | "list";
  onViewChange: (v: "grid" | "list") => void;
}) {
  function toggleDay(day: DayName) {
    const days = filters.days.includes(day)
      ? filters.days.filter((d) => d !== day)
      : [...filters.days, day];
    onChange({ ...filters, days });
  }

  function toggleType(type: SessionType) {
    const types = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];
    onChange({ ...filters, types });
  }

  const isDefault = JSON.stringify(filters) === JSON.stringify(DEFAULT_FILTERS);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search course, room, section…"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <div className="flex flex-wrap items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <label className="flex items-center gap-1">
              From
              <input
                type="time"
                value={filters.from}
                onChange={(e) => onChange({ ...filters, from: e.target.value })}
                className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"
              />
            </label>
            <label className="flex items-center gap-1">
              To
              <input
                type="time"
                value={filters.to}
                onChange={(e) => onChange({ ...filters, to: e.target.value })}
                className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"
              />
            </label>
          </div>

          <div className="flex shrink-0 items-center rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
            <button
              onClick={() => onViewChange("grid")}
              aria-label="Grid view"
              className={`rounded-md p-1.5 ${view === "grid" ? "bg-emerald-500 text-white" : "text-slate-500 dark:text-slate-400"}`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => onViewChange("list")}
              aria-label="List view"
              className={`rounded-md p-1.5 ${view === "list" ? "bg-emerald-500 text-white" : "text-slate-500 dark:text-slate-400"}`}
            >
              <List size={15} />
            </button>
          </div>

          {!isDefault && (
            <button
              onClick={() => onChange(DEFAULT_FILTERS)}
              aria-label="Reset filters"
              className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <RotateCcw size={13} />
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {SCHOOL_DAYS.map((day) => (
          <button
            key={day}
            onClick={() => toggleDay(day)}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
              filters.days.includes(day)
                ? "border-emerald-500 bg-emerald-500 text-white"
                : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            {DAY_ABBR[day]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {LEGEND.map((item) => (
          <button
            key={item.type}
            onClick={() => toggleType(item.type)}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
              filters.types.includes(item.type)
                ? "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                : "border-slate-200 text-slate-400 opacity-60 hover:opacity-100 dark:border-slate-700"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${item.swatchClass}`} />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
