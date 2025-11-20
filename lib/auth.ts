import { ConvexHttpClient } from "convex/browser";
import { cookies } from "next/headers";
import { api } from "@/convex/_generated/api";
import { env } from "@/env";

const convex = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

const SESSION_COOKIE_NAME = "updated.email.session";

export async function getSessionFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  return sessionCookie?.value ?? null;
}

export async function setSessionCookie(sessionId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getAuthenticatedEmail(): Promise<string | null> {
  const sessionId = await getSessionFromCookie();
  if (!sessionId) {
    return null;
  }

  try {
    const session = await convex.query(api.auth.getSession, { sessionId });
    return session?.email ?? null;
  } catch (error) {
    console.error("Failed to get session:", error);
    return null;
  }
}

export async function getSessionId(): Promise<string | null> {
  return await getSessionFromCookie();
}
