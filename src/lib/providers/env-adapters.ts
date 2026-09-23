/* Adapter stubs: parameters kept for interface compliance until vendor HTTP is wired. */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
  "Questo servizio non è ancora configurato. Imposta le credenziali del provider nelle variabili d'ambiente.";

function notConfigured<T>(service: string): ProviderResult<T> {
  return {
    ok: false,
    code: "provider_not_configured",
    message: `${service}: ${NOT_CONFIGURED}`,
  };
}

/** Flight adapter: real HTTP integration only when FLIGHT_PROVIDER_API_KEY (+ base URL) are set. */
export class EnvFlightProvider implements FlightProvider {
  readonly code = "flight_env";

  isConfigured(): boolean {
    return Boolean(
      process.env.FLIGHT_PROVIDER_API_KEY?.trim() &&
        process.env.FLIGHT_PROVIDER_BASE_URL?.trim(),
    );
  }

  async search(_params: FlightSearchParams): Promise<ProviderResult<FlightOfferDto[]>> {
    if (!this.isConfigured()) return notConfigured("Voli");
    return {
      ok: false,
      code: "provider_error",
      message:
        "Provider voli: credenziali presenti ma l'endpoint vendor non è collegato. Nessun risultato inventato.",
    };
  }

  async getDetails(_externalId: string): Promise<ProviderResult<FlightOfferDto>> {
    if (!this.isConfigured()) return notConfigured("Voli");
    return {
      ok: false,
      code: "unavailable",
      message: "Dettaglio volo non disponibile: adapter vendor non collegato.",
    };
  }

  async checkAvailability(
    _externalId: string,
  ): Promise<ProviderResult<{ available: boolean }>> {
    if (!this.isConfigured()) return notConfigured("Voli");
    return {
      ok: false,
      code: "unavailable",
      message: "Disponibilità volo non verificabile: adapter vendor non collegato.",
    };
  }

  async verifyPrice(
    _input: PriceVerification,
  ): Promise<ProviderResult<PriceVerificationResult>> {
    if (!this.isConfigured()) return notConfigured("Voli");
    return {
      ok: false,
      code: "unavailable",
      message: "Verifica prezzo volo non disponibile: adapter vendor non collegato.",
    };
  }

  async book(_input: BookingRequest): Promise<ProviderResult<BookingResult>> {
    if (!this.isConfigured()) return notConfigured("Voli");
    return {
      ok: false,
      code: "booking_not_available",
      message: "Prenotazione volo non disponibile: adapter vendor non collegato.",
    };
  }
}

/** Hotel adapter: real HTTP integration only when HOTEL_PROVIDER_API_KEY (+ base URL) are set. */
export class EnvHotelProvider implements HotelProvider {
  readonly code = "hotel_env";

  isConfigured(): boolean {
    return Boolean(
      process.env.HOTEL_PROVIDER_API_KEY?.trim() &&
        process.env.HOTEL_PROVIDER_BASE_URL?.trim(),
    );
  }

  async search(_params: HotelSearchParams): Promise<ProviderResult<HotelOfferDto[]>> {
    if (!this.isConfigured()) return notConfigured("Hotel");
    return {
      ok: false,
      code: "provider_error",
      message:
        "Provider hotel: credenziali presenti ma l'endpoint vendor non è collegato. Nessun risultato inventato.",
    };
  }

  async getDetails(_externalId: string): Promise<ProviderResult<HotelDetailsDto>> {
    if (!this.isConfigured()) return notConfigured("Hotel");
    return {
      ok: false,
      code: "unavailable",
      message: "Dettaglio hotel non disponibile: adapter vendor non collegato.",
    };
  }

  async checkAvailability(
    _externalId: string,
  ): Promise<ProviderResult<{ available: boolean }>> {
    if (!this.isConfigured()) return notConfigured("Hotel");
    return {
      ok: false,
      code: "unavailable",
      message: "Disponibilità hotel non verificabile: adapter vendor non collegato.",
    };
  }

