import * as oidc from "openid-client";

import type { Configuration } from "openid-client";

export const GOOGLE_PROVIDER = "google";

export const OAUTH_STATE_COOKIE = "google_oauth_state";
export const OAUTH_VERIFIER_COOKIE = "google_oauth_verifier";
export const OAUTH_NONCE_COOKIE = "google_oauth_nonce";

export const OAUTH_COOKIE_MAX_AGE = 60 * 10;

export function getAppUrl() {
  return process.env.APP_URL ?? "http://localhost:3000";
}

export function getGoogleRedirectUri() {
  return `${getAppUrl()}/api/auth/google/callback`;
}

export function isGoogleOAuthConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );
}

let configurationPromise: Promise<Configuration> | null = null;

export function getGoogleConfiguration() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Google OAuth is not configured: set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET",
    );
  }

  configurationPromise ??= oidc.discovery(
    new URL("https://accounts.google.com"),
    clientId,
    clientSecret,
  );

  return configurationPromise;
}
