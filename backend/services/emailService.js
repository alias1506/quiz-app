const SibApiV3Sdk = require('sib-api-v3-sdk');

/**
 * Send certificate email with attachment using Brevo API
 */
async function sendCertificateEmail(name, email, fileBuffer, quizName, contentType = 'application/pdf', filename = 'certificate.pdf') {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("Brevo API key not configured");
  }

  try {
    console.log(`📧 Sending certificate for ${quizName} to: ${email}`);

    // Convert file buffer to base64
    const base64File = fileBuffer.toString('base64');

    // Configure Brevo API client
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    
    // Prepare email using SendSmtpEmail
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    
    sendSmtpEmail.sender = {
      name: "IIE Tech Club",
      email: process.env.SMTP_USER || "iietechclub.mail@gmail.com"
    };
    
    sendSmtpEmail.to = [{ email, name }];
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
    
    // Attach file - use SendSmtpEmailAttachment for proper type
    const attachment = new SibApiV3Sdk.SendSmtpEmailAttachment();
    attachment.content = base64File;
    attachment.name = filename;
    
    sendSmtpEmail.attachment = [attachment];

    console.log("📤 Sending via Brevo API...");
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log(`✅ Email sent! Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error("❌ Email failed:", error.message);
    if (error.response && error.response.body) {
      console.error("Brevo error:", error.response.body);
    }
    throw error;
  }
}

module.exports = { sendCertificateEmail };
