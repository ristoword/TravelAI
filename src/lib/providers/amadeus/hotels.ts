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
  HotelDetailsDto,
  HotelOfferDto,
  HotelProvider,
  HotelSearchParams,
  PriceVerification,
  PriceVerificationResult,
  ProviderResult,
} from "@/lib/providers/types";

function extractCityCode(destination: string): string | null {
  const trimmed = destination.trim();
  if (/^[A-Za-z]{3}$/.test(trimmed)) return trimmed.toUpperCase();
  const match = trimmed.match(/\b([A-Za-z]{3})\b/);
  return match ? match[1].toUpperCase() : null;
}

function mapHotelOffer(raw: unknown): HotelOfferDto | null {
  const offer = asRecord(raw);
  if (!offer) return null;

  const hotel = asRecord(offer.hotel);
  const hotelId =
    (typeof hotel?.hotelId === "string" && hotel.hotelId) ||
    (typeof offer.hotelId === "string" && offer.hotelId) ||
    (typeof offer.id === "string" && offer.id) ||
    undefined;
  if (!hotelId) return null;

  const name =
    (typeof hotel?.name === "string" && hotel.name) ||
    (typeof offer.name === "string" && offer.name) ||
    undefined;
  if (!name) return null;

  const offers = asArray(offer.offers);
  const firstOffer = asRecord(offers[0]) ?? offer;
  const priceObj = asRecord(asRecord(firstOffer)?.price) ?? asRecord(offer.price);
  const money = parseMoney(
    priceObj?.total ?? priceObj?.grandTotal,
    priceObj?.currency,
  );
  if (!money) return null;

  const geo = asRecord(hotel?.geoCode);
  const addr = asRecord(hotel?.address);
  const ratingRaw = hotel?.rating ?? hotel?.starRating;
  const starRating =
    typeof ratingRaw === "number"
      ? ratingRaw
      : typeof ratingRaw === "string"
        ? Number(ratingRaw)
        : undefined;

  const media = asArray(hotel?.media);
  const firstMedia = asRecord(media[0]);
  const imageUrl =
    typeof firstMedia?.uri === "string"
      ? firstMedia.uri
      : typeof firstMedia?.url === "string"
        ? firstMedia.url
        : undefined;

  const policies = asRecord(asRecord(firstOffer)?.policies);
  const cancellation = asRecord(policies?.cancellation);
  const cancellationPolicy =
    typeof cancellation?.description === "string"
      ? cancellation.description
      : typeof policies?.paymentType === "string"
        ? `paymentType: ${policies.paymentType}`
        : undefined;

  const externalId =
    typeof asRecord(firstOffer)?.id === "string"
      ? `${hotelId}:${asRecord(firstOffer)!.id as string}`
      : hotelId;

  return {
    externalId,
    name,
    imageUrl,
    starRating: Number.isFinite(starRating) ? starRating : undefined,
    address: typeof addr?.lines === "object" && Array.isArray(addr.lines)
      ? addr.lines.filter((x): x is string => typeof x === "string").join(", ")
      : typeof addr?.cityName === "string"
        ? addr.cityName
        : undefined,
    city:
      typeof addr?.cityName === "string"
        ? addr.cityName
        : typeof hotel?.cityCode === "string"
          ? hotel.cityCode
          : undefined,
    latitude:
      typeof geo?.latitude === "number"
        ? geo.latitude
        : typeof geo?.latitude === "string"
          ? Number(geo.latitude)
          : undefined,
    longitude:
      typeof geo?.longitude === "number"
        ? geo.longitude
        : typeof geo?.longitude === "string"
          ? Number(geo.longitude)
          : undefined,
    price: money,
    cancellationPolicy,
    description:
      typeof hotel?.description === "object"
        ? typeof asRecord(hotel.description)?.text === "string"
          ? (asRecord(hotel.description)!.text as string)
          : undefined
        : typeof hotel?.description === "string"
          ? hotel.description
          : undefined,
  };
}

export class AmadeusHotelProvider implements HotelProvider {
  readonly code = "amadeus_hotels";

  isConfigured(): boolean {
    return isAmadeusConfigured();
  }

  async search(
    params: HotelSearchParams,
  ): Promise<ProviderResult<HotelOfferDto[]>> {
    if (!this.isConfigured()) return amadeusNotConfigured("Hotel");

    const cityCode = extractCityCode(params.destination);
    if (!cityCode) {
      return {
        ok: false,
        code: "invalid_request",
        message:
          "Hotel Amadeus: indicare un city code IATA (es. PAR, ROM, LIS) nella destinazione. Nessun hotel inventato.",
      };
    }

    const listResult = await amadeusFetch<{ data?: unknown }>(
      `/v1/reference-data/locations/hotels/by-city?cityCode=${encodeURIComponent(cityCode)}`,
    );
    if (!listResult.ok) return listResult;

    const hotelIds = asArray(listResult.data?.data)
      .map((row) => {
        const r = asRecord(row);
        return typeof r?.hotelId === "string" ? r.hotelId : null;
      })
      .filter((id): id is string => Boolean(id))
      .slice(0, 20);

    if (hotelIds.length === 0) {
      return { ok: true, data: [] };
    }

    const qs = new URLSearchParams({
      hotelIds: hotelIds.join(","),
      adults: String(params.adults),
      checkInDate: params.checkIn,
      checkOutDate: params.checkOut,
      roomQuantity: String(params.rooms),
      currency: (params.currency ?? "EUR").toUpperCase(),
      bestRateOnly: "true",
    });

    const offersResult = await amadeusFetch<{ data?: unknown }>(
      `/v3/shopping/hotel-offers?${qs.toString()}`,
    );
    if (!offersResult.ok) return offersResult;

    const offers = asArray(offersResult.data?.data)
      .map(mapHotelOffer)
      .filter((o): o is HotelOfferDto => Boolean(o));

    return { ok: true, data: offers };
  }

