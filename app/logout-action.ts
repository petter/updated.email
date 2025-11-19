"use server";

import { ConvexHttpClient } from "convex/browser";
import { redirect } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { clearSessionCookie, getSessionFromCookie } from "@/lib/auth";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
}

const convex = new ConvexHttpClient(convexUrl);

export async function logoutAction() {
  const sessionId = await getSessionFromCookie();

  if (sessionId) {
    // Delete session from database
    await convex.mutation(api.auth.deleteSession, { sessionId });
  }

  // Clear cookie
  await clearSessionCookie();

  redirect("/dashboard");
}
