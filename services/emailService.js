const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

async function sendMail({ to, subject, html, text, from }) {
    return transporter.sendMail({
        from: from || process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        html,
        text,
    });
}

module.exports = { sendMail }; 