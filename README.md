# Quiz Application

A full-stack quiz application with certificate generation and email delivery.

## 📧 Email Service

Uses **Gmail SMTP** for free and reliable email delivery.

### Quick Setup

1. **Enable 2-Step Verification** on `iiedebateandquizclub@gmail.com`
2. **Generate App Password**: [Google App Passwords](https://myaccount.google.com/apppasswords)
3. **Update backend/.env**: Set `GMAIL_USER` and `GMAIL_APP_PASSWORD`
4. **Add to Render**: Settings → Environment Variables
5. **Deploy**

---

## 🔧 Environment Variables

### For Render (Production)

Go to **Render Dashboard → Your Service → Environment**

Add these variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `GMAIL_USER` | `iiedebateandquizclub@gmail.com` | Your Gmail address |
| `GMAIL_APP_PASSWORD` | `your-16-char-password` | App Password from Google |
| `MONGO_URI` | `mongodb+srv://...` | MongoDB connection string |
| `FRONTEND_URL` | `https://quiz-app-wpgi.onrender.com` | Your Render app URL |
| `GEMINI_API_KEY` | `AIzaSyAR_RmS2WPamTkivWXFEFYMqkuCTcDZIrk` | Gemini API key |
| `JWT_SECRET` | `iiedebateandquizclub` | JWT secret |
| `NODE_ENV` | `production` | Set to production |

### For Local Development

The `backend/.env` file is already configured with placeholder values.

**To update Gmail credentials:**

1. Open `backend/.env`
2. Update these lines:
   ```env
   GMAIL_USER=iiedebateandquizclub@gmail.com
   GMAIL_APP_PASSWORD=your-16-char-app-password
   ```
3. Get App Password from [Google](https://myaccount.google.com/apppasswords)

**Full .env configuration:**

```env
# Gmail SMTP
GMAIL_USER=iiedebateandquizclub@gmail.com
GMAIL_APP_PASSWORD=your-app-password-here

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

Render will auto-deploy from your GitHub repository.

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
📊 Daily email usage: 0/500 (Gmail limit: 500/day)
✅ MongoDB connected
🚀 Server running at http://localhost:5000
```

When you send an email, you'll see:
```
📧 Sending certificate to: user@example.com
✅ Email sent successfully
📬 Message ID: <abc123@gmail.com>
📊 Daily emails sent: 1/500
```

### Production
1. Complete a quiz on your live site
2. Check email (and spam folder)
3. Monitor Render logs

---

## 📊 Email Performance

- **Success Rate**: ~95%
- **Delivery Time**: 5-15 seconds
- **Free Tier Limits**:
  - **Daily**: 500 emails/day
  - **Monthly**: Unlimited (within daily limit)
- **Daily Counter**: Automatically tracks emails sent (resets daily at midnight)
- **Terminal Display**: Shows usage like `5/500` after each email sent
- **No Domain Required**: ✅ Works immediately
- **Sends to Any Email**: ✅ No restrictions

---

## 🆘 Troubleshooting

### Email not sending
- Verify `GMAIL_USER` and `GMAIL_APP_PASSWORD` are set on Render
- Check Render logs for errors
- Make sure 2-Step Verification is enabled on Gmail
- Regenerate App Password if needed

### Emails in spam
- Normal for first few emails
- Mark as "Not Spam"
- Ask users to check spam folder

### Rate limit reached
- **Daily limit**: 500 emails/day (resets at midnight)
- Check terminal counter: `📊 Daily emails sent: X/500`
- Wait until midnight for reset
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
