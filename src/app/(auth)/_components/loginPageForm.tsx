"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/src/schemas/auth.schema";
import { AuthInput } from "@/src/app/(auth)/_components/AuthInput";
import { login, resendVerification } from "@/src/actions/auth.actions";
import GoogleButton from "./googleButton";import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type Props = {
  oauthError?: string;
  googleEnabled: boolean;
};

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  google_denied: "Google sign-in was cancelled.",
  google_invalid_state:
    "Your sign-in session expired. Please try signing in again.",
  google_email_unverified:
    "Your Google account's email is not verified by Google, so it cannot be used to sign in.",
  google_invalid_response:
    "We couldn't read your Google account details. Please try again.",
  google_failed: "Something went wrong with Google sign-in. Please try again.",
  google_unavailable:
    "Google sign-in is temporarily unavailable. Please try again later.",
};

const LoginPageForm = ({ oauthError, googleEnabled }: Props) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);

    const result = await login(formData);

    if (result.error) {
      toast.error(result.error);

      if (result.needsVerification) {
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
      }
      return;
    }

    toast.success("Login successful!");
    router.push("/dashboard");
  };

  async function handleResend() {
    const email = getValues("email");

    if (!email) {
      toast.error("Enter your email first so we know where to send the link.");
      return;
    }

    const formData = new FormData();
    formData.append("email", email);

    await resendVerification(formData);
    toast.success(
      "If an unverified Nexus account exists for that email, we've sent a new verification link.",
    );
  }

  return (
    <>
      <h2 className="card-title text-2xl font-bold justify-center mb-4">
        Welcome back
      </h2>

      {oauthError && (
        <div role="alert" className="alert alert-warning text-sm mb-4">
          {OAUTH_ERROR_MESSAGES[oauthError] ?? OAUTH_ERROR_MESSAGES.google_failed}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <AuthInput
          label="Email"
          type="email"
          placeholder="john@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <AuthInput
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary w-full mt-2"
        >
          Sign in
        </button>
      </form>

      <button
        type="button"
        onClick={handleResend}
        className="btn btn-link btn-sm w-full text-base-content/60"
      >
        Resend verification email
      </button>

      <div className="divider">OR</div>

      <GoogleButton enabled={googleEnabled} />

      <p className="text-center text-sm mt-3">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="link link-primary">
          Create one
        </Link>
      </p>
      <ToastContainer position="top-right" />
    </>
  );
};

export default LoginPageForm;
