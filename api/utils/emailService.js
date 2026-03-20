const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // If SMTP credentials aren't provided, print to console as fallback for dev
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('--- DEVELOPMENT MODE: No SMTP config found ---');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Text: ${text}`);
      if (html) console.log(`HTML: ${html}`);
      console.log('------------------------------------------------');
      return true; // Fake success
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true' || false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"AIGenius LMS" <no-reply@example.com>',
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Error sending email:`, error);
    throw new Error('Email could not be sent');
  }
};

module.exports = {
  sendEmail,
};
