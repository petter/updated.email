import { NewsletterPreviewEmail } from "@/emails/newsletter-preview-email";
import { getFromAddress, getResendClient } from "@/lib/resend";

type SendPreviewIssueEmailInput = {
  recipient: string;
  previewUrl?: string;
  packages?: string[];
};

type SendPreviewIssueEmailResult = {
  id?: string;
};

export async function sendPreviewIssueEmail({
  recipient,
  previewUrl,
  packages = [],
}: SendPreviewIssueEmailInput): Promise<SendPreviewIssueEmailResult> {
  const resend = getResendClient();
  const { data, error } = await resend.emails.send({
    from: getFromAddress(),
    to: recipient,
    subject: "Your updated.email preview is on the way",
    text: buildPlainText({ previewUrl, packages }),
    react: (
      <NewsletterPreviewEmail
        recipientEmail={recipient}
        previewUrl={previewUrl}
        packages={packages}
      />
    ),
  });

  if (error) {
    throw new Error(error.message);
  }

  return { id: data?.id };
}

function buildPlainText({
  previewUrl,
  packages,
}: {
  previewUrl?: string;
  packages: string[];
}): string {
  const lines = [
    "Thanks for joining the updated.email preview!",
    "We'll assemble your first issue with the packages you care about.",
  ];

  if (packages.length > 0) {
    lines.push(
      `Packages on your radar: ${packages
        .map((pkg) => pkg.trim())
        .filter(Boolean)
        .join(", ")}`
    );
  }

  if (previewUrl) {
    lines.push(`You can always revisit the latest preview: ${previewUrl}`);
  }

  lines.push("Talk soon,\nThe updated.email team");

  return lines.join("\n\n");
}
