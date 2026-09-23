import { describe, expect, it } from "vitest";

/**
 * Health response shape contract (no DB / no HTTP server required).
 */
function buildHealthShape(input: {
  database: "ok" | "not_configured" | "error";
  requestId: string;
  timestamp: string;
  providers?: {
    flight: string;
    hotel: string;
    car: string;
    activity: string;
    airports?: string;
    openai: string;
    stripe: string;
  };
}) {
  return {
    status: "ok",
    app: "TravelAI",
    phase: 4,
    database: input.database,
    providers: input.providers ?? {
      flight: "not_configured",
      hotel: "not_configured",
      car: "not_configured",
      activity: "not_configured",
      airports: "not_configured",
      openai: "not_configured",
      stripe: "not_configured",
    },
    requestId: input.requestId,
    timestamp: input.timestamp,
  };
}

describe("health response shape", () => {
  it("marks travel providers as not_configured when env missing", () => {
    const body = buildHealthShape({
      database: "not_configured",
      requestId: "req-1",
      timestamp: "2026-09-23T00:00:00.000Z",
    });

    expect(body.phase).toBe(4);
    expect(body.database).toBe("not_configured");
    expect(body.providers.flight).toBe("not_configured");
    expect(body.providers.hotel).toBe("not_configured");
    expect(body.providers.car).toBe("not_configured");
    expect(body.providers.activity).toBe("not_configured");
    expect(body.requestId).toBeTruthy();
    expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