  async verifyPrice(
    _input: PriceVerification,
  ): Promise<ProviderResult<PriceVerificationResult>> {
    if (!this.isConfigured()) return notConfigured("Hotel");
    return {
      ok: false,
      code: "unavailable",
      message: "Verifica prezzo hotel non disponibile: adapter vendor non collegato.",
    };
  }

  async book(_input: BookingRequest): Promise<ProviderResult<BookingResult>> {
    if (!this.isConfigured()) return notConfigured("Hotel");
    return {
      ok: false,
      code: "booking_not_available",
      message: "Prenotazione hotel non disponibile: adapter vendor non collegato.",
    };
  }
}

/** Car rental adapter: real HTTP integration only when CAR_PROVIDER_API_KEY (+ base URL) are set. */
export class EnvCarRentalProvider implements CarRentalProvider {
  readonly code = "car_env";

  isConfigured(): boolean {
    return Boolean(
      process.env.CAR_PROVIDER_API_KEY?.trim() &&
        process.env.CAR_PROVIDER_BASE_URL?.trim(),
    );
  }

  async search(_params: CarSearchParams): Promise<ProviderResult<CarOfferDto[]>> {
    if (!this.isConfigured()) return notConfigured("Auto");
    return {
      ok: false,
      code: "provider_error",
      message:
        "Provider auto: credenziali presenti ma l'endpoint vendor non è collegato. Nessun risultato inventato.",
    };
  }

  async getDetails(_externalId: string): Promise<ProviderResult<CarOfferDto>> {
    if (!this.isConfigured()) return notConfigured("Auto");
    return {
      ok: false,
      code: "unavailable",
      message: "Dettaglio auto non disponibile: adapter vendor non collegato.",
    };
  }

  async checkAvailability(
    _externalId: string,
  ): Promise<ProviderResult<{ available: boolean }>> {
    if (!this.isConfigured()) return notConfigured("Auto");
    return {
      ok: false,
      code: "unavailable",
      message: "Disponibilità auto non verificabile: adapter vendor non collegato.",
    };
  }

  async verifyPrice(
    _input: PriceVerification,
  ): Promise<ProviderResult<PriceVerificationResult>> {
    if (!this.isConfigured()) return notConfigured("Auto");
    return {
      ok: false,
      code: "unavailable",
      message: "Verifica prezzo auto non disponibile: adapter vendor non collegato.",
    };
  }

  async book(_input: BookingRequest): Promise<ProviderResult<BookingResult>> {
    if (!this.isConfigured()) return notConfigured("Auto");
    return {
      ok: false,
      code: "booking_not_available",
      message: "Prenotazione auto non disponibile: adapter vendor non collegato.",
    };
  }
}

/**
 * Airport autocomplete: only when AIRPORT_AUTOCOMPLETE_BASE_URL (+ optional key) is set,
 * or when AIRPORT_DATASET_PATH points to a local dataset already present in the project.
 * No invented city/airport lists.
 */
export class EnvAirportAutocompleteProvider implements AirportAutocompleteProvider {
  readonly code = "airport_env";

  isConfigured(): boolean {
    return Boolean(
      process.env.AIRPORT_AUTOCOMPLETE_BASE_URL?.trim() ||
        process.env.AIRPORT_DATASET_PATH?.trim(),
    );
  }

  async suggest(
    query: string,
  ): Promise<
    import("@/lib/providers/types").ProviderResult<
      import("@/lib/providers/types").AirportSuggestion[]
    >
  > {
    void query;
    if (!this.isConfigured()) {
      return notConfigured("Autocomplete aeroporti");
    }
    return {
      ok: false,
      code: "unavailable",
      message:
        "Autocomplete aeroporti: dataset/URL configurato ma il loader non è collegato a un dataset presente. Nessuna città inventata.",
    };
  }
}
