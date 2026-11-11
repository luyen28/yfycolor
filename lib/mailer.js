const nodemailer = require('nodemailer');
const mailConfig = require('../config/mail.config');

const transporter = nodemailer.createTransport({
  host: mailConfig.host,
  port: mailConfig.port,
  secure: mailConfig.secure,
  auth: { user: mailConfig.user, pass: mailConfig.pass }
});

async function sendContactEmail({ name, phone, message }) {
  const safeMessage = (message || '').toString();
  await transporter.sendMail({
    from: `"Website" <${mailConfig.user}>`,
    to: mailConfig.to,
    subject: `Yêu cầu liên hệ mới từ website — ${name}`,
    text: `Họ tên: ${name}\nSố điện thoại: ${phone}\nNội dung:\n${safeMessage}`,
    html: `
      <p><strong>Họ tên:</strong> ${name}</p>
      <p><strong>Số điện thoại:</strong> ${phone}</p>
      <p><strong>Nội dung:</strong><br>${safeMessage.replace(/\n/g, '<br>')}</p>
    `
  });
}

module.exports = { sendContactEmail };

