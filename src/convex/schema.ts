import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/* Schema for the public marketing site + admin/client portal.

   Three primary domains live here:

   1. `submissions` — every contact form / inquiry that lands on the
      home page. Read-only to clients, fully visible to admins.

   2. `users` + `sessions` — lightweight email/password auth that
      backs the login page. Passwords are stored salted + PBKDF2
      hashed (see `convex/users.ts`). Sessions are random opaque
      tokens kept here so privileged calls can verify the caller
      server-side instead of trusting client-supplied roles.

   3. `prospects` + `activityLog` — pre-existing tables that powered
      the now-removed agent prospecting tool. Left in place so a
      future re-enable is non-destructive; nothing in the live UI
      reads from them. */
export default defineSchema({
  // ─── Marketing-site form submissions ────────────────────────────
  submissions: defineTable({
    name:      v.string(),
    company:   v.string(),
    email:     v.string(),
    phone:     v.optional(v.string()),
    services:  v.array(v.string()),
    budget:    v.optional(v.string()),
    timeline:  v.optional(v.string()),
    message:   v.string(),
    intent:    v.string(),                 // "project" | "pricing" | "hello"
    source:    v.optional(v.string()),     // page / utm bucket
    status:    v.string(),                 // "new" | "in_review" | "replied" | "archived"
    referrer:  v.optional(v.string()),
    userAgent: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_email",  ["email"]),

  // ─── Email thread per submission (outbound + inbound replies) ────
  /* Every email we send to a submitter — and every reply they send
     back via Resend's inbound feature — is appended here as a row.
     `submissionId` is optional so that an inbound reply we couldn't
     match (e.g. weird headers) can still be stored and surfaced as
     "unmatched" later instead of being dropped on the floor.

     `messageIdHeader` is the RFC-822 Message-ID we generate on every
     outbound email; it embeds the submission id so when the recipient
     replies, the inbound webhook can recover the submission id from
     the `In-Reply-To` header without any DB lookup. */
  messages: defineTable({
    submissionId:      v.optional(v.id("submissions")),
    direction:         v.string(), // "out" | "in"
    fromAddress:       v.string(),
    fromName:          v.optional(v.string()),
    toAddresses:       v.array(v.string()),
    subject:           v.optional(v.string()),
    bodyText:          v.optional(v.string()),
    bodyHtml:          v.optional(v.string()),
    snippet:           v.optional(v.string()),
    messageIdHeader:   v.optional(v.string()),
    inReplyToHeader:   v.optional(v.string()),
    referencesHeaders: v.optional(v.array(v.string())),
    resendId:          v.optional(v.string()),
    inboundEventId:    v.optional(v.string()),
    sentAt:            v.number(),
  })
    .index("by_submission",      ["submissionId"])
    .index("by_messageIdHeader", ["messageIdHeader"])
    .index("by_inboundEventId",  ["inboundEventId"]),

  // ─── Auth: users + sessions ─────────────────────────────────────
  users: defineTable({
    email:       v.string(),
    name:        v.optional(v.string()),
    company:     v.optional(v.string()),
    role:        v.string(),               // "admin" | "client"
    passwordHash: v.string(),              // base64
    salt:         v.string(),              // base64
    createdAt:    v.number(),
    createdBy:    v.optional(v.id("users")),
    lastLoginAt:  v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_role",  ["role"]),

  sessions: defineTable({
    token:     v.string(),
    userId:    v.id("users"),
    createdAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_token",  ["token"])
    .index("by_userId", ["userId"]),

  // ─── Legacy: agent prospecting tool (UI removed, data preserved) ──
  prospects: defineTable({
    name: v.string(),
    address: v.string(),
    phone: v.string(),
    email: v.string(),
    website: v.optional(v.string()),
    category: v.string(),
    location: v.string(),
    hasWebsite: v.boolean(),
    emailStatus: v.string(),
    pitch: v.optional(v.string()),
    pitchGeneratedAt: v.optional(v.number()),
    emailSentAt: v.optional(v.number()),
  })
    .index("by_name", ["name"])
    .index("by_emailStatus", ["emailStatus"])
    .index("by_hasWebsite", ["hasWebsite"])
    .index("by_category", ["category"])
    .index("by_name_and_address", ["name", "address"]),

  activityLog: defineTable({
    text: v.string(),
    type: v.string(),
  })
    .index("by_type", ["type"]),
});
