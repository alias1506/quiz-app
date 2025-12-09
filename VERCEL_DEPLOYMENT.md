# Vercel Deployment Guide

## Email Configuration for Vercel

### Problem
Vercel serverless functions have limitations with SMTP connections that can cause email timeouts.

### Solution Implemented
The application now uses optimized SMTP settings for serverless environments:
- **Port 465 with SSL** (instead of 587 TLS) for better compatibility
- **Extended timeouts** (30-45 seconds) for serverless cold starts
- **Connection pooling disabled** (`pool: false`) for serverless
- **Non-blocking email** - Certificate generation succeeds even if email fails

### Environment Variables Required

In your Vercel project settings, add these environment variables:

1. **MONGO_URI** (Required)
   - Your MongoDB connection string
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/`

2. **GMAIL_APP_PASSWORD** (Required for email)
   - Gmail App Password (NOT your regular Gmail password)
   - How to get it:
     1. Go to https://myaccount.google.com/security
     2. Enable 2-Step Verification if not already enabled
     3. Go to "App passwords" section
     4. Generate new app password for "Mail"
     5. Copy the 16-character password
     6. Add it to Vercel environment variables

3. **FRONTEND_URL** (Optional)
   - Your Vercel frontend URL
   - Example: `https://your-app.vercel.app`

4. **NODE_ENV** (Auto-set by Vercel)
   - Should be `production`

### Gmail Account Setup

**Important:** Make sure the Gmail account (iiedebateandquizclub@gmail.com) has:
- ✅ 2-Step Verification enabled
- ✅ App Password generated
- ✅ "Less secure app access" is NOT needed (we use App Password)
- ✅ SMTP access enabled (usually enabled by default)

### Vercel Configuration

The `vercel.json` is already configured with:
- **60-second timeout** for serverless functions
- **No caching** for certificate endpoint
- **Proper routing** for API and frontend

### Testing Email on Vercel

After deployment:

1. **Check Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Verify `GMAIL_APP_PASSWORD` is set
   - Redeploy if you just added it

2. **Check Logs**
   - Go to Vercel Dashboard → Your Project → Deployments → Latest → Functions
   - Click on any function call to see logs
   - Look for:
     - `✅ Certificate email sent successfully` (success)
     - `⚠️ Email failed (non-critical)` (failure but app continues)
     - `⚠️ GMAIL_APP_PASSWORD not configured` (missing env var)

3. **Test Certificate Generation**
   - Complete a quiz on your Vercel deployment
   - Certificate should be generated regardless of email status
   - Check email inbox (and spam folder)
   - Check Vercel function logs for email status

### Alternative: Use SendGrid (Recommended for Production)

If SMTP continues to have issues on Vercel, consider switching to SendGrid API:

1. Sign up for SendGrid (free tier: 100 emails/day)
2. Get API key from SendGrid dashboard
3. Install: `npm install @sendgrid/mail`
4. Replace nodemailer code with SendGrid API
5. Add `SENDGRID_API_KEY` to Vercel environment variables

SendGrid API is more reliable on serverless platforms than SMTP.

### Troubleshooting

**Email not sending?**
1. Check Vercel function logs for errors
2. Verify `GMAIL_APP_PASSWORD` is correct in Vercel
3. Make sure Gmail account has 2FA enabled
4. Check Gmail account for "suspicious activity" alerts
5. Try regenerating the App Password

**Timeout errors?**
1. Check if function timeout is set to 60 seconds in vercel.json
2. Verify you're on a Vercel plan that supports longer timeouts
3. Consider switching to SendGrid API

**Certificate generates but no email?**
- This is expected behavior if email fails
- User still gets certificate (success)
- Email is treated as non-critical
- Check logs to see why email failed

### Deployment Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod

# Check logs
vercel logs [deployment-url]
```

### Important Notes

- ⏱️ Free Vercel plan has 10-second timeout limit
- ⏱️ Hobby plan has 60-second timeout limit
- 📧 Email sending adds 5-15 seconds to response time
- ✅ Certificate always generates (email is optional)
- 🔒 Never commit `.env` file with real credentials
