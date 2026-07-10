"use client";

import { useEffect, useState } from "react";
import { Bell, Loader2, Send } from "lucide-react";

interface Status {
  configured: boolean;
  hasApiKey: boolean;
  hasPhoneNumber: boolean;
}

export default function NotificationsPanel() {
  const [status, setStatus] = useState<Status | null>(null);
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then(setStatus)
      .catch(() => setStatus({ configured: false, hasApiKey: false, hasPhoneNumber: false }));
  }, []);

  async function sendTest() {
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(phone.trim() ? { phone: phone.trim() } : {}),
      });
      const data = await res.json();
      setResult(
        res.ok
          ? { ok: true, text: `Sent: "${data.message}"` }
          : { ok: false, text: data.error ?? "Failed to send SMS." }
      );
    } catch {
      setResult({ ok: false, text: "Network error while sending SMS." });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
        <Bell size={16} />
        Class Reminders (SMS via Semaphore)
        {status && (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
              status.configured
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
            }`}
          >
            {status.configured ? "Configured" : "Not configured"}
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Override number (optional), e.g. 09171234567"
          className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
        <button
          onClick={sendTest}
          disabled={sending || !status?.hasApiKey}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          Send test SMS
        </button>
      </div>

      {result && (
        <p
          className={`mt-2 text-xs ${result.ok ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
        >
          {result.text}
        </p>
      )}
    </div>
  );
}
