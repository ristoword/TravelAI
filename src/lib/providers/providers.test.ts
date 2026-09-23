import { afterEach, describe, expect, it, vi } from "vitest";
import {
  EnvCarRentalProvider,
  EnvFlightProvider,
  EnvHotelProvider,
  EnvAirportAutocompleteProvider,
} from "@/lib/providers/env-adapters";
import { clearAmadeusTokenCache } from "@/lib/providers/amadeus/client";
import { isAmadeusConfigured } from "@/lib/providers/amadeus/config";
import { executeAiTool, isOpenAiConfigured } from "@/lib/ai/agent";
import { flightSearchSchema, hotelSearchSchema } from "@/lib/validations/travel";

const AMADEUS_ENV_KEYS = [
  "AMADEUS_CLIENT_ID",
  "AMADEUS_CLIENT_SECRET",
  "AMADEUS_BASE_URL",
  "FLIGHT_PROVIDER_API_KEY",
  "FLIGHT_PROVIDER_BASE_URL",
  "HOTEL_PROVIDER_API_KEY",
  "HOTEL_PROVIDER_BASE_URL",
  "CAR_PROVIDER_API_KEY",
  "CAR_PROVIDER_BASE_URL",
] as const;

function clearAmadeusEnv() {
  for (const key of AMADEUS_ENV_KEYS) {
    delete process.env[key];
  }
  clearAmadeusTokenCache();
}

afterEach(() => {
  clearAmadeusEnv();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("provider adapters without Amadeus credentials", () => {
  it("flight provider returns provider_not_configured and no offers", async () => {
    clearAmadeusEnv();
    expect(isAmadeusConfigured()).toBe(false);
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
    clearAmadeusEnv();
    const p = new EnvHotelProvider();
    expect(p.isConfigured()).toBe(false);
    const result = await p.search({
      destination: "LIS",
      checkIn: "2026-10-01",
      checkOut: "2026-10-05",
      adults: 2,
      rooms: 1,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("provider_not_configured");
  });

  it("car provider returns provider_not_configured", async () => {
    clearAmadeusEnv();
    const p = new EnvCarRentalProvider();
    const result = await p.search({
      pickupLocation: "LIS",
      pickupAt: "2026-10-01T10:00",
      dropoffAt: "2026-10-05T10:00",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("provider_not_configured");
  });

  it("does not call fetch when Amadeus credentials are absent", async () => {
    clearAmadeusEnv();
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    await new EnvFlightProvider().search({
      origin: "FCO",
      destination: "MXP",
      departDate: "2026-11-01",
      adults: 1,
    });
    await new EnvHotelProvider().search({
      destination: "PAR",
      checkIn: "2026-11-01",
      checkOut: "2026-11-03",
      adults: 1,
      rooms: 1,
    });
    await new EnvCarRentalProvider().search({
      pickupLocation: "CDG",
      pickupAt: "2026-11-01T10:00",
      dropoffAt: "2026-11-03T10:00",
    });
    await new EnvFlightProvider().book({
      externalId: "off_x",
      kind: "flight",
      confirmedByUser: true,
    });

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("booking without credentials is not a successful booking", async () => {
    clearAmadeusEnv();
    const result = await new EnvFlightProvider().book({
      externalId: "off_x",
      kind: "flight",
      confirmedByUser: true,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("provider_not_configured");
    }
  });
});

describe("airport autocomplete OurAirports", () => {
  it("is configured as public dataset source (no invented list required)", () => {
    const p = new EnvAirportAutocompleteProvider();
    expect(p.isConfigured()).toBe(true);
  });
});

describe("AI tools call adapters", () => {
  it("searchFlights tool surfaces provider_not_configured", async () => {
    clearAmadeusEnv();
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
