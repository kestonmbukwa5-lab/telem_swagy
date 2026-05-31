const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');
const nodemailer = require('nodemailer');
const validator = require('validator');

const app = express();
app.use(bodyParser.json());

// CORS support for GitHub Pages
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

const DATA_FILE = path.join(__dirname, 'subscribers.json');
fs.ensureFileSync(DATA_FILE);

function readSubscribers() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8') || '[]';
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeSubscribers(list) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf8');
}

async function sendEmail(to, subject, text, html) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.FROM_EMAIL || user;

  if (!host || !user || !pass) {
    console.warn('SMTP not configured, skipping email to', to);
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({ from, to, subject, text, html });
}

app.post('/subscribe', async (req, res) => {
  const { email, name } = req.body || {};
  if (!email || !validator.isEmail(email)) return res.status(400).json({ error: 'Valid email required' });

  const list = readSubscribers();
  const exists = list.find((s) => s.email.toLowerCase() === email.toLowerCase());
  if (!exists) {
    const entry = { email, name: name || '', subscribed_at: new Date().toISOString() };
    list.push(entry);
    writeSubscribers(list);
  }

  // send confirmation email
  try {
    await sendEmail(email, 'Thanks for subscribing to TELEM SWAGY', `Hi ${name || ''},\n\nThanks for subscribing to TELEM SWAGY updates. Expect exclusive drops and behind-the-scenes updates.\n\n— TELEM SWAGY`, `<p>Hi ${name || ''},</p><p>Thanks for subscribing to <strong>TELEM SWAGY</strong> updates. Expect exclusive drops and behind-the-scenes updates.</p><p>— TELEM SWAGY</p>`);
  } catch (e) {
    console.error('Error sending confirmation email', e);
  }

  res.json({ ok: true, subscribed: !exists });
});

// simple health check
app.get('/_health', (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Subscription API running on port ${port}`);
  console.log(`📧 SMTP configured: ${process.env.SMTP_HOST ? 'yes' : 'no'}`);
}).on('error', (err) => {
  console.error('❌ Failed to start API:', err.message);
  process.exit(1);
});
