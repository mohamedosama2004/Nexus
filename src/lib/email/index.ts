import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

import {
  projectInvitationEmailHtml,
  verificationEmailHtml,
  workspaceInvitationEmailHtml,
} from "./templates";

import { getAppUrl } from "../email-verification";

const EMAIL_FROM =
  process.env.EMAIL_FROM ?? "Nexus <no-reply@nexus.app>";

let transporter: Transporter | null = null;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  // Gmail SMTP + App Password. SMTP_PASS is a Gmail App Password,
  // not the account's normal password.
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "SMTP credentials (SMTP_USER/SMTP_PASS) are required in production to send emails",
      );
    }

    // Local development fallback (no provider configured):
    // print the email content instead of failing silently.
    console.info(
      `[email:dev] Skipped sending "${subject}" to ${to} — no SMTP credentials set.`,
    );

    if (text) {
      console.info(`[email:dev] ---- EMAIL TEXT START ----\n${text}\n[email:dev] ---- EMAIL TEXT END ----`);
    } else {
      console.debug("[email:dev] Body:\n", html);
    }

    return { messageId: "dev-fallback" };
  }

  const client = getTransporter();

  const info = await client.sendMail({
    from: EMAIL_FROM,
    to,
    subject,
    html,
    ...(text !== undefined && { text }),
  });

  return { messageId: info.messageId };
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

export function buildInvitationUrl(invitationId: string) {
  return `${getAppUrl()}/invitations/${invitationId}`;
}

export async function sendWorkspaceInvitationEmail(
  to: string,
  inviterName: string,
  workspaceName: string,
  invitationUrl: string,
) {
  return sendEmail({
    to,
    subject: `${inviterName || "Someone"} invited you to join ${workspaceName} on Nexus`,
    html: workspaceInvitationEmailHtml(inviterName, workspaceName, invitationUrl),
    text: [
      `${inviterName || "Someone"} has invited you to join the "${workspaceName}" workspace on Nexus.`,
      "",
      "Open this link to view the invitation:",
      invitationUrl,
      "",
      "This link expires in 7 days.",
      "If you weren't expecting this invitation, you can safely ignore this email.",
    ].join("\n"),
  });
}

export async function sendProjectInvitationEmail(
  to: string,
  inviterName: string,
  projectName: string,
  invitationUrl: string,
) {
  return sendEmail({
    to,
    subject: `${inviterName || "Someone"} invited you to the project "${projectName}" on Nexus`,
    html: projectInvitationEmailHtml(inviterName, projectName, invitationUrl),
    text: [
      `${inviterName || "Someone"} has invited you to join the project "${projectName}" on Nexus.`,
      "",
      "Open this link to view the invitation:",
      invitationUrl,
      "",
      "This link expires in 7 days.",
      "If you weren't expecting this invitation, you can safely ignore this email.",
    ].join("\n"),
  });
}
