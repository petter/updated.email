import { ConvexHttpClient } from "convex/browser";
import { type NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { env } from "@/env";
import { clearSessionCookie, getSessionFromCookie } from "@/lib/auth";
import { posthog } from "@/lib/posthog";
import { logTokenConsumption } from "@/lib/request-metadata";

const convex = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  try {
    const result = await convex.mutation(api.subscriptions.unsubscribe, {
      token,
    });

    if (!result.success) {
      logTokenConsumption({
        flow: "unsubscribe",
        token,
        request,
        outcome: "invalid",
        message: result.message,
      });
      // Redirect to unsubscribed page with error message
      const errorMessage = encodeURIComponent(
        result.message || "Invalid or expired unsubscribe link.",
      );
      return NextResponse.redirect(
        new URL(`/unsubscribed?error=${errorMessage}`, request.url),
      );
    }

    // Track subscription cancelled
    if (result.email) {
      posthog.capture({
        distinctId: result.email,
        event: "subscription_cancelled",
        properties: { email: result.email },
      });
    }

    // Log out the user by deleting session and clearing cookie (if they're logged in)
    const sessionId = await getSessionFromCookie();
    let sessionDeleted: boolean | undefined;
    if (sessionId) {
      try {
        await convex.mutation(api.auth.deleteSession, { sessionId });
        sessionDeleted = true;
      } catch (error) {
        // If session deletion fails, continue anyway - we still want to clear the cookie
        console.error("Failed to delete session:", error);
        sessionDeleted = false;
      }
    }
    await clearSessionCookie();

    logTokenConsumption({
      flow: "unsubscribe",
      token,
      request,
      outcome: "success",
      email: result.email,
      extra: { sessionDeleted: sessionDeleted ?? false },
    });

    // Redirect to unsubscribed page
    return NextResponse.redirect(new URL("/unsubscribed", request.url));
  } catch (error) {
    console.error("Unsubscribe failed", error);
    logTokenConsumption({
      flow: "unsubscribe",
      token,
      request,
      outcome: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
    const errorMessage = encodeURIComponent(
      "Something went wrong. Please try again or contact support.",
    );
    return NextResponse.redirect(
      new URL(`/unsubscribed?error=${errorMessage}`, request.url),
    );
  }
}
