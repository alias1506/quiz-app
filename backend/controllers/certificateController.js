// const nodemailer = require("nodemailer");
// const puppeteer = require("puppeteer");

// const sendCertificate = async (req, res) => {
//   try {
//     const { name, email, score, total, date, quizName } = req.body;

//     const frontendBaseURL = process.env.FRONTEND_URL || "http://localhost:5173";

//     const html = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="UTF-8" />
//       <title>Certificate</title>
//       <script src="https://cdn.tailwindcss.com"></script>
//       <style>
//         body { margin: 0; padding: 0; }
//         .certificate {
//           width: 1000px;
//           height: 700px;
//         }
//       </style>
//     </head>
//     <body class="flex items-center justify-center bg-gray-50">
//       <div class="certificate bg-white border-8 border-yellow-600 rounded-2xl shadow-2xl flex flex-col items-center justify-start p-10 font-serif mx-auto">

//         <!-- Top Logos -->
//         <div class="w-full flex justify-between items-center px-16">
//           <img src="${frontendBaseURL}/club-logo.jpg" class="h-28 object-contain" />
//           <img src="${frontendBaseURL}/college-logo.png" class="h-28 object-contain" />
//         </div>

//         <!-- Title -->
//         <div class="mt-6 text-center">
//           <h1 class="text-5xl font-bold text-yellow-700 uppercase">Certificate of Achievement</h1>
//           <p class="text-lg text-gray-600 italic">Voices and Minds United</p>
//         </div>

//         <!-- Main Content -->
//         <div class="text-center px-12 mt-6">
//           <p class="text-2xl mb-4">This is proudly presented to</p>
//           <h2 class="text-4xl font-bold text-gray-900 underline decoration-yellow-500 decoration-4 mb-6">
//             ${name}
//           </h2>
//           <p class="text-xl text-gray-700 mb-4">For outstanding performance in the <b>Debate & Quiz Club</b></p>
//           <p class="text-xl text-gray-700 mb-6">Score: <b>${score}</b> out of <b>${total}</b></p>
//         </div>

//         <!-- Footer -->
//         <div class="flex justify-center w-full px-16 mt-12">
//           <div class="text-center">
//             <p class="text-lg font-semibold">Date</p>
//             <p class="text-gray-700">${date}</p>
//           </div>
//         </div>
//       </div>
//     </body>
//     </html>
//     `;

//     // ✅ Generate cropped certificate (no white space)
//     const browser = await puppeteer.launch({
//       // headless: "new",
//       // args: ["--no-sandbox", "--disable-setuid-sandbox"],

//     });
//     const page = await browser.newPage();
//     await page.setContent(html, { waitUntil: "networkidle0" });

//     const element = await page.$(".certificate");
//     const certificateImage = await element.screenshot({ type: "png" });
//     await browser.close();

//     // ✅ Send email with new message
//     let transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: "iiedebateandquizclub@gmail.com",
//         pass: process.env.GMAIL_APP_PASSWORD,
//       },
//     });

//     await transporter.sendMail({
//       from: "IIE Debate & Quiz Club <iiedebateandquizclub@gmail.com>",
//       to: email,
//       subject: "Your Certificate of Participation 🎓",
//       text: `Hello ${name},\n\nThank you for taking part in our online quiz! 🎉\nPlease find attached your certificate of participation.\n\nWarm regards,\nIIE Debate & Quiz Club`,
//       attachments: [{ filename: "certificate.png", content: certificateImage }],
//     });

//     res.json({ message: "Certificate sent successfully" });
//   } catch (err) {
//     console.error("❌ Error sending certificate:", err);
//     res.status(500).json({ message: "Error sending certificate" });
//   }
// };

// module.exports = { sendCertificate };

// 2nd

// const nodemailer = require("nodemailer");
// const puppeteer = require("puppeteer");
// const fs = require("fs");
// let clubLogoBase64, collegeLogoBase64;

// try {
//   clubLogoBase64 = fs.readFileSync("./public/club-logo.jpg").toString("base64");
//   collegeLogoBase64 = fs
//     .readFileSync("./public/college-logo.png")
//     .toString("base64");
// } catch (e) {
//   console.warn("Logo files not found; external URLs will be used.");
// }

// const sendCertificate = async (req, res) => {
//   try {
//     const { name, email, score, total, date } = req.body;
//     const frontendBaseURL = process.env.FRONTEND_URL || "http://localhost:5173";

//     const imgClub = clubLogoBase64
//       ? `data:image/jpeg;base64,${clubLogoBase64}`
//       : `${frontendBaseURL}/club-logo.jpg`;
//     const imgCollege = collegeLogoBase64
//       ? `data:image/png;base64,${collegeLogoBase64}`
//       : `${frontendBaseURL}/college-logo.png`;

