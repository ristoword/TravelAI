import { AmadeusCarRentalProvider } from "@/lib/providers/amadeus/cars";
import { isAmadeusConfigured } from "@/lib/providers/amadeus/config";
import { AmadeusFlightProvider } from "@/lib/providers/amadeus/flights";
import { AmadeusHotelProvider } from "@/lib/providers/amadeus/hotels";
import { OurAirportsAutocompleteProvider } from "@/lib/providers/ourairports";
import type {
  AirportAutocompleteProvider,
  BookingRequest,
  BookingResult,
  CarOfferDto,
  CarRentalProvider,
  CarSearchParams,
  FlightOfferDto,
  FlightProvider,
  FlightSearchParams,
  HotelDetailsDto,
  HotelOfferDto,
  HotelProvider,
  HotelSearchParams,
  PriceVerification,
  PriceVerificationResult,
  ProviderResult,
} from "@/lib/providers/types";

const NOT_CONFIGURED =
  "Questo servizio non è ancora configurato. Imposta AMADEUS_CLIENT_ID e AMADEUS_CLIENT_SECRET (sandbox Amadeus for Developers).";

function notConfigured<T>(service: string): ProviderResult<T> {
  return {
    ok: false,
    code: "provider_not_configured",
    message: `${service}: ${NOT_CONFIGURED}`,
  };
}

const amadeusFlights = new AmadeusFlightProvider();
const amadeusHotels = new AmadeusHotelProvider();
const amadeusCars = new AmadeusCarRentalProvider();
const ourAirports = new OurAirportsAutocompleteProvider();

/**
 * Flight adapter: Amadeus Flight Offers Search when OAuth credentials exist.
 * Without AMADEUS_CLIENT_ID + AMADEUS_CLIENT_SECRET => provider_not_configured.
 * Legacy FLIGHT_PROVIDER_API_KEY is accepted as client id alias (secret still required).
 */
export class EnvFlightProvider implements FlightProvider {
  readonly code = "flight_env";

  isConfigured(): boolean {
    return isAmadeusConfigured();
  }

  search(params: FlightSearchParams): Promise<ProviderResult<FlightOfferDto[]>> {
    if (!this.isConfigured()) return Promise.resolve(notConfigured("Voli"));
    return amadeusFlights.search(params);
  }

  getDetails(externalId: string): Promise<ProviderResult<FlightOfferDto>> {
    if (!this.isConfigured()) return Promise.resolve(notConfigured("Voli"));
    return amadeusFlights.getDetails(externalId);
  }

  checkAvailability(
    externalId: string,
  ): Promise<ProviderResult<{ available: boolean }>> {
    if (!this.isConfigured()) return Promise.resolve(notConfigured("Voli"));
    return amadeusFlights.checkAvailability(externalId);
  }

  verifyPrice(
    input: PriceVerification,
  ): Promise<ProviderResult<PriceVerificationResult>> {
    if (!this.isConfigured()) return Promise.resolve(notConfigured("Voli"));
    return amadeusFlights.verifyPrice(input);
  }

  book(input: BookingRequest): Promise<ProviderResult<BookingResult>> {
    if (!this.isConfigured()) return Promise.resolve(notConfigured("Voli"));
    return amadeusFlights.book(input);
  }
}

/**
 * Hotel adapter: Amadeus Hotel List by city + Hotel Offers Search v3.
 */
export class EnvHotelProvider implements HotelProvider {
  readonly code = "hotel_env";

  isConfigured(): boolean {
    return isAmadeusConfigured();
  }

  search(params: HotelSearchParams): Promise<ProviderResult<HotelOfferDto[]>> {
    if (!this.isConfigured()) return Promise.resolve(notConfigured("Hotel"));
    return amadeusHotels.search(params);
  }

  getDetails(externalId: string): Promise<ProviderResult<HotelDetailsDto>> {
    if (!this.isConfigured()) return Promise.resolve(notConfigured("Hotel"));
    return amadeusHotels.getDetails(externalId);
  }

  checkAvailability(
    externalId: string,
  ): Promise<ProviderResult<{ available: boolean }>> {
    if (!this.isConfigured()) return Promise.resolve(notConfigured("Hotel"));
    return amadeusHotels.checkAvailability(externalId);
  }

  verifyPrice(
    input: PriceVerification,
  ): Promise<ProviderResult<PriceVerificationResult>> {
    if (!this.isConfigured()) return Promise.resolve(notConfigured("Hotel"));
    return amadeusHotels.verifyPrice(input);
  }

  book(input: BookingRequest): Promise<ProviderResult<BookingResult>> {
    if (!this.isConfigured()) return Promise.resolve(notConfigured("Hotel"));
    return amadeusHotels.book(input);
  }
}

/**
 * Car / ground adapter: Amadeus Transfer Offers (Self-Service has no classic car-rental test API).
 */
export class EnvCarRentalProvider implements CarRentalProvider {
  readonly code = "car_env";

  isConfigured(): boolean {
    return isAmadeusConfigured();
  }

  search(params: CarSearchParams): Promise<ProviderResult<CarOfferDto[]>> {
    if (!this.isConfigured()) return Promise.resolve(notConfigured("Auto"));
    return amadeusCars.search(params);
  }

  getDetails(externalId: string): Promise<ProviderResult<CarOfferDto>> {
    if (!this.isConfigured()) return Promise.resolve(notConfigured("Auto"));
    return amadeusCars.getDetails(externalId);
  }

  checkAvailability(
    externalId: string,
  ): Promise<ProviderResult<{ available: boolean }>> {
    if (!this.isConfigured()) return Promise.resolve(notConfigured("Auto"));
    return amadeusCars.checkAvailability(externalId);
  }

  verifyPrice(
    input: PriceVerification,
  ): Promise<ProviderResult<PriceVerificationResult>> {
    if (!this.isConfigured()) return Promise.resolve(notConfigured("Auto"));
    return amadeusCars.verifyPrice(input);
  }

  book(input: BookingRequest): Promise<ProviderResult<BookingResult>> {
    if (!this.isConfigured()) return Promise.resolve(notConfigured("Auto"));
    return amadeusCars.book(input);
  }
}

/**
 * Airport autocomplete via official OurAirports CSV (download + disk/memory cache).
 * No invented city lists. Download failure => servizio non disponibile.
 */
export class EnvAirportAutocompleteProvider implements AirportAutocompleteProvider {
  readonly code = "airport_env";

  isConfigured(): boolean {
    return ourAirports.isConfigured();
  }

  suggest(query: string): ReturnType<AirportAutocompleteProvider["suggest"]> {
    return ourAirports.suggest(query);
  }
}
