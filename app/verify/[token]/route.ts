import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { env } from "@/env";
import { posthog } from "@/lib/posthog";
import { logTokenConsumption } from "@/lib/request-metadata";

const convex = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const origin = new URL(request.url).origin;

  try {
    const result = await convex.mutation(api.subscriptions.verify, { token });

    if (result.success && result.email) {
      // Track subscription verified
      posthog.capture({
        distinctId: result.email,
        event: "subscription_verified",
        properties: { email: result.email },
      });

      // Create a session for the user
      const sessionResult = await convex.mutation(api.auth.createSession, {
        email: result.email,
      });

      if (sessionResult.success && sessionResult.sessionId) {
        // Create response with redirect
        const response = NextResponse.redirect(
          new URL("/dashboard?verified=true", origin),
        );

        // Set session cookie directly on the response
        response.cookies.set("updated.email.session", sessionResult.sessionId, {
          httpOnly: true,
          secure: env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: "/",
        });

        logTokenConsumption({
          flow: "verify",
          token,
          request,
          outcome: "success",
          email: result.email,
          extra: { sessionCreated: true },
        });
        return response;
      } else {
        logTokenConsumption({
          flow: "verify",
          token,
          request,
          outcome: "success",
          email: result.email,
          message: "Session creation failed",
          extra: { sessionCreated: false },
        });
        // Session creation failed, but verification succeeded
        const url = new URL("/dashboard", origin);
        url.searchParams.set("verified", "true");
        url.searchParams.set("error", "Session creation failed");
        return NextResponse.redirect(url);
      }
    } else {
      logTokenConsumption({
        flow: "verify",
        token,
        request,
        outcome: "invalid",
        message: result.message,
      });
      // Verification failed - redirect to error page
      const url = new URL("/verify/error", origin);
      url.searchParams.set(
        "message",
        result.message || "Invalid or expired token.",
      );
      return NextResponse.redirect(url);
    }
  } catch (error) {
    console.error("Verification failed", error);
    logTokenConsumption({
      flow: "verify",
      token,
      request,
      outcome: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
    const url = new URL("/verify/error", origin);
    url.searchParams.set("message", "Something went wrong. Please try again.");
    return NextResponse.redirect(url);
  }
}
