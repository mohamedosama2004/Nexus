import Link from "next/link";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

import { consumeEmailVerificationToken } from "@/src/lib/email-verification";
import ResendVerificationForm from "../_components/resendVerificationForm";

type Props = {
  searchParams: Promise<{
    token?: string;
    email?: string;
  }>;
};

const iconClass = "size-12 text-primary";

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { token, email } = await searchParams;

  if (!token) {
    return (
      <>
        <div className="flex flex-col items-center gap-3 text-center">
          <EnvelopeIcon className={iconClass} />
          <h2 className="card-title text-xl font-bold justify-center">
            Check your inbox
          </h2>
          <p className="text-sm text-base-content/70">
            We sent you a verification link. Click it to activate your account.
            The link expires in 24 hours.
          </p>
        </div>

        <ResendVerificationForm defaultEmail={email ?? ""} />

        <p className="text-center text-sm">
          Already verified?{" "}
          <Link href="/login" className="link link-primary">
            Sign in
          </Link>
        </p>
      </>
    );
  }

  const result = await consumeEmailVerificationToken(token);

  if (result === "success") {
    return (
      <>
        <div className="flex flex-col items-center gap-3 text-center">
          <CheckCircleIcon className="size-12 text-success" />
          <h2 className="card-title text-xl font-bold justify-center">
            Email verified!
          </h2>
          <p className="text-sm text-base-content/70">
            Your email address has been confirmed. You can now sign in to
            Nexus.
          </p>
        </div>
        <Link href="/login" className="btn btn-primary w-full mt-4">
          Sign in
        </Link>
      </>
    );
  }

  const messages = {
    invalid: {
      title: "Invalid link",
      description:
        "This verification link doesn't exist or is malformed. Request a new one below.",
      icon: (
        <ExclamationTriangleIcon className="size-12 text-warning" />
      ),
    },
    expired: {
      title: "Link expired",
      description:
        "This verification link has expired for security reasons. Request a new one below.",
      icon: <ExclamationTriangleIcon className={iconClass} />,
    },
    "already-used": {
      title: "Link already used",
      description:
        "This verification link was already used. If your email isn't verified yet, request a new one below.",
      icon: <XCircleIcon className="size-12 text-error" />,
    },
  } as const;

  const content = messages[result];

  return (
    <>
      <div className="flex flex-col items-center gap-3 text-center">
        {content.icon}
        <h2 className="card-title text-xl font-bold justify-center">
          {content.title}
        </h2>
        <p className="text-sm text-base-content/70">{content.description}</p>
      </div>

      <ResendVerificationForm defaultEmail="" />

      <p className="text-center text-sm">
        Need help?{" "}
        <Link href="/register" className="link link-primary">
          Create a new account
        </Link>
      </p>
    </>
  );
}
