import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { LoginEmail } from "@/emails/login-email";
import { VerificationEmail } from "@/emails/verification-email";
import { env } from "@/env";
import { getFromAddress, getResendClient } from "@/lib/resend";

const convex = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

type SendEmailResult = {
  id?: string;
};

type SendVerificationEmailInput = {
  recipient: string;
  token: string;
};

type SendLoginEmailInput = {
  recipient: string;
  token: string;
};

export async function sendVerificationEmail({
  recipient,
  token,
}: SendVerificationEmailInput): Promise<SendEmailResult> {
  const resend = getResendClient();
  const link = `${env.NEXT_PUBLIC_APP_URL}/verify/${token}`;

  const { data, error } = await resend.emails.send({
    from: getFromAddress(),
    to: recipient,
    subject: "Confirm your subscription to updated.email",
    text: buildVerificationPlainText(link),
    react: <VerificationEmail validationLink={link} />,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { id: data?.id };
}

export async function sendLoginEmail({
  recipient,
  token,
}: SendLoginEmailInput): Promise<SendEmailResult> {
  const resend = getResendClient();
  const link = `${env.NEXT_PUBLIC_APP_URL}/login/${token}`;

  const { data, error } = await resend.emails.send({
    from: getFromAddress(),
    to: recipient,
    subject: "Sign in to updated.email",
    text: buildLoginPlainText(link),
    react: <LoginEmail loginLink={link} />,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { id: data?.id };
}

function buildVerificationPlainText(link: string): string {
  return `Thanks for signing up for updated.email! Please confirm your subscription by clicking the link below:\n\n${link}\n\nIf you didn't sign up for this, you can safely ignore this email.\n\n— The updated.email team`;
}

function buildLoginPlainText(link: string): string {
  return `Click the link below to sign in to your updated.email dashboard. This link will expire in 30 days:\n\n${link}\n\nIf you didn't request this login link, you can safely ignore this email.\n\n— The updated.email team`;
}

export async function generateUnsubscribeLink(
  email: string,
): Promise<string | null> {
  try {
    const result = await convex.mutation(
      api.subscriptions.generateUnsubscribeToken,
      { email },
    );

    if (!result.success || !result.token) {
      console.error("Failed to generate unsubscribe token:", result.message);
      return null;
    }

    return `${env.NEXT_PUBLIC_APP_URL}/unsubscribe/${result.token}`;
  } catch (error) {
    console.error("Failed to generate unsubscribe link:", error);
    return null;
  }
}
