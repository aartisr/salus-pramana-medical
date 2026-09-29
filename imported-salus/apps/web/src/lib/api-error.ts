export class ApiError extends Error {
  readonly status: number;
  readonly endpoint: string;
  readonly details?: string;
  readonly correlationId?: string;

  constructor(message: string, status: number, endpoint: string, details?: string, correlationId?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.endpoint = endpoint;
    this.details = details;
    this.correlationId = correlationId;
  }
}

export function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const suffix = error.correlationId ? ` Ref: ${error.correlationId}` : "";
    return `${error.message} (${error.status})${suffix}`;
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

export async function fetchJson<T>(endpoint: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(endpoint, init);
  } catch {
    throw new ApiError("Unable to reach API. Ensure both web and API dev servers are running.", 0, endpoint);
  }

  if (!response.ok) {
    const correlationId = response.headers?.get?.("x-correlation-id") ?? undefined;
    const details = await response.text().catch(() => "");
    let message = "Request failed";
    let bodyCorrelationId: string | undefined;

    if (details) {
      try {
        const parsed = JSON.parse(details) as { error?: unknown; message?: unknown; correlationId?: unknown };
        if (typeof parsed.error === "string" && parsed.error.trim()) {
          message = parsed.error;
        } else if (typeof parsed.message === "string" && parsed.message.trim()) {
          message = parsed.message;
        }
        if (typeof parsed.correlationId === "string" && parsed.correlationId.trim()) {
          bodyCorrelationId = parsed.correlationId;
        }
      } catch {
        // keep plain text details when body is not JSON
      }
    }

    throw new ApiError(message, response.status, endpoint, details, bodyCorrelationId ?? correlationId);
  }

  return response.json() as Promise<T>;
}
