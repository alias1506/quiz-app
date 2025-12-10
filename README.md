# 🎯 Quiz Application

A full-stack quiz application with real-time scoring, certificate generation, email delivery, and comprehensive security features.

## ✨ Features

- **Multiple Choice Quizzes** - Dynamic question sets
- **Real-Time Scoring** - Instant feedback and results
- **PDF Certificates** - Auto-generated and emailed
- **Daily Attempt Limits** - 3 attempts per user per day
- **Security Features** - DevTools prevention, tab switching detection
- **Admin Panel** - Separate admin interface for managing questions
- **Email Notifications** - Certificate delivery via Brevo API
- **Responsive Design** - Works on all devices

---

## 🏗️ Tech Stack

### Frontend
- React 18 with Vite
- React Router for navigation
- SweetAlert2 for notifications
- Lucide React icons

### Backend
- Node.js with Express
- MongoDB with Mongoose
- Brevo API for emails
- PDF generation with PDFKit

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account
- Brevo account (free tier)

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd quiz-app
```

### 2. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies (if not using monorepo structure)
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
1. Sign up at https://www.brevo.com
2. Go to Settings → SMTP & API
3. Create new API key

**Get MongoDB URI:**
1. Create cluster at https://cloud.mongodb.com
2. Click "Connect" → "Connect your application"
3. Copy connection string

### 4. Run Development Server

```bash
# From project root
npm run dev
```

This starts:
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

---

## 📋 Environment Variables Reference

### Backend (.env)

| Variable | Example | Description |
|----------|---------|-------------|
| `BREVO_API_KEY` | `xkeysib-abc123...` | Brevo API key for email delivery |
| `SMTP_USER` | `quiz@example.com` | Sender email address |
| `MONGO_URI` | `mongodb+srv://...` | MongoDB connection string |
| `FRONTEND_URL` | `http://localhost:5173` | Frontend URL (for CORS) |
| `PORT` | `5000` | Backend server port |
| `NODE_ENV` | `development` | Environment mode |

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

3. **Add Environment Variables:**
   Copy all variables from local `.env` but update:
   - `FRONTEND_URL`: Your Render frontend URL
   - `NODE_ENV`: `production`

4. **Deploy** - Render auto-deploys on every push!

---

## 🧪 Testing

### Test Email Delivery

1. Complete a quiz locally
2. Check email inbox (and spam folder)
3. Verify certificate PDF attached

### Test Security Features

- Try opening DevTools (F12) - Should redirect to 404
- Try switching tabs during quiz - Should redirect to 404
- Results page - Tab switching allowed ✅

---

## 📁 Project Structure

```
quiz-app/
├── backend/
│   ├── controllers/
│   │   ├── certificateController.js
│   │   └── ...
│   ├── models/
│   │   ├── authModel.js
│   │   └── quizSetModel.js
│   ├── routes/
│   │   ├── authRoute.js
│   │   └── quizRoute.js
│   ├── services/
│   │   └── emailService.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   │   └── SecurityContext.jsx
│   │   ├── pages/
│   │   │   ├── Starting.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ThankYou.jsx
│   │   │   └── NotFound.jsx
│   │   └── App.jsx
│   └── package.json
├── package.json (root - monorepo scripts)
└── README.md
```

---

## 🔒 Security Features

1. **DevTools Prevention**
   - Blocks F12, Ctrl+Shift+I, Ctrl+Shift+J
   - Detects already-open DevTools
   - Right-click disabled

2. **Tab Switching Detection**
   - Only active during quiz
   - Allowed on results and thank you pages

3. **Daily Limits**
   - 3 attempts per user per day
   - Resets at midnight UTC

---

## 🆘 Troubleshooting

### Emails not sending

**Check:**
- ✅ `BREVO_API_KEY` is set correctly
- ✅ Brevo account is active
- ✅ Check Render logs for errors

**Test API key:**
```bash
curl -H "api-key: YOUR_API_KEY" https://api.brevo.com/v3/account
```

### MongoDB connection errors

**Check:**
- ✅ IP whitelist (allow 0.0.0.0/0 for cloud)
- ✅ Correct username/password
- ✅ Database name in URI

### Frontend not loading

**Check:**
- ✅ CORS settings in backend
- ✅ `FRONTEND_URL` matches actual frontend URL
- ✅ Both backend and frontend running

---

## 📊 Limits

| Service | Free Tier Limit | Notes |
|---------|----------------|-------|
| Brevo | 300 emails/day | Unlimited contacts |
| MongoDB Atlas | 512MB storage | Shared cluster |
| Render | 750 hours/month | Auto-sleeps after 15min |

---

## 🔗 Useful Links

- **Brevo Dashboard:** https://app.brevo.com
- **MongoDB Atlas:** https://cloud.mongodb.com
- **Render Dashboard:** https://dashboard.render.com

---

## 📝 License

MIT License - Feel free to use for your projects!

---

**Last Updated:** December 10, 2024
