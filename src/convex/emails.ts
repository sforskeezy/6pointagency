import { v } from "convex/values";
import { action, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";

/* ────────────────────────────────────────────────────────────────
   Transactional email, fully hosted by Convex.

   Historically these sends went through a local Express server
   (`server.js`) on port 3001. That meant any dev tool that grabbed
   3001 (Next.js, Remotion, Vite, …) silently broke the contact form
   because the React dev server's `/api/*` proxy would route to the
   wrong process. Moving the sends into Convex actions removes that
   failure mode entirely — the frontend calls a Convex action, the
   action calls Resend's REST API directly from Convex's cloud, and
   the same action persists the outbound message back into the
   `messages` thread so the admin dashboard stays in sync.
   ──────────────────────────────────────────────────────────────── */

const FROM_DOMAIN = "hello@6point.design";
const FROM_HEADER = "6POINT <hello@6point.design>";
const FROM_DISPLAY = "6POINT";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/* Build an RFC-822 Message-ID with the submissionId baked in, so
   when the recipient hits "Reply" in their mail client the resulting
   In-Reply-To header lets the inbound webhook re-thread it without
   doing any DB lookup. */
const buildMessageId = (submissionId?: string): string => {
  const nonce = Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const subPart = submissionId ? `sub-${submissionId}-` : "misc-";
  return `<${subPart}${nonce}@6point.design>`;
};

const stripHtml = (html: string): string =>
  String(html || "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<\/?(p|div|br|h\d|li|tr|td)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const escapeHtml = (s: string): string =>
  String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

type ResendSendArgs = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  messageIdHeader?: string;
};

type ResendResult = { id?: string };

/* Post to Resend's REST API. Throws with a descriptive message when
   Resend rejects the call so the caller can surface it to the admin
   UI (in the contact form we swallow + log because the submission is
   still already saved in Convex). */
const resendSend = async (args: ResendSendArgs): Promise<ResendResult> => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is not set on the Convex deployment. " +
        "Set it with: npx convex env set RESEND_API_KEY re_...",
    );
  }

  const payload: Record<string, unknown> = {
    from: FROM_HEADER,
    to: [args.to],
    subject: args.subject,
    html: args.html,
  };
  if (args.replyTo) payload.reply_to = args.replyTo;
  if (args.messageIdHeader) {
    payload.headers = { "Message-ID": args.messageIdHeader };
  }

  const r = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await r.text();
  let body: any = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text };
  }

  if (!r.ok) {
    const msg =
      body?.message ||
      body?.error ||
      body?.name ||
      `Resend returned ${r.status}`;
    throw new Error(String(msg));
  }

  return { id: body?.id };
};

/* Only used when the caller hands us a `submissionId` — we accept
   a string from the frontend (because it's easier for React) and
   validate + narrow to Id<"submissions"> on the server before we
   hand it off to the internal mutation. Anything we can't confirm
   gets dropped to `undefined` so the message still gets logged. */
export const _resolveSubmissionIdInternal = internalQuery({
  args: { candidate: v.string() },
  handler: async (ctx, args) => {
    try {
      const id = ctx.db.normalizeId("submissions", args.candidate);
      if (!id) return null;
      const doc = await ctx.db.get(id);
      return doc ? id : null;
    } catch {
      return null;
    }
  },
});

/* Session-token based admin check, used by the authed sending
   actions. Lives here (instead of importing from users.ts) so the
   action only needs one `runQuery` hop before doing its work. */
export const _verifyAdminTokenInternal = internalQuery({
  args: { token: v.string() },
  handler: async (ctx, args): Promise<Doc<"users"> | null> => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
    if (!session || session.expiresAt < Date.now()) return null;
    const user = await ctx.db.get(session.userId);
    if (!user || user.role !== "admin") return null;
    return user;
  },
});

// ── Email bodies ──────────────────────────────────────────────────