//     const html = `
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <meta charset="UTF-8" />
//           <title>Certificate</title>
//           <script src="https://cdn.tailwindcss.com"></script>
//           <style>
//             body { margin: 0; padding: 0; }
//             .certificate {
//               width: 1000px;
//               height: 700px;
//             }
//           </style>
//         </head>
//         <body class="flex items-center justify-center bg-gray-50">
//           <div class="certificate bg-white border-8 border-yellow-600 rounded-2xl shadow-2xl flex flex-col items-center justify-start p-10 font-serif mx-auto">

//             <!-- Top Logos -->
//             <div class="w-full flex justify-between items-center px-16">
//               <img src="${frontendBaseURL}/club-logo.jpg" class="h-28 object-contain" />
//               <img src="${frontendBaseURL}/college-logo.png" class="h-28 object-contain" />
//             </div>

//             <!-- Title -->
//             <div class="mt-6 text-center">
//               <h1 class="text-5xl font-bold text-yellow-700 uppercase">Certificate of Achievement</h1>
//               <p class="text-lg text-gray-600 italic">Voices and Minds United</p>
//             </div>

//             <!-- Main Content -->
//             <div class="text-center px-12 mt-6">
//               <p class="text-2xl mb-4">This is proudly presented to</p>
//               <h2 class="text-4xl font-bold text-gray-900 underline decoration-yellow-500 decoration-4 mb-6">
//                 ${name}
//               </h2>
//               <p class="text-xl text-gray-700 mb-4">For outstanding performance in the <b>Debate & Quiz Club</b></p>
//               <p class="text-xl text-gray-700 mb-6">Score: <b>${score}</b> out of <b>${total}</b></p>
//             </div>

//             <!-- Footer -->
//             <div class="flex justify-center w-full px-16 mt-12">
//               <div class="text-center">
//                 <p class="text-lg font-semibold">Date</p>
//                 <p class="text-gray-700">${date}</p>
//               </div>
//             </div>
//           </div>
//         </body>
//         </html>
//         `;

//     const browser = await puppeteer.launch({
//       headless: true,
//       args: [
//         "--no-sandbox",
//         "--disable-setuid-sandbox",
//         "--disable-dev-shm-usage",
//         "--disable-gpu",
//         "--no-zygote",
//         "--single-process",
//       ],
//       executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
//     });

//     const page = await browser.newPage();
//     page.setDefaultNavigationTimeout(30000);
//     page.setDefaultTimeout(30000);

//     page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
//     page.on("pageerror", (err) => console.error("PAGE ERROR:", err));
//     page.on("requestfailed", (req) =>
//       console.error("REQ FAILED:", req.url(), req.failure()?.errorText)
//     );

//     await page.setContent(html, {
//       waitUntil: ["load", "domcontentloaded", "networkidle2"],
//     });

//     // Ensure logos loaded if using URLs
//     const cert = await page.$(".certificate");
//     if (!cert) throw new Error("Certificate container not found");
//     const certificateImage = await cert.screenshot({ type: "png" });

//     await browser.close();

//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: "iiedebateandquizclub@gmail.com",
//         pass: process.env.GMAIL_APP_PASSWORD,
//       },
//     });

//     await transporter.verify();

//     await transporter.sendMail({
//       from: "IIE Debate & Quiz Club <iiedebateandquizclub@gmail.com>",
//       to: email,
//       subject: "Your Certificate of Participation 🎓",
//       text: `Hello ${name},\n\nThank you for taking part in our online quiz! 🎉\nPlease find attached your certificate of participation.\n\nWarm regards,\nIIE Debate & Quiz Club`,
//       attachments: [{ filename: "certificate.png", content: certificateImage }],
//     });

//     res.json({ message: "Certificate sent successfully" });
//   } catch (err) {
//     console.error("❌ Error sending certificate:", err?.stack || err);
//     res
//       .status(500)
//       .json({ message: "Error sending certificate", error: err?.message });
//   }
// };

// module.exports = { sendCertificate };

// server/certificate.js (or your controller file)
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const puppeteer = require("puppeteer");

// Preload logos as base64 to avoid any network dependency
let clubLogoBase64 = null;
let collegeLogoBase64 = null;
try {
  const clubPath = path.resolve(__dirname, "./public/club-logo.jpg");
  const collegePath = path.resolve(__dirname, "./public/college-logo.png");
  clubLogoBase64 = fs.readFileSync(clubPath).toString("base64");
  collegeLogoBase64 = fs.readFileSync(collegePath).toString("base64");
  console.log("Logos loaded for certificate rendering.");
} catch (e) {
  console.warn(
    "Logo files not found. Place club-logo.jpg and college-logo.png in ./public",
    e?.message || e
  );
}

