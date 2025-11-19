import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  waitlist: defineTable({
    email: v.string(),
  }).index("by_email", ["email"]),
  subscriptions: defineTable({
    email: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("subscribed"),
      v.literal("unsubscribed"),
    ),
    subscribedAt: v.optional(v.number()),
    unsubscribedAt: v.optional(v.number()),
  }).index("by_email", ["email"]),
  verification_tokens: defineTable({
    token: v.string(),
    email: v.string(),
    expiresAt: v.optional(v.number()),
  }).index("by_token", ["token"]),
  login_tokens: defineTable({
    token: v.string(),
    email: v.string(),
    expiresAt: v.optional(v.number()),
  }).index("by_token", ["token"]),
  sessions: defineTable({
    sessionId: v.string(),
    email: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
  }).index("by_sessionId", ["sessionId"]),
  unsubscribe_tokens: defineTable({
    token: v.string(),
    email: v.string(),
    expiresAt: v.optional(v.number()),
  }).index("by_token", ["token"]),
  package_subscriptions: defineTable({
    email: v.string(),
    packageName: v.string(),
    subscribedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_email_and_package", ["email", "packageName"]),
});
