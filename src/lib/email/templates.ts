function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function invitationEmailHtml(options: {
  heading: string;
  message: string;
  invitationUrl: string;
  buttonLabel: string;
}) {
  return `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:12px;padding:40px;">
            <tr>
              <td style="text-align:center;padding-bottom:24px;">
                <span style="font-size:24px;font-weight:bold;color:#570df8;">Nexus</span>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:16px;font-size:20px;font-weight:bold;color:#1f2937;text-align:center;">
                ${options.heading}
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:24px;font-size:14px;line-height:21px;color:#6b7280;text-align:center;">
                ${options.message}
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom:24px;">
                <a href="${options.invitationUrl}"
                   style="background-color:#570df8;color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;padding:12px 32px;border-radius:8px;display:inline-block;">
                  ${options.buttonLabel}
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:8px;font-size:12px;line-height:18px;color:#9ca3af;text-align:center;">
                This link expires in 7 days.
              </td>
            </tr>
            <tr>
              <td style="font-size:12px;line-height:18px;color:#9ca3af;text-align:center;">
                If you weren't expecting this invitation, you can safely ignore this email.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
}

export function workspaceInvitationEmailHtml(
  inviterName: string,
  workspaceName: string,
  invitationUrl: string,
) {
  const inviterDisplayName = inviterName ? escapeHtml(inviterName) : "Someone";
  const workspaceDisplayName = escapeHtml(workspaceName);

  return invitationEmailHtml({
    heading: "You're invited to join a workspace",
    message: `${inviterDisplayName} has invited you to join the "${workspaceDisplayName}" workspace on Nexus.`,
    invitationUrl,
    buttonLabel: "View Invitation",
  });
}

export function projectInvitationEmailHtml(
  inviterName: string,
  projectName: string,
  invitationUrl: string,
) {
  const inviterDisplayName = inviterName ? escapeHtml(inviterName) : "Someone";
  const projectDisplayName = escapeHtml(projectName);

  return invitationEmailHtml({
    heading: "You're invited to join a project",
    message: `${inviterDisplayName} has invited you to join the project "${projectDisplayName}" on Nexus.`,
    invitationUrl,
    buttonLabel: "View Invitation",
  });
}

export function verificationEmailHtml(name: string, verificationUrl: string) {
  const displayName = name ? escapeHtml(name.split(" ")[0]) : "there";

  return `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:12px;padding:40px;">
            <tr>
              <td style="text-align:center;padding-bottom:24px;">
                <span style="font-size:24px;font-weight:bold;color:#570df8;">Nexus</span>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:16px;font-size:20px;font-weight:bold;color:#1f2937;text-align:center;">
                Verify your email address
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:24px;font-size:14px;line-height:21px;color:#6b7280;text-align:center;">
                Hi ${displayName}, welcome to Nexus! Please confirm your email address so we know it's really you.
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom:24px;">
                <a href="${verificationUrl}"
                   style="background-color:#570df8;color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;padding:12px 32px;border-radius:8px;display:inline-block;">
                  Verify email
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:8px;font-size:12px;line-height:18px;color:#9ca3af;text-align:center;">
                This link expires in 24 hours and can only be used once.
              </td>
            </tr>
            <tr>
              <td style="font-size:12px;line-height:18px;color:#9ca3af;text-align:center;">
                If you didn't create a Nexus account, you can safely ignore this email.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
}
