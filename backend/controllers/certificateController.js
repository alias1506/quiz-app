const nodemailer = require("nodemailer");
const puppeteer = require("puppeteer");

const sendCertificate = async (req, res) => {
  try {
    const { name, email, score, total, date, quizName } = req.body;

    const frontendBaseURL = process.env.FRONTEND_URL || "http://localhost:5173";

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

    // ✅ Generate cropped certificate (no white space)
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const element = await page.$(".certificate");
    const certificateImage = await element.screenshot({ type: "png" });
    await browser.close();

    // ✅ Send email with new message
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
      text: `Hello ${name},\n\nThank you for taking part in our online quiz! 🎉\nPlease find attached your certificate of participation.\n\nWarm regards,\nIIE Debate & Quiz Club`,
      attachments: [{ filename: "certificate.png", content: certificateImage }],
    });

    res.json({ message: "Certificate sent successfully" });
  } catch (err) {
    console.error("❌ Error sending certificate:", err);
    res.status(500).json({ message: "Error sending certificate" });
  }
};

module.exports = { sendCertificate };
