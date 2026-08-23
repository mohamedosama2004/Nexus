import { cookies } from "next/headers";

import { prisma } from "./prisma";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export async function createUserSession(userId: string) {
  const sessionToken = crypto.randomUUID();

  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.session.create({
    data: {
      userId,
      token: sessionToken,
      expiresAt,
    },
  });

  const cookieStore = await cookies();

  cookieStore.set("session_token", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}
