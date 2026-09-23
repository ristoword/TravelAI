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
};

const catalog: Record<Locale, Messages> = {
  it: {
    brand: "TravelAI",
    heroTitle: "Il tuo viaggio. Organizzato dall’AI.",
    heroSubtitle:
      "Piattaforma in costruzione: autenticazione e database sono attivi in questa fase.",
    notAvailableYet:
      "Ricerca voli, hotel e assistente AI non sono ancora disponibili (fasi successive). Nessuna offerta o prezzo inventato.",
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
      "Puoi registrarti e gestire il profilo. La ricerca e le prenotazioni arriveranno dopo.",
  },
  en: {
    brand: "TravelAI",
    heroTitle: "Your trip. Organized by AI.",
    heroSubtitle:
      "Platform under construction: authentication and database are active in this phase.",
    notAvailableYet:
      "Flight/hotel search and the AI assistant are not available yet (later phases). No invented offers or prices.",
    login: "Log in",
    register: "Sign up",
    profile: "Profile",
    logout: "Log out",
    email: "Email",
    password: "Password",
    name: "Name",
    submitLogin: "Log in",
    submitRegister: "Create account",
    updateProfile: "Save profile",
    resetPassword: "Reset password",
    requestReset: "Send reset link",
    confirmReset: "Set new password",
    verifyEmail: "Verify email",
    oauthNotConfigured: "OAuth is not configured",
    emailNotConfigured: "Email provider is not configured",
    homeCtaHonest:
      "You can register and manage your profile. Search and bookings come later.",
  },
  nl: {
    brand: "TravelAI",
    heroTitle: "Jouw reis. Georganiseerd door AI.",
    heroSubtitle:
      "Platform in opbouw: authenticatie en database zijn actief in deze fase.",
    notAvailableYet:
      "Vlucht-/hotelszoeken en AI-assistent zijn nog niet beschikbaar. Geen verzonnen aanbiedingen.",
    login: "Inloggen",
    register: "Registreren",
    profile: "Profiel",
    logout: "Uitloggen",
    email: "E-mail",
    password: "Wachtwoord",
    name: "Naam",
    submitLogin: "Inloggen",
    submitRegister: "Account maken",
    updateProfile: "Profiel opslaan",
    resetPassword: "Wachtwoord resetten",
    requestReset: "Resetlink versturen",
    confirmReset: "Nieuw wachtwoord instellen",
    verifyEmail: "E-mail verifiëren",
    oauthNotConfigured: "OAuth is niet geconfigureerd",
    emailNotConfigured: "E-mailprovider is niet geconfigureerd",
    homeCtaHonest:
      "Je kunt je registreren en je profiel beheren. Zoeken en boeken komen later.",
  },
  de: {
    brand: "TravelAI",
    heroTitle: "Deine Reise. Organisiert von der KI.",
    heroSubtitle:
      "Plattform im Aufbau: Authentifizierung und Datenbank sind in dieser Phase aktiv.",
    notAvailableYet:
      "Flug-/Hotelsuche und KI-Assistent sind noch nicht verfügbar. Keine erfundenen Angebote.",
    login: "Anmelden",
    register: "Registrieren",
    profile: "Profil",
    logout: "Abmelden",
    email: "E-Mail",
    password: "Passwort",
    name: "Name",
    submitLogin: "Anmelden",
    submitRegister: "Konto erstellen",
    updateProfile: "Profil speichern",
    resetPassword: "Passwort zurücksetzen",
    requestReset: "Reset-Link senden",
    confirmReset: "Neues Passwort festlegen",
    verifyEmail: "E-Mail bestätigen",
    oauthNotConfigured: "OAuth ist nicht konfiguriert",
    emailNotConfigured: "E-Mail-Anbieter ist nicht konfiguriert",
    homeCtaHonest:
      "Du kannst dich registrieren und dein Profil verwalten. Suche und Buchungen folgen später.",
  },
  fr: {
    brand: "TravelAI",
    heroTitle: "Votre voyage. Organisé par l’IA.",
    heroSubtitle:
      "Plateforme en construction : authentification et base de données actives à cette phase.",
    notAvailableYet:
      "Recherche vols/hôtels et assistant IA pas encore disponibles. Aucune offre inventée.",
    login: "Connexion",
    register: "Inscription",
    profile: "Profil",
    logout: "Déconnexion",
    email: "E-mail",
    password: "Mot de passe",
    name: "Nom",
    submitLogin: "Se connecter",
    submitRegister: "Créer un compte",
    updateProfile: "Enregistrer le profil",
    resetPassword: "Réinitialiser le mot de passe",
    requestReset: "Envoyer le lien",
    confirmReset: "Définir le nouveau mot de passe",
    verifyEmail: "Vérifier l’e-mail",
    oauthNotConfigured: "OAuth non configuré",
    emailNotConfigured: "Fournisseur e-mail non configuré",
    homeCtaHonest:
      "Vous pouvez vous inscrire et gérer votre profil. Recherche et réservations viendront plus tard.",
  },
  es: {
    brand: "TravelAI",
    heroTitle: "Tu viaje. Organizado por la IA.",
    heroSubtitle:
      "Plataforma en construcción: autenticación y base de datos activas en esta fase.",
    notAvailableYet:
      "Búsqueda de vuelos/hoteles y asistente IA aún no disponibles. Sin ofertas inventadas.",
    login: "Iniciar sesión",
    register: "Registrarse",
    profile: "Perfil",
    logout: "Cerrar sesión",
    email: "Correo",
    password: "Contraseña",
    name: "Nombre",
    submitLogin: "Entrar",
    submitRegister: "Crear cuenta",
    updateProfile: "Guardar perfil",
    resetPassword: "Restablecer contraseña",
    requestReset: "Enviar enlace",
    confirmReset: "Establecer nueva contraseña",
    verifyEmail: "Verificar correo",
    oauthNotConfigured: "OAuth no configurado",
    emailNotConfigured: "Proveedor de correo no configurado",
    homeCtaHonest:
      "Puedes registrarte y gestionar tu perfil. La búsqueda y las reservas llegarán después.",
  },
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
