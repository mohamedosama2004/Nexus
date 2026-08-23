import { Resend } from "resend";

import { verificationEmailHtml } from "./templates";

const EMAIL_FROM = process.env.EMAIL_FROM ?? "Nexus <onboarding@resend.dev>";

let resendClient: Resend | null = null;

function getResendClient(apiKey: string) {
  resendClient ??= new Resend(apiKey);
  return resendClient;
}

type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "RESEND_API_KEY is required in production to send emails",
      );
    }

    // Local development fallback (no provider configured):
    // print the email content instead of failing silently.
    console.info(
      `[email:dev] Skipped sending "${subject}" to ${to} — no RESEND_API_KEY set.`,
    );

    if (text) {
      console.info(`[email:dev] ---- EMAIL TEXT START ----\n${text}\n[email:dev] ---- EMAIL TEXT END ----`);
    } else {
      console.debug("[email:dev] Body:\n", html);
    }

    return { id: "dev-fallback" };
  }

  const client = getResendClient(apiKey);

  const { data, error } = await client.emails.send({
    from: EMAIL_FROM,
    to,
    subject,
    html,
    ...(text !== undefined && { text }),
  });

  if (error) {
    throw new Error(`Email delivery failed: ${error.message}`);
  }

  return data;
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  verificationUrl: string,
) {
  return sendEmail({
    to,
    subject: "Verify your Nexus email address",
    html: verificationEmailHtml(name, verificationUrl),
    text: [
      `Hi ${name || "there"}, welcome to Nexus!`,
      "",
      "Confirm your email address by opening this link:",
      verificationUrl,
      "",
      "This link expires in 24 hours and can only be used once.",
      "If you didn't create a Nexus account, you can safely ignore this email.",
    ].join("\n"),
  });
}
