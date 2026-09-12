import type { Metadata } from "next";

import LoginPageForm from "../_components/loginPageForm";
import { isGoogleOAuthConfigured } from "@/src/lib/oauth/google";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Nexus to manage your projects and workspace.",
};

type Props = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <LoginPageForm
      oauthError={error}
      googleEnabled={isGoogleOAuthConfigured()}
    />
  );
}
