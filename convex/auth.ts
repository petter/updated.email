import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const requestLogin = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Generate a token
    const token = crypto.randomUUID();

    // Store the token
    await ctx.db.insert("login_tokens", {
      token,
      email: args.email,
      expiresAt: Date.now() + 1000 * 60 * 60, // 1 hour
    });

    return { success: true, token };
  },
});

export const verifyLoginToken = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const tokenRecord = await ctx.db
      .query("login_tokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!tokenRecord) {
      return { success: false, message: "Invalid token" };
    }

    if (tokenRecord.expiresAt && tokenRecord.expiresAt < Date.now()) {
      return { success: false, message: "Token expired" };
    }

    // Generate session ID
    const sessionId = crypto.randomUUID();
    const now = Date.now();
    const expiresAt = now + 1000 * 60 * 60 * 24 * 30; // 30 days

    // Create session
    await ctx.db.insert("sessions", {
      sessionId,
      email: tokenRecord.email,
      createdAt: now,
      expiresAt,
    });

    // Clean up the used token
    await ctx.db.delete(tokenRecord._id);

    return { success: true, sessionId, email: tokenRecord.email };
  },
});

export const getSession = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) {
      return null;
    }

    if (session.expiresAt < Date.now()) {
      // Session expired
      return null;
    }

    return {
      email: session.email,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    };
  },
});

export const createSession = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Generate session ID
    const sessionId = crypto.randomUUID();
    const now = Date.now();
    const expiresAt = now + 1000 * 60 * 60 * 24 * 30; // 30 days

    // Create session
    await ctx.db.insert("sessions", {
      sessionId,
      email: args.email,
      createdAt: now,
      expiresAt,
    });

    return { success: true, sessionId };
  },
});

export const deleteSession = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }

    return { success: true };
  },
});
