import { ConvexHttpClient } from "convex/browser";
import { type NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { env } from "@/env";
import { clearSessionCookie, getSessionFromCookie } from "@/lib/auth";

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
      // Redirect to unsubscribed page with error message
      const errorMessage = encodeURIComponent(
        result.message || "Invalid or expired unsubscribe link.",
      );
      return NextResponse.redirect(
        new URL(`/unsubscribed?error=${errorMessage}`, request.url),
      );
    }

    // Log out the user by deleting session and clearing cookie (if they're logged in)
    const sessionId = await getSessionFromCookie();
    if (sessionId) {
      try {
        await convex.mutation(api.auth.deleteSession, { sessionId });
      } catch (error) {
        // If session deletion fails, continue anyway - we still want to clear the cookie
        console.error("Failed to delete session:", error);
      }
    }
    await clearSessionCookie();

    // Redirect to unsubscribed page
    return NextResponse.redirect(new URL("/unsubscribed", request.url));
  } catch (error) {
    console.error("Unsubscribe failed", error);
    const errorMessage = encodeURIComponent(
      "Something went wrong. Please try again or contact support.",
    );
    return NextResponse.redirect(
      new URL(`/unsubscribed?error=${errorMessage}`, request.url),
    );
  }
}
