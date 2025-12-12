"use server";

import { ConvexHttpClient } from "convex/browser";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { env } from "@/env";
import { setSessionCookie } from "@/lib/auth";
import { posthog } from "@/lib/posthog";
import { getTokenFingerprint, type TokenFlow } from "@/lib/request-metadata";

const convex = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

export type LoginTokenActionResult =
  | { success: true }
  | { success: false; error: string };

export async function loginTokenAction(
  _prevState: LoginTokenActionResult | null,
  formData: FormData,
): Promise<LoginTokenActionResult> {
  const token = formData.get("token");

  if (!token || typeof token !== "string") {
    return { success: false, error: "Token is required" };
  }

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
    const result = await convex.mutation(api.auth.verifyLoginToken, { token });

    if (!result.success) {
      // Log token consumption failure
      const hashedToken = getTokenFingerprint(token);
      const payload = {
        flow: "login" as TokenFlow,
        outcome: "invalid" as const,
        hashedToken,
        message: result.message,
        metadata: requestMetadata,
      };

      console.info("[token-consumption]", payload);

      posthog.capture({
        distinctId: hashedToken,
        event: "token_consumption",
        properties: payload,
      });

      return {
        success: false,
        error: result.message || "Invalid or expired token",
      };
    }

    if (!result.sessionId) {
      return { success: false, error: "Login failed" };
    }

    // Set session cookie
    await setSessionCookie(result.sessionId);

    // Log token consumption success
    const hashedToken = getTokenFingerprint(token);
    const payload = {
      flow: "login" as TokenFlow,
      outcome: "success" as const,
      hashedToken,
      email: result.email,
      metadata: requestMetadata,
      extra: { sessionCreated: true },
    };

    console.info("[token-consumption]", payload);

    posthog.capture({
      distinctId: result.email ?? hashedToken,
      event: "token_consumption",
      properties: payload,
    });

    // Redirect to dashboard
    redirect("/dashboard");
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

    console.error("Login failed", error);

    // Log error
    const hashedToken = getTokenFingerprint(token);
    const payload = {
      flow: "login" as TokenFlow,
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

    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
