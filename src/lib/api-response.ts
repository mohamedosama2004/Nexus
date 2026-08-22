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