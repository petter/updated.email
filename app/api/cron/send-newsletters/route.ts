import { ConvexHttpClient } from "convex/browser";
import { type NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { env } from "@/env";

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
export async function POST(request: NextRequest) {
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
    // Call the Convex action to send newsletters
    const result = await convex.action(
      api.newsletters.sendNewslettersToAllSubscribers,
      {},
    );

    return NextResponse.json({
      ...result,
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
