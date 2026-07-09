import { LEGEND } from "@/lib/schedule-data";

export default function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {LEGEND.map((item) => (
        <div key={item.type} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
          <span className={`h-2.5 w-2.5 rounded-full ${item.swatchClass}`} />
          {item.label}
        </div>
      ))}
    </div>
  );
}
