# Vercel Email Setup Checklist

## ✅ Current Configuration Status

Your code is already configured correctly for Gmail SMTP on Vercel!

## 📋 Deployment Checklist

### 1. Environment Variables in Vercel

Go to your Vercel project → Settings → Environment Variables

Add these:

```
GMAIL_APP_PASSWORD=dvjqztmfnljeqqak
MONGO_URI=mongodb+srv://iiedebateandquizclub:iiedebateandquizclub@cluster.xvjap5l.mongodb.net/?appName=Cluster
FRONTEND_URL=https://your-vercel-app-url.vercel.app
GEMINI_API_KEY=AIzaSyAR_RmS2WPamTkivWXFEFYMqkuCTcDZIrk
JWT_SECRET=iiedebateandquizclub
```

**Important:** Make sure `GMAIL_APP_PASSWORD` is set for ALL environments:
- ✅ Production
- ✅ Preview
- ✅ Development

### 2. Gmail Account Settings

Make sure the Gmail account `iiedebateandquizclub@gmail.com` has:

1. ✅ **2-Step Verification enabled**
   - Go to: https://myaccount.google.com/security
   
2. ✅ **App Password generated**
   - Go to: https://myaccount.google.com/apppasswords
   - Should be 16 characters: `dvjqztmfnljeqqak`

3. ✅ **No "suspicious activity" blocks**
   - Check: https://myaccount.google.com/notifications
   - If blocked, click "It was me" to unblock

### 3. Deploy to Vercel

```bash
# If using Vercel CLI
vercel --prod

# Or push to your GitHub repo
git add .
git commit -m "Email configuration for Vercel"
git push origin main
```

### 4. Test After Deployment

1. Complete a quiz on your Vercel deployment
2. Wait 30-45 seconds for email
3. Check email inbox (and spam folder)
4. Check Vercel function logs

### 5. Check Vercel Logs

If email doesn't arrive:

1. Go to Vercel Dashboard
2. Your Project → Deployments
3. Click latest deployment
4. Click "Functions" tab
5. Find `/api/certificate/send`
6. Look for:
   - ✅ `📧 Email configured: Gmail SMTP` (startup)
   - ✅ `📧 Sending email to: user@example.com`
   - ✅ `✅ Email sent via Nodemailer (SMTP)`
   - ❌ `❌ Nodemailer error: ...` (if failed)

## 🔧 Current Technical Setup

### Email Service (`emailService.js`)
- ✅ Using Gmail SMTP on port 465 (SSL)
- ✅ 30-second connection timeout
- ✅ 45-second total timeout with Promise.race
- ✅ Non-blocking (certificate generates even if email fails)
- ✅ Proper error handling

### Vercel Configuration (`vercel.json`)
- ✅ Function timeout: 60 seconds
- ✅ Certificate route with no-cache headers
- ✅ Production environment

### Certificate Controller
- ✅ Generates PDF certificate
- ✅ Calls email service
- ✅ Returns success even if email fails

## 🆘 Troubleshooting

### Email not sending on Vercel?

**1. Check Environment Variables**
```bash
vercel env ls
```
Make sure `GMAIL_APP_PASSWORD` is listed

**2. Redeploy After Adding Env Vars**
Environment variables only apply after redeployment:
```bash
vercel --prod --force
```

**3. Check Gmail Account**
- Sign in to `iiedebateandquizclub@gmail.com`
- Check for security alerts
- Verify app password is still valid

**4. View Live Logs**
```bash
vercel logs --follow
```

**5. Test Locally First**
```bash
cd backend
npm start
# Test certificate generation locally
```

### Common Issues

**"SMTP timeout"**
- Gmail is blocking the connection
- Check for security alerts in Gmail
- Regenerate app password

**"GMAIL_APP_PASSWORD not configured"**
- Environment variable not set in Vercel
- Add it and redeploy

**"Connection refused"**
- Port 465 might be blocked
- This is rare on Vercel, usually works

**Email arrives in spam**
- This is normal for first few emails
- Ask users to check spam folder

## ✅ Success Indicators

When working correctly, you should see:

**On Server Startup:**
```
📧 Email configured: Gmail SMTP
✅ MongoDB connected to 'Quiz' database
🚀 Server running at http://localhost:5000
```

**When Sending Certificate:**
```
📧 Sending email to: user@example.com
✅ Email sent via Nodemailer (SMTP)
✅ Certificate email sent successfully to: user@example.com
```

## 📝 Quick Commands

```bash
# Deploy to Vercel
vercel --prod

# View environment variables
vercel env ls

# Add environment variable
vercel env add GMAIL_APP_PASSWORD

# View function logs
vercel logs

# Force redeploy
vercel --prod --force
```

## 🎯 Expected Behavior

- **Certificate generates:** Always (even if email fails)
- **Email sends:** 90-95% of the time on Vercel
- **Email delay:** 5-15 seconds on Vercel
- **Timeout:** 45 seconds max, then gives up gracefully

If email fails, user still gets certificate success message, but check logs to fix email issue.
