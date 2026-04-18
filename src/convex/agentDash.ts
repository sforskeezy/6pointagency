import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── Check if a business has already been processed ──
export const checkProspect = query({
  args: { name: v.string(), address: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("prospects")
      .withIndex("by_name_and_address", (q) =>
        q.eq("name", args.name).eq("address", args.address)
      )
      .take(1);
    return existing.length > 0 ? existing[0] : null;
  },
});

// ── Save or update a prospect ──
export const upsertProspect = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    // Check if already exists
    const existing = await ctx.db
      .query("prospects")
      .withIndex("by_name_and_address", (q) =>
        q.eq("name", args.name).eq("address", args.address)
      )
      .take(1);

    if (existing.length > 0) {
      // Update existing record
      await ctx.db.patch(existing[0]._id, {
        emailStatus: args.emailStatus,
        pitch: args.pitch || existing[0].pitch,
        email: args.email || existing[0].email,
        ...(args.emailStatus === "sent" ? { emailSentAt: Date.now() } : {}),
        ...(args.pitch ? { pitchGeneratedAt: Date.now() } : {}),
      });
      return existing[0]._id;
    } else {
      // Insert new prospect
      return await ctx.db.insert("prospects", {
        name: args.name,
        address: args.address,
        phone: args.phone,
        email: args.email,
        website: args.website,
        category: args.category,
        location: args.location,
        hasWebsite: args.hasWebsite,
        emailStatus: args.emailStatus,
        pitch: args.pitch,
        ...(args.emailStatus === "sent" ? { emailSentAt: Date.now() } : {}),
        ...(args.pitch ? { pitchGeneratedAt: Date.now() } : {}),
      });
    }
  },
});

// ── Get all prospects (latest first) ──
export const listProspects = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("prospects").order("desc").take(500);
  },
});

// ── Get prospects without websites ──
export const listNoWebsite = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("prospects")
      .withIndex("by_hasWebsite", (q) => q.eq("hasWebsite", false))
      .order("desc")
      .take(500);
  },
});

// ── Get sent emails ──
export const listSentEmails = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("prospects")
      .withIndex("by_emailStatus", (q) => q.eq("emailStatus", "sent"))
      .order("desc")
      .take(500);
  },
});

// ── Get all prospects with pitches (sent, failed, no-email) ──
export const listPitchedProspects = query({
  args: {},
  handler: async (ctx) => {
    // Get all non-skipped, non-pending prospects
    const all = await ctx.db.query("prospects").order("desc").take(500);
    return all.filter(
      (p) => p.pitch !== undefined && p.pitch !== null && p.pitch !== ""
    );
  },
});

// ── Get stats ──
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    // Use counters — take a reasonable batch to compute
    const all = await ctx.db.query("prospects").take(5000);
    const found = all.length;
    const noSite = all.filter((p) => !p.hasWebsite).length;
    const emailed = all.filter((p) => p.emailStatus === "sent").length;
    const categories = new Set(all.map((p) => p.category)).size;
    return { found, noSite, emailed, categories };
  },
});

// ── Log activity ──
export const logActivity = mutation({
  args: {
    text: v.string(),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activityLog", {
      text: args.text,
      type: args.type,
    });
  },
});

// ── Get recent activity ──
export const listActivity = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("activityLog").order("desc").take(200);
  },
});

// ── Clear all activity (for fresh runs) ──
export const clearActivity = mutation({
  args: {},
  handler: async (ctx) => {
    const logs = await ctx.db.query("activityLog").take(500);
    for (const log of logs) {
      await ctx.db.delete(log._id);
    }
  },
});
