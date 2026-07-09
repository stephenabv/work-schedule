const SEMAPHORE_ENDPOINT = "https://api.semaphore.co/api/v4/messages";

export interface SendSmsResult {
  success: boolean;
  status?: number;
  error?: string;
}

export async function sendSms(message: string, recipient?: string): Promise<SendSmsResult> {
  const apiKey = process.env.SEMAPHORE_API_KEY;
  const number = recipient?.trim() || process.env.NOTIFY_PHONE_NUMBER;

  if (!apiKey) return { success: false, error: "SEMAPHORE_API_KEY is not configured" };
  if (!number) return { success: false, error: "No recipient phone number configured" };

  const body = new URLSearchParams({ apikey: apiKey, number, message });
  if (process.env.SEMAPHORE_SENDER_NAME) {
    body.set("sendername", process.env.SEMAPHORE_SENDER_NAME);
  }

  try {
    const res = await fetch(SEMAPHORE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { success: false, status: res.status, error: text || res.statusText };
    }
    return { success: true, status: res.status };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Request to Semaphore failed" };
  }
}
