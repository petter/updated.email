import { VerificationEmail } from "@/emails/verification-email";
import { WaitlistConfirmationEmail } from "@/emails/waitlist-confirmation-email";
import { getFromAddress, getResendClient } from "@/lib/resend";

type SendWaitlistConfirmationEmailInput = {
  recipient: string;
};

type SendWaitlistConfirmationEmailResult = {
  id?: string;
};

type SendVerificationEmailInput = {
  recipient: string;
  token: string;
};

export async function sendWaitlistConfirmationEmail({
  recipient,
}: SendWaitlistConfirmationEmailInput): Promise<SendWaitlistConfirmationEmailResult> {
  const resend = getResendClient();
  const { data, error } = await resend.emails.send({
    from: getFromAddress(),
    to: recipient,
    subject: "You're signed up for updated.email",
    text: buildWaitlistPlainText(),
    react: <WaitlistConfirmationEmail recipientEmail={recipient} />,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { id: data?.id };
}

export async function sendVerificationEmail({
  recipient,
  token,
}: SendVerificationEmailInput): Promise<SendWaitlistConfirmationEmailResult> {
  const resend = getResendClient();
  const link = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${token}`;

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

function buildWaitlistPlainText(): string {
  const lines = [
    "Thanks for joining the updated.email waitlist!",
    "We've added you to our list and we're working hard to bring you a curated weekly brief on new releases, breaking changes, and adoption signals for the packages you depend on.",
    "We'll let you know as soon as updated.email is ready. Until then, stay tuned!",
    "— The updated.email team",
  ];

  return lines.join("\n\n");
}

function buildVerificationPlainText(link: string): string {
  return `Thanks for signing up for updated.email! Please confirm your subscription by clicking the link below:\n\n${link}\n\nIf you didn't sign up for this, you can safely ignore this email.\n\n— The updated.email team`;
}