function buildHtml({ name, score, total, date }) {
  const imgClub = clubLogoBase64
    ? `data:image/jpeg;base64,${clubLogoBase64}`
    : "";
  const imgCollege = collegeLogoBase64
    ? `data:image/png;base64,${collegeLogoBase64}`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Certificate</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  :root {
    --bg: #f9fafb;
    --paper: #ffffff;
    --border: #ca8a04; /* yellow-600 */
    --title: #a16207; /* amber-700 */
    --text: #111827;  /* gray-900 */
    --muted: #374151; /* gray-700 */
    --muted2:#4b5563; /* gray-600 */
    --shadow: rgba(0,0,0,0.25);
    --accent: #eab308; /* amber-500 */
  }
  html, body { margin:0; padding:0; background:var(--bg); }
  body { font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif; }
  .certificate {
    width: 1000px;
    height: 700px;
    background: var(--paper);
    border: 8px solid var(--border);
    border-radius: 16px;
    box-shadow: 0 25px 50px var(--shadow);
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px;
    box-sizing: border-box;
  }
  .row {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 64px;
    box-sizing: border-box;
  }
  .logo {
    height: 112px;
    width: auto;
    object-fit: contain;
    display: block;
  }
  .title {
    margin-top: 24px;
    text-align: center;
  }
  .title h1 {
    font-size: 48px;
    line-height: 1.1;
    font-weight: 800;
    color: var(--title);
    text-transform: uppercase;
    margin: 0;
  }
  .subtitle {
    color: var(--muted2);
    font-style: italic;
    margin-top: 6px;
    font-size: 18px;
  }
  .content {
    text-align: center;
    padding: 0 48px;
    margin-top: 24px;
  }
  .label {
    font-size: 20px;
    margin-bottom: 12px;
    color: var(--text);
  }
  .name {
    font-size: 36px;
    font-weight: 800;
    color: var(--text);
    text-decoration: underline;
    text-decoration-color: var(--accent);
    text-decoration-thickness: 4px;
    margin: 12px 0 20px 0;
  }
  .muted {
    color: var(--muted);
    font-size: 18px;
    margin: 6px 0;
  }
  .footer {
    margin-top: auto;
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 0 64px;
    box-sizing: border-box;
  }
  .footer .block {
    text-align: center;
  }
  .footer .label {
    font-weight: 600;
  }
</style>
</head>
<body>
  <div class="certificate">
    <div class="row">
      ${imgClub ? `<img src="${imgClub}" class="logo" alt="Club Logo" />` : `<div></div>`}
      ${imgCollege ? `<img src="${imgCollege}" class="logo" alt="College Logo" />` : `<div></div>`}
    </div>

    <div class="title">
      <h1>Certificate of Achievement</h1>
      <p class="subtitle">Voices and Minds United</p>
    </div>

    <div class="content">
      <p class="label">This is proudly presented to</p>
      <div class="name">${escapeHtml(name)}</div>
      <p class="muted">For outstanding performance in the <b>Debate & Quiz Club</b></p>
      <p class="muted">Score: <b>${escapeHtml(score)}</b> out of <b>${escapeHtml(total)}</b></p>
    </div>

    <div class="footer">
      <div class="block">
        <p class="label">Date</p>
        <p class="muted">${escapeHtml(date)}</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(v) {
  if (v === null || v === undefined) return "";
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function renderCertificatePng(html) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-zygote",
      "--single-process"
    ]
    // executablePath: omit for puppeteer (bundled Chromium). If you use puppeteer-core, set executablePath.
  });

  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(30000);
    page.setDefaultTimeout(30000);

    // Diagnostics
    page.on("console", msg => console.log("PAGE LOG:", msg.text()));
    page.on("pageerror", err => console.error("PAGE ERROR:", err));
    page.on("requestfailed", req =>
      console.error("REQ FAILED:", req.url(), req.failure()?.errorText)
    );
    page.on("framenavigated", f => console.log("FRAME NAV:", f.url()));

    // Static content; no external requests. Use domcontentloaded only.
    await page.setContent(html, { waitUntil: ["domcontentloaded"] });
    const cert = await page.$(".certificate");
    if (!cert) throw new Error("Certificate container not found");

    // Make sure element is fully laid out
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));

    const pngBuffer = await cert.screenshot({ type: "png" });
    return pngBuffer;
  } finally {
    await browser.close();
  }
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "iiedebateandquizclub@gmail.com",
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

async function sendCertificate(req, res) {
  try {
    const { name, email, score, total, date } = req.body || {};
    if (!name || !email || score === undefined || total === undefined || !date) {
      return res.status(400).json({ message: "Missing required fields: name, email, score, total, date" });
    }

    // Verify SMTP first to fail fast if creds are wrong
    await transporter.verify();

    const html = buildHtml({ name, score, total, date });
    const png = await renderCertificatePng(html);

    await transporter.sendMail({
      from: 'IIE Debate & Quiz Club <iiedebateandquizclub@gmail.com>',
      to: email,
      subject: "Your Certificate of Participation 🎓",
      text: `Hello ${name},

Thank you for taking part in our online quiz! 🎉
Please find attached your certificate of participation.

Warm regards,
IIE Debate & Quiz Club`,
      attachments: [
        { filename: "certificate.png", content: png, contentType: "image/png" }
      ]
    });

    res.json({ message: "Certificate sent successfully" });
  } catch (err) {
    console.error("❌ Error sending certificate:", err?.stack || err);
    res.status(500).json({ message: "Error sending certificate", error: err?.message || "Unknown error" });
  }
}

module.exports = { sendCertificate };
