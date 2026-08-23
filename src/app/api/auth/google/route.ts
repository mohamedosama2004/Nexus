import { NextResponse } from "next/server";
import * as oidc from "openid-client";

import {
  OAUTH_COOKIE_MAX_AGE,
  OAUTH_NONCE_COOKIE,
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
  getAppUrl,
  getGoogleConfiguration,
  getGoogleRedirectUri,
} from "../../../../lib/oauth/google";

export async function GET() {
  try {
    const configuration = await getGoogleConfiguration();

    const state = oidc.randomState();
    const nonce = oidc.randomNonce();
    const codeVerifier = oidc.randomPKCECodeVerifier();
    const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);

    const authorizationUrl = oidc.buildAuthorizationUrl(configuration, {
      redirect_uri: getGoogleRedirectUri(),
      scope: "openid profile email",
      state,
      nonce,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    const secure = process.env.NODE_ENV === "production";

    const response = NextResponse.redirect(authorizationUrl.toString());

    // Scoped so these cookies are only ever sent to the callback route.
    const cookieOptions = {
      httpOnly: true,
      secure,
      sameSite: "lax" as const,
      maxAge: OAUTH_COOKIE_MAX_AGE,
      path: "/api/auth/google/callback",
    };

    response.cookies.set(OAUTH_STATE_COOKIE, state, cookieOptions);
    response.cookies.set(OAUTH_VERIFIER_COOKIE, codeVerifier, cookieOptions);
    response.cookies.set(OAUTH_NONCE_COOKIE, nonce, cookieOptions);

    return response;
  } catch (error) {
    console.error("Google OAuth start error:", error);

    return NextResponse.redirect(
      new URL("/login?error=google_unavailable", getAppUrl()),
    );
  }
}
