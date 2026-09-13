import { NextResponse } from "next/server";

export function apiError(
  message: string,
  status: number,
  issues?: unknown
) {
  return NextResponse.json(
    {
      error: message,
      ...(issues !== undefined && { issues }),
    },
    { status }
  );
}

export function apiTooManyRequests(retryAfterSeconds: number) {
  return NextResponse.json(
    {
      error: "Too many requests. Please try again later.",
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
      },
    }
  );
}