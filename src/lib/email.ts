/**
 * Gmail SMTP – full-width dark emails.
 * Env: SMTP_USER, SMTP_PASS, EMAIL_FROM
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

/** Full-width dark layout (fills the screen on mobile) */
function layout(title: string, bodyHtml: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
</head>
<body style="margin:0;padding:0;width:100%;background-color:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;min-width:100%;background-color:#09090b;">
    <tr>
      <td style="background-color:#16a34a;padding:22px 20px;text-align:center;width:100%;">
        <span style="color:#000000;font-size:18px;font-weight:700;">${SITE_NAME}</span>
      </td>
    </tr>
    <tr>
      <td style="padding:36px 24px 16px 24px;width:100%;background-color:#09090b;">
        <h1 style="margin:0;font-size:26px;line-height:1.25;color:#fafafa;font-weight:700;">${title}</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 24px 24px 24px;width:100%;background-color:#09090b;color:#a1a1aa;font-size:16px;line-height:1.65;">
        ${bodyHtml}
      </td>
    </tr>
    <tr>
      <td style="padding:8px 24px 40px 24px;width:100%;background-color:#09090b;border-top:1px solid #27272a;">
        <p style="margin:20px 0 0 0;">
          <a href="${SITE_URL}" style="color:#4ade80;font-size:14px;text-decoration:none;font-weight:600;">Open ${SITE_NAME} →</a>
        </p>
        <p style="margin:16px 0 0 0;font-size:12px;color:#52525b;">© 2026 ${SITE_NAME}</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function btn(href: string, label: string) {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0 12px 0;width:100%;">
    <tr>
      <td style="background-color:#22c55e;border-radius:12px;text-align:center;width:100%;">
        <a href="${href}" style="display:block;width:100%;padding:16px 20px;color:#000000;font-size:16px;font-weight:700;text-decoration:none;text-align:center;box-sizing:border-box;">${label}</a>
      </td>
    </tr>
  </table>`;
}

export async function emailWelcome(to: string, name?: string | null) {
  return sendEmail({
    to,
    subject: `Welcome to ${SITE_NAME}`,
    html: layout(
      "Welcome!",
      `<p style="margin:0 0 14px 0;color:#d4d4d8;">Hi ${name || "there"},</p>
       <p style="margin:0 0 14px 0;color:#d4d4d8;">Thanks for joining <strong style="color:#fafafa;">${SITE_NAME}</strong>. Your account is ready.</p>
       <p style="margin:0 0 4px 0;color:#d4d4d8;">Watch ads, complete tasks, invite friends, and withdraw via PayPal, Bitcoin, or gift cards.</p>
       ${btn(`${SITE_URL}/dashboard`, "Go to Dashboard")}`
    ),
  });
}

export async function emailWithdrawalStatus(
  to: string,
  opts: { amount: number; method: string; status: string; activationCode?: string | null }
) {
  const amount = `$${Number(opts.amount).toFixed(2)}`;
  const method = opts.method;

  if (opts.status === "pending") {
    return sendEmail({
      to,
      subject: `Withdrawal under review – ${SITE_NAME}`,
      html: layout(
        "Withdrawal Under Review",
        `<p style="margin:0 0 14px 0;color:#d4d4d8;">We received your withdrawal of <strong style="color:#fafafa;">${amount}</strong> via <strong style="color:#fafafa;">${method}</strong>.</p>
         <p style="margin:0 0 4px 0;color:#d4d4d8;">Status: <strong style="color:#fbbf24;">Under review</strong>. We’ll email you when it changes.</p>
         ${btn(`${SITE_URL}/withdraw`, "View withdrawals")}`
      ),
    });
  }

  if (opts.status === "processing") {
    return sendEmail({
      to,
      subject: `Withdrawal processing – ${SITE_NAME}`,
      html: layout(
        "Withdrawal Processing",
        `<p style="margin:0 0 14px 0;color:#d4d4d8;">Your withdrawal of <strong style="color:#fafafa;">${amount}</strong> (${method}) is now <strong style="color:#38bdf8;">processing</strong>.</p>
         <p style="margin:0 0 4px 0;color:#d4d4d8;">If you get an activation code, enter it on the site to continue.</p>
         ${btn(`${SITE_URL}/withdraw/activate`, "Enter activation code")}`
      ),
    });
  }

  if (opts.status === "rejected") {
    return sendEmail({
      to,
      subject: `Withdrawal failed – ${SITE_NAME}`,
      html: layout(
        "Withdrawal Failed",
        `<p style="margin:0 0 14px 0;color:#d4d4d8;">Your withdrawal of <strong style="color:#fafafa;">${amount}</strong> (${method}) could not be completed.</p>
         <p style="margin:0 0 4px 0;color:#f87171;">Please contact support for more information. Your balance has been restored if applicable.</p>
         ${btn(`${SITE_URL}/support`, "Contact Support")}`
      ),
    });
  }

  if (opts.status === "approved") {
    return sendEmail({
      to,
      subject: `Withdrawal successful – ${SITE_NAME}`,
      html: layout(
        "Withdrawal Successful",
        `<p style="margin:0 0 14px 0;color:#d4d4d8;">Your withdrawal of <strong style="color:#fafafa;">${amount}</strong> via <strong style="color:#fafafa;">${method}</strong> was <strong style="color:#4ade80;">successful</strong>.</p>
         <p style="margin:0 0 4px 0;color:#d4d4d8;">Funds should arrive according to your payment method’s processing time.</p>
         ${btn(`${SITE_URL}/dashboard`, "Go to Dashboard")}`
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
      `<p style="margin:0 0 14px 0;color:#d4d4d8;">Use this code for your withdrawal of <strong style="color:#fafafa;">$${Number(opts.amount).toFixed(2)}</strong> (${opts.method}):</p>
       <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:20px 0;width:100%;">
         <tr>
           <td style="background-color:#18181b;border:1px solid #3f3f46;border-radius:12px;padding:22px 16px;text-align:center;width:100%;">
             <span style="font-size:24px;letter-spacing:3px;font-family:ui-monospace,monospace;color:#4ade80;font-weight:700;">${opts.code}</span>
           </td>
         </tr>
       </table>
       ${btn(`${SITE_URL}/withdraw/activate`, "Enter Code")}`
    ),
  });
}

export async function emailSupportReply(to: string, opts: { subject: string; reply: string }) {
  return sendEmail({
    to,
    subject: `Support reply: ${opts.subject}`,
    html: layout(
      "Support Reply",
      `<p style="margin:0 0 14px 0;color:#d4d4d8;">Reply about: <strong style="color:#fafafa;">${opts.subject}</strong></p>
       <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:14px 0;width:100%;">
         <tr>
           <td style="background-color:#18181b;border:1px solid #27272a;border-radius:12px;padding:16px;color:#d4d4d8;font-size:15px;line-height:1.55;white-space:pre-wrap;width:100%;">${opts.reply}</td>
         </tr>
       </table>
       ${btn(`${SITE_URL}/support`, "View conversation")}`
    ),
  });
}

export async function emailBanned(to: string) {
  return sendEmail({
    to,
    subject: `Account banned – ${SITE_NAME}`,
    html: layout(
      "Account Banned",
      `<p style="margin:0 0 14px 0;color:#d4d4d8;">Your account has been banned for <strong style="color:#f87171;">unusual activity</strong>.</p>
       <p style="margin:0;color:#a1a1aa;font-size:14px;">If you believe this is a mistake, contact support from another email.</p>`
    ),
  });
}

export async function emailPasswordReset(to: string, resetUrl: string) {
  return sendEmail({
    to,
    subject: `Reset your password – ${SITE_NAME}`,
    html: layout(
      "Reset Password",
      `<p style="margin:0 0 14px 0;color:#d4d4d8;">We received a request to reset your password.</p>
       ${btn(resetUrl, "Reset Password")}
       <p style="margin:18px 0 0 0;color:#71717a;font-size:13px;">This link expires in 1 hour. If you did not request this, ignore this email.</p>`
    ),
  });
}
