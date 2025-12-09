/**
 * Email Service - Gmail SMTP for certificate delivery
 */

const nodemailer = require("nodemailer");

/**
 * Send email using Nodemailer (Gmail SMTP)
 * @param {Object} options - Email options
 * @returns {Promise<boolean>} - Success status
 */
async function sendWithNodemailer(options) {
  const { to, subject, html, text, attachments } = options;
  
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "iiedebateandquizclub@gmail.com",
        pass: process.env.GMAIL_APP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.sendMail({
      from: "IIE Debate & Quiz Club <iiedebateandquizclub@gmail.com>",
      to: to,
      subject: subject,
      text: text,
      html: html,
      attachments: attachments,
    });
    
    console.log("✅ Email sent via Nodemailer (SMTP)");
    return true;
  } catch (error) {
    console.error("❌ Nodemailer error:", error.message);
    throw error;
  }
}

/**
 * Main email sending function using Gmail SMTP
 * @param {Object} options - Email options
 * @returns {Promise<boolean>} - Success status
 */
async function sendEmail(options) {
  const { to, subject } = options;
  
  // Validate required fields
  if (!to || !subject) {
    throw new Error("Email 'to' and 'subject' are required");
  }

  if (!process.env.GMAIL_APP_PASSWORD) {
    console.error("❌ GMAIL_APP_PASSWORD not configured!");
    throw new Error("Email provider not configured");
  }

  console.log(`📧 Sending email to: ${to}`);
  
  try {
    await sendWithNodemailer(options);
    return true;
  } catch (error) {
    console.error("❌ Email failed:", error.message);
    throw error;
  }
}

/**
 * Send certificate email with PDF attachment
 * @param {string} name - Recipient name
 * @param {string} email - Recipient email
 * @param {Buffer} pdfBuffer - PDF certificate buffer
 * @returns {Promise<boolean>} - Success status
 */
async function sendCertificateEmail(name, email, pdfBuffer) {
  const options = {
    to: email,
    subject: "Your Certificate of Participation 🎓",
    text: `Hello ${name},\n\nThank you for taking part in Quizopolis! 🎉\nPlease find attached your certificate of participation.\n\nWarm regards,\nIIE Debate & Quiz Club`,
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
      filename: "certificate.pdf",
      content: pdfBuffer,
      contentType: 'application/pdf'
    }],
  };

  return await sendEmail(options);
}

module.exports = {
  sendEmail,
  sendCertificateEmail,
};