const confirmationHtml = (opts: {
  firstName: string;
  greeting: string;
  intentLabel: string;
  company?: string;
  servicesLine?: string;
  message?: string;
}) => `
  <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
    <div style="text-align: center; padding: 0 0 24px;">
      <div style="font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 700; letter-spacing: -0.01em; color: #1a1a1a;">
        6POINT
      </div>
      <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.18em; color: #748E75; text-transform: uppercase; margin-top: 4px;">
        Designs
      </div>
    </div>

    <h1 style="font-family: Georgia, 'Times New Roman', serif; font-weight: 400; font-size: 28px; line-height: 1.2; color: #1a1a1a; margin: 0 0 16px;">
      Thanks for reaching out${opts.firstName ? `, ${escapeHtml(opts.firstName)}` : ""}.
    </h1>
    <p style="font-size: 15px; line-height: 1.7; color: #2c2c2c; margin: 0 0 18px;">
      ${escapeHtml(opts.greeting)} we just received your note about <strong>${escapeHtml(opts.intentLabel)}</strong>${opts.company ? ` for <strong>${escapeHtml(opts.company)}</strong>` : ""} and a real human at 6POINT will read it shortly. You'll hear back from us within <strong>one business day</strong>.
    </p>

    ${
      opts.servicesLine
        ? `
    <div style="margin: 24px 0; padding: 16px 18px; background: #f6f6f4; border: 1px solid #e8e8e4; border-radius: 12px;">
      <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.06em; color: #888; text-transform: uppercase; margin-bottom: 6px;">
        Services you mentioned
      </div>
      <div style="font-size: 14px; color: #2c2c2c; line-height: 1.55;">
        ${escapeHtml(opts.servicesLine)}
      </div>
    </div>`
        : ""
    }

    ${
      opts.message
        ? `
    <div style="margin: 24px 0; padding: 16px 18px; background: #ffffff; border: 1px solid #e8e8e4; border-radius: 12px;">
      <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.06em; color: #888; text-transform: uppercase; margin-bottom: 6px;">
        What you sent
      </div>
      <div style="font-size: 14px; color: #2c2c2c; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(opts.message)}</div>
    </div>`
        : ""
    }

    <p style="font-size: 14px; line-height: 1.7; color: #555; margin: 24px 0 0;">
      In the meantime, feel free to call us at <strong>(803) 669-5425</strong> or just hit reply — this email goes straight to our inbox.
    </p>

    <p style="font-size: 14px; line-height: 1.7; color: #2c2c2c; margin: 22px 0 0;">
      Talk soon,<br/>
      <strong>The 6POINT Team</strong>
    </p>

    <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0 18px;" />
    <div style="text-align: center;">
      <p style="font-size: 11px; color: #999; margin: 0 0 4px;"><strong>6POINT</strong> — Digital Design Agency</p>
      <p style="font-size: 11px; color: #bbb; margin: 0;">
        <a href="mailto:hello@6point.design" style="color: #748E75; text-decoration: none;">hello@6point.design</a> · <strong>(803) 669-5425</strong>
      </p>
    </div>
  </div>`;

const replyHtml = (opts: { recipientName?: string; body: string }) => `
  <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
    ${opts.recipientName ? `<p style="font-size: 15px; color: #2c2c2c; margin: 0 0 16px 0;">Hi ${escapeHtml(opts.recipientName)},</p>` : ""}
    <div style="white-space: pre-wrap; font-size: 15px; line-height: 1.8; color: #2c2c2c;">
${escapeHtml(opts.body)}
    </div>
    <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;" />
    <div style="text-align: center; padding: 20px 0;">
      <p style="font-size: 12px; color: #999; margin: 0 0 4px 0;"><strong>6POINT</strong> — Digital Design Agency</p>
      <p style="font-size: 11px; color: #bbb; margin: 0;">Reply to this email or call <strong>803-669-5425</strong> · <a href="mailto:hello@6point.design" style="color: #748E75;">hello@6point.design</a></p>
    </div>
  </div>`;

const pitchHtml = (opts: { pitchBody: string }) => `
  <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
    <div style="white-space: pre-wrap; font-size: 15px; line-height: 1.8; color: #2c2c2c;">
${escapeHtml(opts.pitchBody)}
    </div>
    <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;" />
    <div style="text-align: center; padding: 20px 0;">
      <p style="font-size: 12px; color: #999; margin: 0 0 4px 0;">Sent by <strong>6POINT</strong> — Digital Design Agency</p>
      <p style="font-size: 11px; color: #bbb; margin: 0;">This email cannot be replied to. Call <strong>803-669-5425</strong> or email <a href="mailto:hello@6point.design" style="color: #748E75;">hello@6point.design</a></p>
    </div>
  </div>`;

// ── Public: auto-confirmation after a contact form submit ────────

