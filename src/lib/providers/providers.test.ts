import { describe, expect, it } from "vitest";
import {
  EnvCarRentalProvider,
  EnvFlightProvider,
  EnvHotelProvider,
  EnvAirportAutocompleteProvider,
} from "@/lib/providers/env-adapters";
import { executeAiTool, isOpenAiConfigured } from "@/lib/ai/agent";
import { flightSearchSchema, hotelSearchSchema } from "@/lib/validations/travel";

describe("provider adapters without credentials", () => {
  it("flight provider returns provider_not_configured and no offers", async () => {
    const p = new EnvFlightProvider();
    expect(p.isConfigured()).toBe(false);
    const result = await p.search({
      origin: "FCO",
      destination: "LIS",
      departDate: "2026-10-01",
      adults: 1,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("provider_not_configured");
  });

  it("hotel provider returns provider_not_configured", async () => {
    const p = new EnvHotelProvider();
    expect(p.isConfigured()).toBe(false);
    const result = await p.search({
      destination: "Lisbona",
      checkIn: "2026-10-01",
      checkOut: "2026-10-05",
      adults: 2,
      rooms: 1,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("provider_not_configured");
  });

  it("car provider returns provider_not_configured", async () => {
    const p = new EnvCarRentalProvider();
    const result = await p.search({
      pickupLocation: "LIS",
      pickupAt: "2026-10-01T10:00",
      dropoffAt: "2026-10-05T10:00",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("provider_not_configured");
  });

  it("airport autocomplete is not configured without dataset/url", async () => {
    const p = new EnvAirportAutocompleteProvider();
    expect(p.isConfigured()).toBe(false);
    const result = await p.suggest("rom");
    expect(result.ok).toBe(false);
  });
});

describe("AI tools call adapters", () => {
  it("searchFlights tool surfaces provider_not_configured", async () => {
    const result = await executeAiTool("searchFlights", {
      origin: "FCO",
      destination: "MXP",
      departDate: "2026-11-01",
      adults: 1,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("provider_not_configured");
  });

  it("isOpenAiConfigured reflects env without inventing replies", () => {
    expect(typeof isOpenAiConfigured()).toBe("boolean");
  });
});

describe("travel validation", () => {
  it("accepts valid flight search params", () => {
    const parsed = flightSearchSchema.safeParse({
      origin: "FCO",
      destination: "LIS",
      departDate: "2026-10-01",
      adults: 2,
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid hotel dates", () => {
    const parsed = hotelSearchSchema.safeParse({
      destination: "Roma",
      checkIn: "01-10-2026",
      checkOut: "2026-10-05",
      adults: 2,
      rooms: 1,
    });
    expect(parsed.success).toBe(false);
  });
});
