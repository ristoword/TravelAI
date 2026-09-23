import {
  EnvAirportAutocompleteProvider,
  EnvCarRentalProvider,
  EnvFlightProvider,
  EnvHotelProvider,
} from "@/lib/providers/env-adapters";
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
  return {
    flight: providerStatus(flightProvider.isConfigured()),
    hotel: providerStatus(hotelProvider.isConfigured()),
    car: providerStatus(carProvider.isConfigured()),
    airports: providerStatus(airportProvider.isConfigured()),
    activity: "not_configured" as ProviderStatus,
    openai: providerStatus(Boolean(process.env.OPENAI_API_KEY?.trim())),
    stripe: providerStatus(Boolean(process.env.STRIPE_SECRET_KEY?.trim())),
  };
}

export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY?.trim() &&
      process.env.STRIPE_PUBLISHABLE_KEY?.trim(),
  );
}