export const sendConfirmation = action({
  args: {
    to:           v.string(),
    name:         v.optional(v.string()),
    company:      v.optional(v.string()),
    intent:       v.optional(v.string()),
    services:     v.optional(v.array(v.string())),
    message:      v.optional(v.string()),
    submissionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.to || !/\S+@\S+\.\S+/.test(args.to)) {
      throw new Error("Invalid recipient email.");
    }

    /* Normalize + validate the submissionId so we only stamp a real
       Id<"submissions"> onto the thread (avoids runtime errors in
       recordOutboundInternal, which is `v.id("submissions")`). */
    let resolvedId: any = undefined;
    if (args.submissionId) {
      resolvedId = await ctx.runQuery(
        internal.emails._resolveSubmissionIdInternal,
        { candidate: args.submissionId },
      );
      resolvedId = resolvedId || undefined;
    }

    const firstName = (args.name || "").trim().split(/\s+/)[0] || "";
    const greeting = firstName ? `Hi ${firstName},` : "Hi there,";
    const intentLabel =
      ({
        project: "starting a project",
        pricing: "getting pricing",
        hello: "saying hello",
      } as Record<string, string>)[args.intent || ""] || "getting in touch";

    const servicesLine =
      Array.isArray(args.services) && args.services.length
        ? args.services.join(" · ")
        : undefined;

    const subject = `Got your message${args.company ? ` — ${args.company}` : ""}`;
    const messageId = buildMessageId(args.submissionId);
    const html = confirmationHtml({
      firstName,
      greeting,
      intentLabel,
      company: args.company,
      servicesLine,
      message: args.message,
    });

    const { id: resendId } = await resendSend({
      to: args.to,
      subject,
      html,
      replyTo: FROM_DOMAIN,
      messageIdHeader: messageId,
    });

    const plain =
      `Thanks for reaching out${firstName ? `, ${firstName}` : ""}.\n\n` +
      `We just received your note about ${intentLabel}` +
      `${args.company ? ` for ${args.company}` : ""} and a real human at 6POINT will read it shortly.\n\n` +
      `${servicesLine ? `Services you mentioned: ${servicesLine}\n\n` : ""}` +
      `${args.message ? `Your message:\n${args.message}\n\n` : ""}` +
      `Talk soon,\nThe 6POINT Team`;

    await ctx.runMutation(internal.messages.recordOutboundInternal, {
      submissionId:    resolvedId,
      fromAddress:     FROM_DOMAIN,
      fromName:        FROM_DISPLAY,
      toAddresses:     [args.to],
      subject,
      bodyText:        plain,
      bodyHtml:        html,
      messageIdHeader: messageId,
      resendId,
      sentAt:          Date.now(),
    });

    return { ok: true, id: resendId ?? null };
  },
});

// ── Admin: reply to a submission (authed) ────────────────────────

export const sendReply = action({
  args: {
    token:          v.string(),
    to:             v.string(),
    subject:        v.optional(v.string()),
    body:           v.string(),
    recipientName:  v.optional(v.string()),
    submissionId:   v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin: Doc<"users"> | null = await ctx.runQuery(
      internal.emails._verifyAdminTokenInternal,
      { token: args.token },
    );
    if (!admin) throw new Error("Admin access required.");

    if (!args.to || !/\S+@\S+\.\S+/.test(args.to)) {
      throw new Error("Invalid recipient email.");
    }
    if (!args.body.trim()) throw new Error("Message body is empty.");

    let resolvedId: any = undefined;
    if (args.submissionId) {
      resolvedId = await ctx.runQuery(
        internal.emails._resolveSubmissionIdInternal,
        { candidate: args.submissionId },
      );
      resolvedId = resolvedId || undefined;
    }

    const subject =
      (args.subject && args.subject.trim()) || "Re: your inquiry with 6POINT";
    const messageId = buildMessageId(args.submissionId);
    const html = replyHtml({
      recipientName: args.recipientName,
      body: args.body,
    });

    const { id: resendId } = await resendSend({
      to: args.to,
      subject,
      html,
      replyTo: FROM_DOMAIN,
      messageIdHeader: messageId,
    });

    await ctx.runMutation(internal.messages.recordOutboundInternal, {
      submissionId:    resolvedId,
      fromAddress:     FROM_DOMAIN,
      fromName:        FROM_DISPLAY,
      toAddresses:     [args.to],
      subject,
      bodyText:        stripHtml(html) || args.body,
      bodyHtml:        html,
      messageIdHeader: messageId,
      resendId,
      sentAt:          Date.now(),
    });

    return { ok: true, id: resendId ?? null };
  },
});

// ── Admin: outbound cold pitch (authed) ──────────────────────────

export const sendPitch = action({
  args: {
    token:        v.string(),
    to:           v.string(),
    businessName: v.optional(v.string()),
    pitchBody:    v.string(),
    submissionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin: Doc<"users"> | null = await ctx.runQuery(
      internal.emails._verifyAdminTokenInternal,
      { token: args.token },
    );
    if (!admin) throw new Error("Admin access required.");

    if (!args.to || !/\S+@\S+\.\S+/.test(args.to)) {
      throw new Error("Invalid recipient email.");
    }
    if (!args.pitchBody.trim()) throw new Error("Pitch body is empty.");

    let resolvedId: any = undefined;
    if (args.submissionId) {
      resolvedId = await ctx.runQuery(
        internal.emails._resolveSubmissionIdInternal,
        { candidate: args.submissionId },
      );
      resolvedId = resolvedId || undefined;
    }

    const subject = `Quick thought about ${args.businessName || "your business"}'s online presence`;
    const messageId = buildMessageId(args.submissionId);
    const html = pitchHtml({ pitchBody: args.pitchBody });

    const { id: resendId } = await resendSend({
      to: args.to,
      subject,
      html,
      replyTo: FROM_DOMAIN,
      messageIdHeader: messageId,
    });

    await ctx.runMutation(internal.messages.recordOutboundInternal, {
      submissionId:    resolvedId,
      fromAddress:     FROM_DOMAIN,
      fromName:        FROM_DISPLAY,
      toAddresses:     [args.to],
      subject,
      bodyText:        args.pitchBody,
      bodyHtml:        html,
      messageIdHeader: messageId,
      resendId,
      sentAt:          Date.now(),
    });

    return { ok: true, id: resendId ?? null };
  },
});
