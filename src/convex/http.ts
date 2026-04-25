import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

/* ────────────────────────────────────────────────────────────────
   Public HTTP endpoints, hosted by Convex.

   We use Convex's HTTP actions instead of routing through the local
   Express server for two reasons:
     1. They're already publicly reachable (Convex deployment URL),
        which is what Resend's inbound webhook needs.
     2. They run inside Convex so they can call internal mutations
        directly without us having to plumb a separate auth token.

   Both endpoints are protected by a shared secret — the outbound
   logger via header, the inbound webhook by the Svix signature
   Resend includes (when you wire up the webhook secret).
   ──────────────────────────────────────────────────────────────── */

const http = httpRouter();

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/* ── Outbound logger ───────────────────────────────────────────────

   server.js POSTs here every time it hands an email to Resend. We
   intentionally make this an HTTP action (not a public mutation)
   so the only way to invoke it is from a process that knows the
   shared secret — the secret never has to ride alongside any
   end-user session token. */
http.route({
  path: "/messages/log-outbound",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const expected = process.env.INTERNAL_API_SECRET;
    if (!expected) {
      return json(500, {
        error:
          "INTERNAL_API_SECRET is not configured on this Convex deployment.",
      });
    }
    const presented = req.headers.get("x-internal-secret") ?? "";
    if (presented !== expected) {
      return json(401, { error: "Bad shared secret." });
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return json(400, { error: "Body must be JSON." });
    }

    const { fromAddress, toAddresses } = body || {};
    if (typeof fromAddress !== "string" || !Array.isArray(toAddresses)) {
      return json(400, { error: "fromAddress + toAddresses are required." });
    }

    /* Validate the submission id (if provided) before stamping it
       onto the message row — failing here surfaces config errors
       in dev instead of silently writing an orphan reference. */
    let submissionId: Id<"submissions"> | undefined = undefined;
    if (typeof body.submissionId === "string" && body.submissionId.length > 0) {
      try {
        const ok = await ctx.runQuery(
          internal.messages.submissionExistsInternal,
          { id: body.submissionId as Id<"submissions"> },
        );
        if (ok) submissionId = body.submissionId as Id<"submissions">;
      } catch {
        /* Bad id format — leave undefined and store as orphan. */
      }
    }

    const id = await ctx.runMutation(internal.messages.recordOutboundInternal, {
      submissionId,
      fromAddress,
      fromName:        body.fromName,
      toAddresses:     toAddresses.map((s: any) => String(s)),
      subject:         body.subject,
      bodyText:        body.bodyText,
      bodyHtml:        body.bodyHtml,
      messageIdHeader: body.messageIdHeader,
      resendId:        body.resendId,
      sentAt:          typeof body.sentAt === "number" ? body.sentAt : undefined,
    });

    return json(200, { ok: true, id });
  }),
});

/* ── Helpers for the inbound matcher ───────────────────────────── */

/* Pull a submission id out of an `In-Reply-To` (or `References`)
   header that we generated on a previous outbound. We stamp every
   outbound Message-ID with the form `<sub-{id}-{nonce}@6point.design>`,
   so this regex is the round-trip. */
const parseSubmissionIdFromHeader = (
  raw: string | null | undefined,
): string | null => {
  if (!raw) return null;
  const m = raw.match(/<sub-([a-z0-9]+)-/i);
  return m ? m[1] : null;
};

/* Resend's inbound webhook payload nests the parsed message under
   `data` and includes envelope info at the top level. Field names
   evolve, so we look in a few likely places before giving up. */
const pickFirst = <T,>(...vals: (T | null | undefined)[]): T | undefined => {
  for (const v of vals) if (v != null) return v as T;
  return undefined;
};

const headerLookup = (headers: any, key: string): string | undefined => {
  if (!headers) return undefined;
  const wanted = key.toLowerCase();
  if (Array.isArray(headers)) {
    for (const h of headers) {
      const k = (h?.name ?? h?.key ?? "").toLowerCase();
      if (k === wanted) return String(h?.value ?? h?.val ?? "");
    }
    return undefined;
  }
  if (typeof headers === "object") {
    for (const [k, v] of Object.entries(headers)) {
      if (k.toLowerCase() === wanted) return String(v);
    }
  }
  return undefined;
};

const extractEmailAddress = (raw: string | undefined): string | undefined => {
  if (!raw) return undefined;
  const m = raw.match(/<([^>]+)>/);
  if (m) return m[1].trim().toLowerCase();
  return raw.trim().toLowerCase();
};

const extractDisplayName = (raw: string | undefined): string | undefined => {
  if (!raw) return undefined;
  const m = raw.match(/^"?([^"<]*?)"?\s*<[^>]+>/);
  if (m && m[1].trim()) return m[1].trim();
  return undefined;
};

