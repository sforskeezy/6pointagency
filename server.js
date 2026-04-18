const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
app.use(cors());
app.use(express.json());

const resend = new Resend('re_GQv6PAWd_G1LPGBzWgJgRDfS3fCemy6nV');

// ── Send outreach email ──
app.post('/api/send-email', async (req, res) => {
  const { to, businessName, pitchBody } = req.body;

  if (!to || !pitchBody) {
    return res.status(400).json({ error: 'Missing required fields: to, pitchBody' });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'HELLO@6POINTSOLUTIONS.COM',
      to: [to],
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n  🚀 6POINT Agent API running → http://localhost:${PORT}\n`);
});
