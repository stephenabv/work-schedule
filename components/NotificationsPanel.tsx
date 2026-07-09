"use client";

import { Bell } from "lucide-react";

const OPTIONS = [
  "Notify 10 minutes before class",
  "Notify 30 minutes before class",
  "Daily digest each morning",
];

export default function NotificationsPanel() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
        <Bell size={16} />
        Class Reminders
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          Coming soon
        </span>
      </div>
      <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
        This is a placeholder for future push/email/SMS reminders. Backend hookup lives at{" "}
        <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">app/api/notifications/route.ts</code>{" "}
        — wire it to a scheduler once a provider is chosen.
      </p>
      <div className="mt-3 flex flex-col gap-2">
        {OPTIONS.map((label) => (
          <label
            key={label}
            className="flex cursor-not-allowed items-center gap-2 text-sm text-slate-400 dark:text-slate-500"
          >
            <input type="checkbox" disabled className="h-3.5 w-3.5 rounded" />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}
