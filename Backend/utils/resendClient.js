import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const sanitizeEmail = (value) =>
  String(value || "no-reply@urbantales-ecommerce.in")
    .replace(/[<>]/g, "")
    .trim();

const buildFrom = (name) => {
  const email = sanitizeEmail(process.env.EMAIL_FROM);
  return `${name} <${email}>`;
};

export async function sendEmail({
  to,
  subject,
  html,
  text,
  fromName = "UrbanTales",
  replyTo,
}) {
  if (!resend) {
    console.warn("RESEND_API_KEY is missing. Email send skipped.");
    return { skipped: true };
  }

  const recipients = Array.isArray(to) ? to : [to];
  const payload = {
    from: buildFrom(fromName),
    to: recipients,
    subject,
    html,
    text,
  };

  if (replyTo) {
    payload.replyTo = Array.isArray(replyTo) ? replyTo : [replyTo];
  }

  return resend.emails.send(payload);
}
