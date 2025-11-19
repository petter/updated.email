"use server";

import { ConvexHttpClient } from "convex/browser";
import { redirect } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { env } from "@/env";
import { clearSessionCookie, getSessionFromCookie } from "@/lib/auth";

const convex = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

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
