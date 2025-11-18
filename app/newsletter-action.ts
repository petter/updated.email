"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { sendWaitlistConfirmationEmail } from "@/lib/newsletter";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function submitNewsletterAction(formData: FormData) {
  const email = extractEmail(formData);

  if (!email) {
    redirect("/?newsletter=error");
  }

  try {
    // Add email to Convex waitlist
    await convex.mutation(api.waitlist.addToWaitlist, { email });

    // Send confirmation email
    await sendWaitlistConfirmationEmail({ recipient: email });

    // Set cookie to remember the user
    const cookieStore = await cookies();
    cookieStore.set("waitlist_email", email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  } catch (error) {
    console.error("waitlist signup failed", error);
    redirect("/?newsletter=error");
  }

  redirect("/?newsletter=success");
}

function extractEmail(formData: FormData): string | null {
  const value = formData.get("email");
  if (typeof value !== "string") {
    return null;
  }
  const email = value.trim();
  return email.length > 0 ? email : null;
}
