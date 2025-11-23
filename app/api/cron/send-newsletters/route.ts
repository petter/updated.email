import { ConvexHttpClient } from "convex/browser";
import { type NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { env } from "@/env";
import { sendNewsletterToSubscriber } from "./send-newsletter-to-subscriber";

const convex = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

/**
 * Vercel cron job endpoint that sends newsletters to all subscribers.
 * Runs every Sunday at 12:00 UTC.
 *
 * This endpoint is secured using a bearer token in the Authorization header.
 * Vercel automatically includes the CRON_SECRET as a bearer token when invoking
 * cron jobs. For local testing, include the Authorization header:
 * curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/send-newsletters
 */
export async function GET(request: NextRequest) {
  // Verify authorization header
  const authHeader = request.headers.get("authorization");
  const expectedAuth = `Bearer ${env.CRON_SECRET}`;

  if (!env.CRON_SECRET) {
    console.error("CRON_SECRET environment variable is not set");
    return NextResponse.json(
      {
        success: false,
        error: "Server configuration error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }

  if (authHeader !== expectedAuth) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized",
        timestamp: new Date().toISOString(),
      },
      { status: 401 },
    );
  }

  try {
    // Get all active subscriptions
    // Pass cronSecret for server-side authentication
    const subscriptions = await convex.query(
      api.subscriptions.getAllActiveSubscriptions,
      { cronSecret: env.CRON_SECRET },
    );

    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    let successCount = 0;
    let errorCount = 0;

    for (const subscription of subscriptions) {
      // Get package subscriptions for this user
      // Pass cronSecret for server-side authentication
      const packageSubscriptions = await convex.query(
        api.subscriptions.getPackageSubscriptions,
        {
          email: subscription.email,
          cronSecret: env.CRON_SECRET,
        },
      );

      if (packageSubscriptions.length === 0) {
        // Skip users with no package subscriptions
        continue;
      }

      // Determine the "since" date - use last newsletter sent date or subscription date
      const since =
        subscription.lastNewsletterSentAt ??
        subscription.subscribedAt ??
        oneWeekAgo;

      const packageNames = packageSubscriptions.map(
        (pkg: { packageName: string }) => pkg.packageName,
      );

      try {
        const result = await sendNewsletterToSubscriber({
          email: subscription.email,
          packageNames,
          since,
        });

        if (result.success) {
          // Update last newsletter sent date
          // Pass cronSecret for server-side authentication
          await convex.mutation(api.subscriptions.updateLastNewsletterSentAt, {
            email: subscription.email,
            timestamp: now,
            cronSecret: env.CRON_SECRET,
          });
          successCount++;
        } else {
          errorCount++;
          console.error(
            `Failed to send newsletter to ${subscription.email}:`,
            result.error,
          );
        }
      } catch (error) {
        errorCount++;
        console.error(
          `Error sending newsletter to ${subscription.email}:`,
          error,
        );
      }
    }

    return NextResponse.json({
      success: true,
      sent: successCount,
      errors: errorCount,
      total: subscriptions.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in newsletter cron job:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
