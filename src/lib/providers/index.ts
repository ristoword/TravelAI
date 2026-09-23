import {
  EnvAirportAutocompleteProvider,
  EnvCarRentalProvider,
  EnvFlightProvider,
  EnvHotelProvider,
} from "@/lib/providers/env-adapters";
import { isAmadeusConfigured } from "@/lib/providers/amadeus/config";
import { isStripeConfigured } from "@/lib/stripe";
import type {
  AirportAutocompleteProvider,
  CarRentalProvider,
  FlightProvider,
  HotelProvider,
  ProviderStatus,
} from "@/lib/providers/types";

const flightProvider = new EnvFlightProvider();
const hotelProvider = new EnvHotelProvider();
const carProvider = new EnvCarRentalProvider();
const airportProvider = new EnvAirportAutocompleteProvider();

export function getFlightProvider(): FlightProvider {
  return flightProvider;
}

export function getHotelProvider(): HotelProvider {
  return hotelProvider;
}

export function getCarRentalProvider(): CarRentalProvider {
  return carProvider;
}

export function getAirportAutocompleteProvider(): AirportAutocompleteProvider {
  return airportProvider;
}

export function providerStatus(configured: boolean): ProviderStatus {
  return configured ? "configured" : "not_configured";
}

export function getTravelProviderStatuses() {
  const amadeus = isAmadeusConfigured();
  return {
    flight: providerStatus(amadeus),
    hotel: providerStatus(amadeus),
    car: providerStatus(amadeus),
    airports: providerStatus(airportProvider.isConfigured()),
    activity: "not_configured" as ProviderStatus,
    openai: providerStatus(Boolean(process.env.OPENAI_API_KEY?.trim())),
    /** Requires STRIPE_SECRET_KEY + STRIPE_PUBLISHABLE_KEY (webhook is separate). */
    stripe: providerStatus(isStripeConfigured()),
    amadeus: providerStatus(amadeus),
  };
}

export { isStripeConfigured };
