import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Records a newsletter send in the database.
 */
export const recordNewsletterSend = mutation({
  args: {
    email: v.string(),
    packageNames: v.array(v.string()),
    packageCount: v.number(),
    updateCount: v.number(),
    status: v.union(v.literal("success"), v.literal("error")),
    emailId: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("newsletter_sends", {
      email: args.email,
      sentAt: Date.now(),
      packageNames: args.packageNames,
      packageCount: args.packageCount,
      updateCount: args.updateCount,
      status: args.status,
      emailId: args.emailId,
      error: args.error,
    });
  },
});

/**
 * Gets all newsletter sends for a specific email address.
 */
export const getNewsletterSendsByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const sends = await ctx.db
      .query("newsletter_sends")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .collect();

    // Sort by sentAt descending (most recent first)
    return sends.sort((a, b) => b.sentAt - a.sentAt);
  },
});

/**
 * Gets all newsletter sends, optionally filtered by date range.
 */
export const getAllNewsletterSends = query({
  args: {
    limit: v.optional(v.number()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let sends = await ctx.db
      .query("newsletter_sends")
      .withIndex("by_sentAt")
      .collect();

    // Filter by date range if provided
    const { startDate, endDate } = args;
    if (startDate) {
      sends = sends.filter((send) => send.sentAt >= startDate);
    }
    if (endDate) {
      sends = sends.filter((send) => send.sentAt <= endDate);
    }

    // Sort by sentAt descending (most recent first)
    sends.sort((a, b) => b.sentAt - a.sentAt);

    // Apply limit if provided
    if (args.limit) {
      sends = sends.slice(0, args.limit);
    }

    return sends;
  },
});
