import type { Locale } from "@/lib/validations/auth";
import { defaultLocale, locales } from "@/lib/validations/auth";

type Messages = {
  brand: string;
  heroTitle: string;
  heroSubtitle: string;
  notAvailableYet: string;
  login: string;
  register: string;
  profile: string;
  logout: string;
  email: string;
  password: string;
  name: string;
  submitLogin: string;
  submitRegister: string;
  updateProfile: string;
  resetPassword: string;
  requestReset: string;
  confirmReset: string;
  verifyEmail: string;
  oauthNotConfigured: string;
  emailNotConfigured: string;
  homeCtaHonest: string;
  tabFlights: string;
  tabPackage: string;
  tabHotels: string;
  tabCars: string;
  from: string;
  to: string;
  depart: string;
  return: string;
  passengers: string;
  cabinClass: string;
  baggage: string;
  roundTrip: string;
  oneWay: string;
  multiCity: string;
  searchFlights: string;
  searchPackage: string;
  searchHotels: string;
  searchCars: string;
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  rooms: string;
  hotelPrefs: string;
  pickup: string;
  dropoff: string;
  pickupTime: string;
  dropoffTime: string;
  driverAge: string;
  tellWhere: string;
  tellWherePlaceholder: string;
  providerNotConfigured: string;
  serviceUnavailable: string;
  autocompleteNotConfigured: string;
  searchingFlights: string;
  searchingHotels: string;
  searchingCars: string;
  fetchError: string;
  retry: string;
  select: string;
  seeHotel: string;
  book: string;
  imageUnavailable: string;
  notAvailable: string;
  changeFlight: string;
  changeHotel: string;
  total: string;
  compare: string;
  trips: string;
  aiNotConfigured: string;
  filters: string;
  sortPriceAsc: string;
  sortPriceDesc: string;
  sortDuration: string;
};

const it: Messages = {
  brand: "TravelAI",
  heroTitle: "Il tuo viaggio. Organizzato dall'AI.",
  heroSubtitle:
    "Cerca, confronta e organizza voli, hotel e auto in un unico posto.",
  notAvailableYet:
    "I risultati di ricerca arrivano solo da provider configurati. Nessuna offerta inventata.",
  login: "Accedi",
  register: "Registrati",
  profile: "Profilo",
  logout: "Esci",
  email: "Email",
  password: "Password",
  name: "Nome",
  submitLogin: "Accedi",
  submitRegister: "Crea account",
  updateProfile: "Salva profilo",
  resetPassword: "Reimposta password",
  requestReset: "Invia link di reset",
  confirmReset: "Imposta nuova password",
  verifyEmail: "Verifica email",
  oauthNotConfigured: "OAuth non configurato",
  emailNotConfigured: "Provider email non configurato",
  homeCtaHonest:
    "La ricerca è implementata: se un provider non è configurato vedrai uno stato chiaro, non dati finti.",
  tabFlights: "Voli",
  tabPackage: "Voli + Hotel",
  tabHotels: "Hotel",
  tabCars: "Auto",
  from: "Da",
  to: "A",
  depart: "Andata",
  return: "Ritorno",
  passengers: "Passeggeri",
  cabinClass: "Classe",
  baggage: "Bagaglio",
  roundTrip: "Andata e ritorno",
  oneWay: "Solo andata",
  multiCity: "Multi-city",
  searchFlights: "Cerca voli",
  searchPackage: "Cerca volo + hotel",
  searchHotels: "Cerca hotel",
  searchCars: "Cerca auto",
  destination: "Destinazione",
  checkIn: "Check-in",
  checkOut: "Check-out",
  guests: "Ospiti",
  rooms: "Camere",
  hotelPrefs: "Preferenze hotel",
  pickup: "Ritiro",
  dropoff: "Riconsegna",
  pickupTime: "Ora ritiro",
  dropoffTime: "Ora riconsegna",
  driverAge: "Età conducente",
  tellWhere: "Dimmi dove vuoi andare.",
  tellWherePlaceholder: "Es. weekend a Lisbona a giugno…",
  providerNotConfigured: "Provider non configurato",
  serviceUnavailable: "Servizio non disponibile",
  autocompleteNotConfigured:
    "Autocomplete aeroporti non configurato — digita codice o città manualmente.",
  searchingFlights: "Searching flights…",
  searchingHotels: "Searching hotels…",
  searchingCars: "Searching rental cars…",
  fetchError: "Non siamo riusciti a recuperare i risultati in questo momento.",
  retry: "Riprova",
  select: "Seleziona",
  seeHotel: "Vedi hotel",
  book: "Prenota",
  imageUnavailable: "Immagine non disponibile",
  notAvailable: "Non disponibile",
  changeFlight: "Cambia volo",
  changeHotel: "Cambia hotel",
  total: "Totale",
  compare: "Confronta",
  trips: "I miei viaggi",
  aiNotConfigured: "INTEGRAZIONE NON CONFIGURATA — API KEY NECESSARIA",
  filters: "Filtri",
  sortPriceAsc: "Prezzo ↑",
  sortPriceDesc: "Prezzo ↓",
  sortDuration: "Durata",
};