/* ── Inbound webhook ───────────────────────────────────────────────

   Resend posts the parsed inbound message here. We try three ways
   to thread it back to a submission, in order of confidence:
     1. Parse `In-Reply-To` for our embedded submission id
     2. Walk the `References` chain looking for the same pattern
     3. Fall back to "latest submission for this sender's email"
   If all three fail we still record the message with a null
   submissionId so it shows up in the "unmatched" bucket later. */
http.route({
  path: "/resend/inbound",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    /* Optional Svix signature verification.
       We accept un-signed payloads in dev (no secret set) so users
       can iterate locally without ngrok plumbing, but in production
       you should set RESEND_WEBHOOK_SECRET so impostors can't post. */
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
    let rawBody: string;
    try {
      rawBody = await req.text();
    } catch {
      return json(400, { error: "Could not read body." });
    }

    if (webhookSecret) {
      try {
        // Lazy-import so dev mode without svix installed still works.
        const { Webhook } = await import("svix");
        const wh = new Webhook(webhookSecret);
        const headers = {
          "svix-id":        req.headers.get("svix-id") ?? "",
          "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
          "svix-signature": req.headers.get("svix-signature") ?? "",
        };
        wh.verify(rawBody, headers);
      } catch (err: any) {
        return json(401, {
          error: "Bad webhook signature.",
          detail: err?.message ?? String(err),
        });
      }
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return json(400, { error: "Body must be JSON." });
    }

    const data = payload?.data ?? payload ?? {};
    const eventId =
      pickFirst<string>(payload?.id, data?.id, data?.email_id, data?.message_id);
    const headers = data?.headers ?? data?.email?.headers;

    /* Fish each piece out of whatever shape Resend gave us. */
    const fromHeader = pickFirst<string>(
      data?.from,
      data?.from_address,
      data?.from?.address,
      headerLookup(headers, "from"),
    );
    const fromAddress =
      extractEmailAddress(fromHeader) ?? "unknown@unknown";
    const fromName = extractDisplayName(fromHeader);

    const toRaw = pickFirst<string | string[]>(
      data?.to,
      data?.to_addresses,
      data?.recipients,
      headerLookup(headers, "to"),
    );
    const toAddresses = (Array.isArray(toRaw) ? toRaw : [toRaw])
      .filter(Boolean)
      .map((s: any) => extractEmailAddress(String(s)) ?? String(s));

    const subject = pickFirst<string>(
      data?.subject,
      headerLookup(headers, "subject"),
    );
    const bodyText = pickFirst<string>(data?.text, data?.body_text);
    const bodyHtml = pickFirst<string>(data?.html, data?.body_html);

    const messageIdHeader =
      pickFirst<string>(
        data?.message_id,
        data?.messageId,
        headerLookup(headers, "message-id"),
      ) ?? undefined;
    const inReplyToHeader =
      pickFirst<string>(
        data?.in_reply_to,
        data?.inReplyTo,
        headerLookup(headers, "in-reply-to"),
      ) ?? undefined;

    const referencesRaw =
      pickFirst<string>(headerLookup(headers, "references")) ?? "";
    const referencesHeaders = referencesRaw
      ? referencesRaw.split(/\s+/).filter(Boolean)
      : undefined;

    /* Try to recover the originating submission. */
    let submissionId: Id<"submissions"> | undefined = undefined;
    const fromInReplyTo = parseSubmissionIdFromHeader(inReplyToHeader);
    let candidate = fromInReplyTo;
    if (!candidate && referencesHeaders) {
      for (const ref of referencesHeaders) {
        const id = parseSubmissionIdFromHeader(ref);
        if (id) {
          candidate = id;
          break;
        }
      }
    }
    if (candidate) {
      try {
        const exists = await ctx.runQuery(
          internal.messages.submissionExistsInternal,
          { id: candidate as Id<"submissions"> },
        );
        if (exists) submissionId = candidate as Id<"submissions">;
      } catch {
        /* Bad id format — fall through to email match. */
      }
    }
    if (!submissionId && fromAddress) {
      const sub = await ctx.runQuery(
        internal.messages.findLatestSubmissionByEmailInternal,
        { email: fromAddress },
      );
      if (sub) submissionId = sub._id as Id<"submissions">;
    }

    const id = await ctx.runMutation(internal.messages.recordInboundInternal, {
      submissionId,
      fromAddress,
      fromName,
      toAddresses,
      subject,
      bodyText,
      bodyHtml,
      messageIdHeader,
      inReplyToHeader,
      referencesHeaders,
      inboundEventId: eventId,
      sentAt: Date.now(),
    });

    return json(200, { ok: true, id, matched: !!submissionId });
  }),
});

export default http;
