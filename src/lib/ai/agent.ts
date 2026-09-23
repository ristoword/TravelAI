import {
  getCarRentalProvider,
  getFlightProvider,
  getHotelProvider,
} from "@/lib/providers";
import type {
  CarSearchParams,
  FlightSearchParams,
  HotelDetailsDto,
  HotelOfferDto,
  HotelSearchParams,
  PriceVerification,
  ProviderResult,
} from "@/lib/providers/types";

/**
 * AI tool registry — each tool calls real adapters. No invented extraction or fake replies.
 */
export const aiToolDefinitions = [
  {
    type: "function" as const,
    function: {
      name: "searchFlights",
      description: "Search flights via the configured flight provider adapter.",
      parameters: {
        type: "object",
        properties: {
          origin: { type: "string" },
          destination: { type: "string" },
          departDate: { type: "string", description: "YYYY-MM-DD" },
          returnDate: { type: "string" },
          adults: { type: "number" },
          cabinClass: { type: "string" },
        },
        required: ["origin", "destination", "departDate", "adults"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "searchHotels",
      description: "Search hotels via the configured hotel provider adapter.",
      parameters: {
        type: "object",
        properties: {
          destination: { type: "string" },
          checkIn: { type: "string" },
          checkOut: { type: "string" },
          adults: { type: "number" },
          rooms: { type: "number" },
        },
        required: ["destination", "checkIn", "checkOut", "adults", "rooms"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "searchCars",
      description: "Search rental cars via the configured car provider adapter.",
      parameters: {
        type: "object",
        properties: {
          pickupLocation: { type: "string" },
          dropoffLocation: { type: "string" },
          pickupAt: { type: "string" },
          dropoffAt: { type: "string" },
          driverAge: { type: "number" },
        },
        required: ["pickupLocation", "pickupAt", "dropoffAt"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "getHotelDetails",
      description: "Get hotel details from the hotel provider by external id.",
      parameters: {
        type: "object",
        properties: { externalId: { type: "string" } },
        required: ["externalId"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "getFlightDetails",
      description: "Get flight details from the flight provider by external id.",
      parameters: {
        type: "object",
        properties: { externalId: { type: "string" } },
        required: ["externalId"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "compareHotels",
      description:
        "Compare hotel offers by external ids. Only fields present in provider data are returned.",
      parameters: {
        type: "object",
        properties: {
          externalIds: { type: "array", items: { type: "string" } },
        },
        required: ["externalIds"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_offer_details",
      description:
        "Get offer details by kind (flight|hotel|car) and externalId via the provider adapter.",
      parameters: {
        type: "object",
        properties: {
          kind: { type: "string", enum: ["flight", "hotel", "car"] },
          externalId: { type: "string" },
        },
        required: ["kind", "externalId"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "verifyPrice",
      description: "Verify a price against the provider for flight, hotel, or car.",
      parameters: {
        type: "object",
        properties: {
          kind: { type: "string", enum: ["flight", "hotel", "car"] },
          externalId: { type: "string" },
          expectedAmount: { type: "number" },
          currency: { type: "string" },
        },
        required: ["kind", "externalId", "expectedAmount", "currency"],
      },
    },
  },
] as const;

export type AiToolName =
  | "searchFlights"
  | "search_flights"
  | "searchHotels"
  | "search_hotels"
  | "searchCars"
  | "search_cars"
  | "getHotelDetails"
  | "getFlightDetails"
  | "get_offer_details"
  | "compareHotels"
  | "verifyPrice"
  | "verify_price";

function normalizeToolName(name: string): AiToolName | string {
  const map: Record<string, AiToolName> = {
    search_flights: "searchFlights",
    search_hotels: "searchHotels",
    search_cars: "searchCars",
    get_offer_details: "get_offer_details",
    verify_price: "verifyPrice",
  };
  return map[name] ?? name;
}

export async function executeAiTool(
  name: string,
  args: Record<string, unknown>,
): Promise<ProviderResult<unknown>> {
  const tool = normalizeToolName(name);
  switch (tool as AiToolName) {
    case "searchFlights":
    case "search_flights": {
      const params: FlightSearchParams = {
        origin: String(args.origin ?? ""),
        destination: String(args.destination ?? ""),
        departDate: String(args.departDate ?? ""),
        returnDate: args.returnDate ? String(args.returnDate) : undefined,
        adults: Number(args.adults ?? 1),
        cabinClass: args.cabinClass ? String(args.cabinClass) : undefined,
      };
      return getFlightProvider().search(params);
    }
    case "searchHotels":
    case "search_hotels": {
      const params: HotelSearchParams = {
        destination: String(args.destination ?? ""),
        checkIn: String(args.checkIn ?? ""),
        checkOut: String(args.checkOut ?? ""),
        adults: Number(args.adults ?? 1),
        rooms: Number(args.rooms ?? 1),
      };
      return getHotelProvider().search(params);
    }
    case "searchCars":
    case "search_cars": {
      const params: CarSearchParams = {
        pickupLocation: String(args.pickupLocation ?? ""),
        dropoffLocation: args.dropoffLocation
          ? String(args.dropoffLocation)
          : undefined,
        pickupAt: String(args.pickupAt ?? ""),
        dropoffAt: String(args.dropoffAt ?? ""),
        driverAge: args.driverAge ? Number(args.driverAge) : undefined,
      };
      return getCarRentalProvider().search(params);
    }
    case "getHotelDetails":
      return getHotelProvider().getDetails(String(args.externalId ?? ""));
    case "getFlightDetails":
      return getFlightProvider().getDetails(String(args.externalId ?? ""));
    case "get_offer_details": {
      const kind = String(args.kind ?? args.offerKind ?? "hotel");
      const id = String(args.externalId ?? "");
      if (kind === "flight") return getFlightProvider().getDetails(id);
      if (kind === "car") return getCarRentalProvider().getDetails(id);
      return getHotelProvider().getDetails(id);
    }
    case "compareHotels": {
      const ids = Array.isArray(args.externalIds)
        ? args.externalIds.map(String)
        : [];
      const hotel = getHotelProvider();
      if (!hotel.isConfigured()) {
        return {
          ok: false,
          code: "provider_not_configured",
          message: "Provider hotel non configurato.",
        };
      }
      const results: Array<{
        externalId: string;
        offer?: HotelDetailsDto | HotelOfferDto;
        error?: string;
      }> = [];
      for (const id of ids) {
        const detail = await hotel.getDetails(id);
        if (detail.ok) {
          results.push({ externalId: id, offer: detail.data });
        } else {
          results.push({ externalId: id, error: detail.message });
        }
      }
      return { ok: true, data: results };
    }
    case "verifyPrice":
    case "verify_price": {
      const input: PriceVerification = {
        kind: args.kind as PriceVerification["kind"],
        externalId: String(args.externalId ?? ""),
        expectedAmount: Number(args.expectedAmount ?? 0),
        currency: String(args.currency ?? "EUR"),
      };
      if (input.kind === "flight") return getFlightProvider().verifyPrice(input);
      if (input.kind === "hotel") return getHotelProvider().verifyPrice(input);
      return getCarRentalProvider().verifyPrice(input);
    }
    default:
      return {
        ok: false,
        code: "invalid_request",
        message: `Tool sconosciuto: ${name}`,
      };
  }
}

export function isOpenAiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

/**
 * Real OpenAI Chat Completions with tool calling when OPENAI_API_KEY is set.
 * Never simulates an AI reply when the key is missing.
 */
export async function runAiChat(messages: ChatMessage[]): Promise<
  | { ok: true; reply: string; toolResults?: unknown[] }
  | { ok: false; code: string; message: string }
> {
  if (!isOpenAiConfigured()) {
    return {
      ok: false,
      code: "openai_not_configured",
      message:
        "INTEGRAZIONE NON CONFIGURATA — API KEY NECESSARIA. Imposta OPENAI_API_KEY. Il form di ricerca manuale resta utilizzabile.",
    };
  }

  const apiKey = process.env.OPENAI_API_KEY!.trim();
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

  try {
    const first = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "Sei l'assistente TravelAI. Usa SOLO i tool (searchFlights/searchHotels/searchCars/get_offer_details/verifyPrice e alias) per dati di viaggio. " +
              "Non inventare mai voli, hotel, auto, prezzi, foto, disponibilità o prenotazioni. " +
              "Se un tool restituisce provider_not_configured o Amadeus non configurato, dillo esplicitamente all'utente e invita a usare il form manuale o ad attendere le credenziali sandbox. " +
              "Prima di booking o pagamento chiedi sempre conferma esplicita dell'utente. Non dichiarare pagamenti riusciti.",
          },
          ...messages,
        ],
        tools: aiToolDefinitions,
        tool_choice: "auto",
      }),
    });

    if (!first.ok) {
      return {
        ok: false,
        code: "openai_error",
        message: "Non siamo riusciti a contattare il modello AI in questo momento.",
      };
    }

    const payload = (await first.json()) as {
      choices?: Array<{
        message?: {
          content?: string | null;
          tool_calls?: Array<{
            id: string;
            function: { name: string; arguments: string };
          }>;
        };
      }>;
    };

    const msg = payload.choices?.[0]?.message;
    if (!msg) {
      return {
        ok: false,
        code: "openai_error",
        message: "Risposta AI vuota dal provider.",
      };
    }

    const toolCalls = msg.tool_calls ?? [];
    if (toolCalls.length === 0) {
      return {
        ok: true,
        reply:
          msg.content?.trim() ||
          "Nessuna azione eseguita. Usa il form di ricerca manuale se preferisci.",
      };
    }

    const toolResults: unknown[] = [];
    const followUpMessages: Array<Record<string, unknown>> = [
      {
        role: "system",
        content:
          "Sei l'assistente TravelAI. Usa solo i risultati dei tool. Se vedi provider_not_configured, dillo all'utente senza inventare offerte. Non dichiarare pagamenti o prenotazioni riuscite senza conferma esplicita e provider reale.",
      },
      ...messages,
      msg,
    ];

    for (const call of toolCalls) {
      let parsed: Record<string, unknown> = {};
      try {
        parsed = JSON.parse(call.function.arguments || "{}") as Record<
          string,
          unknown
        >;
      } catch {
        parsed = {};
      }
      const result = await executeAiTool(call.function.name, parsed);
      toolResults.push({ tool: call.function.name, result });
      followUpMessages.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    }

    const second = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: followUpMessages,
      }),
    });

    if (!second.ok) {
      return {
        ok: true,
        reply:
          "I tool sono stati eseguiti. Non è stato possibile generare un riepilogo testuale dal modello.",
        toolResults,
      };
    }

    const secondPayload = (await second.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
    };
    const reply =
      secondPayload.choices?.[0]?.message?.content?.trim() ||
      "Operazione completata tramite tool provider (vedere risultati strumenti).";

    return { ok: true, reply, toolResults };
  } catch {
    return {
      ok: false,
      code: "openai_error",
      message: "Non siamo riusciti a recuperare i risultati in questo momento.",
    };
  }
}
