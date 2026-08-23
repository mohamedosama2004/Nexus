import crypto from "crypto";

import { prisma } from "./prisma";

const VERIFICATION_TOKEN_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

export function getAppUrl() {
  return process.env.APP_URL ?? "http://localhost:3000";
}

function hashToken(rawToken: string) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export async function createEmailVerificationToken(userId: string) {
  const rawToken = crypto.randomBytes(32).toString("hex");

  // Only one active verification token per user.
  await prisma.emailVerificationToken.deleteMany({
    where: {
      userId,
      consumedAt: null,
    },
  });

  await prisma.emailVerificationToken.create({
    data: {
      tokenHash: hashToken(rawToken),
      userId,
      expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
    },
  });

  return rawToken;
}

export function buildVerificationUrl(rawToken: string) {
  return `${getAppUrl()}/verify-email?token=${rawToken}`;
}

export type EmailVerificationResult =
  | "success"
  | "invalid"
  | "expired"
  | "already-used";

export async function consumeEmailVerificationToken(
  rawToken: string,
): Promise<EmailVerificationResult> {
  const token = await prisma.emailVerificationToken.findUnique({
    where: {
      tokenHash: hashToken(rawToken),
    },
  });

  if (!token) {
    return "invalid";
  }

  if (token.consumedAt) {
    return "already-used";
  }

  if (token.expiresAt < new Date()) {
    return "expired";
  }

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: token.userId,
      },
      data: {
        emailVerifiedAt: new Date(),
      },
    }),
    prisma.emailVerificationToken.update({
      where: {
        id: token.id,
      },
      data: {
        consumedAt: new Date(),
      },
    }),
  ]);

  return "success";
}
