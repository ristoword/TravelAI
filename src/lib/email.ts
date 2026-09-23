/**
 * Email delivery stub for Phase 2.
 * If EMAIL_SERVER / EMAIL_FROM are not set, we do NOT pretend to send mail.
 */
export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.EMAIL_SERVER?.trim() && process.env.EMAIL_FROM?.trim(),
  );
}

export type EmailSendResult =
  | { sent: true }
  | { sent: false; reason: "email_provider_not_configured" };

export async function sendEmail(_opts: {
  to: string;
  subject: string;
  text: string;
}): Promise<EmailSendResult> {
  void _opts;
  if (!isEmailConfigured()) {
    return { sent: false, reason: "email_provider_not_configured" };
  }

  // Real SMTP transport would be wired here when EMAIL_* env vars are set.
  // Not implemented in Phase 2 beyond configuration detection.
  return { sent: false, reason: "email_provider_not_configured" };
}
