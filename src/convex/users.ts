import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

/* ────────────────────────────────────────────────────────────────
   Auth module — email/password login backed entirely by Convex.

   Why this shape:
     · Convex queries/mutations run in a V8 isolate that exposes the
       Web Crypto API (`crypto.subtle`) but NOT Node modules. So
       `bcrypt` is out; we use PBKDF2 with SHA-256 instead, which is
       industry-standard and runs natively in V8.
     · Sessions are opaque random tokens persisted in the `sessions`
       table. The frontend stores the token in localStorage and sends
       it on every privileged call. The server is the only place the
       role check lives — clients can't fake admin by editing storage.
     · The very first time `loginWithPassword` is invoked, if the
       table is empty we seed the in-house admin
       (admin@6pa.design / admin) so the user can log in immediately
       on a fresh deployment without any setup step. After that, the
       admin can mint additional users from the admin dashboard.
   ──────────────────────────────────────────────────────────────── */

const ADMIN_EMAIL = "admin@6pa.design";
const ADMIN_INITIAL_PASSWORD = "admin";

const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_HASH = "SHA-256";
const PBKDF2_KEY_BITS = 256;

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

// ── crypto helpers (pure Web Crypto, runs in Convex V8) ───────────

const toBase64 = (bytes: Uint8Array): string => {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  // btoa is available in V8 / browsers
  return btoa(binary);
};

const fromBase64 = (b64: string): Uint8Array => {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
};

const randomBytes = (n: number): Uint8Array => {
  const buf = new Uint8Array(n);
  crypto.getRandomValues(buf);
  return buf;
};

const hashPassword = async (
  password: string,
  saltBytes: Uint8Array,
): Promise<string> => {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltBytes as unknown as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: PBKDF2_HASH,
    },
    keyMaterial,
    PBKDF2_KEY_BITS,
  );
  return toBase64(new Uint8Array(bits));
};

const constantTimeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
};

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const newSessionToken = (): string => {
  // 32 random bytes → 256 bits → base64url-ish (just base64 here).
  return toBase64(randomBytes(32)).replace(/=+$/, "");
};

const publicUser = (u: Doc<"users">) => ({
  _id: u._id,
  email: u.email,
  name: u.name ?? null,
  company: u.company ?? null,
  role: u.role,
  createdAt: u.createdAt,
  lastLoginAt: u.lastLoginAt ?? null,
});

// ── Internal: ensure the bootstrap admin exists ──────────────────

/* Called inline at the start of `loginWithPassword`. Idempotent — if
   any user already exists we no-op. This keeps the very first login
   on a fresh deployment painless: the admin types their seeded
   credentials and they just work, no migration step needed. */
const ensureBootstrapAdmin = async (
  ctx: { db: any },
): Promise<void> => {
  const existing = await ctx.db
    .query("users")
    .withIndex("by_email", (q: any) => q.eq("email", ADMIN_EMAIL))
    .unique();
  if (existing) return;

  const salt = randomBytes(16);
  const passwordHash = await hashPassword(ADMIN_INITIAL_PASSWORD, salt);
  await ctx.db.insert("users", {
    email: ADMIN_EMAIL,
    name: "Admin",
    role: "admin",
    passwordHash,
    salt: toBase64(salt),
    createdAt: Date.now(),
  });
};

// ── Public: login ────────────────────────────────────────────────

export const loginWithPassword = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    await ensureBootstrapAdmin(ctx);

    const email = normalizeEmail(args.email);
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!user) {
      // Always run a hash even on miss so the timing doesn't leak
      // whether the email exists.
      await hashPassword(args.password, randomBytes(16));
      return { ok: false as const, error: "Invalid email or password." };
    }

    const candidate = await hashPassword(
      args.password,
      fromBase64(user.salt),
    );
    if (!constantTimeEqual(candidate, user.passwordHash)) {
      return { ok: false as const, error: "Invalid email or password." };
    }

    const token = newSessionToken();
    await ctx.db.insert("sessions", {
      token,
      userId: user._id,
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_TTL_MS,
    });
    await ctx.db.patch(user._id, { lastLoginAt: Date.now() });

    return {
      ok: true as const,
      token,
      user: publicUser(user),
    };
  },
});

// ── Public: resolve a session token → current user ───────────────

/* The frontend calls this on mount to figure out who the current
   user is. Returns `null` if the token is missing, expired, or
   doesn't match a known session. */
export const me = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.token) return null;
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token!))
      .unique();
    if (!session) return null;
    if (session.expiresAt < Date.now()) return null;
    const user = await ctx.db.get(session.userId);
    if (!user) return null;
    return publicUser(user);
  },
});

// ── Public: logout (invalidate a session) ────────────────────────

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
    if (session) await ctx.db.delete(session._id);
    return { ok: true as const };
  },
});

// ── Helper: assert the caller is an admin via session token ──────

/* Pulled into a helper because every privileged mutation/query
   needs the same guard. Returns the verified admin user document
   so callers can use it (e.g. to stamp `createdBy`). */
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

// Re-exported for use by other Convex modules in this directory.
export const _requireAdmin = requireAdmin;

// ── Admin: list all users ────────────────────────────────────────

export const listUsers = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token);
    const users = await ctx.db.query("users").order("desc").take(500);
    return users.map(publicUser);
  },
});

// ── Admin: create a new user ─────────────────────────────────────

export const createUser = mutation({
  args: {
    token:    v.string(),
    email:    v.string(),
    password: v.string(),
    name:     v.optional(v.string()),
    company:  v.optional(v.string()),
    role:     v.string(), // "admin" | "client"
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);

    const email = normalizeEmail(args.email);
    if (!/\S+@\S+\.\S+/.test(email)) {
      throw new Error("Please enter a valid email address.");
    }
    if (args.password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }
    if (args.role !== "admin" && args.role !== "client") {
      throw new Error("Role must be 'admin' or 'client'.");
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (existing) throw new Error("A user with that email already exists.");

    const salt = randomBytes(16);
    const passwordHash = await hashPassword(args.password, salt);
    const id: Id<"users"> = await ctx.db.insert("users", {
      email,
      name: args.name,
      company: args.company,
      role: args.role,
      passwordHash,
      salt: toBase64(salt),
      createdAt: Date.now(),
      createdBy: admin._id,
    });

    const created = await ctx.db.get(id);
    return publicUser(created!);
  },
});

// ── Admin: delete a user (cleans up their sessions too) ──────────

export const deleteUser = mutation({
  args: { token: v.string(), userId: v.id("users") },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.token);
    if (args.userId === admin._id) {
      throw new Error("You can't delete your own account while signed in.");
    }
    // Wipe their sessions in batches first so they can't keep using
    // a stale token after we drop the user row.
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .take(200);
    for (const s of sessions) await ctx.db.delete(s._id);
    await ctx.db.delete(args.userId);
    return { ok: true as const };
  },
});

// ── Internal: dev/setup helper to reset the admin password ──────

/* Not exposed to clients. Run from the Convex dashboard's "Run a
   Function" panel if you ever lock yourself out. */
export const _resetAdminPassword = internalMutation({
  args: { newPassword: v.string() },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", ADMIN_EMAIL))
      .unique();
    if (!admin) throw new Error("Bootstrap admin doesn't exist yet.");
    const salt = randomBytes(16);
    const passwordHash = await hashPassword(args.newPassword, salt);
    await ctx.db.patch(admin._id, { passwordHash, salt: toBase64(salt) });
    return { ok: true as const };
  },
});
