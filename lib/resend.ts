import { Resend } from "resend";
import { env } from "@/env";

let client: Resend | undefined;

export function getResendClient(): Resend {
  if (!client) {
    client = new Resend(env.RESEND_API_KEY);
  }
  return client;
}

export function getFromAddress(): string {
  return env.RESEND_FROM_EMAIL ?? "NPM Newsletter <onboarding@resend.dev>";
}
