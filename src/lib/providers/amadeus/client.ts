import {
  getAmadeusBaseUrl,
  getAmadeusClientId,
  getAmadeusClientSecret,
  isAmadeusConfigured,
} from "@/lib/providers/amadeus/config";
import type { ProviderFailureCode, ProviderResult } from "@/lib/providers/types";

type TokenCache = {
  accessToken: string;
  expiresAtMs: number;
};

let tokenCache: TokenCache | null = null;

export type AmadeusHttpError = {
  status: number;
  title?: string;
  detail?: string;
  code?: string | number;
};

function failure(
  code: ProviderFailureCode,
  message: string,
): ProviderResult<never> {
  return { ok: false, code, message };
}

export function amadeusNotConfigured(
  service: string,
): ProviderResult<never> {
  return failure(
    "provider_not_configured",
    `${service}: Questo servizio non è ancora configurato. Imposta AMADEUS_CLIENT_ID e AMADEUS_CLIENT_SECRET (sandbox Amadeus for Developers).`,
  );
}

/**
 * OAuth2 client_credentials against POST /v1/security/oauth2/token.
 * Returns a bearer token or a structured provider failure (never invents tokens).
 */
export async function getAmadeusAccessToken(): Promise<ProviderResult<string>> {
  if (!isAmadeusConfigured()) {
    return amadeusNotConfigured("Amadeus");
  }

  const now = Date.now();
  if (tokenCache && tokenCache.expiresAtMs > now + 30_000) {
    return { ok: true, data: tokenCache.accessToken };
  }

  const clientId = getAmadeusClientId()!;
  const clientSecret = getAmadeusClientSecret()!;
  const baseUrl = getAmadeusBaseUrl();
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/v1/security/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
  } catch {
    return failure(
      "provider_error",
      "Amadeus: impossibile contattare l'endpoint OAuth. Nessun risultato inventato.",
    );
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    return failure(
      "provider_error",
      `Amadeus OAuth: risposta non JSON (HTTP ${response.status}).`,
    );
  }

  if (!response.ok) {
    const err = extractAmadeusError(json);
    return failure(
      "provider_error",
      `Amadeus OAuth HTTP ${response.status}: ${err}`,
    );
  }

  const record = asRecord(json);
  const accessToken =
    typeof record?.access_token === "string" ? record.access_token : undefined;
  const expiresIn =
    typeof record?.expires_in === "number" ? record.expires_in : 1799;

  if (!accessToken) {
    return failure(
      "provider_error",
      "Amadeus OAuth: access_token assente nella risposta. Formato non atteso.",
    );
  }

  tokenCache = {
    accessToken,
    expiresAtMs: now + expiresIn * 1000,
  };

  return { ok: true, data: accessToken };
}

/** Clear cached token (tests / credential rotation). */
export function clearAmadeusTokenCache(): void {
  tokenCache = null;
}

export async function amadeusFetch<T>(
  pathAndQuery: string,
  init?: RequestInit,
): Promise<ProviderResult<T>> {
  const tokenResult = await getAmadeusAccessToken();
  if (!tokenResult.ok) return tokenResult;

  const baseUrl = getAmadeusBaseUrl();
  const url = pathAndQuery.startsWith("http")
    ? pathAndQuery
    : `${baseUrl}${pathAndQuery.startsWith("/") ? "" : "/"}${pathAndQuery}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${tokenResult.data}`,
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });
  } catch {
    return failure(
      "provider_error",
      "Amadeus: errore di rete durante la richiesta. Nessun risultato inventato.",
    );
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    return failure(
      "provider_error",
      `Amadeus: risposta non JSON (HTTP ${response.status}).`,
    );
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAmadeusTokenCache();
    }
    return failure(
      response.status === 404 ? "not_found" : "provider_error",
      `Amadeus HTTP ${response.status}: ${extractAmadeusError(json)}`,
    );
  }

  return { ok: true, data: json as T };
}

export function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function extractAmadeusError(json: unknown): string {
  const root = asRecord(json);
  const errors = asArray(root?.errors);
  if (errors.length > 0) {
    const first = asRecord(errors[0]);
    const title = typeof first?.title === "string" ? first.title : undefined;
    const detail = typeof first?.detail === "string" ? first.detail : undefined;
    const code = first?.code != null ? String(first.code) : undefined;
    return [code, title, detail].filter(Boolean).join(" — ") || "errore Amadeus";
  }
  if (typeof root?.error_description === "string") {
    return root.error_description;
  }
  if (typeof root?.error === "string") {
    return root.error;
  }
  if (typeof root?.title === "string") {
    return root.title;
  }
  return "errore strutturato dal provider";
}

export function parseIsoDurationMinutes(iso?: string): number | undefined {
  if (!iso || typeof iso !== "string") return undefined;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/i);
  if (!match) return undefined;
  const hours = match[1] ? Number(match[1]) : 0;
  const minutes = match[2] ? Number(match[2]) : 0;
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return undefined;
  return hours * 60 + minutes;
}

export function parseMoney(
  amount: unknown,
  currency: unknown,
): { amount: number; currency: string } | null {
  const n =
    typeof amount === "number"
      ? amount
      : typeof amount === "string"
        ? Number(amount)
        : NaN;
  const cur = typeof currency === "string" ? currency : "";
  if (!Number.isFinite(n) || !cur) return null;
  return { amount: n, currency: cur };
}
