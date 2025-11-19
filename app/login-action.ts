"use server";

import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { env } from "@/env";
import { sendLoginEmail } from "@/lib/newsletter";

const convex = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

export type LoginActionResult =
  | { success: true; message: string; email: string }
  | { success: false; error: string };

export async function requestLoginAction(
  _prevState: LoginActionResult | null,
  formData: FormData,
): Promise<LoginActionResult> {
  const email = extractEmail(formData);

  if (!email) {
    return { success: false, error: "Please provide a valid email address." };
  }

  try {
    // Generate login token
    const result = await convex.mutation(api.auth.requestLogin, {
      email,
    });

    if (result.token) {
      // Send login email
      await sendLoginEmail({ recipient: email, token: result.token });
    }

    return {
      success: true,
      message: "Check your email for a login link.",
      email,
    };
  } catch (error) {
    console.error("login request failed", error);
    return {
      success: false,
      error: "We couldn't send the login email. Please try again.",
    };
  }
}

function extractEmail(formData: FormData): string | null {
  const value = formData.get("email");
  if (typeof value !== "string") {
    return null;
  }
  const email = value.trim();
  return email.length > 0 ? email : null;
}
