/**
 * Gmail SMTP email.
 * Env on Vercel: SMTP_USER, SMTP_PASS (App Password), EMAIL_FROM
 */

const SITE_NAME = "AdCash Rewards";
const SITE_URL = process.env.NEXTAUTH_URL || "https://adcash-reward.vercel.app";

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from =
    process.env.EMAIL_FROM ||
    (user ? `AdCash Rewards <${user}>` : null);

  if (!user || !pass || !from) {
    console.log("[email] skipped (missing SMTP env):", opts.subject, "→", opts.to);
    return false;
  }

  try {
    // Dynamic import + external package so Next/webpack does not break the build
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass: pass.replace(/\s/g, "") },
    });

    await transporter.sendMail({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    return true;
  } catch (err) {
    console.error("[email] error:", err);
    return false;
  }
}

function layout(title: string, body: string) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#09090b;font-family:system-ui,sans-serif;">
  <div style="max-width:520px;margin:24px auto;background:#18181b;border:1px solid #27272a;border-radius:16px;overflow:hidden;">
    <div style="background:#22c55e;padding:16px 24px;"><strong style="color:#000;font-size:16px;">${SITE_NAME}</strong></div>
    <div style="padding:28px 24px;color:#e4e4e7;">
      <h1 style="margin:0 0 12px;font-size:20px;color:#fff;">${title}</h1>
      ${body}
      <p style="margin:24px 0 0;font-size:12px;color:#71717a;">
        <a href="${SITE_URL}" style="color:#22c55e;text-decoration:none;">Open ${SITE_NAME}</a>
      </p>
    </div>
  </div></body></html>`;
}

export async function emailWelcome(to: string, name?: string | null) {
  return sendEmail({
    to,
    subject: `Welcome to ${SITE_NAME}`,
    html: layout(
      "Welcome!",
      `<p>Hi ${name || "there"},</p><p>Your account is ready. Watch ads, complete tasks, and withdraw via PayPal, Bitcoin, or gift cards.</p>
       <p><a href="${SITE_URL}/dashboard" style="display:inline-block;background:#22c55e;color:#000;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600;">Go to Dashboard</a></p>`
    ),
  });
}

export async function emailWithdrawalStatus(
  to: string,
  opts: { amount: number; method: string; status: string; activationCode?: string | null }
) {
  const amount = `$${Number(opts.amount).toFixed(2)}`;
  if (opts.status === "rejected") {
    return sendEmail({
      to,
      subject: `Withdrawal failed – ${SITE_NAME}`,
      html: layout(
        "Withdrawal Failed",
        `<p>Your withdrawal of <strong>${amount}</strong> (${opts.method}) could not be completed.</p>
         <p>Please contact support for more information.</p>
         <p><a href="${SITE_URL}/support" style="color:#22c55e;">Contact Support</a></p>`
      ),
    });
  }
  if (opts.status === "approved") {
    return sendEmail({
      to,
      subject: `Withdrawal successful – ${SITE_NAME}`,
      html: layout(
        "Withdrawal Successful",
        `<p>Your withdrawal of <strong>${amount}</strong> via <strong>${opts.method}</strong> was successful.</p>`
      ),
    });
  }
  if (opts.status === "processing") {
    return sendEmail({
      to,
      subject: `Withdrawal processing – ${SITE_NAME}`,
      html: layout(
        "Withdrawal Processing",
        `<p>Your withdrawal of <strong>${amount}</strong> (${opts.method}) is now being processed.</p>`
      ),
    });
  }
  return false;
}

export async function emailActivationCode(
  to: string,
  opts: { amount: number; method: string; code: string }
) {
  return sendEmail({
    to,
    subject: `Your activation code – ${SITE_NAME}`,
    html: layout(
      "Activation Code",
      `<p>Code for withdrawal of <strong>$${Number(opts.amount).toFixed(2)}</strong> (${opts.method}):</p>
       <p style="font-size:22px;letter-spacing:3px;font-family:monospace;background:#09090b;padding:14px;border-radius:8px;text-align:center;color:#22c55e;"><strong>${opts.code}</strong></p>
       <p><a href="${SITE_URL}/withdraw/activate" style="display:inline-block;background:#22c55e;color:#000;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600;">Enter Code</a></p>`
    ),
  });
}

export async function emailSupportReply(to: string, opts: { subject: string; reply: string }) {
  return sendEmail({
    to,
    subject: `Support reply: ${opts.subject}`,
    html: layout(
      "Support Reply",
      `<p>Reply about: <strong>${opts.subject}</strong></p>
       <div style="background:#09090b;border:1px solid #27272a;border-radius:8px;padding:14px;margin:12px 0;color:#d4d4d8;white-space:pre-wrap;">${opts.reply}</div>
       <p><a href="${SITE_URL}/support" style="color:#22c55e;">View conversation</a></p>`
    ),
  });
}

export async function emailBanned(to: string) {
  return sendEmail({
    to,
    subject: `Account banned – ${SITE_NAME}`,
    html: layout(
      "Account Banned",
      `<p>Your account has been banned for <strong>unusual activity</strong>.</p>`
    ),
  });
}

export async function emailPasswordReset(to: string, resetUrl: string) {
  return sendEmail({
    to,
    subject: `Reset your password – ${SITE_NAME}`,
    html: layout(
      "Reset Password",
      `<p>We received a request to reset your password.</p>
       <p><a href="${resetUrl}" style="display:inline-block;background:#22c55e;color:#000;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600;">Reset Password</a></p>
       <p style="font-size:13px;color:#a1a1aa;">This link expires in 1 hour.</p>`
    ),
  });
}
