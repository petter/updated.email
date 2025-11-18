import { WaitlistConfirmationEmail } from "@/emails/waitlist-confirmation-email";
import { getFromAddress, getResendClient } from "@/lib/resend";

type SendWaitlistConfirmationEmailInput = {
  recipient: string;
};

type SendWaitlistConfirmationEmailResult = {
  id?: string;
};

export async function sendWaitlistConfirmationEmail({
  recipient,
}: SendWaitlistConfirmationEmailInput): Promise<SendWaitlistConfirmationEmailResult> {
  const resend = getResendClient();
  const { data, error } = await resend.emails.send({
    from: getFromAddress(),
    to: recipient,
    subject: "You're signed up for updated.email",
    text: buildPlainText(),
    react: <WaitlistConfirmationEmail recipientEmail={recipient} />,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { id: data?.id };
}

function buildPlainText(): string {
  const lines = [
    "Thanks for joining the updated.email waitlist!",
    "We've added you to our list and we're working hard to bring you a curated weekly brief on new releases, breaking changes, and adoption signals for the packages you depend on.",
    "We'll let you know as soon as updated.email is ready. Until then, stay tuned!",
    "— The updated.email team",
  ];

  return lines.join("\n\n");
}
