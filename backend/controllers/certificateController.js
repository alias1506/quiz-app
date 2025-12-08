const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const axios = require("axios");
const User = require("../models/authModel");

const sendCertificate = async (req, res) => {
  try {
    const { name, email, score, total, date, quizName } = req.body;

    const frontendBaseURL = process.env.FRONTEND_URL || "http://localhost:5173";

    // Save quiz completion as new entry
    const normalizedEmail = email.toLowerCase().trim();
    
    // Calculate total attempts for this email
    const totalAttempts = await User.countDocuments({
      email: { $regex: `^${normalizedEmail}$`, $options: "i" },
    });
    const attemptNumber = totalAttempts + 1;
    
    const newEntry = new User({
      name: name,
      email: normalizedEmail,
      score: score,
      total: total,
      quizName: quizName || "Quiz",
      attemptNumber: attemptNumber,
      joinedOn: new Date(date || Date.now()),
    });
    await newEntry.save();

    // Emit event to admin panel
    const adminSocket = req.app.get('adminSocket');
    if (adminSocket && adminSocket.connected) {
      adminSocket.emit('user:created', { users: [newEntry] });
    }

    // Keep your HTML (not rendered by PDFKit, but preserved as requested)
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>Certificate</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        body { margin: 0; padding: 0; }
        .certificate {
          width: 1000px;
          height: 700px;
        }
      </style>
    </head>
    <body class="flex items-center justify-center bg-gray-50">
      <div class="certificate bg-white border-8 border-yellow-600 rounded-2xl shadow-2xl flex flex-col items-center justify-start p-10 font-serif mx-auto">

        <!-- Top Logos -->
        <div class="w-full flex justify-between items-center px-16">
          <img src="${frontendBaseURL}/club-logo.jpg" class="h-28 object-contain" />
          <img src="${frontendBaseURL}/college-logo.png" class="h-28 object-contain" />
        </div>

        <!-- Title -->
        <div class="mt-6 text-center">
          <h1 class="text-5xl font-bold text-yellow-700 uppercase">Certificate of Achievement</h1>
          <p class="text-lg text-gray-600 italic">Voices and Minds United</p>
        </div>

        <!-- Main Content -->
        <div class="text-center px-12 mt-6">
          <p class="text-2xl mb-4">This is proudly presented to</p>
          <h2 class="text-4xl font-bold text-gray-900 underline decoration-yellow-500 decoration-4 mb-6">
            ${name}
          </h2>
          <p class="text-xl text-gray-700 mb-4">For outstanding performance in the <b>Debate & Quiz Club</b></p>
          <p class="text-xl text-gray-700 mb-6">Score: <b>${score}</b> out of <b>${total}</b></p>
        </div>

        <!-- Footer -->
        <div class="flex justify-center w-full px-16 mt-12">
          <div class="text-center">
            <p class="text-lg font-semibold">Date</p>
            <p class="text-gray-700">${date}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;

    // Build a PDF that visually matches the Tailwind layout using PDFKit
    const width = 1000;
    const height = 700;

    const doc = new PDFDocument({
      size: [width, height],
      margins: { top: 0, left: 0, right: 0, bottom: 0 },
    });

    const chunks = [];
    doc.on("data", (d) => chunks.push(d));
    const pdfDone = new Promise((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });

    // Background
    doc.rect(0, 0, width, height).fill("#f9fafb");

    const cardX = 0;
    const cardY = 0;
    const cardW = width;
    const cardH = height;
    const radius = 24;

    doc.save();
    doc.lineWidth(16);
    doc.strokeColor("#ca8a04");
    roundedRect(doc, cardX + 16, cardY + 16, cardW - 32, cardH - 32, radius);
    doc.stroke();

    doc.fillColor("#ffffff");
    roundedRect(doc, cardX + 24, cardY + 24, cardW - 48, cardH - 48, radius);
    doc.fill();
    doc.restore();

    const pad = 40;
    const innerX = cardX + 24 + pad;
    const innerY = cardY + 24 + pad;
    const innerW = cardW - 48 - pad * 2;

    const logosPadX = 64;
    const logosY = innerY;
    const logosH = 112;
    const logosBoxW = innerW - logosPadX * 2;

    const clubLogoUrl = `${frontendBaseURL}/club-logo.jpg`;
    const collegeLogoUrl = `${frontendBaseURL}/college-logo.png`;

    let clubLogoBuf = null;
    let collegeLogoBuf = null;
    try {
      const [clubRes, collegeRes] = await Promise.all([
        axios.get(clubLogoUrl, { responseType: "arraybuffer" }),
        axios.get(collegeLogoUrl, { responseType: "arraybuffer" }),
      ]);
      clubLogoBuf = Buffer.from(clubRes.data);
      collegeLogoBuf = Buffer.from(collegeRes.data);
    } catch (e) {
      clubLogoBuf = null;
      collegeLogoBuf = null;
    }

    const leftLogoW = 200;
    const rightLogoW = 200;
    const leftLogoX = innerX + logosPadX;
    const rightLogoX = innerX + logosPadX + logosBoxW - rightLogoW;
    
    if (clubLogoBuf) {
      doc.image(clubLogoBuf, leftLogoX, logosY, {
        fit: [leftLogoW, logosH],
        align: "left",
        valign: "center",
      });
    }
    if (collegeLogoBuf) {
      doc.image(collegeLogoBuf, rightLogoX, logosY, {
        fit: [rightLogoW, logosH],
        align: "right",
        valign: "center",
      });
    }

    let cursorY = logosY + logosH + 24;

    doc.fillColor("#a16207");
    doc.fontSize(48);
    doc.font("Times-Bold");
    centerText(doc, "Certificate of Achievement", innerX, cursorY, innerW);
    cursorY += 48 + 8;

    doc.fillColor("#4b5563");
    doc.fontSize(18);
    doc.font("Times-Italic");
    centerText(doc, "Voices and Minds United", innerX, cursorY, innerW);
    cursorY += 18 + 24;

    doc.fillColor("#111827");
    doc.font("Times-Roman");
    doc.fontSize(22);
    centerText(doc, "This is proudly presented to", innerX, cursorY, innerW);
    cursorY += 22 + 16;

    doc.font("Times-Bold");
    doc.fontSize(36);
    const nameText = name || "";
    const nameWidth = doc.widthOfString(nameText);
    const nameX = innerX + (innerW - nameWidth) / 2;
    doc.fillColor("#111827");
    doc.text(nameText, nameX, cursorY, { lineBreak: false });
    
    const underlineY = cursorY + doc.currentLineHeight() + 4;
    doc.save();
    doc.lineWidth(4);
    doc.strokeColor("#eab308");
    doc.moveTo(nameX, underlineY).lineTo(nameX + nameWidth, underlineY).stroke();
    doc.restore();
    cursorY += doc.currentLineHeight() + 24;

    doc.font("Times-Roman");
    doc.fontSize(20);
    doc.fillColor("#374151");
    centerText(doc, "For outstanding performance in the Debate & Quiz Club", innerX, cursorY, innerW);
    cursorY += 20 + 12;

    centerText(doc, `Score: ${score} out of ${total}`, innerX, cursorY, innerW);
    cursorY += 20 + 48;

    cursorY += 48;
    doc.font("Times-Bold").fontSize(18).fillColor("#111827");
    centerText(doc, "Date", innerX, cursorY, innerW);
    cursorY += 18 + 6;
    doc.font("Times-Roman").fontSize(16).fillColor("#374151");
    centerText(doc, date || "", innerX, cursorY, innerW);

    doc.end();
    const pdfBuffer = await pdfDone;

    // Verify Gmail credentials are available
    if (!process.env.GMAIL_APP_PASSWORD) {
      throw new Error("GMAIL_APP_PASSWORD is not configured in environment variables");
    }

    // Send email with PDF attachment
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "iiedebateandquizclub@gmail.com",
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: "IIE Debate & Quiz Club <iiedebateandquizclub@gmail.com>",
      to: email,
      subject: "Your Certificate of Participation 🎓",
      text: `Hello ${name},\n\nThank you for taking part in Quizopolis! 🎉\nPlease find attached your certificate of participation.\n\nWarm regards,\nIIE Debate & Quiz Club`,
      attachments: [{ filename: "certificate.pdf", content: pdfBuffer }],
    });

    res.json({ message: "Certificate sent successfully" });
  } catch (err) {
    console.error("❌ Error sending certificate:", err);
    res.status(500).json({ message: "Error sending certificate" });
  }
};

// Helper functions
function roundedRect(doc, x, y, w, h, r) {
  doc.moveTo(x + r, y);
  doc.lineTo(x + w - r, y);
  doc.quadraticCurveTo(x + w, y, x + w, y + r);
  doc.lineTo(x + w, y + h - r);
  doc.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  doc.lineTo(x + r, y + h);
  doc.quadraticCurveTo(x, y + h, x, y + h - r);
  doc.lineTo(x, y + r);
  doc.quadraticCurveTo(x, y, x + r, y);
}

function centerText(doc, text, x, y, width) {
  doc.text(text, x, y, { width, align: "center" });
}

module.exports = { sendCertificate };
