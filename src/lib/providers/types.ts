/**
 * Shared provider contracts. Adapters must never invent offers, prices, photos, or coordinates.
 */

export type ProviderStatus = "configured" | "not_configured";

export type ProviderFailureCode =
  | "provider_not_configured"
  | "provider_error"
  | "not_found"
  | "unavailable"
  | "invalid_request"
  | "booking_not_available";

export type ProviderResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      code: ProviderFailureCode;
      message: string;
    };

export type Money = {
  amount: number;
  currency: string;
};

export type FlightSearchParams = {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  cabinClass?: string;
  tripType?: "roundtrip" | "oneway" | "multicity";
  baggage?: string;
  currency?: string;
};

export type FlightOfferDto = {
  externalId: string;
  airline?: string;
  airlineLogoUrl?: string;
  flightNumber?: string;
  origin?: string;
  destination?: string;
  departAt?: string;
  arriveAt?: string;
  durationMinutes?: number;
  stops?: number;
  cabinClass?: string;
  baggage?: string;
  conditions?: string;
  price: Money;
  segments?: Array<{
    airline?: string;
    flightNumber?: string;
    origin?: string;
    destination?: string;
    departAt?: string;
    arriveAt?: string;
    durationMinutes?: number;
    originLat?: number;
    originLng?: number;
    destLat?: number;
    destLng?: number;
  }>;
};

export type HotelSearchParams = {
  destination: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  rooms: number;
  currency?: string;
  preferences?: string;
};

export type HotelAmenityDto = {
  code: string;
  name: string;
};

export type HotelOfferDto = {
  externalId: string;
  name: string;
  imageUrl?: string;
  starRating?: number;
  guestRating?: number;
  reviewCount?: number;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
  amenities?: HotelAmenityDto[];
  price: Money;
  cancellationPolicy?: string;
  description?: string;
};

export type HotelDetailsDto = HotelOfferDto & {
  images?: Array<{ url: string; alt?: string }>;
  rooms?: Array<{
    externalId?: string;
    name: string;
    description?: string;
    maxOccupancy?: number;
    bedType?: string;
    price?: Money;
    available?: boolean;
    cancellationPolicy?: string;
  }>;
  conditions?: string;
};

export type CarSearchParams = {
  pickupLocation: string;
  dropoffLocation?: string;
  pickupAt: string;
  dropoffAt: string;
  driverAge?: number;
  currency?: string;
};

export type CarOfferDto = {
  externalId: string;
  vendorName?: string;
  vehicleName?: string;
  category?: string;
  transmission?: string;
  seats?: number;
  bags?: number;
  fuelType?: string;
  imageUrl?: string;
  pickupLat?: number;
  pickupLng?: number;
  conditions?: string;
  price: Money;
};

export type PriceVerification = {
  externalId: string;
  expectedAmount: number;
  currency: string;
  kind: "flight" | "hotel" | "car";
};

export type PriceVerificationResult = {
  matched: boolean;
  currentPrice?: Money;
  message: string;
};

export type BookingRequest = {
  externalId: string;
  kind: "flight" | "hotel" | "car";
  confirmedByUser: boolean;
  travelers?: Array<Record<string, unknown>>;
};

export type BookingResult = {
  confirmationCode?: string;
  status: string;
  message: string;
};

export interface FlightProvider {
  readonly code: string;
  isConfigured(): boolean;
  search(params: FlightSearchParams): Promise<ProviderResult<FlightOfferDto[]>>;
  getDetails(externalId: string): Promise<ProviderResult<FlightOfferDto>>;
  checkAvailability(externalId: string): Promise<ProviderResult<{ available: boolean }>>;
  verifyPrice(input: PriceVerification): Promise<ProviderResult<PriceVerificationResult>>;
  book(input: BookingRequest): Promise<ProviderResult<BookingResult>>;
}

export interface HotelProvider {
  readonly code: string;
  isConfigured(): boolean;
  search(params: HotelSearchParams): Promise<ProviderResult<HotelOfferDto[]>>;
  getDetails(externalId: string): Promise<ProviderResult<HotelDetailsDto>>;
  checkAvailability(externalId: string): Promise<ProviderResult<{ available: boolean }>>;
  verifyPrice(input: PriceVerification): Promise<ProviderResult<PriceVerificationResult>>;
  book(input: BookingRequest): Promise<ProviderResult<BookingResult>>;
}

export interface CarRentalProvider {
  readonly code: string;
  isConfigured(): boolean;
  search(params: CarSearchParams): Promise<ProviderResult<CarOfferDto[]>>;
  getDetails(externalId: string): Promise<ProviderResult<CarOfferDto>>;
  checkAvailability(externalId: string): Promise<ProviderResult<{ available: boolean }>>;
  verifyPrice(input: PriceVerification): Promise<ProviderResult<PriceVerificationResult>>;
  book(input: BookingRequest): Promise<ProviderResult<BookingResult>>;
}

export type AirportSuggestion = {
  iata: string;
  name: string;
  city?: string;
  country?: string;
};

export interface AirportAutocompleteProvider {
  readonly code: string;
  isConfigured(): boolean;
  suggest(query: string): Promise<ProviderResult<AirportSuggestion[]>>;
}
