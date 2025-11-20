"use client";

/**
 * Gets the session ID from cookies in client components.
 * Returns null if not found.
 */
export function getSessionIdFromCookie(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookies = document.cookie.split(";");
  const sessionCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("updated.email.session="),
  );

  if (!sessionCookie) {
    return null;
  }

  return sessionCookie.split("=")[1]?.trim() ?? null;
}
