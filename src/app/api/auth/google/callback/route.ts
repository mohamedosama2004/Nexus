import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import * as oidc from "openid-client";

import { prisma } from "../../../../../lib/prisma";
import { createUserSession } from "../../../../../lib/session";
import {
  GOOGLE_PROVIDER,
  OAUTH_NONCE_COOKIE,
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
  getAppUrl,
  getGoogleConfiguration,
  getGoogleRedirectUri,
} from "../../../../../lib/oauth/google";

function failure(request: Request, reason: string) {
  return NextResponse.redirect(
    new URL(`/login?error=${reason}`, getAppUrl()),
  );
}

export async function GET(request: Request) {
  const cookieStore = await cookies();

  try {
    const configuration = await getGoogleConfiguration();

    const state = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
    const codeVerifier = cookieStore.get(OAUTH_VERIFIER_COOKIE)?.value;
    const nonce = cookieStore.get(OAUTH_NONCE_COOKIE)?.value;

    // Clear the one-time OAuth cookies no matter what happens.
    cookieStore.delete(OAUTH_STATE_COOKIE);
    cookieStore.delete(OAUTH_VERIFIER_COOKIE);
    cookieStore.delete(OAUTH_NONCE_COOKIE);

    if (!state || !codeVerifier || !nonce) {
      return failure(request, "google_invalid_state");
    }

    const url = new URL(request.url);

    if (url.searchParams.get("error")) {
      return failure(request, "google_denied");
    }

    const tokens = await oidc.authorizationCodeGrant(
      configuration,
      url,
      {
        expectedState: state,
        expectedNonce: nonce,
        pkceCodeVerifier: codeVerifier,
      },
      { redirect_uri: getGoogleRedirectUri() },
    );

    const claims = tokens.claims();

    if (!claims?.sub) {
      return failure(request, "google_invalid_response");
    }

    // Fetch identity server-side over TLS; expectedSubject ties the
    // userinfo response to the validated ID token's `sub` claim.
    const userinfo = await oidc.fetchUserInfo(
      configuration,
      tokens.access_token,
      claims.sub,
    );

    const { email, email_verified: emailVerified, name } = userinfo;

    if (!email || !emailVerified) {
      return failure(request, "google_email_unverified");
    }

    let userId: string;

    const existingAccount = await prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: GOOGLE_PROVIDER,
          providerAccountId: claims.sub,
        },
      },
      select: {
        userId: true,
      },
    });

    if (existingAccount) {
      userId = existingAccount.userId;
    } else {
      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true, emailVerifiedAt: true },
      });

      if (existingUser) {
        // Link the Google identity onto the existing account and
        // preserve its id, memberships, projects, invitations, etc.
        await prisma.$transaction([
          prisma.oAuthAccount.create({
            data: {
              userId: existingUser.id,
              provider: GOOGLE_PROVIDER,
              providerAccountId: claims.sub,
            },
          }),
          ...(existingUser.emailVerifiedAt
            ? []
            : [
                prisma.user.update({
                  where: { id: existingUser.id },
                  data: { emailVerifiedAt: new Date() },
                }),
              ]),
        ]);

        userId = existingUser.id;
      } else {
        // Brand-new Google user: mirror the register flow
        // (user + workspace + OWNER membership).
        const user = await prisma.$transaction(async (tx) => {
          const displayName =
            name ?? email.split("@")[0];

          const created = await tx.user.create({
            data: {
              name: displayName,
              email,
              passwordHash: null,
              emailVerifiedAt: new Date(),
            },
          });

          const workspace = await tx.workspace.create({
            data: {
              name: `${displayName}'s Workspace`,
            },
          });

          await tx.membership.create({
            data: {
              userId: created.id,
              workspaceId: workspace.id,
              role: "OWNER",
            },
          });

          await tx.oAuthAccount.create({
            data: {
              userId: created.id,
              provider: GOOGLE_PROVIDER,
              providerAccountId: claims.sub,
            },
          });

          return created;
        });

        userId = user.id;
      }
    }

    await createUserSession(userId);

    return NextResponse.redirect(new URL("/dashboard", getAppUrl()));
  } catch (error) {
    console.error("Google OAuth callback error:", error);

    return NextResponse.redirect(
      new URL("/login?error=google_failed", getAppUrl()),
    );
  }
}
