import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Every business the agent discovers gets stored here
  prospects: defineTable({
    name: v.string(),
    address: v.string(),
    phone: v.string(),
    email: v.string(),
    website: v.optional(v.string()),
    category: v.string(),
    location: v.string(),
    hasWebsite: v.boolean(),
    emailStatus: v.string(), // "pending" | "sent" | "failed" | "no-email" | "skipped"
    pitch: v.optional(v.string()),
    pitchGeneratedAt: v.optional(v.number()),
    emailSentAt: v.optional(v.number()),
  })
    .index("by_name", ["name"])
    .index("by_emailStatus", ["emailStatus"])
    .index("by_hasWebsite", ["hasWebsite"])
    .index("by_category", ["category"])
    .index("by_name_and_address", ["name", "address"]),

  // Activity log for full audit trail
  activityLog: defineTable({
    text: v.string(),
    type: v.string(), // "search" | "analyze" | "email" | "error" | "success"
  })
    .index("by_type", ["type"]),
});
