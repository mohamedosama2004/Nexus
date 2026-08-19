"use server";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import { loginSchema, registerSchema } from "../schemas/auth.schema";

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

  const user = await prisma.user.create({
    data: {
      name: validName,
      email: validEmail,
      passwordHash,
    },
  });

  const sessionToken = crypto.randomUUID();

  await prisma.session.create({
    data: {
      userId: user.id,
      token: sessionToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },
  });
  const cookieStore = await cookies();

cookieStore.set("session_token", sessionToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
  path: "/",
});

  return {
    success: true,
    userId: user.id,
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

  const passwordMatch = await bcrypt.compare(
    validPassword,
    user.passwordHash
  );

  if (!passwordMatch) {
    return {
      error: "Invalid email or password",
    };
  }

  const sessionToken = crypto.randomUUID();

  await prisma.session.create({
    data: {
      userId: user.id,
      token: sessionToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },
  });

  const cookieStore = await cookies();

  cookieStore.set("session_token", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    path: "/",
  });

  return {
    success: true,
  };
}

export async function logout() {
  const cookieStore = await cookies();

  const sessionToken = cookieStore.get("session_token")?.value;

  if (sessionToken) {
    await prisma.session.delete({
      where: {
        token: sessionToken,
      },
    });
  }

  cookieStore.delete("session_token");
}