// Vercel serverless function to send contact emails using SendGrid
// Set these environment variables in your Vercel project settings:
// SENDGRID_API_KEY, TO_EMAIL (recipient), FROM_EMAIL (optional, e.g. no-reply@yourdomain.com)

const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const sendGridKey = process.env.SENDGRID_API_KEY;
  const toEmail = process.env.TO_EMAIL || 'hamzamjid88@gmail.com';
  const fromEmail = process.env.FROM_EMAIL || `no-reply@${req.headers.host || 'protfolio'}`;

  if (!sendGridKey) {
    // In production we require a key. For local development, save messages to a local log so testing works.
    if (process.env.NODE_ENV === 'production') {
      return res.status(500).json({ error: 'SendGrid API key not configured (SENDGRID_API_KEY)' });
    }

    try {
      const raw = await new Promise((resolve, reject) => {
        let d = '';
        req.on('data', c => d += c);
        req.on('end', () => resolve(d));
        req.on('error', reject);
      });
      let parsed = null;
      try { parsed = raw ? JSON.parse(raw) : null; } catch (e) { parsed = raw || null; }
      const bodyText = JSON.stringify({ time: new Date().toISOString(), host: req.headers.host, msg: parsed }) + '\n';
      const filePath = path.join(process.cwd(), 'dev_messages.log');
      fs.appendFileSync(filePath, bodyText, { encoding: 'utf8' });
      return res.status(200).json({ ok: true, dev: true, note: `Saved to ${filePath}` });
    } catch (err) {
      console.error('dev fallback write error', err);
      return res.status(500).json({ error: 'Local fallback failed' });
    }
  }

  try {
    const body = req.body && Object.keys(req.body).length ? req.body : await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => data += chunk);
      req.on('end', () => {
        try { resolve(JSON.parse(data || '{}')); } catch (e) { resolve({}); }
      });
      req.on('error', reject);
    });

    const name = (body.name || 'Website visitor').toString().slice(0, 200);
    const email = (body.email || '').toString().slice(0, 200);
    const message = (body.message || '').toString().slice(0, 4000);

    const subject = `Portfolio contact: ${name}`;

    const payload = {
      personalizations: [{ to: [{ email: toEmail }] , subject }],
      from: { email: fromEmail, name: 'Portfolio Website' },
      reply_to: email ? { email, name } : undefined,
      content: [{ type: 'text/plain', value: `Message from ${name} <${email}>:\n\n${message}` }]
    };

    const r = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendGridKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(502).json({ error: 'SendGrid error', details: text });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('send handler error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
