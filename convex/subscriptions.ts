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
    // If previously unsubscribed, allow resubscription
    if (existing) {
      // If it's pending or unsubscribed, update to pending and generate a new token
      await ctx.db.patch(existing._id, {
        status: "pending",
      });
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

export const generateUnsubscribeToken = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!subscription || subscription.status !== "subscribed") {
      return { success: false, message: "No active subscription found" };
    }

    // Check if there's already a valid token for this email
    // We'll reuse existing tokens to avoid creating many tokens per user
    const existingTokens = await ctx.db.query("unsubscribe_tokens").collect();

    const validToken = existingTokens.find(
      (t) =>
        t.email === args.email && (!t.expiresAt || t.expiresAt > Date.now()),
    );

    if (validToken) {
      // Reuse existing valid token
      return { success: true, token: validToken.token };
    }

    // Generate a new token
    const token = crypto.randomUUID();

    // Store the token without expiration - users should be able to unsubscribe anytime
    // The token is tied to the email, so security is maintained
    await ctx.db.insert("unsubscribe_tokens", {
      token,
      email: args.email,
      // No expiration - users should be able to unsubscribe from old emails
    });

    return { success: true, token };
  },
});

export const unsubscribe = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const tokenRecord = await ctx.db
      .query("unsubscribe_tokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!tokenRecord) {
      return { success: false, message: "Invalid unsubscribe token" };
    }

    // Unsubscribe tokens don't expire - users should be able to unsubscribe anytime
    // Even from old emails. The token is tied to the email address, providing security.

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_email", (q) => q.eq("email", tokenRecord.email))
      .first();

    if (!subscription) {
      return { success: false, message: "Subscription not found" };
    }

    // Mark as unsubscribed
    await ctx.db.patch(subscription._id, {
      status: "unsubscribed",
      unsubscribedAt: Date.now(),
    });

    // Clean up the used token
    await ctx.db.delete(tokenRecord._id);

    return { success: true, email: tokenRecord.email };
  },
});

export const unsubscribeByEmail = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!subscription) {
      return { success: false, message: "Subscription not found" };
    }

    if (subscription.status === "unsubscribed") {
      return { success: false, message: "Already unsubscribed" };
    }

    // Mark as unsubscribed
    await ctx.db.patch(subscription._id, {
      status: "unsubscribed",
      unsubscribedAt: Date.now(),
    });

    return { success: true };
  },
});

// Package subscription functions
export const addPackageSubscription = mutation({
  args: {
    email: v.string(),
    packageName: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if package subscription already exists
    const existing = await ctx.db
      .query("package_subscriptions")
      .withIndex("by_email_and_package", (q) =>
        q.eq("email", args.email).eq("packageName", args.packageName),
      )
      .first();

    if (existing) {
      return { success: false, message: "Package already subscribed" };
    }

    // Add package subscription
    await ctx.db.insert("package_subscriptions", {
      email: args.email,
      packageName: args.packageName,
      subscribedAt: Date.now(),
    });

    return { success: true };
  },
});

export const removePackageSubscription = mutation({
  args: {
    email: v.string(),
    packageName: v.string(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("package_subscriptions")
      .withIndex("by_email_and_package", (q) =>
        q.eq("email", args.email).eq("packageName", args.packageName),
      )
      .first();

    if (!subscription) {
      return { success: false, message: "Package subscription not found" };
    }

    await ctx.db.delete(subscription._id);
    return { success: true };
  },
});

export const getPackageSubscriptions = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const subscriptions = await ctx.db
      .query("package_subscriptions")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .collect();

    // Sort by subscribedAt descending (most recent first)
    return subscriptions.sort((a, b) => b.subscribedAt - a.subscribedAt);
  },
});

export const getAllActiveSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    const subscriptions = await ctx.db
      .query("subscriptions")
      .filter((q) => q.eq(q.field("status"), "subscribed"))
      .collect();

    return subscriptions;
  },
});

export const updateLastNewsletterSentAt = mutation({
  args: {
    email: v.string(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!subscription) {
      return { success: false, message: "Subscription not found" };
    }

    await ctx.db.patch(subscription._id, {
      lastNewsletterSentAt: args.timestamp,
    });

    return { success: true };
  },
});
