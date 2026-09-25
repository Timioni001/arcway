/** Shapes shared by API routes and client hooks. */
import type { ActivityItem } from "./server/activity";

export type { ActivityItem };

export type ProgressResponse = {
  address: string;
  eligibility: Record<string, { eligible: boolean; reason?: string }>;
  completed: string[];
  recordingEnabled: boolean;
};

export type ClaimResponse =
  | { status: "submitted"; txHash: string }
  | { status: "already_recorded" };

export type ApiErrorCode =
  | "invalid_request"
  | "recording_unavailable"
  | "rate_limited"
  | "not_eligible"
  | "arc_unavailable"
  | "submit_failed";

export type ApiError = { error: ApiErrorCode; message: string; retryAfterSeconds?: number };

export class ApiRequestError extends Error {
  constructor(public readonly code: ApiErrorCode | "network", message: string, public readonly retryAfterSeconds?: number) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export async function apiFetch<T>(input: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(input, init);
  } catch {
    throw new ApiRequestError("network", "You appear to be offline. Check your connection and try again.");
  }
  const body = await res.json().catch(() => undefined);
  if (!res.ok) {
    const err = body as ApiError | undefined;
    throw new ApiRequestError(err?.error ?? "arc_unavailable", err?.message ?? "Something went wrong. Please try again.", err?.retryAfterSeconds);
  }
  return body as T;
}
