"use server";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import { loginSchema, registerSchema, emailOnlySchema } from "../schemas/auth.schema";
import {
  buildVerificationUrl,
  createEmailVerificationToken,
} from "../lib/email-verification";
import { sendVerificationEmail } from "../lib/email";
import { createUserSession } from "../lib/session";
import {
  RATE_LIMIT_EXCEEDED_MESSAGE,
  consumeRateLimit,
  getRateLimitClientIp,
} from "../lib/rate-limit";

export async function register(formData: FormData) {
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");

  const result = registerSchema.safeParse({
    name,
    email,
    password,
  });

  if (!result.success) {
    return {
      error: "Invalid input",
    };
  }

  const clientIp = await getRateLimitClientIp();

  const rateLimit = await consumeRateLimit(`register:${clientIp}`, "register");

  if (!rateLimit.allowed) {
    return {
      error: RATE_LIMIT_EXCEEDED_MESSAGE,
    };
  }

  const {
    name: validName,
    email: validEmail,
    password: validPassword,
  } = result.data;

  const existingUser = await prisma.user.findUnique({
    where: {
      email: validEmail,
    },
  });

  if (existingUser) {
    return {
      error: "Email already exists",
    };
  }

  const passwordHash = await bcrypt.hash(validPassword, 10);

  const resultTransaction = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: validName,
        email: validEmail,
        passwordHash,
      },
    });

    const workspace = await tx.workspace.create({
      data: {
        name: `${validName}'s Workspace`,
      },
    });

    await tx.membership.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        role: "OWNER",
      },
    });

    return {
      user,
      workspace,
    };
  });

  const verificationToken =
    await createEmailVerificationToken(resultTransaction.user.id);

  try {
    await sendVerificationEmail(
      validEmail,
      validName,
      buildVerificationUrl(verificationToken),
    );
  } catch {
    // Registration still succeeded; the user can request a new
    // verification email. Never log the token itself.
    console.error("Failed to send verification email after registration");
  }

  return {
    success: true,
    userId: resultTransaction.user.id,
  };
}

export async function login(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  const result = loginSchema.safeParse({
    email,
    password,
  });

  if (!result.success) {
    return {
      error: "Invalid email or password",
    };
  }

  const { email: validEmail, password: validPassword } = result.data;

  const clientIp = await getRateLimitClientIp();

  // Limit both per-IP (bursts / spray from one host) and per-email+IP
  // (credential stuffing against a single account).
  const [ipLimit, accountLimit] = await Promise.all([
    consumeRateLimit(`login:${clientIp}`, "login"),
    consumeRateLimit(`login:${validEmail.toLowerCase()}:${clientIp}`, "login"),
  ]);

  if (!ipLimit.allowed || !accountLimit.allowed) {
    return {
      error: RATE_LIMIT_EXCEEDED_MESSAGE,
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      email: validEmail,
    },
  });

  if (!user) {
    return {
      error: "Invalid email or password",
    };
  }

  // Google-only account: no password has ever been set.
  if (!user.passwordHash) {
    return {
      error: "Invalid email or password",
    };
  }

  const passwordMatch = await bcrypt.compare(validPassword, user.passwordHash);

  if (!passwordMatch) {
    return {
      error: "Invalid email or password",
    };
  }

  if (!user.emailVerifiedAt) {
    return {
      error:
        "Please verify your email address before signing in. Check your inbox for a verification link.",
      needsVerification: true,
    };
  }

  await createUserSession(user.id);

  return {
    success: true,
  };
}

export async function resendVerification(formData: FormData) {
  const email = formData.get("email");

  const result = emailOnlySchema.safeParse({ email });

  if (!result.success) {
    // Deliberately generic: do not reveal whether the email exists.
    return { success: true };
  }

  const clientIp = await getRateLimitClientIp();

  const rateLimit = await consumeRateLimit(
    `verification-resend:${clientIp}:${result.data.email.toLowerCase()}`,
    "verificationResend",
  );

  if (!rateLimit.allowed) {
    return {
      error: RATE_LIMIT_EXCEEDED_MESSAGE,
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      email: result.data.email,
    },
  });

  if (user && !user.emailVerifiedAt) {
    const verificationToken = await createEmailVerificationToken(user.id);

    try {
      await sendVerificationEmail(
        user.email,
        user.name,
        buildVerificationUrl(verificationToken),
      );
    } catch {
      console.error("Failed to send verification email on resend");
    }
  }

  return { success: true };
}

export async function logout() {
  const cookieStore = await cookies();

  const sessionToken = cookieStore.get("session_token")?.value;

  if (sessionToken) {
    // deleteMany (not delete) so logging out never throws when the row was
    // already removed or expired.
    await prisma.session.deleteMany({
      where: {
        token: sessionToken,
      },
    });
  }

  cookieStore.delete("session_token");
}