function localize(base: Messages, overrides: Partial<Messages>): Messages {
  return { ...base, ...overrides };
}

const catalog: Record<Locale, Messages> = {
  it,
  en: localize(it, {
    heroTitle: "Your trip. Organized by AI.",
    heroSubtitle: "Search, compare and organize flights, hotels and cars in one place.",
    tabFlights: "Flights",
    tabPackage: "Flight + Hotel",
    tabHotels: "Hotels",
    tabCars: "Cars",
    searchFlights: "Search flights",
    searchPackage: "Search flight + hotel",
    searchHotels: "Search hotels",
    searchCars: "Search cars",
    tellWhere: "Tell me where you want to go.",
    providerNotConfigured: "Provider not configured",
    serviceUnavailable: "Service unavailable",
    fetchError: "We couldn't retrieve results right now.",
    retry: "Retry",
    select: "Select",
    seeHotel: "View hotel",
    book: "Book",
    imageUnavailable: "Image unavailable",
    notAvailable: "Not available",
    changeFlight: "Change flight",
    changeHotel: "Change hotel",
    total: "Total",
    compare: "Compare",
    trips: "My trips",
    aiNotConfigured: "INTEGRATION NOT CONFIGURED — API KEY REQUIRED",
    filters: "Filters",
    login: "Log in",
    register: "Sign up",
    profile: "Profile",
    logout: "Log out",
  }),
  nl: localize(it, {
    heroTitle: "Jouw reis. Georganiseerd door AI.",
    heroSubtitle: "Zoek, vergelijk en organiseer vluchten, hotels en auto's op één plek.",
    tabFlights: "Vluchten",
    tabHotels: "Hotels",
    tabCars: "Auto's",
    login: "Inloggen",
    register: "Registreren",
    profile: "Profiel",
  }),
  de: localize(it, {
    heroTitle: "Deine Reise. Organisiert von der KI.",
    heroSubtitle: "Suche, vergleiche und organisiere Flüge, Hotels und Autos an einem Ort.",
    tabFlights: "Flüge",
    tabHotels: "Hotels",
    tabCars: "Autos",
    login: "Anmelden",
    register: "Registrieren",
    profile: "Profil",
  }),
  fr: localize(it, {
    heroTitle: "Votre voyage. Organisé par l'IA.",
    heroSubtitle: "Cherchez, comparez et organisez vols, hôtels et voitures en un seul endroit.",
    tabFlights: "Vols",
    tabHotels: "Hôtels",
    tabCars: "Voitures",
    login: "Connexion",
    register: "Inscription",
    profile: "Profil",
  }),
  es: localize(it, {
    heroTitle: "Tu viaje. Organizado por la IA.",
    heroSubtitle: "Busca, compara y organiza vuelos, hoteles y coches en un solo lugar.",
    tabFlights: "Vuelos",
    tabHotels: "Hoteles",
    tabCars: "Coches",
    login: "Iniciar sesión",
    register: "Registrarse",
    profile: "Perfil",
  }),
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function resolveLocale(value?: string | null): Locale {
  if (value && isLocale(value)) return value;
  return defaultLocale;
}

export function t(locale: Locale = defaultLocale): Messages {
  return catalog[resolveLocale(locale)];
}

export { defaultLocale, locales };
export type { Messages };
