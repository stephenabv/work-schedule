const SEMAPHORE_ENDPOINT = "https://api.semaphore.co/api/v4/messages";

// Sender name shown on the recipient's phone. Must be registered and approved
// on the Semaphore account; override via SEMAPHORE_SENDER_NAME if needed.
const DEFAULT_SENDER_NAME = "AzariSolar";

export interface SendSmsResult {
  success: boolean;
  status?: number;
  /** How many recipients Semaphore accepted the message for. */
  accepted?: number;
  error?: string;
}

/**
 * Normalizes one or more phone numbers into the comma-separated list the
 * Semaphore API expects. Accepts a single number ("09171234567") or several
 * ("09171234567,09181234567", spaces around commas tolerated).
 */
export function parseRecipients(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean);
}

export async function sendSms(message: string, recipient?: string): Promise<SendSmsResult> {
  const apiKey = process.env.SEMAPHORE_API_KEY;
  const recipients = parseRecipients(recipient?.trim() ? recipient : process.env.NOTIFY_PHONE_NUMBER);

  if (!apiKey) return { success: false, error: "SEMAPHORE_API_KEY is not configured" };
  if (recipients.length === 0) return { success: false, error: "No recipient phone number configured" };

  const body = new URLSearchParams({
    apikey: apiKey,
    number: recipients.join(","),
    message,
    sendername: process.env.SEMAPHORE_SENDER_NAME?.trim() || DEFAULT_SENDER_NAME,
  });

  try {
    const res = await fetch(SEMAPHORE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(10_000),
    });

    const text = await res.text().catch(() => "");
    if (!res.ok) {
      return { success: false, status: res.status, error: text || res.statusText };
    }

    // Semaphore returns HTTP 200 even when nothing was queued (invalid API
    // key, unapproved sender name, malformed number, no credits, ...). A real
    // send returns a JSON array with one entry per recipient, each carrying a
    // message_id — anything else is an error payload and must be surfaced.
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return { success: false, status: res.status, error: `Unexpected Semaphore response: ${text}` };
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return { success: false, status: res.status, error: `Semaphore rejected the message: ${text}` };
    }

    const accepted = parsed.filter(
      (m) => typeof m === "object" && m !== null && "message_id" in m
    ).length;
    if (accepted === 0) {
      return { success: false, status: res.status, error: `Semaphore rejected the message: ${text}` };
    }

    return { success: true, status: res.status, accepted };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Request to Semaphore failed" };
  }
}
