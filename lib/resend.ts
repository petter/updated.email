import { Resend } from "resend";

let client: Resend | undefined;

function assertApiKey(): string {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is missing. Add it to your .env.local file to send emails.",
    );
  }
  return apiKey;
}

export function getResendClient(): Resend {
  if (!client) {
    client = new Resend(assertApiKey());
  }
  return client;
}

export function getFromAddress(): string {
  return (
    process.env.RESEND_FROM_EMAIL ?? "NPM Newsletter <onboarding@resend.dev>"
  );
}
