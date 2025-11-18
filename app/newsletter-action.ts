"use server";

import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { sendWaitlistConfirmationEmail } from "@/lib/newsletter";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export type NewsletterActionResult =
  | { success: true; isNew: boolean; email: string }
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
    // Add email to Convex waitlist
    const result = await convex.mutation(api.waitlist.addToWaitlist, {
      email,
    });

    // Send confirmation email (even if they're already signed up, in case they didn't receive it before)
    await sendWaitlistConfirmationEmail({ recipient: email });

    if (result.isNew) {
      return {
        success: true,
        isNew: true,
        email,
      };
    } else {
      return {
        success: true,
        isNew: false,
        email,
      };
    }
  } catch (error) {
    console.error("waitlist signup failed", error);
    return {
      success: false,
      error: "We couldn't add you to the waitlist. Please try again.",
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
