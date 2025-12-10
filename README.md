# Quiz Application

A full-stack quiz application with certificate generation and email delivery.

## 📧 Email Service

Uses **Brevo API** for reliable email delivery on Render free tier.

### Quick Setup

1. **Sign up at Brevo**: https://www.brevo.com/
2. **Get API Key**: Settings → SMTP & API → Create new API key
3. **Update backend/.env**: Set `BREVO_API_KEY`
4. **Add to Render**: Settings → Environment Variables
5. **Deploy**

---

## 🔧 Environment Variables

### For Render (Production)

Go to **Render Dashboard → New Web Service**

**Settings:**
- **Build Command:** `npm run render-build`
- **Start Command:** `npm start`

**Environment Variables:**
Add these variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `BREVO_API_KEY` | `xkeysib-...` | Brevo API key from dashboard |
| `SMTP_USER` | `email@gmail.com` | Your sender email address |
| `MONGO_URI` | `mongodb+srv://...` | MongoDB connection string |
| `FRONTEND_URL` | `https://quiz-app-wpgi.onrender.com` | Your Render app URL |
| `GEMINI_API_KEY` | `AIzaSy...` | Gemini API key |
| `JWT_SECRET` | `iiedebateandquizclub` | JWT secret |
| `NODE_ENV` | `production` | Set to production |

### For Local Development

The `backend/.env` file is already configured with placeholder values.

**To update Gmail credentials:**

1. Open `backend/.env`
2. Update these lines:
   ```env
    BREVO_API_KEY=your-brevo-api-key-here
    SMTP_USER=iiedebateandquizclub@gmail.com
    ```
3. Get API Key from [Brevo Dashboard](https://app.brevo.com/)

**Full .env configuration:**

```env
# Brevo Email API
BREVO_API_KEY=your-brevo-api-key-here
SMTP_USER=iiedebateandquizclub@gmail.com

# MongoDB Database
MONGO_URI=mongodb+srv://iiedebateandquizclub:iiedebateandquizclub@cluster.xvjap5l.mongodb.net/?appName=Cluster

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Gemini API
GEMINI_API_KEY=AIzaSyAR_RmS2WPamTkivWXFEFYMqkuCTcDZIrk

# JWT Secret
JWT_SECRET=iiedebateandquizclub

# Server Configuration
PORT=5000
NODE_ENV=development
```

---

## 🚀 Deployment

```bash
git add .
git commit -m "Deploy to Render"
git push origin main
```

1. **Push code** to GitHub
2. **Create New Web Service** on Render
3. connect your repository
4. Use settings:
   - **Build Command:** `npm run render-build`
   - **Start Command:** `npm start`
5. Add Environment Variables from above

---

## 🧪 Testing

### Local
```bash
cd backend
npm start
```

Expected output:
```
📧 Email configured: Gmail SMTP
✅ MongoDB connected
🚀 Server running at http://localhost:5000
```

When you send an email, you'll see:
```
📧 Sending certificate to: user@example.com
✅ Email sent successfully
📬 Message ID: <abc123@gmail.com>
```

### Production
1. Complete a quiz on your live site
2. Check email (and spam folder)
3. Monitor Render logs

---

## 📊 Email Performance

- **Success Rate**: ~95%
- **Delivery Time**: 5-15 seconds
- **Gmail Limits**: Gmail enforces 500 emails/day (managed by Google, not the app)
- **No Domain Required**: ✅ Works immediately
- **Sends to Any Email**: ✅ No restrictions

---

## 🆘 Troubleshooting

### Email not sending
- Verify `GMAIL_USER` and `GMAIL_APP_PASSWORD` are set on Render
- Check Render logs for errors
- The app uses **Port 465 (SSL)** for better reliability. Ensure this outbound port is allowed.
- Make sure 2-Step Verification is enabled on Gmail
- Regenerate App Password if needed

### Emails in spam
- Normal for first few emails
- Mark as "Not Spam"
- Ask users to check spam folder

### Rate limit reached
- **Gmail enforces**: 500 emails/day limit (managed by Google)
- Gmail will reject emails after 500/day
- Wait until midnight (GMT) for reset
- Consider using multiple Gmail accounts if needed

---

## 📝 Project Structure

```
quiz-app/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   │   └── emailService.js
│   ├── server.js
│   └── package.json
├── frontend/
│   └── ...
└── README.md
```

---

## 🔗 Links

- **Gmail App Passwords**: https://myaccount.google.com/apppasswords
- **Google Account Security**: https://myaccount.google.com/security
- **Render Dashboard**: https://dashboard.render.com

---

**Last Updated**: December 9, 2025
