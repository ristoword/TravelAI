/**
 * Amadeus Self-Service (test/production) configuration.
 * Never invent credentials. Empty id/secret => provider_not_configured.
 */

export const AMADEUS_DEFAULT_TEST_BASE_URL = "https://test.api.amadeus.com";

export function getAmadeusBaseUrl(): string {
  const fromAmadeus = process.env.AMADEUS_BASE_URL?.trim();
  if (fromAmadeus) return fromAmadeus.replace(/\/$/, "");
  const fromFlight = process.env.FLIGHT_PROVIDER_BASE_URL?.trim();
  if (fromFlight) return fromFlight.replace(/\/$/, "");
  const fromHotel = process.env.HOTEL_PROVIDER_BASE_URL?.trim();
  if (fromHotel) return fromHotel.replace(/\/$/, "");
  const fromCar = process.env.CAR_PROVIDER_BASE_URL?.trim();
  if (fromCar) return fromCar.replace(/\/$/, "");
  return AMADEUS_DEFAULT_TEST_BASE_URL;
}

export function getAmadeusClientId(): string | undefined {
  return (
    process.env.AMADEUS_CLIENT_ID?.trim() ||
    process.env.FLIGHT_PROVIDER_API_KEY?.trim() ||
    process.env.HOTEL_PROVIDER_API_KEY?.trim() ||
    process.env.CAR_PROVIDER_API_KEY?.trim() ||
    undefined
  );
}

export function getAmadeusClientSecret(): string | undefined {
  return process.env.AMADEUS_CLIENT_SECRET?.trim() || undefined;
}

/** True only when both OAuth client credentials are present. */
export function isAmadeusConfigured(): boolean {
  return Boolean(getAmadeusClientId() && getAmadeusClientSecret());
}
