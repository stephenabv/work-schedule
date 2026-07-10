"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ScheduleEntry } from "@/lib/types";
import { parseTimeToMinutes } from "@/lib/time-utils";
import FilterBar, { DEFAULT_FILTERS, Filters } from "./FilterBar";
import ScheduleGrid from "./ScheduleGrid";
import ScheduleList from "./ScheduleList";
import NowBanner from "./NowBanner";
import Legend from "./Legend";
import ThemeToggle from "./ThemeToggle";
import NotificationsPanel from "./NotificationsPanel";
import { Download, Loader2, Printer } from "lucide-react";

export default function ScheduleApp({ initialEntries }: { initialEntries: ScheduleEntry[] }) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [view, setView] = useState<"grid" | "list">("list");
  const [now, setNow] = useState<Date>(new Date());
  const [isExporting, setIsExporting] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setView(window.innerWidth >= 768 ? "grid" : "list");
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const filteredEntries = useMemo(() => {
    const from = parseTimeToMinutes(filters.from);
    const to = parseTimeToMinutes(filters.to);
    const query = filters.search.trim().toLowerCase();

    return initialEntries.filter((entry) => {
      if (!filters.days.includes(entry.day)) return false;
      if (!filters.types.includes(entry.type)) return false;

      if (entry.start && entry.end) {
        const start = parseTimeToMinutes(entry.start);
        const end = parseTimeToMinutes(entry.end);
        if (end <= from || start >= to) return false;
      }

      if (query) {
        const haystack = `${entry.title} ${entry.room ?? ""} ${entry.recurrence ?? ""}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      return true;
    });
  }, [initialEntries, filters]);

  async function handleExportImage() {
    if (!captureRef.current || isExporting) return;
    setIsExporting(true);
    try {
      const { toPng } = await import("html-to-image");
      const isDark = document.documentElement.classList.contains("dark");
      const dataUrl = await toPng(captureRef.current, {
        backgroundColor: isDark ? "#020617" : "#f8fafc",
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `worksched-${view}-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export schedule image", err);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-4 px-3 py-5 sm:px-6 sm:py-8">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">WorkSched</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            1st Semester Schedule · SY 2026–2027
          </p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <button
            onClick={handleExportImage}
            disabled={isExporting}
            aria-label="Download schedule as image"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          </button>
          <button
            onClick={() => window.print()}
            aria-label="Print schedule"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Printer size={16} />
          </button>
          <ThemeToggle />
        </div>
      </header>

      <NowBanner entries={initialEntries} now={now} />

      <div className="no-print">
        <FilterBar filters={filters} onChange={setFilters} view={view} onViewChange={setView} />
      </div>

      <div ref={captureRef} className="flex flex-col gap-4">
        <Legend />

        {view === "grid" ? (
          <ScheduleGrid entries={filteredEntries} now={now} />
        ) : (
          <ScheduleList entries={filteredEntries} now={now} />
        )}
      </div>

      <div className="no-print">
        <NotificationsPanel />
      </div>

      <footer className="mt-2 text-center text-[11px] text-slate-400 dark:text-slate-600">
        Transcribed from the handwritten SY 2026–2027 schedule. Double-check FabLab day placements in{" "}
        <code>lib/schedule-data.ts</code> against the original note.
      </footer>
    </div>
  );
}
