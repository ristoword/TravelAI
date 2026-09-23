import {
  amadeusFetch,
  amadeusNotConfigured,
  asArray,
  asRecord,
  parseIsoDurationMinutes,
  parseMoney,
} from "@/lib/providers/amadeus/client";
import { isAmadeusConfigured } from "@/lib/providers/amadeus/config";
import type {
  BookingRequest,
  BookingResult,
  FlightOfferDto,
  FlightProvider,
  FlightSearchParams,
  PriceVerification,
  PriceVerificationResult,
  ProviderResult,
} from "@/lib/providers/types";

type AmadeusFlightOffersResponse = {
  data?: unknown;
};

function mapCabinClass(input?: string): string | undefined {
  if (!input) return undefined;
  const n = input.toUpperCase().replace(/\s+/g, "_");
  if (["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"].includes(n)) return n;
  if (n === "PREMIUM") return "PREMIUM_ECONOMY";
  return undefined;
}

function mapFlightOffer(raw: unknown): FlightOfferDto | null {
  const offer = asRecord(raw);
  if (!offer) return null;
  const id = typeof offer.id === "string" ? offer.id : undefined;
  if (!id) return null;

  const priceObj = asRecord(offer.price);
  const money = parseMoney(priceObj?.grandTotal ?? priceObj?.total, priceObj?.currency);
  if (!money) return null;

  const itineraries = asArray(offer.itineraries);
  const firstItin = asRecord(itineraries[0]);
  const segmentsRaw = asArray(firstItin?.segments);
  const segments = segmentsRaw
    .map((seg) => {
      const s = asRecord(seg);
      if (!s) return null;
      const dep = asRecord(s.departure);
      const arr = asRecord(s.arrival);
      const carrier = asRecord(s.carrierCode ? { carrierCode: s.carrierCode } : s);
      return {
        airline:
          typeof s.carrierCode === "string"
            ? s.carrierCode
            : typeof carrier?.carrierCode === "string"
              ? carrier.carrierCode
              : undefined,
        flightNumber:
          typeof s.number === "string"
            ? `${typeof s.carrierCode === "string" ? s.carrierCode : ""}${s.number}`
            : undefined,
        origin: typeof dep?.iataCode === "string" ? dep.iataCode : undefined,
        destination: typeof arr?.iataCode === "string" ? arr.iataCode : undefined,
        departAt: typeof dep?.at === "string" ? dep.at : undefined,
        arriveAt: typeof arr?.at === "string" ? arr.at : undefined,
        durationMinutes: parseIsoDurationMinutes(
          typeof s.duration === "string" ? s.duration : undefined,
        ),
      };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  const firstSeg = segments[0];
  const lastSeg = segments[segments.length - 1];
  const validating =
    typeof offer.validatingAirlineCodes === "object" &&
    Array.isArray(offer.validatingAirlineCodes)
      ? (offer.validatingAirlineCodes[0] as unknown)
      : undefined;

  return {
    externalId: id,
    airline:
      typeof validating === "string"
        ? validating
        : firstSeg?.airline,
    flightNumber: firstSeg?.flightNumber,
    origin: firstSeg?.origin,
    destination: lastSeg?.destination,
    departAt: firstSeg?.departAt,
    arriveAt: lastSeg?.arriveAt,
    durationMinutes: parseIsoDurationMinutes(
      typeof firstItin?.duration === "string" ? firstItin.duration : undefined,
    ),
    stops: Math.max(0, segments.length - 1),
    cabinClass: (() => {
      const traveler = asRecord(asArray(offer.travelerPricings)[0]);
      const fd = asRecord(asArray(traveler?.fareDetailsBySegment)[0]);
      return typeof fd?.cabin === "string" ? fd.cabin : undefined;
    })(),
    price: money,
    segments: segments.length ? segments : undefined,
  };
}

export class AmadeusFlightProvider implements FlightProvider {
  readonly code = "amadeus_flights";

  isConfigured(): boolean {
    return isAmadeusConfigured();
  }

  async search(
    params: FlightSearchParams,
  ): Promise<ProviderResult<FlightOfferDto[]>> {
    if (!this.isConfigured()) return amadeusNotConfigured("Voli");

    const qs = new URLSearchParams({
      originLocationCode: params.origin.toUpperCase(),
      destinationLocationCode: params.destination.toUpperCase(),
      departureDate: params.departDate,
      adults: String(params.adults),
      currencyCode: (params.currency ?? "EUR").toUpperCase(),
      max: "30",
    });
    if (params.returnDate && params.tripType !== "oneway") {
      qs.set("returnDate", params.returnDate);
    }
    if (params.children && params.children > 0) {
      qs.set("children", String(params.children));
    }
    const cabin = mapCabinClass(params.cabinClass);
    if (cabin) qs.set("travelClass", cabin);

    const result = await amadeusFetch<AmadeusFlightOffersResponse>(
      `/v2/shopping/flight-offers?${qs.toString()}`,
    );
    if (!result.ok) return result;

    const offers = asArray(result.data?.data)
      .map(mapFlightOffer)
      .filter((o): o is FlightOfferDto => Boolean(o));

    return { ok: true, data: offers };
  }

  async getDetails(externalId: string): Promise<ProviderResult<FlightOfferDto>> {
    if (!this.isConfigured()) return amadeusNotConfigured("Voli");
    // Amadeus Self-Service does not expose a stable GET-by-id for search offers.
    // Price endpoint requires the full offer body; without it we cannot invent details.
    void externalId;
    return {
      ok: false,
      code: "unavailable",
      message:
        "Dettaglio volo: Amadeus non espone GET stabile per offer id di search. Rieseguire la search o usare verifica prezzo con payload completo.",
    };
  }

  async checkAvailability(
    externalId: string,
  ): Promise<ProviderResult<{ available: boolean }>> {
    if (!this.isConfigured()) return amadeusNotConfigured("Voli");
    void externalId;
    return {
      ok: false,
      code: "unavailable",
      message:
        "Disponibilità volo: richiede Flight Offers Price con il body dell'offerta Amadeus. Nessuna conferma inventata.",
    };
  }

  async verifyPrice(
    input: PriceVerification,
  ): Promise<ProviderResult<PriceVerificationResult>> {
    if (!this.isConfigured()) return amadeusNotConfigured("Voli");
    void input;
    return {
      ok: false,
      code: "unavailable",
      message:
        "Verifica prezzo volo: Amadeus Flight Offers Price richiede il JSON completo dell'offerta. Nessun prezzo inventato.",
    };
  }

  async book(input: BookingRequest): Promise<ProviderResult<BookingResult>> {
    if (!this.isConfigured()) return amadeusNotConfigured("Voli");
    if (!input.confirmedByUser) {
      return {
        ok: false,
        code: "invalid_request",
        message: "Conferma utente obbligatoria prima della prenotazione.",
      };
    }
    return {
      ok: false,
      code: "booking_not_available",
      message:
        "Prenotazione volo Amadeus (Flight Create Orders) non avviata: servono dati passeggero completi e pagamento. Nessuna prenotazione simulata.",
    };
  }
}
