import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const addToWaitlist = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      return { id: existing._id, isNew: false };
    }

    const waitlistId = await ctx.db.insert("waitlist", {
      email: args.email,
    });

    return { id: waitlistId, isNew: true };
  },
});
