const SibApiV3Sdk = require('sib-api-v3-sdk');

/**
 * Send certificate email with PDF attachment using Brevo API
 * @param {string} name - Recipient name
 * @param {string} email - Recipient email
 * @param {Buffer} pdfBuffer - PDF certificate buffer
 * @param {string} quizName - The name of the quiz
 * @returns {Promise<boolean>} - Success status
 */
async function sendCertificateEmail(name, email, pdfBuffer, quizName) {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("Brevo API key not configured. Set BREVO_API_KEY in environment variables.");
  }

  try {
    console.log(`📧 Sending certificate for ${quizName} to: ${email}`);
    console.log(`📎 Attaching PDF: ${pdfBuffer.length} bytes`);
    
    const base64Content = pdfBuffer.toString('base64');
    console.log(`📎 Base64 length: ${base64Content.length} characters`);

    // Configure API client
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    // Initialize API instance
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    // Prepare email
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.sender = {
      name: "IIE Tech Club",
      email: process.env.SMTP_USER || "iietechclub.mail@gmail.com"
    };

    sendSmtpEmail.to = [{ email: email, name: name }];
    sendSmtpEmail.subject = `Your Certificate for ${quizName || 'the Event'} 🎓`;
    sendSmtpEmail.subject = `Your Certificate for ${quizName || 'the Event'} 🎓`;

    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3b82f6; margin: 0;">IIE Tech Club</h1>
          <p style="color: #6b7280; margin: 5px 0;">Voices and Minds United</p>
        </div>
        
        <h2 style="color: #1f2937; margin-top: 0;">Hello ${name},</h2>
        
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">
          Thank you for taking part in <strong style="color: #3b82f6;">${quizName || 'the event'}</strong>! 🎉
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
            <strong style="color: #1f2937;">IIE Tech Club</strong>
          </p>
          <p style="font-size: 12px; color: #9ca3af; margin-top: 15px;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      </div>
    `;

    // Create SendSmtpEmailAttachment object properly
    const attachment = new SibApiV3Sdk.SendSmtpEmailAttachment();
    attachment.content = base64Content;
    attachment.name = 'certificate.pdf';

    sendSmtpEmail.attachment = [attachment];

    console.log("📤 Sending email via Brevo SDK...");
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log(`✅ Certificate email sent successfully to: ${email}`);
    console.log(`📬 Message ID: ${result.messageId}`);

    return true;
  } catch (error) {
    console.error("❌ Email delivery failed:", error.message);
    if (error.response) {
      console.error("📋 Brevo API error response:");
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}


/**
 * Send generic email using Brevo API
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

  if (!process.env.BREVO_API_KEY) {
    throw new Error("Brevo API key not configured");
  }

  try {
    console.log(`📧 Sending email to: ${to}`);

    // Configure API client
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.sender = {
      name: "IIE Tech Club",
      email: process.env.SMTP_USER || "iietechclub.mail@gmail.com"
    };

    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html || text;

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log("✅ Email sent successfully via Brevo");
    console.log("📬 Message ID:", result.messageId);

    return true;
  } catch (error) {
    console.error("❌ Email delivery failed:", error.message);
    if (error.response) {
      console.error("📋 Brevo API error:", error.response.body);
    }
    throw error;
  }
}

module.exports = {
  sendEmail,
  sendCertificateEmail,
};
