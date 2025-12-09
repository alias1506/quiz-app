const nodemailer = require('nodemailer');

/**
 * Send certificate email with PDF attachment
 * @param {string} name - Recipient name
 * @param {string} email - Recipient email
 * @param {Buffer} pdfBuffer - PDF certificate buffer
 * @returns {Promise<boolean>} - Success status
 */
async function sendCertificateEmail(name, email, pdfBuffer) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("Email credentials not configured. Set SMTP_USER and SMTP_PASS variables.");
  }

  const fromEmail = process.env.SMTP_USER;

  try {
    console.log(`📧 Sending certificate to: ${email}`);

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: process.env.SMTP_SECURE === 'true' || true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: `"IIE Debate & Quiz Club" <${fromEmail}>`,
      to: email,
      subject: 'Your Certificate of Participation 🎓',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6; margin: 0;">IIE Debate & Quiz Club</h1>
            <p style="color: #6b7280; margin: 5px 0;">Voices and Minds United</p>
          </div>
          
          <h2 style="color: #1f2937; margin-top: 0;">Hello ${name},</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            Thank you for taking part in <strong style="color: #3b82f6;">Quizopolis</strong>! 🎉
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            Your certificate of participation is attached to this email. We're proud of your achievement!
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            Keep learning and stay curious! We hope to see you at our next event.
          </p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">
              Warm regards,<br>
              <strong style="color: #1f2937;">IIE Debate & Quiz Club</strong>
            </p>
            <p style="font-size: 12px; color: #9ca3af; margin-top: 15px;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </div>
      `,
      attachments: [{
        filename: 'certificate.pdf',
        content: pdfBuffer,
      }],
    });

    console.log("✅ Email sent successfully");
    console.log("📬 Message ID:", info.messageId);

    return true;
  } catch (error) {
    console.error("❌ Email delivery failed:", error.message);
    throw error;
  }
}

/**
 * Send generic email using Gmail
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} [options.text] - Plain text content (optional)
 * @returns {Promise<boolean>} - Success status
 */
async function sendEmail(options) {
  const { to, subject, html, text } = options;

  if (!to || !subject) {
    throw new Error("Email 'to' and 'subject' are required");
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("Email credentials not configured. Set SMTP_USER and SMTP_PASS variables.");
  }

  const fromEmail = process.env.SMTP_USER;

  try {
    console.log(`📧 Sending email to: ${to}`);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: process.env.SMTP_SECURE === 'true' || true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"IIE Debate & Quiz Club" <${fromEmail}>`,
      to: to,
      subject: subject,
      html: html || text,
    });

    console.log("✅ Email sent successfully");
    console.log("📬 Message ID:", info.messageId);

    return true;
  } catch (error) {
    console.error("❌ Email delivery failed:", error.message);
    throw error;
  }
}

module.exports = {
  sendEmail,
  sendCertificateEmail,
};
