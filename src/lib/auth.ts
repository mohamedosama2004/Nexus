import { cookies } from "next/headers";
import { prisma } from "../lib/prisma";

export { toPublicUser } from "./user";
export type { PublicUser } from "./user";

export async function getCurrentUser() {
  const cookieStore = await cookies();

  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: {
      token: sessionToken,
    },
    include: {
      user: {
        include: {
          avatarFile: true,
        },
        omit: {
          passwordHash: true,
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt < new Date()) {
    // Opportunistically delete the expired row so the DB does not
    // accumulate dead sessions for users who come back after expiry.
    await prisma.session.deleteMany({
      where: { token: sessionToken },
    });
    return null;
  }

  return session.user;
}