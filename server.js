require('dotenv').config();

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

// ── Send outreach email ──
app.post('/api/send-email', async (req, res) => {
  const { to, businessName, pitchBody } = req.body;

  if (!to || !pitchBody) {
    return res.status(400).json({ error: 'Missing required fields: to, pitchBody' });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: '6POINT <hello@6pointsolutions.com>',
      to: [to],
      replyTo: 'sixpointagency@gmail.com',
      subject: `Quick thought about ${businessName || 'your business'}'s online presence`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
          <div style="white-space: pre-wrap; font-size: 15px; line-height: 1.8; color: #2c2c2c;">
${pitchBody}
          </div>
          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;" />
          <div style="text-align: center; padding: 20px 0;">
            <p style="font-size: 12px; color: #999; margin: 0 0 4px 0;">Sent by <strong>6POINT</strong> — Digital Design Agency</p>
            <p style="font-size: 11px; color: #bbb; margin: 0;">This email cannot be replied to. Call <strong>803-669-5425</strong> or email <a href="mailto:sixpointagency@gmail.com" style="color: #748E75;">sixpointagency@gmail.com</a></p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: error.message || 'Resend API error' });
    }

    console.log(`✅ Email sent to ${to} (ID: ${data?.id})`);
    return res.json({ success: true, id: data?.id });
  } catch (err) {
    console.error('Server error sending email:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ── Reply to a contact submission ──
app.post('/api/reply-email', async (req, res) => {
  const { to, subject, body, replyTo, recipientName } = req.body;

  if (!to || !body) {
    return res.status(400).json({ error: 'Missing required fields: to, body' });
  }

  const safeSubject =
    (subject && String(subject).trim()) || 'Re: your inquiry with 6POINT';

  try {
    const { data, error } = await resend.emails.send({
      from: '6POINT <hello@6pointsolutions.com>',
      to: [to],
      replyTo: replyTo || 'sixpointagency@gmail.com',
      subject: safeSubject,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
          ${recipientName ? `<p style="font-size: 15px; color: #2c2c2c; margin: 0 0 16px 0;">Hi ${recipientName},</p>` : ''}
          <div style="white-space: pre-wrap; font-size: 15px; line-height: 1.8; color: #2c2c2c;">
${body}
          </div>
          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;" />
          <div style="text-align: center; padding: 20px 0;">
            <p style="font-size: 12px; color: #999; margin: 0 0 4px 0;"><strong>6POINT</strong> — Digital Design Agency</p>
            <p style="font-size: 11px; color: #bbb; margin: 0;">Reply to this email or call <strong>803-669-5425</strong> · <a href="mailto:sixpointagency@gmail.com" style="color: #748E75;">sixpointagency@gmail.com</a></p>
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
    return res.json({ success: true, id: data?.id });
  } catch (err) {
    console.error('❌ Server error sending reply:', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n  🚀 6POINT Agent API running → http://localhost:${PORT}\n`);
});
