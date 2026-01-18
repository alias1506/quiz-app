const { sendCertificateEmail } = require("../services/emailService");
const { createCanvas, loadImage } = require('canvas');
const path = require('path');
const fs = require('fs');

const sendCertificate = async (req, res) => {
  try {
    const { name, email, quizName, date } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ 
        message: "Missing required fields: name or email" 
      });
    }

    // Check if admin - skip email for admin
    const isAdmin = name?.toLowerCase() === 'admin' && email?.toLowerCase() === 'admin@gmail.com';

    console.log("📋 Generating certificate by overlaying name on template image...");

    // Load certificate template image
    const templatePath = path.join(__dirname, '../certificate_template/certificate.png');
    
    if (!fs.existsSync(templatePath)) {
      throw new Error('Certificate template image not found at: ' + templatePath);
    }

    // Load the image and create canvas
    const image = await loadImage(templatePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    // Draw the certificate template
    ctx.drawImage(image, 0, 0);

    // Add participant name with cursive font (75px italic serif for elegant cursive look)
    ctx.font = 'italic 75px serif';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // For 16:9 certificate - horizontally and vertically centered in name area
    const centerX = canvas.width / 2;   // Horizontal center
    const centerY = canvas.height * 0.49; // Vertical center of name area (49% from top)
    
    console.log(`🎨 Drawing "${name}" at (${centerX}, ${centerY}) with cursive font`);
    ctx.fillText(name, centerX, centerY);

    // Convert canvas to buffer
    const pdfBuffer = canvas.toBuffer('image/png');
    
    console.log(`✅ Certificate generated! Size: ${pdfBuffer.length} bytes (${(pdfBuffer.length / 1024).toFixed(2)} KB)`);

    // Send email only if not admin
    let emailSent = false;
    if (!isAdmin) {
      try {
        await sendCertificateEmail(name, email, pdfBuffer, quizName, 'image/png', 'certificate.png');
        emailSent = true;
      } catch (emailError) {
        console.error("⚠️ Email failed (non-critical):", emailError.message);
      }
    } else {
      console.log("ℹ️ Skipping email for admin user");
    }

    res.json({
      message: emailSent
        ? "Certificate generated and sent to email"
        : "Certificate generated successfully",
      emailSent
    });
  } catch (err) {
    console.error("❌ Error generating certificate:", err);
    res.status(500).json({ message: "Error generating certificate", error: err.message });
  }
};

module.exports = { sendCertificate };
