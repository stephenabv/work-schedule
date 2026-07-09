import { ScheduleEntry } from "@/lib/types";
import { formatRange } from "@/lib/time-utils";

const TYPE_STYLES: Record<ScheduleEntry["type"], string> = {
  fablab:
    "bg-fablab-light text-fablab-dark border-fablab/40 dark:bg-fablab-dark/30 dark:text-pink-200 dark:border-fablab/50",
  laboratory:
    "bg-lab-light text-lab-dark border-lab/40 dark:bg-lab-dark/30 dark:text-yellow-200 dark:border-lab/50",
  nstp:
    "bg-nstp-light text-nstp-dark border-nstp/40 dark:bg-nstp-dark/30 dark:text-sky-200 dark:border-nstp/50",
  available:
    "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700",
  break:
    "bg-zinc-100 text-zinc-500 border-dashed border-zinc-300 dark:bg-zinc-800/40 dark:text-zinc-400 dark:border-zinc-600",
};

export default function EntryChip({
  entry,
  isNow,
  compact,
}: {
  entry: ScheduleEntry;
  isNow?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={`relative flex h-full w-full flex-col justify-center gap-0.5 rounded-lg border px-2 py-1.5 text-left ${TYPE_STYLES[entry.type]} ${
        isNow ? "ring-2 ring-offset-1 ring-emerald-500 dark:ring-offset-slate-950" : ""
      } ${compact ? "text-[11px]" : "text-xs"}`}
    >
      {isNow && (
        <span className="absolute -top-2 right-1 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white shadow">
          Now
        </span>
      )}
      <div className="flex items-center justify-between gap-1">
        <span className="truncate font-semibold">{entry.title}</span>
        {entry.recurrence && (
          <span className="shrink-0 rounded bg-black/5 px-1 text-[9px] font-medium dark:bg-white/10">
            {entry.recurrence}
          </span>
        )}
      </div>
      {entry.room && <span className="truncate opacity-80">{entry.room}</span>}
      <span className="truncate opacity-70">
        {entry.start ? formatRange(entry.start, entry.end) : entry.note ?? "Time varies"}
      </span>
    </div>
  );
}
