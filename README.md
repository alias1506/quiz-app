# 🎯 Student Quiz Application

> Modern, secure quiz platform with real-time scoring, certificate generation, email delivery, and comprehensive anti-cheating measures.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📑 Table of Contents

- [Quick Start](#-quick-start)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Security Features](#-security-features)
- [Email System](#-email-system)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)

---

## 🚀 Quick Start

```bash
# 1. Clone repository
git clone <repository-url>
cd quiz-app

# 2. Install dependencies
npm run install-all

# 3. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials

# 4. Start development
npm run dev
```

**Access Points:**
- **Student App:** `http://localhost:5173`
- **Backend API:** `http://localhost:3000/api`

---

## ✨ Features

### 📝 Quiz Experience
- **Multi-Part Quizzes** - Support for quiz parts (Part A, Part B, etc.)
- **Multi-Round System** - Organized rounds with themed questions
- **Round-by-Round Loading** - Lazy load questions for better performance
- **Randomized Questions** - Questions shuffle on every attempt
- **Randomized Options** - Answer options randomize per question
- **Timed Rounds** - Countdown timer with visual warnings
- **Unlimited Time Mode** - Rounds without time limits
- **Smart Navigation** - Previous/Next/Submit with validation
- **Progress Tracking** - Visual progress bar per round
- **Round Instructions** - Custom instructions with HTML support

### 🎓 Results & Certificates
- **Real-Time Scoring** - Instant score calculation
- **Round-by-Round Timing** - Detailed time tracking per round
- **PDF Certificates** - Auto-generated professional certificates
- **Email Delivery** - Certificates sent via Brevo API
- **Performance Summary** - Detailed results breakdown
- **Certificate Preview** - View before download

### 🔒 Security & Anti-Cheating
- **DevTools Prevention** - Blocks F12, inspect element, right-click
- **Tab Switch Detection** - Monitors focus during active quiz
- **Results Page Exception** - Tab switching allowed after completion
- **Context Menu Disable** - Right-click blocked during quiz
- **Copy/Paste Prevention** - Disabled during quiz
- **Source View Blocked** - Ctrl+U disabled
- **Auto Redirect** - Violations redirect to 404 page

### 👥 User Management
- **Daily Attempt Limits** - 3 attempts per user per day per quiz part
- **Part-Based Tracking** - Independent tracking for each quiz part
- **Auto Reset** - Attempts reset at midnight UTC
- **Email Validation** - Duplicate prevention per part
- **Attempt History** - Complete attempt log with timestamps
- **Admin Bypass** - Unlimited attempts for admin users

### 🎨 User Experience
- **Modern UI** - Clean, gradient-based design
- **Responsive** - Works on all screen sizes
- **Loading States** - Skeleton screens and spinners
- **Smooth Animations** - Transitions and micro-interactions
- **Emoji Support** - Rich text with emoji rendering
- **Scientific Notation** - Auto-format powers (x²) and formulas (H₂O)
- **Code Highlighting** - Special formatting for code snippets
- **Accessibility** - Keyboard navigation and ARIA labels

---

## 🏗️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.3.1 | UI Framework |
| **Vite** | 5.4.11 | Build Tool & Dev Server |
| **React Router** | 7.1.1 | Client-side routing |
| **SweetAlert2** | 11.14.5 | Beautiful alerts |
| **Lucide React** | 0.469.0 | Modern icons |
| **Tailwind CSS** | 3.4.17 | Utility-first CSS |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 18+ | Runtime Environment |
| **Express** | 4.21.2 | Web Framework |
| **MongoDB** | Atlas | Database |
| **Mongoose** | 8.9.3 | ODM |
| **Brevo (Sendinblue)** | - | Email Service |
| **PDFKit** | 0.15.2 | PDF Generation |
| **Axios** | 1.7.9 | HTTP Client |
| **CORS** | 2.8.5 | Cross-Origin Resource Sharing |

---

## 💻 Installation

### Prerequisites
- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **MongoDB Atlas** account (free tier: 512MB)
- **Brevo** account (free tier: 300 emails/day)

### Step-by-Step Installation

#### 1. Clone Repository
```bash
git clone <repository-url>
cd quiz-app
```

#### 2. Install Dependencies
```bash
# Install all dependencies (frontend + backend)
npm run install-all

# OR install separately
npm install          # Root dependencies
cd backend && npm install
cd ../frontend && npm install
```

#### 3. Environment Setup

Create `backend/.env`:
```env
# Brevo Email Configuration
BREVO_API_KEY=xkeysib-your_brevo_api_key_here
SMTP_USER=your_verified_email@example.com

# MongoDB Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/Quiz?retryWrites=true&w=majority

# Server Configuration
PORT=3000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

**Get Brevo API Key:**
1. Visit https://www.brevo.com (free signup)
2. Navigate to: Settings → SMTP & API → API Keys
3. Click "Generate a New API Key"
4. Copy key (format: `xkeysib-...`)
5. Free tier: 300 emails/day

**Get MongoDB URI:**
1. Visit https://cloud.mongodb.com
2. Create free M0 cluster (512MB)
3. Create Database User
4. Add IP Address to whitelist (0.0.0.0/0 for development)
5. Click "Connect" → "Connect your application"
6. Copy connection string
7. Replace `<password>` with your DB password

#### 4. Configure Admin Panel Integration

The student app receives quiz data from the admin panel via webhook. When a quiz is published in the admin panel, it notifies this app.

**In Admin Panel `.env`:**
```env
STUDENT_APP_URL=http://localhost:3000
```

**In Production:**
```env
STUDENT_APP_URL=https://your-student-app.onrender.com
```

#### 5. Start Development
```bash
# From project root
npm run dev
```

This runs:
- Frontend on `http://localhost:5173`
- Backend on `http://localhost:3000`

---

## ⚙️ Configuration

### Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BREVO_API_KEY` | ✅ Yes | - | Brevo API key for sending emails |
| `SMTP_USER` | ✅ Yes | - | Verified sender email in Brevo |
| `MONGO_URI` | ✅ Yes | - | MongoDB connection string |
| `PORT` | ⚠️ Optional | 3000 | Backend server port |
| `NODE_ENV` | ⚠️ Optional | development | Environment mode |
| `FRONTEND_URL` | ⚠️ Optional | http://localhost:5173 | Frontend URL for CORS |

### Text Formatting Features

The app automatically formats special notation:

**Scientific Notation:**
- Powers: `x^2` → x²
- Exponents: `10^-3` → 10⁻³
- Greek letters: `alpha`, `beta`, `gamma` → α, β, γ

**Chemical Formulas:**
- `H2O` → H₂O
- `CO2` → CO₂
- `(NH4)2SO4` → (NH₄)₂SO₄

**Advanced:**
- Subscripts: `x_{n+1}` → x₍ₙ₊₁₎
- Superscripts: `e^{2x}` → e²ˣ

---

## 🔐 Security Features

### 1. DevTools Prevention System

**Blocked Actions:**
- F12 (DevTools Toggle)
- Ctrl+Shift+I (Inspect Element)
- Ctrl+Shift+J (Console)
- Ctrl+Shift+C (Element Selector)
- Ctrl+U (View Source)
- Right-click context menu
- Cmd+Option+I (Mac DevTools)

**Detection:**
```javascript
// Detects if DevTools is already open
const devtoolsOpen = window.outerHeight - window.innerHeight > threshold;
```

**Behavior:**
- Instant redirect to 404 page
- Clear all quiz state
- Block return navigation

### 2. Tab Switching Detection

**Monitored Events:**
- `visibilitychange` - Tab becomes hidden
- `blur` - Window loses focus
- `focus` - Window regains focus

**Smart Detection:**
- Only active during quiz (Dashboard page)
- Disabled on Results page (ThankYou)
- Disabled on Starting page
- Grace period on initial load

**Violation Handling:**
```javascript
if (violation detected) {
  → Clear quiz state
  → Redirect to 404
  → Log attempt (if enabled)
}
```

### 3. Daily Attempt Limits

**Rules:**
- 3 attempts per user per day per quiz part
- Resets at midnight UTC
- Tracked in MongoDB
- Part-independent (Part A and Part B counted separately)

**Admin Exception:**
- Email: `admin@gmail.com` OR
- Name: `admin` (case-insensitive)
- Unlimited attempts
- No email notifications

**Enforcement:**
```javascript
// Backend validation
if (attemptCount >= 3 && !isAdmin) {
  return 429; // Too Many Requests
}
```

### 4. Copy/Paste Prevention

**Disabled Actions:**
- Copy (Ctrl+C)
- Cut (Ctrl+X)
- Paste (Ctrl+V)
- Select All (Ctrl+A)
- Drag selection

**Implementation:**
```javascript
document.addEventListener('copy', (e) => e.preventDefault());
document.addEventListener('paste', (e) => e.preventDefault());
```

---

## 📧 Email System

### Brevo Integration

**Email Flow:**
1. User completes quiz
2. Backend generates PDF certificate using PDFKit
3. Email sent via Brevo API with certificate attached
4. User receives email within seconds

**Email Template:**
```
Subject: 🎓 Your Quiz Certificate

Dear [Student Name],

Congratulations on completing the quiz!

📊 Your Results:
- Score: [X]/[Total]
- Completion Time: [HH:MM:SS]

Your certificate is attached to this email.

Best regards,
Quiz Team
```

**Daily Limit Tracking:**
```javascript
// Console output
✅ Email sent successfully! (Today: 23/300)
```

**Features:**
- Daily counter with auto-reset
- Retry logic on failure
- Error logging
- Test mode for development

### Certificate Generation

**PDF Features:**
- Professional design
- Student name and score
- Completion date
- Unique certificate ID
- Company/organization logo support

**Template Location:**
```
backend/certificate_template/
```

**Customization:**
Edit `backend/controllers/certificateController.js` to modify:
- Colors and fonts
- Layout and spacing
- Logo and branding
- Text content

---

## 📁 Project Structure

```
quiz-app/
├── frontend/                      # React Application
│   ├── src/
│   │   ├── components/            # Reusable Components
│   │   │   ├── Certificate.jsx    # Certificate display
│   │   │   ├── Navbar.jsx         # Top navigation
│   │   │   └── ProtectedRoute.jsx # Route guard
│   │   ├── contexts/
│   │   │   └── SecurityContext.jsx  # Security features
│   │   ├── pages/                 # Page Components
│   │   │   ├── Starting.jsx       # Login/signup page
│   │   │   ├── Dashboard.jsx      # Quiz interface
│   │   │   ├── ThankYou.jsx       # Results page
│   │   │   └── NotFound.jsx       # 404 page
│   │   ├── utils/
│   │   │   ├── formatText.js      # Text formatting
│   │   │   └── swalHelper.js      # SweetAlert config
│   │   ├── App.jsx                # Main app component
│   │   ├── main.jsx               # Entry point
│   │   └── index.css              # Global styles
│   ├── public/
│   ├── vite.config.js             # Vite configuration
│   └── package.json
├── backend/                       # Express Server
│   ├── models/
│   │   ├── authModel.js           # User schema
│   │   ├── questionModel.js       # Question schema
│   │   ├── roundModel.js          # Round schema
│   │   └── quizModel.js           # Quiz schema
│   ├── routes/
│   │   ├── authRoute.js           # User auth & attempts
│   │   ├── questionRoute.js       # Question retrieval
│   │   ├── quizRoute.js           # Quiz data & webhook
│   │   ├── setsRoute.js           # Question sets
│   │   └── certificateRoute.js    # Certificate generation
│   ├── controllers/
│   │   └── certificateController.js  # PDF & email logic
│   ├── services/
│   │   ├── emailService.js        # Brevo integration
│   │   └── certificateService.js  # PDF generation
│   ├── certificate_template/      # Certificate assets
│   ├── .env                       # Environment variables
│   ├── server.js                  # Express app setup
│   └── package.json
├── package.json                   # Root package (monorepo)
└── README.md
```

---

## 🔌 API Documentation

### User Authentication

#### POST `/api/users/check-email`
Check if user exists and can attempt quiz
```json
Request:
{
  "email": "student@example.com",
  "quizPart": "Part A",
  "hasParts": true
}

Response:
{
  "exists": true,
  "user": {
    "name": "John Doe",
    "email": "student@example.com"
  }
}
```

#### POST `/api/users/check-attempts`
Check remaining attempts for user
```json
Request:
{
  "email": "student@example.com",
  "quizPart": "Part A",
  "hasParts": true
}

Response:
{
  "canAttempt": true,
  "currentAttempts": 2,
  "remainingAttempts": 1,
  "maxAttempts": 3,
  "partAttempts": {
    "Part A": 2,
    "Part B": 1
  },
  "timeUntilReset": 0
}
```

#### POST `/api/users/record-attempt`
Record a new quiz attempt
```json
Request:
{
  "name": "John Doe",
  "email": "student@example.com",
  "quizName": "Math Test 2024",
  "quizPart": "Part A"
}

Response:
{
  "success": true,
  "message": "Attempt recorded successfully",
  "currentAttempts": 3,
  "remainingAttempts": 0
}
```

#### POST `/api/users/update-score`
Update user's score and send certificate
```json
Request:
{
  "email": "student@example.com",
  "score": 85,
  "total": 100,
  "quizName": "Math Test 2024",
  "quizPart": "Part A",
  "roundTimings": [
    { "roundName": "Algebra", "timeTaken": 300 },
    { "roundName": "Geometry", "timeTaken": 450 }
  ]
}

Response:
{
  "success": true,
  "message": "Score updated and certificate sent",
  "user": {
    "name": "John Doe",
    "email": "student@example.com",
    "score": 85,
    "total": 100
  }
}
```

---

### Quiz Data

#### POST `/api/quiz/webhook`
Receive quiz publish notification from admin panel
```json
Request:
{
  "quizId": "...",
  "action": "published"
}

Response:
{
  "success": true,
  "message": "Quiz data updated"
}
```

#### GET `/api/quiz/rounds/:part`
Get active rounds for a quiz part
```json
Response:
{
  "quizName": "Math Championship 2024",
  "quizPart": "Part A",
  "rounds": [
    {
      "_id": "...",
      "name": "Algebra Round",
      "description": "Test your algebra skills...",
      "positivePoints": 4,
      "negativePoints": 1,
      "timeLimit": { "hours": 0, "minutes": 30, "seconds": 0 },
      "selectedSets": [...]
    }
  ]
}
```

#### GET `/api/questions`
Get all published questions

#### GET `/api/questions/by-set/:setName`
Get questions for specific set

---

## 🌐 Deployment

### Deploy to Render

#### Step 1: Prepare Repository
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### Step 2: Create Web Service
1. Visit https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repository

#### Step 3: Configure Service
- **Name:** `student-quiz-app`
- **Environment:** `Node`
- **Region:** Choose closest region
- **Branch:** `main`
- **Build Command:** `npm run build`
- **Start Command:** `npm start`

**Note:** The build script automatically:
1. Installs all dependencies
2. Builds frontend (Vite)
3. Copies frontend build to backend/public
4. Starts backend server serving frontend

#### Step 4: Environment Variables
Add in Render dashboard:

```env
BREVO_API_KEY=xkeysib_your_production_key
SMTP_USER=noreply@yourcompany.com
MONGO_URI=mongodb+srv://...your_production_db
NODE_ENV=production
FRONTEND_URL=https://student-quiz-app.onrender.com
PORT=3000
```

**Important:** Ensure `FRONTEND_URL` matches your actual Render URL!

#### Step 5: Deploy
Click "Create Web Service"

Render will:
✅ Clone your repository  
✅ Install dependencies  
✅ Build frontend  
✅ Start backend server  
✅ Serve frontend from `/`  

**Your app will be live at:** `https://student-quiz-app.onrender.com`

### Post-Deployment Setup

#### 1. Update Admin Panel
In admin panel `.env`:
```env
STUDENT_APP_URL=https://student-quiz-app.onrender.com
```

#### 2. Verify Brevo Email
1. Login to Brevo dashboard
2. Go to Senders & IP
3. Add and verify `SMTP_USER` email
4. Test email sending

#### 3. Configure MongoDB
1. In MongoDB Atlas, whitelist Render IPs
2. Or set to `0.0.0.0/0` (allow all)
3. Verify connection works

#### 4. Test the App
1. Visit your app URL
2. Create test account
3. Take a quiz
4. Verify:
   - ✅ Quiz loads correctly
   - ✅ Timer works
   - ✅ Scoring calculates
   - ✅ Certificate email arrives
   - ✅ Daily limits apply

---

## 🔧 Troubleshooting

### Common Issues

#### ❌ Emails Not Sending

**Symptoms:** No email received after quiz completion

**Solutions:**
1. **Verify Brevo API Key:**
   ```bash
   curl -H "api-key: YOUR_API_KEY" https://api.brevo.com/v3/account
   ```
   Should return account details

2. **Check Sender Email:**
   - Must be verified in Brevo
   - Go to Senders & IP → Add/verify sender

3. **Check Daily Limit:**
   - Free tier: 300 emails/day
   - Check backend console for counter
   - Resets at midnight UTC

4. **Test Mode:**
   In development, emails redirect to `SMTP_USER`

5. **Check Logs:**
   ```bash
   # Backend console
   ✅ Email sent successfully! (Today: 23/300)
   # OR
   ❌ Email failed: [error message]
   ```

---

#### ❌ Certificate Not Generated

**Symptoms:** Email sent but no PDF attached

**Solutions:**
1. **Verify PDFKit installed:**
   ```bash
   cd backend && npm list pdfkit
   ```

2. **Check backend logs** for PDF errors

3. **Test certificate generation:**
   Call `/api/certificate/test` endpoint (if you create one)

4. **Verify user data:**
   Ensure name and score are provided

---

#### ❌ Security Features Not Working

**Symptoms:** DevTools/tab switching not blocked

**Solutions:**
1. **Check SecurityContext:**
   Verify `SecurityContext` is wrapping app in `App.jsx`

2. **Check Route:**
   Security only active on `/dashboard` route

3. **Browser Compatibility:**
   Some features don't work in certain browsers

4. **Clear Cache:**
   Hard refresh (Ctrl+Shift+R)

---

#### ❌ MongoDB Connection Failed

**Symptoms:** "Authentication failed" or "Connection timeout"

**Solutions:**
1. **Verify Connection String:**
   - Check username/password
   - Ensure URL is properly encoded
   - Include database name: `...mongodb.net/Quiz`

2. **Network Access:**
   - In MongoDB Atlas: Network Access
   - Add IP: `0.0.0.0/0` (allow all) for testing
   - Or add specific Render IPs

3. **Database User:**
   - Verify user exists in Database Access
   - Check permissions (Read/Write)

4. **Test Connection:**
   ```bash
   mongosh "your_connection_string"
   ```

---

#### ❌ Quiz Not Loading

**Symptoms:** "No quizzes available" message

**Solutions:**
1. **Verify Quiz is Published:**
   In admin panel, ensure quiz status is "Published"

2. **Check Webhook:**
   - Verify `STUDENT_APP_URL` in admin panel
   - Test webhook endpoint: `POST /api/quiz/webhook`

3. **Manually Sync:**
   Publish quiz again in admin panel

4. **Check Database:**
   Verify `Round` collection has active rounds

---

#### ❌ Attempt Limit Issues

**Symptoms:** Can't take quiz or incorrect attempt count

**Solutions:**
1. **Check Current Attempts:**
   Use `/api/users/check-attempts` endpoint

2. **Reset Attempts:**
   Manually in MongoDB:
   ```javascript
   db.Users.updateOne(
     { email: "user@example.com" },
     { $set: { dailyAttempts: 0, lastAttemptDate: null } }
   )
   ```

3. **Time Zone Issues:**
   Attempts reset at midnight UTC

4. **Part-Based Tracking:**
   Each quiz part has independent attempt counter

---

#### ❌ Timer Not Working

**Symptoms:** Timer stuck or not counting down

**Solutions:**
1. **Check Round Configuration:**
   Verify time limit is set in admin panel

2. **Browser Compatibility:**
   Test in different browser

3. **Check Console:**
   Look for JavaScript errors

4. **Unlimited Time:**
   If all timer values are 0, it's unlimited time mode

---

### Debug Mode

Enable detailed console logging:

```javascript
// frontend/src/main.jsx
window.DEBUG = true;

// Then check console for detailed logs
```

---

## 📊 Performance Optimization

### Frontend
- ✅ Vite for fast builds and HMR
- ✅ Lazy loading with React.lazy()
- ✅ React Router v7 for code splitting
- ✅ Minified production builds
- ✅ Tree shaking unused code

### Backend
- ✅ MongoDB indexes on email and quiz fields
- ✅ Mongoose connection pooling
- ✅ Static file caching in production
- ✅ Response compression (if enabled)

### Recommended MongoDB Indexes
```javascript
// Users collection
db.Users.createIndex({ email: 1 });
db.Users.createIndex({ "attempts.quizPart": 1 });
db.Users.createIndex({ lastAttemptDate: 1 });

// Rounds collection
db.Rounds.createIndex({ quizId: 1, isActive: 1 });
```

---

## 🎓 Scientific Notation Guide

The app automatically formats text using the `formatText` utility.

**Usage in Questions/Options:**
```javascript
// Input:
"What is H2O?"
"Calculate x^2 + 3x - 5"
"The value of alpha is..."

// Output:
"What is H₂O?"
"Calculate x² + 3x - 5"
"The value of α is..."
```

**Supported Formats:**

| Input | Output | Type |
|-------|--------|------|
| `H2O` | H₂O | Chemical formula |
| `CO2` | CO₂ | Chemical formula |
| `x^2` | x² | Superscript |
| `10^-3` | 10⁻³ | Negative exponent |
| `x_{n}` | xₙ | Subscript |
| `alpha` | α | Greek letter |
| `beta` | β | Greek letter |
| `pi` | π | Greek letter |

---

## 🔗 Useful Resources

- **React Documentation:** https://react.dev
- **Vite Guide:** https://vitejs.dev/guide
- **MongoDB Atlas:** https://cloud.mongodb.com
- **Brevo (Email):** https://www.brevo.com
- **Brevo API Docs:** https://developers.brevo.com
- **PDFKit Documentation:** https://pdfkit.org
- **Render Docs:** https://render.com/docs

---

## 🆘 Support

For issues:
1. Check [Troubleshooting](#-troubleshooting) section
2. Review backend console logs
3. Check MongoDB Atlas logs
4. Verify Brevo dashboard for email stats
5. Test API endpoints with Postman

---

## 📝 License

MIT License © 2026

---

**Version:** 3.0.0  
**Last Updated:** January 2026  
**Node Version:** 18+  
**Supported Browsers:** Chrome, Firefox, Safari, Edge (latest)
