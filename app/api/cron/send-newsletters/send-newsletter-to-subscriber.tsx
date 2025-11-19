import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { NewsletterEmail } from "@/emails/newsletter-email";
import { env } from "@/env";
import { getChangelogs } from "@/lib/changelog";
import { getPackageUpdates, type PackageUpdateResult } from "@/lib/npm";
import { getFromAddress, getResendClient } from "@/lib/resend";
import type { ChangelogEntry } from "@/lib/types";

const convex = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

interface SendNewsletterToSubscriberParams {
  email: string;
  packageNames: string[];
  since: number; // timestamp
}

interface SendNewsletterToSubscriberResult {
  success: true;
  emailId?: string;
}

interface SendNewsletterToSubscriberError {
  success: false;
  error: string;
}

export async function sendNewsletterToSubscriber(
  params: SendNewsletterToSubscriberParams,
): Promise<SendNewsletterToSubscriberResult | SendNewsletterToSubscriberError> {
  const { email, packageNames, since } = params;

  // Fetch package updates for all subscribed packages
  const packageUpdates: Array<
    PackageUpdateResult & { changelogs: Record<string, ChangelogEntry> }
  > = [];

  for (const packageName of packageNames) {
    const updates = await getPackageUpdates(packageName, new Date(since), {
      versions: { patch: false },
    });

    // Fetch changelogs if we have versions
    let changelogs: Record<string, ChangelogEntry> = {};
    if (updates.versions.length > 0 && updates.repositoryUrl) {
      changelogs = await getChangelogs(updates.repositoryUrl, updates.versions);
    }

    packageUpdates.push({
      ...updates,
      changelogs,
    });
  }

  // Generate unsubscribe link
  const unsubscribeTokenResult = await convex.mutation(
    api.subscriptions.generateUnsubscribeToken,
    { email },
  );

  const unsubscribeLink: string | undefined = unsubscribeTokenResult.success
    ? `${env.NEXT_PUBLIC_APP_URL}/unsubscribe/${unsubscribeTokenResult.token}`
    : undefined;

  // Generate dashboard magic link
  const loginTokenResult = await convex.mutation(api.auth.requestLogin, {
    email,
  });

  const dashboardLink: string | undefined = loginTokenResult.token
    ? `${env.NEXT_PUBLIC_APP_URL}/login/${loginTokenResult.token}`
    : undefined;

  // Send email using Resend
  const resend = getResendClient();
  const { data, error } = await resend.emails.send({
    from: getFromAddress(),
    to: email,
    subject: "Your Weekly Package Updates",
    react: (
      <NewsletterEmail
        packageUpdates={packageUpdates}
        unsubscribeLink={unsubscribeLink}
        dashboardLink={dashboardLink}
      />
    ),
  });

  // Calculate total update count
  const updateCount = packageUpdates.reduce(
    (sum, pkg) => sum + pkg.versions.length,
    0,
  );

  if (error || !data?.id) {
    const errorMessage = error?.message || "Failed to send email";
    console.error(`Failed to send newsletter to ${email}:`, errorMessage);

    // Record failed send
    await convex.mutation(api.newsletters.recordNewsletterSend, {
      email,
      packageNames,
      packageCount: packageNames.length,
      updateCount,
      status: "error",
      error: errorMessage,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }

  // Record successful send
  await convex.mutation(api.newsletters.recordNewsletterSend, {
    email,
    packageNames,
    packageCount: packageNames.length,
    updateCount,
    status: "success",
    emailId: data.id,
  });

  return { success: true, emailId: data.id };
}
