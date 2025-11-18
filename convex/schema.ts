import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  newsletterSubscriptions: defineTable({
    email: v.string(),
    status: v.union(
      v.literal("subscribed"),
      v.literal("unsubscribed"),
      v.literal("pending")
    ),
    packages: v.array(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"]),
});
