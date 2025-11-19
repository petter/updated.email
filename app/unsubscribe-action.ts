"use server";

import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { env } from "@/env";
import { getAuthenticatedEmail } from "@/lib/auth";

const convex = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

export type UnsubscribeActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function unsubscribeAction(): Promise<UnsubscribeActionResult> {
  const email = await getAuthenticatedEmail();

  if (!email) {
    return {
      success: false,
      error: "You must be logged in to unsubscribe.",
    };
  }

  try {
    const result = await convex.mutation(api.subscriptions.unsubscribeByEmail, {
      email,
    });

    if (!result.success) {
      return {
        success: false,
        error: result.message || "Failed to unsubscribe",
      };
    }

    return {
      success: true,
      message: "You have been successfully unsubscribed.",
    };
  } catch (error) {
    console.error("unsubscribe failed", error);
    return {
      success: false,
      error: "We couldn't unsubscribe you. Please try again.",
    };
  }
}
