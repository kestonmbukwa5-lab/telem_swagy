const fs = require('fs-extra');
const path = require('path');
const nodemailer = require('nodemailer');

const DATA_FILE = path.join(__dirname, 'subscribers.json');
const subscribers = fs.readJsonSync(DATA_FILE, { throws: false }) || [];

async function sendEmail(to, subject, text, html) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.FROM_EMAIL || user;

  if (!host || !user || !pass) {
    console.warn('SMTP not configured, skipping emails');
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  });

  for (const s of subscribers) {
    try {
      await transporter.sendMail({
        from,
        to: s.email,
        subject,
        text,
        html,
      });
      console.log('Sent update to', s.email);
    } catch (e) {
      console.error('Failed to send to', s.email, e.message || e);
    }
  }
}

async function run() {
  const subject = process.env.UPDATE_SUBJECT || 'TELEM SWAGY update';
  const body = process.env.UPDATE_BODY || 'New music and exclusive content from TELEM SWAGY — stay tuned.';
  await sendEmail(null, subject, body, `<p>${body}</p>`);
}

run().catch((e) => { console.error(e); process.exit(1); });
