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

/**
 * Validates a cron secret for server-side authentication.
 * Throws an error if the secret is invalid.
 * The CRON_SECRET should be set as a Convex environment variable.
 */
export function validateCronSecret(cronSecret: string | undefined): void {
  if (!cronSecret) {
    throw new Error("Cron secret required for server-side calls");
  }

  // Get the expected secret from Convex environment variables
  // Set this in your Convex dashboard: npx convex env set CRON_SECRET <value>
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    // In development, allow if CRON_SECRET env var is not set (for local testing)
    // In production, this should always be set
    if (process.env.NODE_ENV === "production") {
      throw new Error("CRON_SECRET not configured in Convex");
    }
    return; // Allow in development if not configured
  }

  if (cronSecret !== expectedSecret) {
    throw new Error("Invalid cron secret");
  }
}
