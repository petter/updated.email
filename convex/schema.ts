import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  waitlist: defineTable({
    email: v.string(),
  }).index("by_email", ["email"]),
  subscriptions: defineTable({
    email: v.string(),
    status: v.union(v.literal("pending"), v.literal("subscribed")),
    subscribedAt: v.optional(v.number()),
  }).index("by_email", ["email"]),
  verification_tokens: defineTable({
    token: v.string(),
    email: v.string(),
    expiresAt: v.optional(v.number()),
  }).index("by_token", ["token"]),
});
