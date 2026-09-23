import { promises as fs } from "node:fs";
import path from "node:path";
import type {
  AirportAutocompleteProvider,
  AirportSuggestion,
  ProviderResult,
} from "@/lib/providers/types";

/** Official OurAirports CSV (public dataset). Not a hand-written city list. */
export const OURAIRPORTS_CSV_URL =
  "https://davidmegginson.github.io/ourairports-data/airports.csv";

type AirportRow = {
  iata: string;
  name: string;
  city?: string;
  country?: string;
  searchText: string;
};

let memoryCache: AirportRow[] | null = null;
let loadPromise: Promise<ProviderResult<AirportRow[]>> | null = null;

function cachePath(): string {
  const custom = process.env.AIRPORT_DATASET_PATH?.trim();
  if (custom) return custom;
  return path.join(process.cwd(), ".data", "ourairports-airports.csv");
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function parseAirportsCsv(csv: string): AirportRow[] {
  const lines = csv.split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const idx = {
    iata: header.indexOf("iata_code"),
    name: header.indexOf("name"),
    city: header.indexOf("municipality"),
    country: header.indexOf("iso_country"),
    type: header.indexOf("type"),
  };
  if (idx.iata < 0 || idx.name < 0) return [];

  const rows: AirportRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const cols = parseCsvLine(line);
    const iata = (cols[idx.iata] || "").trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(iata)) continue;
    const type = idx.type >= 0 ? (cols[idx.type] || "").trim() : "";
    // Keep real airports with IATA; skip seaplane/heliport noise when type present.
    if (type && type !== "large_airport" && type !== "medium_airport" && type !== "small_airport") {
      continue;
    }
    const name = (cols[idx.name] || "").trim();
    if (!name) continue;
    const city = idx.city >= 0 ? (cols[idx.city] || "").trim() || undefined : undefined;
    const country =
      idx.country >= 0 ? (cols[idx.country] || "").trim() || undefined : undefined;
    rows.push({
      iata,
      name,
      city,
      country,
      searchText: `${iata} ${name} ${city ?? ""} ${country ?? ""}`.toLowerCase(),
    });
  }
  return rows;
}

async function downloadCsv(): Promise<ProviderResult<string>> {
  const url = process.env.AIRPORT_AUTOCOMPLETE_BASE_URL?.trim() || OURAIRPORTS_CSV_URL;
  try {
    const response = await fetch(url, {
      headers: { Accept: "text/csv,*/*" },
      cache: "no-store",
    });
    if (!response.ok) {
      return {
        ok: false,
        code: "provider_error",
        message: `OurAirports: download fallito (HTTP ${response.status}). Autocomplete non disponibile.`,
      };
    }
    const text = await response.text();
    if (!text.includes("iata_code") && !text.includes("IATA")) {
      return {
        ok: false,
        code: "provider_error",
        message:
          "OurAirports: CSV non nel formato atteso. Autocomplete non disponibile. Nessun aeroporto inventato.",
      };
    }
    return { ok: true, data: text };
  } catch {
    return {
      ok: false,
      code: "unavailable",
      message:
        "OurAirports: servizio non disponibile (download fallito). Digita il codice IATA manualmente.",
    };
  }
}

async function loadAirports(): Promise<ProviderResult<AirportRow[]>> {
  if (memoryCache) return { ok: true, data: memoryCache };
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const file = cachePath();
    try {
      const existing = await fs.readFile(/* turbopackIgnore: true */ file, "utf8");
      const parsed = parseAirportsCsv(existing);
      if (parsed.length > 0) {
        memoryCache = parsed;
        return { ok: true, data: parsed };
      }
    } catch {
      // cache miss — download
    }

    const downloaded = await downloadCsv();
    if (!downloaded.ok) return downloaded;

    try {
      await fs.mkdir(/* turbopackIgnore: true */ path.dirname(file), { recursive: true });
      await fs.writeFile(/* turbopackIgnore: true */ file, downloaded.data, "utf8");
    } catch {
      // Disk cache is best-effort; memory cache still works.
    }

    const parsed = parseAirportsCsv(downloaded.data);
    if (parsed.length === 0) {
      return {
        ok: false,
        code: "provider_error",
        message:
          "OurAirports: nessun aeroporto con IATA nel CSV. Autocomplete non disponibile.",
      };
    }
    memoryCache = parsed;
    return { ok: true, data: parsed };
  })();

  try {
    return await loadPromise;
  } finally {
    loadPromise = null;
  }
}

/** Test helper: reset in-memory cache. */
export function clearAirportMemoryCache(): void {
  memoryCache = null;
  loadPromise = null;
}

export class OurAirportsAutocompleteProvider implements AirportAutocompleteProvider {
  readonly code = "ourairports";

  /**
   * Always "configured" as a public dataset source.
   * Runtime failures surface as unavailable (not fake suggestions).
   */
  isConfigured(): boolean {
    return true;
  }

  async suggest(query: string): Promise<ProviderResult<AirportSuggestion[]>> {
    const q = query.trim().toLowerCase();
    if (q.length < 1) return { ok: true, data: [] };

    const loaded = await loadAirports();
    if (!loaded.ok) return loaded;

    const startsWithIata: AirportSuggestion[] = [];
    const contains: AirportSuggestion[] = [];

    for (const row of loaded.data) {
      if (row.iata.toLowerCase().startsWith(q)) {
        startsWithIata.push({
          iata: row.iata,
          name: row.name,
          city: row.city,
          country: row.country,
        });
      } else if (row.searchText.includes(q)) {
        contains.push({
          iata: row.iata,
          name: row.name,
          city: row.city,
          country: row.country,
        });
      }
      if (startsWithIata.length + contains.length >= 80) break;
    }

    return {
      ok: true,
      data: [...startsWithIata, ...contains].slice(0, 12),
    };
  }
}
