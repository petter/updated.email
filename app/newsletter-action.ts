"use server";

import { redirect } from "next/navigation";

import { sendPreviewIssueEmail } from "@/lib/newsletter";

export async function submitNewsletterAction(formData: FormData) {
  const email = extractEmail(formData);

  if (!email) {
    redirect("/?newsletter=error");
  }

  try {
    await sendPreviewIssueEmail({ recipient: email });
  } catch (error) {
    console.error("newsletter preview email failed", error);
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
