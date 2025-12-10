# 🎯 Quiz Application

A full-stack quiz application with real-time scoring, certificate generation, email delivery, and comprehensive security features.

## ✨ Features

### Core Features
- **Multiple Choice Quizzes** - Dynamic question sets with randomized order
- **Randomized Options** - Question options shuffle on every attempt
- **Real-Time Scoring** - Instant feedback and results
- **PDF Certificates** - Auto-generated and emailed via Brevo
- **Daily Attempt Limits** - 3 attempts per user per day
- **Email Notifications** - Certificate delivery with Brevo API
- **Responsive Design** - Works on all devices

### Security Features
- **DevTools Prevention** - Blocks F12, Ctrl+Shift+I, right-click
- **Tab Switching Detection** - Monitors focus during quiz
- **Anti-Cheating** - Redirects to 404 page on violations
- **Results Page Protection** - Allows tab switching after quiz completion

### Advanced Features
- **Admin Detection** - Automatic detection of admin users
- **Unlimited Admin Access** - No attempt limits for admin
- **Email Tracking** - Daily counter with auto-reset
- **Scientific Notation** - Auto-format powers (x²) and formulas (H₂O)

---

## 🏗️ Tech Stack

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **SweetAlert2** for notifications
- **Lucide React** icons
- **Tailwind CSS** for styling

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **Brevo API** for email delivery
- **PDFKit** for certificate generation
- **Session Management** with cookies

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (free tier)
- Brevo account (free tier - 300 emails/day)

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd quiz-app
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Configure Environment Variables

Create `backend/.env`:

```env
# Brevo Email API
BREVO_API_KEY=your_brevo_api_key_here
SMTP_USER=your_email@example.com

# MongoDB Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Server Configuration
PORT=5000
NODE_ENV=development
```

**Get your Brevo API key:**
1. Sign up at https://www.brevo.com (free tier: 300 emails/day)
2. Go to Settings → SMTP & API
3. Create new API key
4. Copy the key

**Get MongoDB URI:**
1. Create cluster at https://cloud.mongodb.com (free tier: 512MB)
2. Click "Connect" → "Connect your application"
3. Copy connection string
4. Replace `<password>` with your database password

### 4. Run Development Server

```bash
# From project root
npm run dev
```

This starts:
- **Backend:** `http://localhost:5000`
- **Frontend:** `http://localhost:5173`

---

## 📋 Environment Variables Reference

### Backend (.env)

| Variable | Example | Description |
|----------|---------|-------------|
| `BREVO_API_KEY` | `xkeysib-abc123...` | Brevo API key for email delivery |
| `SMTP_USER` | `quiz@example.com` | Sender email address (verified in Brevo) |
| `MONGO_URI` | `mongodb+srv://...` | MongoDB connection string |
| `FRONTEND_URL` | `http://localhost:5173` | Frontend URL (for CORS) |
| `PORT` | `5000` | Backend server port |
| `NODE_ENV` | `development` or `production` | Environment mode |

---

## 🌐 Deployment (Render)

### Automatic Deployment

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Deploy to Render"
   git push origin main
   ```

2. **Create Web Service on Render:**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name:** quiz-app
     - **Build Command:** `npm run render-build`
     - **Start Command:** `npm start`
     - **Environment:** Node

3. **Add Environment Variables:**
   Copy all variables from local `.env` but update:
   - `FRONTEND_URL`: Your Render frontend URL (e.g., `https://quiz-app.onrender.com`)
   - `NODE_ENV`: `production`

4. **Deploy** - Render auto-deploys on every push to main branch!

---

## 🧪 Testing

### Test Email Delivery

1. Complete a quiz locally at `http://localhost:5173`
2. Check email inbox (and spam folder)
3. Verify certificate PDF is attached
4. Check backend console for email counter (e.g., "1/300")

### Test Security Features

- **DevTools:** Try opening F12 → Should redirect to 404
- **Tab Switching:** Switch tabs during quiz → Should redirect to 404
- **Results Page:** Tab switching allowed after completion ✅
- **Right Click:** Disabled during quiz

### Test Admin Features

Create a user with:
- **Email:** `admin@gmail.com`
- **Name:** `admin`

Admin user gets:
- ✅ Unlimited quiz attempts
- ✅ No daily limits
- ✅ No email notifications

---

## 📁 Project Structure

