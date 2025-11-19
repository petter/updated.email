import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const subscribe = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing && existing.status === "subscribed") {
      return { success: false, message: "Already subscribed" };
    }

    // Create or update subscription to pending
    if (existing) {
      // If it's pending, we just want to resend the verification, so we generate a new token
    } else {
      await ctx.db.insert("subscriptions", {
        email: args.email,
        status: "pending",
      });
    }

    // Generate a token
    const token = crypto.randomUUID();

    // Store the token
    await ctx.db.insert("verification_tokens", {
      token,
      email: args.email,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24, // 24 hours
    });

    return { success: true, token };
  },
});

export const verify = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const tokenRecord = await ctx.db
      .query("verification_tokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!tokenRecord) {
      return { success: false, message: "Invalid token" };
    }

    if (tokenRecord.expiresAt && tokenRecord.expiresAt < Date.now()) {
      return { success: false, message: "Token expired" };
    }

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_email", (q) => q.eq("email", tokenRecord.email))
      .first();

    if (!subscription) {
      return { success: false, message: "Subscription not found" };
    }

    await ctx.db.patch(subscription._id, {
      status: "subscribed",
      subscribedAt: Date.now(),
    });

    // Clean up the used token
    await ctx.db.delete(tokenRecord._id);

    return { success: true };
  },
});

export const getSubscriptionStatus = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    return sub ? sub.status : null;
  },
});
