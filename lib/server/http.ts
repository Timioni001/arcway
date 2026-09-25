import { NextResponse } from "next/server";
import { getAddress, isAddress, type Address } from "viem";
import type { ApiError, ApiErrorCode } from "../api";

export function apiError(status: number, error: ApiErrorCode, message: string, extra: Partial<ApiError> = {}) {
  const headers: Record<string, string> = {};
  if (extra.retryAfterSeconds) headers["retry-after"] = String(extra.retryAfterSeconds);
  return NextResponse.json({ error, message, ...extra } satisfies ApiError, { status, headers });
}

export function parseAddress(value: unknown): Address | undefined {
  return typeof value === "string" && isAddress(value) ? getAddress(value) : undefined;
}

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}
