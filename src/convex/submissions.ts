import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

/* Public form submissions (the homepage Contact form writes here)
   plus admin-only read & status APIs that back the admin dashboard.
   Auth for the privileged endpoints is enforced by re-using the
   session-token guard from `convex/users.ts`. */

const requireAdmin = async (ctx: { db: any }, token: string | undefined) => {
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
  return user;
};

const VALID_STATUSES = new Set([
  "new",
  "in_review",
  "replied",
  "archived",
]);

// ── Public: write a new submission ───────────────────────────────

export const create = mutation({
  args: {
    name:      v.string(),
    company:   v.string(),
    email:     v.string(),
    phone:     v.optional(v.string()),
    services:  v.array(v.string()),
    budget:    v.optional(v.string()),
    timeline:  v.optional(v.string()),
    message:   v.string(),
    intent:    v.string(),
    source:    v.optional(v.string()),
    referrer:  v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    if (!/\S+@\S+\.\S+/.test(email)) {
      throw new Error("Please enter a valid email address.");
    }
    if (!args.name.trim()) throw new Error("Name is required.");
    if (!args.message.trim()) throw new Error("Message is required.");

    const id = await ctx.db.insert("submissions", {
      name:      args.name.trim(),
      company:   args.company.trim(),
      email,
      phone:     args.phone?.trim() || undefined,
      services:  args.services,
      budget:    args.budget?.trim() || undefined,
      timeline:  args.timeline?.trim() || undefined,
      message:   args.message.trim(),
      intent:    args.intent,
      source:    args.source,
      referrer:  args.referrer,
      userAgent: args.userAgent,
      status:    "new",
    });
    return { ok: true as const, id };
  },
});

// ── Admin: list submissions (newest first) ───────────────────────

export const listAll = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    return await ctx.db.query("submissions").order("desc").take(500);
  },
});

// ── Admin: just the headline counts for the topbar / KPI tiles ───

export const getCounts = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    /* Bounded scan — cheap until volume gets very high. If this
       ever becomes a hot path, swap for denormalised counters
       updated inside `create` / `setStatus`. */
    const all = await ctx.db.query("submissions").take(2000);
    const counts: Record<string, number> = {
      total:      all.length,
      new:        0,
      in_review:  0,
      replied:    0,
      archived:   0,
    };
    for (const s of all) {
      if (counts[s.status] != null) counts[s.status]++;
    }
    /* "Today" counter — last 24h */
    const dayAgo = Date.now() - 1000 * 60 * 60 * 24;
    counts.today = all.filter((s) => s._creationTime >= dayAgo).length;
    /* Week counter — last 7d, useful for the trend chip */
    const weekAgo = Date.now() - 1000 * 60 * 60 * 24 * 7;
    counts.week = all.filter((s) => s._creationTime >= weekAgo).length;
    return counts;
  },
});

// ── Admin: change submission status ──────────────────────────────

export const setStatus = mutation({
  args: {
    token: v.string(),
    id:    v.id("submissions"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    if (!VALID_STATUSES.has(args.status)) {
      throw new Error("Invalid status.");
    }
    await ctx.db.patch(args.id, { status: args.status });
    return { ok: true as const };
  },
});

// ── Admin: delete a submission ───────────────────────────────────

export const remove = mutation({
  args: { token: v.string(), id: v.id("submissions") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    await ctx.db.delete(args.id);
    return { ok: true as const };
  },
});
