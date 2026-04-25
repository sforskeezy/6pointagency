import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

/* ────────────────────────────────────────────────────────────────
   Threaded email conversation per submission.

   Two write paths feed this table:
     · Outbound — server.js calls `POST /messages/log-outbound` (an
       httpAction in `convex/http.ts`) every time it successfully
       hands an email to Resend. That action calls
       `recordOutboundInternal` here.
     · Inbound — Resend's inbound-email webhook posts to
       `/resend/inbound`, which calls `recordInboundInternal` after
       extracting the parsed message and threading metadata.

   The drawer in the admin UI subscribes to `listBySubmission` and
   gets a live conversation view for free thanks to Convex.
   ──────────────────────────────────────────────────────────────── */

/* Local copy of the admin guard. We can't `import` from `users.ts`
   without creating a circular type dep when the generated server
   types haven't been regenerated yet, so we just inline the check.
   It's the same logic used in `submissions.ts`. */
const requireAdmin = async (
  ctx: { db: any },
  token: string | undefined,
): Promise<Doc<"users">> => {
  if (!token) throw new Error("Not signed in.");
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .unique();
  if (!session || session.expiresAt < Date.now()) {
    throw new Error("Session expired. Please sign in again.");
  }
  const user = await ctx.db.get(session.userId);
  if (!user || user.role !== "admin") {
    throw new Error("Admin access required.");
  }
  return user as Doc<"users">;
};

const snippetOf = (text: string | undefined, max = 220): string | undefined => {
  if (!text) return undefined;
  const collapsed = text.replace(/\s+/g, " ").trim();
  if (collapsed.length <= max) return collapsed;
  return collapsed.slice(0, max - 1) + "…";
};

// ── Admin: live thread for one submission ────────────────────────

export const listBySubmission = query({
  args: { token: v.string(), submissionId: v.id("submissions") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const rows = await ctx.db
      .query("messages")
      .withIndex("by_submission", (q) => q.eq("submissionId", args.submissionId))
      .order("asc")
      .take(500);
    return rows;
  },
});

// ── Admin: inbound replies the matcher couldn't pin to a submission

export const listUnmatchedInbound = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const rows = await ctx.db
      .query("messages")
      .withIndex("by_submission", (q) => q.eq("submissionId", undefined))
      .order("desc")
      .take(100);
    return rows.filter((m) => m.direction === "in");
  },
});

/* ── Internal: record an outbound email ────────────────────────────

   Called by the http action in `convex/http.ts` after server.js
   successfully hands an email to Resend. Idempotent on `resendId`
   so a retry can't double-log the same send. */
export const recordOutboundInternal = internalMutation({
  args: {
    submissionId:    v.optional(v.id("submissions")),
    fromAddress:     v.string(),
    fromName:        v.optional(v.string()),
    toAddresses:     v.array(v.string()),
    subject:         v.optional(v.string()),
    bodyText:        v.optional(v.string()),
    bodyHtml:        v.optional(v.string()),
    messageIdHeader: v.optional(v.string()),
    resendId:        v.optional(v.string()),
    sentAt:          v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.resendId) {
      const existing = await ctx.db
        .query("messages")
        .withIndex("by_messageIdHeader", (q) =>
          q.eq("messageIdHeader", args.messageIdHeader),
        )
        .take(5);
      const dup = existing.find((m) => m.resendId === args.resendId);
      if (dup) return dup._id;
    }
    const id = await ctx.db.insert("messages", {
      submissionId:      args.submissionId,
      direction:         "out",
      fromAddress:       args.fromAddress,
      fromName:          args.fromName,
      toAddresses:       args.toAddresses,
      subject:           args.subject,
      bodyText:          args.bodyText,
      bodyHtml:          args.bodyHtml,
      snippet:           snippetOf(args.bodyText) ?? snippetOf(args.bodyHtml),
      messageIdHeader:   args.messageIdHeader,
      resendId:          args.resendId,
      sentAt:            args.sentAt ?? Date.now(),
    });
    return id;
  },
});

/* ── Internal: record an inbound (reply) email ─────────────────────

   The http action does the parsing + threading lookup, so by the
   time we land here we already know which submission this reply
   belongs to (or `undefined` if the matcher gave up). */
export const recordInboundInternal = internalMutation({
  args: {
    submissionId:      v.optional(v.id("submissions")),
    fromAddress:       v.string(),
    fromName:          v.optional(v.string()),
    toAddresses:       v.array(v.string()),
    subject:           v.optional(v.string()),
    bodyText:          v.optional(v.string()),
    bodyHtml:          v.optional(v.string()),
    messageIdHeader:   v.optional(v.string()),
    inReplyToHeader:   v.optional(v.string()),
    referencesHeaders: v.optional(v.array(v.string())),
    inboundEventId:    v.optional(v.string()),
    sentAt:            v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.inboundEventId) {
      const existing = await ctx.db
        .query("messages")
        .withIndex("by_inboundEventId", (q) =>
          q.eq("inboundEventId", args.inboundEventId),
        )
        .unique();
      if (existing) return existing._id;
    }

    const id = await ctx.db.insert("messages", {
      submissionId:      args.submissionId,
      direction:         "in",
      fromAddress:       args.fromAddress,
      fromName:          args.fromName,
      toAddresses:       args.toAddresses,
      subject:           args.subject,
      bodyText:          args.bodyText,
      bodyHtml:          args.bodyHtml,
      snippet:           snippetOf(args.bodyText) ?? snippetOf(args.bodyHtml),
      messageIdHeader:   args.messageIdHeader,
      inReplyToHeader:   args.inReplyToHeader,
      referencesHeaders: args.referencesHeaders,
      inboundEventId:    args.inboundEventId,
      sentAt:            args.sentAt ?? Date.now(),
    });

    /* Auto-bump the submission status to "replied" so the admin sees
       a visual cue in the inbox list that there's something new to
       look at. We don't downgrade later — admins control that. */
    if (args.submissionId) {
      const sub = await ctx.db.get(args.submissionId);
      if (sub && sub.status !== "archived") {
        await ctx.db.patch(args.submissionId, { status: "replied" });
      }
    }

    return id;
  },
});

/* ── Internal: validate an Id<"submissions"> string ─────────────────

   The http action receives a plain string from server.js — we use
   this query to confirm the submission actually exists before we
   accept the outbound log. Failing closed here protects us from
   bogus / spoofed payloads even though the http action is already
   shared-secret gated. */
export const submissionExistsInternal = internalQuery({
  args: { id: v.id("submissions") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    return doc != null;
  },
});

/* ── Internal: look up a message by Message-ID header ───────────────

   The inbound matcher prefers to recover the submission id from the
   embedded `<sub-{submissionId}-...>` Message-ID we generated on the
   way out, but as a fallback it asks here whether we know about the
   header at all (e.g. for forwarded chains). */
export const findByMessageIdHeaderInternal = internalQuery({
  args: { messageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_messageIdHeader", (q) =>
        q.eq("messageIdHeader", args.messageId),
      )
      .unique();
  },
});

/* ── Internal: most recent submission for a given email ─────────────

   Last-resort matcher: if header threading fails, see if there's a
   recent submission from this address and stitch the inbound message
   to that. */
export const findLatestSubmissionByEmailInternal = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const rows = await ctx.db
      .query("submissions")
      .withIndex("by_email", (q) => q.eq("email", email))
      .order("desc")
      .take(1);
    return rows[0] ?? null;
  },
});
