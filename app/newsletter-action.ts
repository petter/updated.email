"use server";

import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { sendVerificationEmail } from "@/lib/newsletter";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export type NewsletterActionResult =
  | { success: true; message: string; email: string }
  | { success: false; error: string };

export async function submitNewsletterAction(
  _prevState: NewsletterActionResult | null,
  formData: FormData
): Promise<NewsletterActionResult> {
  const email = extractEmail(formData);

  if (!email) {
    return { success: false, error: "Please provide a valid email address." };
  }

  try {
    // Add email to Convex subscriptions (pending) and get token
    const result = await convex.mutation(api.subscriptions.subscribe, {
      email,
    });

    if (!result.success) {
        // If already subscribed or other error
        return {
            success: false,
            error: result.message || "Something went wrong",
        };
    }

    if (result.token) {
        // Send verification email
        await sendVerificationEmail({ recipient: email, token: result.token });
    }

    return {
        success: true,
        message: "Check your email to confirm your subscription.",
        email,
    };

  } catch (error) {
    console.error("newsletter signup failed", error);
    return {
      success: false,
      error: "We couldn't sign you up. Please try again.",
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