```
quiz-app/
├── backend/
│   ├── controllers/
│   │   ├── certificateController.js   # PDF generation & email
│   │   └── quizController.js          # Quiz logic
│   ├── models/
│   │   ├── authModel.js               # User schema
│   │   └── quizSetModel.js            # Set & question schema
│   ├── routes/
│   │   ├── authRoute.js               # Auth endpoints
│   │   └── quizRoute.js               # Quiz endpoints
│   ├── services/
│   │   └── emailService.js            # Brevo email service
│   ├── server.js                      # Express server
│   ├── .env                           # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/                # Reusable components
│   │   ├── contexts/
│   │   │   └── SecurityContext.jsx    # Security features
│   │   ├── pages/
│   │   │   ├── Starting.jsx           # Sign in page
│   │   │   ├── Dashboard.jsx          # Quiz interface
│   │   │   ├── ThankYou.jsx           # Results page
│   │   │   └── NotFound.jsx           # 404 page
│   │   ├── App.jsx                    # Main app component
│   │   └── main.jsx                   # Entry point
│   ├── public/                        # Static assets
│   ├── package.json
│   └── vite.config.js
├── package.json                       # Root package (monorepo)
└── README.md
```

---

## 🔒 Security Features

### 1. DevTools Prevention
- Blocks F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
- Detects already-open DevTools on page load
- Right-click disabled during quiz
- Redirects to 404 page on violation

### 2. Tab Switching Detection
- Active only during quiz (Dashboard page)
- Monitors `visibilitychange` and `blur` events
- Disabled on results page (ThankYou)
- Redirects to 404 page on violation

### 3. Daily Attempt Limits
- 3 attempts per user per day
- Resets at midnight UTC
- Enforced at backend level
- Admin users bypass limit

### 4. Admin Detection
- Automatic: `admin@gmail.com` or name `admin`
- Unlimited attempts
- No email notifications
- Special badge in UI

---

## 📊 Email Service Details

### Brevo Integration

**Features:**
- ✅ 300 emails/day (free tier)
- ✅ Daily counter with auto-reset
- ✅ PDF attachments supported
- ✅ Professional email templates

**Email Counter:**
```
Server console output:
✅ Email sent successfully! (Today: 1/300)
```

Counter resets daily at:
- **Development:** Midnight UTC
- **Production:** Midnight UTC

**Testing Mode:**
When in development, emails redirect to `SMTP_USER` if recipient is not verified in Brevo.

---

## 🆘 Troubleshooting

### Emails Not Sending

**Check:**
- ✅ `BREVO_API_KEY` is set correctly in `.env`
- ✅ `SMTP_USER` email is verified in Brevo
- ✅ Brevo account is active
- ✅ Check backend console for errors
- ✅ Check "Email sent successfully" message

**Test API key:**
```bash
curl -H "api-key: YOUR_API_KEY" https://api.brevo.com/v3/account
```

**If email limit reached:**
- Free tier: 300/day
- Upgrade or wait for reset at midnight UTC

### MongoDB Connection Errors

**Check:**
- ✅ IP whitelist includes `0.0.0.0/0` for cloud deployment
- ✅ Username and password are correct
- ✅ Database name is in URI
- ✅ Network access configured

**Test connection:**
```bash
mongosh "mongodb+srv://username:password@cluster.mongodb.net/"
```

### Frontend Not Loading

**Check:**
- ✅ CORS settings in `backend/server.js`
- ✅ `FRONTEND_URL` matches actual frontend URL
- ✅ Both backend and frontend are running
- ✅ Port 5173 is available

### Certificate Generation Issues

**Check:**
- ✅ User name and score are provided
- ✅ PDFKit is installed: `npm install pdfkit`
- ✅ Check backend console for PDF errors

---

## 📊 Service Limits

| Service | Free Tier Limit | Notes |
|---------|----------------|-------|
| **Brevo** | 300 emails/day | Unlimited contacts, no credit card |
| **MongoDB Atlas** | 512MB storage | Shared cluster, auto-paused after 60 days inactivity |
| **Render** | 750 hours/month | Auto-sleeps after 15min inactivity |

---

## 🔗 Useful Links

- **Brevo Dashboard:** https://app.brevo.com
- **MongoDB Atlas:** https://cloud.mongodb.com
- **Render Dashboard:** https://dashboard.render.com
- **Brevo API Docs:** https://developers.brevo.com

---

## 🎓 Scientific Notation Support

Questions automatically format:
- **Powers:** `x^2` → x²
- **Exponents:** `10^-3` → 10⁻³
- **Chemical Formulas:** `H2O` → H₂O, `CO2` → CO₂

---

## 📝 License

MIT License - Feel free to use for your projects!

---

## 🤝 Support

For issues or questions:
1. Check troubleshooting section above
2. Review Brevo/MongoDB/Render documentation
3. Check backend console logs for errors

---

**Last Updated:** December 10, 2024
**Version:** 2.0.0
