"use server";

import { ConvexHttpClient } from "convex/browser";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { env } from "@/env";
import { clearSessionCookie, getSessionFromCookie } from "@/lib/auth";
import { posthog } from "@/lib/posthog";
import { getTokenFingerprint, type TokenFlow } from "@/lib/request-metadata";

const convex = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

export async function unsubscribeAction(formData: FormData) {
  const token = formData.get("token");
  const email = formData.get("email");

  // Get headers for logging
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for") ?? undefined;
  const forwardedChain = forwardedFor
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const requestMetadata = {
    userAgent: headersList.get("user-agent") ?? undefined,
    clientIp: headersList.get("x-real-ip") ?? forwardedChain?.[0],
    forwardedFor,
    referer: headersList.get("referer") ?? undefined,
    acceptLanguage: headersList.get("accept-language") ?? undefined,
    secFetchSite: headersList.get("sec-fetch-site") ?? undefined,
    secFetchMode: headersList.get("sec-fetch-mode") ?? undefined,
    secFetchDest: headersList.get("sec-fetch-dest") ?? undefined,
    secFetchUser: headersList.get("sec-fetch-user") ?? undefined,
  };

  try {
    let unsubscribeEmail: string | undefined;

    if (token && typeof token === "string") {
      // Unsubscribe via token
      const unsubscribeResult = await convex.mutation(
        api.subscriptions.unsubscribe,
        {
          token,
        },
      );

      if (!unsubscribeResult.success) {
        // Log token consumption failure
        const hashedToken = getTokenFingerprint(token);
        const payload = {
          flow: "unsubscribe" as TokenFlow,
          outcome: "invalid" as const,
          hashedToken,
          message: unsubscribeResult.message,
          metadata: requestMetadata,
        };

        console.info("[token-consumption]", payload);

        posthog.capture({
          distinctId: hashedToken,
          event: "token_consumption",
          properties: payload,
        });

        const errorMessage = encodeURIComponent(
          unsubscribeResult.message || "Invalid or expired unsubscribe link.",
        );
        redirect(`/unsubscribed?error=${errorMessage}`);
      }

      // TypeScript narrows to success case after the check above
      unsubscribeEmail = unsubscribeResult.email;
    } else if (email && typeof email === "string") {
      // Unsubscribe via email
      const emailTrimmed = email.trim();
      if (emailTrimmed.length === 0) {
        const errorMessage = encodeURIComponent(
          "Please provide a valid email address.",
        );
        redirect(`/unsubscribed?error=${errorMessage}`);
      }

      await convex.mutation(api.subscriptions.unsubscribeByEmailPublic, {
        email: emailTrimmed,
      });

      // unsubscribeByEmailPublic always returns success: true
      // (non-enumerating design - always succeeds even if email doesn't exist)
      unsubscribeEmail = emailTrimmed;
    } else {
      const errorMessage = encodeURIComponent(
        "Please provide either a token or email address.",
      );
      redirect(`/unsubscribed?error=${errorMessage}`);
    }

    // Track subscription cancelled
    if (unsubscribeEmail) {
      posthog.capture({
        distinctId: unsubscribeEmail,
        event: "subscription_cancelled",
        properties: { email: unsubscribeEmail },
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

    // Log token consumption if token was used
    if (token && typeof token === "string") {
      const hashedToken = getTokenFingerprint(token);
      const payload = {
        flow: "unsubscribe" as TokenFlow,
        outcome: "success" as const,
        hashedToken,
        email: unsubscribeEmail,
        metadata: requestMetadata,
        extra: { sessionDeleted: sessionDeleted ?? false },
      };

      console.info("[token-consumption]", payload);

      posthog.capture({
        distinctId: unsubscribeEmail ?? hashedToken,
        event: "token_consumption",
        properties: payload,
      });
    }

    // Redirect to unsubscribed page
    redirect("/unsubscribed");
  } catch (error) {
    // Re-throw redirect errors - they should not be caught
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    console.error("Unsubscribe failed", error);

    // Log error if token was used
    if (token && typeof token === "string") {
      const hashedToken = getTokenFingerprint(token);
      const payload = {
        flow: "unsubscribe" as TokenFlow,
        outcome: "error" as const,
        hashedToken,
        message: error instanceof Error ? error.message : "Unknown error",
        metadata: requestMetadata,
      };

      console.info("[token-consumption]", payload);

      posthog.capture({
        distinctId: hashedToken,
        event: "token_consumption",
        properties: payload,
      });
    }

    const errorMessage = encodeURIComponent(
      "Something went wrong. Please try again or contact support.",
    );
    redirect(`/unsubscribed?error=${errorMessage}`);
  }
}
