require('dotenv').config({ path: '.env' });
/* `.env.local` is what CRA loads for the React build; the Convex CLI
   also writes its deployment URL there. We pull from it as a backup
   so the Express server can reach Convex without duplicating values. */
require('dotenv').config({ path: '.env.local' });

const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
app.use(cors());
app.use(express.json());

const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY) {
  console.error(
    '\n  ✖ Missing RESEND_API_KEY.\n' +
    '    Create a .env file in the project root with:\n' +
    '      RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx\n'
  );
  process.exit(1);
}
const resend = new Resend(RESEND_API_KEY);

const FROM_DOMAIN = 'hello@6point.design';
const FROM_HEADER = '6POINT <hello@6point.design>';
const FROM_DISPLAY = '6POINT';

/* We log every outbound email back into Convex so the admin
   dashboard can render a live conversation per submission. */
const CONVEX_SITE_URL =
  process.env.CONVEX_SITE_URL ||
  process.env.REACT_APP_CONVEX_SITE_URL ||
  '';
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET || '';

if (!CONVEX_SITE_URL) {
  console.warn(
    '\n  ⚠ CONVEX_SITE_URL is not set — outbound emails will not be\n' +
    '    persisted to the conversation thread. Set CONVEX_SITE_URL\n' +
    '    (or REACT_APP_CONVEX_SITE_URL) in .env to enable.\n'
  );
}
if (!INTERNAL_API_SECRET) {
  console.warn(
    '\n  ⚠ INTERNAL_API_SECRET is not set — Convex will reject\n' +
    '    outbound logging requests. Set INTERNAL_API_SECRET in .env\n' +
    '    AND on the Convex deployment (npx convex env set).\n'
  );
}

/* Build an RFC-822 Message-ID with the submissionId baked in, so when
   the recipient hits "Reply" in their mail client the resulting
   In-Reply-To header lets the inbound webhook re-thread it without
   doing any DB lookup. */
const buildMessageId = (submissionId) => {
  const nonce = crypto.randomBytes(8).toString('hex');
  const subPart = submissionId ? `sub-${submissionId}-` : 'misc-';
  return `<${subPart}${nonce}@6point.design>`;
};

const stripHtml = (html) =>
  String(html || '')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<\/?(p|div|br|h\d|li|tr|td)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const logOutboundEmail = async ({
  submissionId,
  to,
  subject,
  html,
  text,
  resendId,
  messageIdHeader,
  fromAddress = FROM_DOMAIN,
  fromName = FROM_DISPLAY,
}) => {
  if (!CONVEX_SITE_URL || !INTERNAL_API_SECRET) return;
  try {
    const r = await fetch(`${CONVEX_SITE_URL}/messages/log-outbound`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Secret': INTERNAL_API_SECRET,
      },
      body: JSON.stringify({
        submissionId: submissionId || undefined,
        fromAddress,
        fromName,
        toAddresses: Array.isArray(to) ? to : [to],
        subject,
        bodyText: text || stripHtml(html),
        bodyHtml: html,
        messageIdHeader,
        resendId,
        sentAt: Date.now(),
      }),
    });
    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      console.warn(
        `  ⚠ Convex log-outbound rejected (${r.status}): ${detail.slice(0, 200)}`,
      );
    }
  } catch (err) {
    console.warn('  ⚠ Could not log outbound email to Convex:', err.message);
  }
};

