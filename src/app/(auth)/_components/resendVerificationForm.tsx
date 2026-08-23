"use client";

import { useState } from "react";

import { resendVerification } from "@/src/actions/auth.actions";

type Props = {
  defaultEmail?: string;
};

export default function ResendVerificationForm({ defaultEmail = "" }: Props) {
  const [email, setEmail] = useState(defaultEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("email", email);

      await resendVerification(formData);
      setSent(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div role="status" className="alert alert-success text-sm">
        If an unverified Nexus account exists for that email, we&apos;ve sent a
        new verification link.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label className="text-left text-xs font-semibold uppercase tracking-wide opacity-70">
        Didn&apos;t get the email?
      </label>
      <input
        type="email"
        required
        placeholder="john@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="input input-bordered w-full"
      />
      <button type="submit" disabled={isSubmitting} className="btn btn-ghost">
        {isSubmitting ? (
          <span className="loading loading-spinner loading-sm" />
        ) : (
          "Resend verification email"
        )}
      </button>
    </form>
  );
}
