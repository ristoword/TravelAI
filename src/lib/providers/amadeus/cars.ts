import {
  amadeusFetch,
  amadeusNotConfigured,
  asArray,
  asRecord,
  parseMoney,
} from "@/lib/providers/amadeus/client";
import { isAmadeusConfigured } from "@/lib/providers/amadeus/config";
import type {
  BookingRequest,
  BookingResult,
  CarOfferDto,
  CarRentalProvider,
  CarSearchParams,
  PriceVerification,
  PriceVerificationResult,
  ProviderResult,
} from "@/lib/providers/types";

/**
 * Amadeus Self-Service non espone un endpoint "car rental" classico in test.
 * Espone Transfer Offers: POST /v1/shopping/transfer-offers.
 * Mappiamo solo offerte transfer reali restituiti da Amadeus (niente inventati).
 */

function toAmadeusDateTime(value: string): string {
  // Accept "YYYY-MM-DDTHH:mm" or full ISO; Amadeus expects local datetime.
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return `${value}:00`;
  return value;
}

function mapTransferOffer(raw: unknown): CarOfferDto | null {
  const offer = asRecord(raw);
  if (!offer) return null;
  const id = typeof offer.id === "string" ? offer.id : undefined;
  if (!id) return null;

  const priceObj = asRecord(offer.quotation) ?? asRecord(offer.price);
  const money = parseMoney(
    priceObj?.monetaryAmount ?? priceObj?.total ?? priceObj?.grandTotal,
    priceObj?.currencyCode ?? priceObj?.currency,
  );
  if (!money) return null;

  const vehicle = asRecord(offer.vehicle);
  const provider = asRecord(offer.serviceProvider) ?? asRecord(offer.provider);
  const start = asRecord(offer.start);

  return {
    externalId: id,
    vendorName:
      typeof provider?.name === "string"
        ? provider.name
        : typeof provider?.code === "string"
          ? provider.code
          : undefined,
    vehicleName:
      typeof vehicle?.description === "string"
        ? vehicle.description
        : typeof vehicle?.code === "string"
          ? vehicle.code
          : typeof offer.transferType === "string"
            ? `Transfer ${offer.transferType}`
            : "Transfer",
    category:
      typeof offer.transferType === "string"
        ? offer.transferType
        : typeof vehicle?.category === "string"
          ? vehicle.category
          : undefined,
    seats:
      typeof vehicle?.seats === "number"
        ? vehicle.seats
        : typeof asRecord(vehicle?.seats)?.count === "number"
          ? (asRecord(vehicle!.seats)!.count as number)
          : undefined,
    bags:
      typeof vehicle?.baggages === "number"
        ? vehicle.baggages
        : undefined,
    imageUrl:
      typeof asRecord(asArray(vehicle?.imageURL)[0])?.url === "string"
        ? (asRecord(asArray(vehicle!.imageURL)[0])!.url as string)
        : typeof vehicle?.imageURL === "string"
          ? vehicle.imageURL
          : undefined,
    pickupLat:
      typeof asRecord(start?.location)?.latitude === "number"
        ? (asRecord(start!.location)!.latitude as number)
        : undefined,
    pickupLng:
      typeof asRecord(start?.location)?.longitude === "number"
        ? (asRecord(start!.location)!.longitude as number)
        : undefined,
    conditions:
      typeof offer.methodsOfPaymentAccepted === "object"
        ? `payments: ${JSON.stringify(offer.methodsOfPaymentAccepted)}`
        : undefined,
    price: money,
  };
}

export class AmadeusCarRentalProvider implements CarRentalProvider {
  readonly code = "amadeus_transfers";

  isConfigured(): boolean {
    // Transfer Offers is the documented Amadeus Self-Service vertical for ground transport.
    return isAmadeusConfigured();
  }

  async search(params: CarSearchParams): Promise<ProviderResult<CarOfferDto[]>> {
    if (!this.isConfigured()) return amadeusNotConfigured("Auto / Transfer");

    const startLocationCode = params.pickupLocation.trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(startLocationCode)) {
      return {
        ok: false,
        code: "invalid_request",
        message:
          "Transfer Amadeus: pickupLocation deve essere un codice IATA aeroporto (3 lettere). Nessuna offerta inventata.",
      };
    }

    const body: Record<string, unknown> = {
      startLocationCode,
      startDateTime: toAmadeusDateTime(params.pickupAt),
      transferType: "PRIVATE",
      passengers: 1,
      currencyCode: (params.currency ?? "EUR").toUpperCase(),
    };

    const drop = params.dropoffLocation?.trim();
    if (drop) {
      if (/^[A-Za-z]{3}$/.test(drop)) {
        body.endLocationCode = drop.toUpperCase();
      } else {
        body.endAddressLine = drop;
        body.endCityName = drop;
      }
    }
    const result = await amadeusFetch<{ data?: unknown }>(
      "/v1/shopping/transfer-offers",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    if (!result.ok) return result;

    const offers = asArray(result.data?.data)
      .map(mapTransferOffer)
      .filter((o): o is CarOfferDto => Boolean(o));

    return { ok: true, data: offers };
  }

  async getDetails(externalId: string): Promise<ProviderResult<CarOfferDto>> {
    if (!this.isConfigured()) return amadeusNotConfigured("Auto / Transfer");
    void externalId;
    return {
      ok: false,
      code: "unavailable",
      message:
        "Dettaglio transfer: Amadeus non espone GET stabile per offer id di search. Rieseguire la search.",
    };
  }

  async checkAvailability(
    externalId: string,
  ): Promise<ProviderResult<{ available: boolean }>> {
    if (!this.isConfigured()) return amadeusNotConfigured("Auto / Transfer");
    void externalId;
    return {
      ok: false,
      code: "unavailable",
      message:
        "Disponibilità transfer non verificabile senza body offerta Amadeus. Nessuna conferma inventata.",
    };
  }

  async verifyPrice(
    input: PriceVerification,
  ): Promise<ProviderResult<PriceVerificationResult>> {
    if (!this.isConfigured()) return amadeusNotConfigured("Auto / Transfer");
    void input;
    return {
      ok: false,
      code: "unavailable",
      message:
        "Verifica prezzo transfer: richiede il payload offerta Amadeus. Nessun prezzo inventato.",
    };
  }

  async book(input: BookingRequest): Promise<ProviderResult<BookingResult>> {
    if (!this.isConfigured()) return amadeusNotConfigured("Auto / Transfer");
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
        "Prenotazione transfer Amadeus (Transfer Orders) non avviata: servono dati passeggero e pagamento. Nessuna prenotazione simulata.",
    };
  }
}
