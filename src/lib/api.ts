import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    requestId: string;
    timestamp: string;
  };
};

export function createRequestId(): string {
  return randomUUID();
}

export function apiError(
  code: string,
  message: string,
  status: number,
  requestId = createRequestId(),
): NextResponse<ApiErrorBody> {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        requestId,
        timestamp: new Date().toISOString(),
      },
    },
    {
      status,
      headers: { "x-request-id": requestId },
    },
  );
}

export function apiSuccess<T extends Record<string, unknown>>(
  data: T,
  status = 200,
  requestId = createRequestId(),
): NextResponse<T & { requestId: string; timestamp: string }> {
  return NextResponse.json(
    {
      ...data,
      requestId,
      timestamp: new Date().toISOString(),
    },
    {
      status,
      headers: { "x-request-id": requestId },
    },
  );
}
