import { render } from "@react-email/render";
import { type NextRequest, NextResponse } from "next/server";
import type { NewsletterEmail } from "@/emails/newsletter-email";
import type { PackageUpdateResult } from "@/lib/npm";
import { getFromAddress, getResendClient } from "@/lib/resend";
import type { ChangelogEntry } from "@/lib/types";

export async function POST(request: NextRequest) {
  // Verify the request has the correct authorization header
  // Vercel cron jobs send CRON_SECRET in the Authorization header
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const {
      email,
      packageUpdates: rawPackageUpdates,
      unsubscribeLink,
    }: {
      email: string;
      packageUpdates: Array<{
        packageName: string;
        versions: Array<{
          version: string;
          publishedAt: string | Date;
        }>;
        error?: string;
        repositoryUrl?: string;
        changelogs: Record<string, ChangelogEntry>;
      }>;
      unsubscribeLink?: string;
    } = body;

    // Convert date strings back to Date objects
    const packageUpdates: Array<
      PackageUpdateResult & { changelogs: Record<string, ChangelogEntry> }
    > = rawPackageUpdates.map((pkg) => ({
      ...pkg,
      versions: pkg.versions.map((v) => ({
        ...v,
        publishedAt:
          v.publishedAt instanceof Date
            ? v.publishedAt
            : new Date(v.publishedAt),
      })),
    }));

    // Render email
    // biome-ignore lint/complexity/noBannedTypes: JSX is valid in Next.js API routes
    const emailHtml = render(
      <NewsletterEmail
        packageUpdates={packageUpdates}
        unsubscribeLink={unsubscribeLink}
      />,
    );

    // Build plain text version
    const plainText = buildNewsletterPlainText(packageUpdates, unsubscribeLink);

    // Send email via Resend
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: getFromAddress(),
      to: email,
      subject: "Your Weekly Package Updates from updated.email",
      text: plainText,
      html: emailHtml,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, emailId: data?.id });
  } catch (error) {
    console.error("Error sending newsletter:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

function buildNewsletterPlainText(
  packageUpdates: Array<
    PackageUpdateResult & { changelogs: Record<string, ChangelogEntry> }
  >,
  unsubscribeLink?: string,
): string {
  const lines: string[] = [];
  lines.push("Your Weekly Package Updates from updated.email");
  lines.push("");
  lines.push("Here are the latest updates for the packages you're following:");
  lines.push("");

  const hasUpdates = packageUpdates.some(
    (pkg) => pkg.versions.length > 0 && !pkg.error,
  );

  if (!hasUpdates) {
    lines.push(
      "No new updates this week for the packages you're subscribed to. Check back next week!",
    );
  } else {
    for (const pkg of packageUpdates) {
      if (pkg.error || pkg.versions.length === 0) {
        continue;
      }

      lines.push(`${pkg.packageName}:`);
      lines.push("");

      for (const version of pkg.versions) {
        lines.push(
          `  ${version.version} - ${new Date(version.publishedAt).toLocaleDateString()}`,
        );
        const changelog = pkg.changelogs[version.version];
        if (changelog?.url) {
          lines.push(`  View release: ${changelog.url}`);
        }
        lines.push("");
      }
    }
  }

  if (unsubscribeLink) {
    lines.push("");
    lines.push(`Unsubscribe from these emails: ${unsubscribeLink}`);
  }

  lines.push("");
  lines.push("— The updated.email team");

  return lines.join("\n");
}