// ── Send outreach email ──
app.post('/api/send-email', async (req, res) => {
  const { to, businessName, pitchBody, submissionId } = req.body;

  if (!to || !pitchBody) {
    return res.status(400).json({ error: 'Missing required fields: to, pitchBody' });
  }

  const messageId = buildMessageId(submissionId);
  const subject = `Quick thought about ${businessName || 'your business'}'s online presence`;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_HEADER,
      to: [to],
      replyTo: FROM_DOMAIN,
      subject,
      headers: { 'Message-ID': messageId },
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
          <div style="white-space: pre-wrap; font-size: 15px; line-height: 1.8; color: #2c2c2c;">
${pitchBody}
          </div>
          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;" />
          <div style="text-align: center; padding: 20px 0;">
            <p style="font-size: 12px; color: #999; margin: 0 0 4px 0;">Sent by <strong>6POINT</strong> — Digital Design Agency</p>
            <p style="font-size: 11px; color: #bbb; margin: 0;">This email cannot be replied to. Call <strong>803-669-5425</strong> or email <a href="mailto:hello@6point.design" style="color: #748E75;">hello@6point.design</a></p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: error.message || 'Resend API error' });
    }

    console.log(`✅ Email sent to ${to} (ID: ${data?.id})`);
    await logOutboundEmail({
      submissionId,
      to,
      subject,
      html: '',
      text: pitchBody,
      resendId: data?.id,
      messageIdHeader: messageId,
    });
    return res.json({ success: true, id: data?.id });
  } catch (err) {
    console.error('Server error sending email:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ── Reply to a contact submission ──
app.post('/api/reply-email', async (req, res) => {
  const { to, subject, body, replyTo, recipientName, submissionId } = req.body;

  if (!to || !body) {
    return res.status(400).json({ error: 'Missing required fields: to, body' });
  }

  const safeSubject =
    (subject && String(subject).trim()) || 'Re: your inquiry with 6POINT';
  const messageId = buildMessageId(submissionId);

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_HEADER,
      to: [to],
      replyTo: replyTo || FROM_DOMAIN,
      subject: safeSubject,
      headers: { 'Message-ID': messageId },
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
          ${recipientName ? `<p style="font-size: 15px; color: #2c2c2c; margin: 0 0 16px 0;">Hi ${recipientName},</p>` : ''}
          <div style="white-space: pre-wrap; font-size: 15px; line-height: 1.8; color: #2c2c2c;">
${body}
          </div>
          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;" />
          <div style="text-align: center; padding: 20px 0;">
            <p style="font-size: 12px; color: #999; margin: 0 0 4px 0;"><strong>6POINT</strong> — Digital Design Agency</p>
            <p style="font-size: 11px; color: #bbb; margin: 0;">Reply to this email or call <strong>803-669-5425</strong> · <a href="mailto:hello@6point.design" style="color: #748E75;">hello@6point.design</a></p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Resend error:', JSON.stringify(error, null, 2));
      const status =
        typeof error.statusCode === 'number' ? error.statusCode : 500;
      return res.status(status).json({
        error: error.message || error.name || 'Resend API error',
        name: error.name,
        statusCode: status,
      });
    }

    console.log(`✅ Reply sent to ${to} (ID: ${data?.id})`);
    await logOutboundEmail({
      submissionId,
      to,
      subject: safeSubject,
      html: '',
      text: body,
      resendId: data?.id,
      messageIdHeader: messageId,
    });
    return res.json({ success: true, id: data?.id });
  } catch (err) {
    console.error('❌ Server error sending reply:', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

// ── Auto-confirmation to a brand new submitter ──
app.post('/api/send-confirmation', async (req, res) => {
  const { to, name, company, intent, services, message, submissionId } = req.body;

  if (!to) {
    return res.status(400).json({ error: 'Missing required field: to' });
  }

  const firstName = (name || '').trim().split(/\s+/)[0];
  const greeting = firstName ? `Hi ${firstName},` : 'Hi there,';
  const intentLabel = ({
    project: 'starting a project',
    pricing: 'getting pricing',
    hello:   'saying hello',
  })[intent] || 'getting in touch';

  const servicesLine = Array.isArray(services) && services.length
    ? services.join(' · ')
    : null;

  const confirmationSubject = `Got your message${company ? ` — ${company}` : ''}`;
  const messageId = buildMessageId(submissionId);

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_HEADER,
      to: [to],
      replyTo: FROM_DOMAIN,
      subject: confirmationSubject,
      headers: { 'Message-ID': messageId },
      html: `
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
            Thanks for reaching out${firstName ? `, ${firstName}` : ''}.
          </h1>
          <p style="font-size: 15px; line-height: 1.7; color: #2c2c2c; margin: 0 0 18px;">
            ${greeting} we just received your note about <strong>${intentLabel}</strong>${company ? ` for <strong>${company}</strong>` : ''} and a real human at 6POINT will read it shortly. You'll hear back from us within <strong>one business day</strong>.
          </p>

          ${servicesLine ? `
          <div style="margin: 24px 0; padding: 16px 18px; background: #f6f6f4; border: 1px solid #e8e8e4; border-radius: 12px;">
            <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.06em; color: #888; text-transform: uppercase; margin-bottom: 6px;">
              Services you mentioned
            </div>
            <div style="font-size: 14px; color: #2c2c2c; line-height: 1.55;">
              ${servicesLine}
            </div>
          </div>` : ''}

          ${message ? `
          <div style="margin: 24px 0; padding: 16px 18px; background: #ffffff; border: 1px solid #e8e8e4; border-radius: 12px;">
            <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.06em; color: #888; text-transform: uppercase; margin-bottom: 6px;">
              What you sent
            </div>
            <div style="font-size: 14px; color: #2c2c2c; line-height: 1.6; white-space: pre-wrap;">${String(message).replace(/</g, '&lt;')}</div>
          </div>` : ''}

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
        </div>
      `,
    });

    if (error) {
      console.error('❌ Resend confirmation error:', JSON.stringify(error, null, 2));
      const status = typeof error.statusCode === 'number' ? error.statusCode : 500;
      return res.status(status).json({
        error: error.message || error.name || 'Resend API error',
        name: error.name,
        statusCode: status,
      });
    }

    console.log(`✅ Confirmation sent to ${to} (ID: ${data?.id})`);
    const confirmationText =
      `Thanks for reaching out${firstName ? `, ${firstName}` : ''}.\n\n` +
      `We just received your note about ${intentLabel}` +
      `${company ? ` for ${company}` : ''} and a real human at 6POINT will read it shortly.\n\n` +
      `${servicesLine ? `Services you mentioned: ${servicesLine}\n\n` : ''}` +
      `${message ? `Your message:\n${message}\n\n` : ''}` +
      `Talk soon,\nThe 6POINT Team`;
    await logOutboundEmail({
      submissionId,
      to,
      subject: confirmationSubject,
      html: '',
      text: confirmationText,
      resendId: data?.id,
      messageIdHeader: messageId,
    });
    return res.json({ success: true, id: data?.id });
  } catch (err) {
    console.error('❌ Server error sending confirmation:', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = Number(process.env.PORT) || 3001;
const server = app.listen(PORT, () => {
  console.log(`\n  🚀 6POINT Agent API running → http://localhost:${PORT}\n`);
});

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(
      `\n  ✖ Port ${PORT} is already in use.\n` +
      `    Stop the other process or set PORT in .env to a free port.\n`
    );
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});
