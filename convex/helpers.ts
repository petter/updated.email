import type { MutationCtx, QueryCtx } from "./_generated/server";

/**
 * Validates a session ID and returns the associated email.
 * Throws an error if the session is invalid or expired.
 */
export async function getAuthenticatedEmail(
  ctx: QueryCtx | MutationCtx,
  sessionId: string | undefined,
): Promise<string> {
  if (!sessionId) {
    throw new Error("Authentication required");
  }

  const session = await ctx.db
    .query("sessions")
    .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
    .first();

  if (!session) {
    throw new Error("Invalid session");
  }

  if (session.expiresAt < Date.now()) {
    throw new Error("Session expired");
  }

  return session.email;
}

/**
 * Validates that the authenticated user's email matches the provided email.
 * Throws an error if authentication fails or emails don't match.
 */
export async function requireEmailMatch(
  ctx: QueryCtx | MutationCtx,
  sessionId: string | undefined,
  email: string,
): Promise<void> {
  const authenticatedEmail = await getAuthenticatedEmail(ctx, sessionId);
  if (authenticatedEmail !== email) {
    throw new Error("Unauthorized: email mismatch");
  }
}
