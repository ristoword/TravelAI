export function isGoogleOAuthConfigured(): boolean {
  return Boolean(
    process.env.AUTH_GOOGLE_ID?.trim() &&
      process.env.AUTH_GOOGLE_SECRET?.trim(),
  );
}

export function isGitHubOAuthConfigured(): boolean {
  return Boolean(
    process.env.AUTH_GITHUB_ID?.trim() &&
      process.env.AUTH_GITHUB_SECRET?.trim(),
  );
}

export function getOAuthStatus() {
  return {
    google: isGoogleOAuthConfigured() ? "configured" : "not_configured",
    github: isGitHubOAuthConfigured() ? "configured" : "not_configured",
  } as const;
}