  async getDetails(externalId: string): Promise<ProviderResult<HotelDetailsDto>> {
    if (!this.isConfigured()) return amadeusNotConfigured("Hotel");

    const hotelId = externalId.includes(":")
      ? externalId.split(":")[0]
      : externalId;
    if (!hotelId) {
      return { ok: false, code: "invalid_request", message: "hotel id mancante." };
    }

    const result = await amadeusFetch<{ data?: unknown }>(
      `/v3/shopping/hotel-offers?hotelIds=${encodeURIComponent(hotelId)}`,
    );
    if (!result.ok) return result;

    const first = asArray(result.data?.data)[0];
    const mapped = mapHotelOffer(first);
    if (!mapped) {
      return {
        ok: false,
        code: "not_found",
        message: "Hotel non trovato nella risposta Amadeus.",
      };
    }

    const offer = asRecord(first);
    const hotel = asRecord(offer?.hotel);
    const media = asArray(hotel?.media)
      .map((m) => {
        const row = asRecord(m);
        const url =
          typeof row?.uri === "string"
            ? row.uri
            : typeof row?.url === "string"
              ? row.url
              : undefined;
        if (!url) return null;
        const alt = typeof row?.category === "string" ? row.category : undefined;
        return { url, ...(alt ? { alt } : {}) };
      })
      .filter((x): x is { url: string; alt?: string } => Boolean(x));

    const rooms = asArray(offer?.offers)
      .map((o) => {
        const row = asRecord(o);
        if (!row) return null;
        const room = asRecord(row.room);
        const price = asRecord(row.price);
        const money = parseMoney(price?.total ?? price?.grandTotal, price?.currency);
        return {
          externalId: typeof row.id === "string" ? row.id : undefined,
          name:
            typeof asRecord(room?.typeEstimated)?.category === "string"
              ? (asRecord(room!.typeEstimated)!.category as string)
              : typeof room?.description === "object" &&
                  typeof asRecord(room.description)?.text === "string"
                ? (asRecord(room.description)!.text as string)
                : "Camera",
          description:
            typeof room?.description === "object"
              ? (asRecord(room.description)?.text as string | undefined)
              : undefined,
          bedType:
            typeof asRecord(room?.typeEstimated)?.bedType === "string"
              ? (asRecord(room!.typeEstimated)!.bedType as string)
              : undefined,
          price: money ?? undefined,
          available: true,
        };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));

    const details: HotelDetailsDto = {
      ...mapped,
      images: media.length ? media : mapped.imageUrl ? [{ url: mapped.imageUrl }] : undefined,
      rooms: rooms.length ? rooms : undefined,
    };

    return { ok: true, data: details };
  }

  async checkAvailability(
    externalId: string,
  ): Promise<ProviderResult<{ available: boolean }>> {
    if (!this.isConfigured()) return amadeusNotConfigured("Hotel");
    const details = await this.getDetails(externalId);
    if (!details.ok) return details;
    return {
      ok: true,
      data: { available: Boolean(details.data.rooms?.length || details.data.price) },
    };
  }

  async verifyPrice(
    input: PriceVerification,
  ): Promise<ProviderResult<PriceVerificationResult>> {
    if (!this.isConfigured()) return amadeusNotConfigured("Hotel");
    const details = await this.getDetails(input.externalId);
    if (!details.ok) return details;
    const current = details.data.price;
    if (!current) {
      return {
        ok: false,
        code: "unavailable",
        message: "Prezzo hotel assente nella risposta Amadeus.",
      };
    }
    const matched =
      current.currency.toUpperCase() === input.currency.toUpperCase() &&
      Math.abs(current.amount - input.expectedAmount) < 0.01;
    return {
      ok: true,
      data: {
        matched,
        currentPrice: current,
        message: matched
          ? "Prezzo confermato da Amadeus."
          : "Il prezzo attuale Amadeus non coincide con quello atteso.",
      },
    };
  }

  async book(input: BookingRequest): Promise<ProviderResult<BookingResult>> {
    if (!this.isConfigured()) return amadeusNotConfigured("Hotel");
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
        "Prenotazione hotel Amadeus (Hotel Booking) non avviata: servono dati ospite e pagamento. Nessuna prenotazione simulata.",
    };
  }
}
