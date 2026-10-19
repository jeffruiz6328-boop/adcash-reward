/**
 * Email helpers. Currently no-op (returns false) so the site builds without nodemailer.
 * On-site ban page, failed popup, support chat, and activation codes still work.
 * To enable real Gmail SMTP later, we can add nodemailer back once App Password works.
 */

const SITE_NAME = "AdCash Rewards";

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  console.log("[email] skipped:", opts.subject, "→", opts.to);
  return false;
}

export async function emailWelcome(to: string, name?: string | null) {
  return sendEmail({
    to,
    subject: `Welcome to ${SITE_NAME}`,
    html: "",
  });
}

export async function emailWithdrawalStatus(
  to: string,
  opts: { amount: number; method: string; status: string; activationCode?: string | null }
) {
  return sendEmail({
    to,
    subject: `Withdrawal ${opts.status} – ${SITE_NAME}`,
    html: "",
  });
}

export async function emailActivationCode(
  to: string,
  opts: { amount: number; method: string; code: string }
) {
  return sendEmail({
    to,
    subject: `Your activation code – ${SITE_NAME}`,
    html: "",
  });
}

export async function emailSupportReply(to: string, opts: { subject: string; reply: string }) {
  return sendEmail({
    to,
    subject: `Support reply: ${opts.subject}`,
    html: "",
  });
}

export async function emailBanned(to: string) {
  return sendEmail({
    to,
    subject: `Account banned – ${SITE_NAME}`,
    html: "",
  });
}

export async function emailPasswordReset(to: string, resetUrl: string) {
  return sendEmail({
    to,
    subject: `Reset your password – ${SITE_NAME}`,
    html: "",
  });
}
