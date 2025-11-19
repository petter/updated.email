import { ConvexHttpClient } from "convex/browser";
import { type NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { env } from "@/env";

const convex = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

/**
 * Vercel cron job endpoint that sends newsletters to all subscribers.
 * Runs every Sunday at 12:00 UTC.
 *
 * Vercel cron jobs are protected by default - only Vercel's infrastructure
 * can call this endpoint. No additional authentication needed.
 *
 * To test locally, you can call this endpoint directly:
 * curl http://localhost:3000/api/cron/send-newsletters
 */
export async function GET(_request: NextRequest) {
  try {
    // Call the Convex action to send newsletters
    const result = await convex.action(
      api.newsletters.sendNewslettersToAllSubscribers,
      {}
    );

    return NextResponse.json({
      success: true,
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
      { status: 500 }
    );
  }
}
