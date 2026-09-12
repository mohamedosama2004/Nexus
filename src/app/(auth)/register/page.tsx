import type { Metadata } from "next";

import RegisterPageForm from "../_components/registerPageForm";
import { isGoogleOAuthConfigured } from "@/src/lib/oauth/google";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Create your Nexus account and start planning, tracking, and shipping your team's work.",
};

export default function RegisterPage() {
  return (
    <RegisterPageForm googleEnabled={isGoogleOAuthConfigured()} />
  );
}
