# API-Based Email Service Setup Guide

## Overview

The application now supports **3 email providers** with automatic fallback:

1. **Resend** (Recommended) - Modern, Vercel-optimized, easy setup
2. **SendGrid** - Popular, reliable, free tier available
3. **Gmail/SMTP** - Fallback option, can timeout on serverless

The system automatically tries providers in order until one succeeds.

---

## Option 1: Resend (Recommended for Vercel)

### Why Resend?
- ✅ Built for serverless platforms
- ✅ Fast and reliable on Vercel
- ✅ Simple API
- ✅ Free tier: 100 emails/day
- ✅ No credit card required for free tier

### Setup Steps:

1. **Sign up for Resend**
   - Go to https://resend.com
   - Sign up with your email or GitHub
   - Verify your email

2. **Get API Key**
   - Go to dashboard: https://resend.com/api-keys
   - Click "Create API Key"
   - Name it: "Quiz App Production"
   - Copy the API key (starts with `re_`)

3. **Add to Vercel**
   - Go to your Vercel project
   - Settings → Environment Variables
   - Add new variable:
     - **Name:** `RESEND_API_KEY`
     - **Value:** `re_xxxxxxxxxx` (your API key)
     - **Environment:** Production, Preview, Development
   - Click "Save"

4. **Update Email From Address** (Optional)
   - In `emailService.js`, line 21:
   ```javascript
   from: "IIE Debate & Quiz Club <your-email@resend.dev>",
   ```
   - Or add your verified domain in Resend dashboard

5. **Test**
   - Redeploy your Vercel app
   - Complete a quiz
   - Check Resend dashboard logs

**Note:** With free tier, emails come from `onboarding@resend.dev`. To use your own domain:
- Add domain in Resend dashboard
- Verify DNS records
- Update `from` address in code

---

## Option 2: SendGrid

### Why SendGrid?
- ✅ Industry standard
- ✅ Free tier: 100 emails/day
- ✅ Good deliverability
- ✅ Detailed analytics

### Setup Steps:

1. **Sign up for SendGrid**
   - Go to https://sendgrid.com
   - Sign up (requires credit card verification)
   - Complete account setup

2. **Get API Key**
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Name: "Quiz App"
   - Select "Full Access" or "Mail Send" only
   - Click "Create & View"
   - Copy the API key (starts with `SG.`)

3. **Verify Sender Email**
   - Go to Settings → Sender Authentication
   - Click "Verify a Single Sender"
   - Add: iiedebateandquizclub@gmail.com
   - Check email and verify

4. **Add to Vercel**
   - Go to your Vercel project
   - Settings → Environment Variables
   - Add new variable:
     - **Name:** `SENDGRID_API_KEY`
     - **Value:** `SG.xxxxxxxxxx` (your API key)
     - **Environment:** Production, Preview, Development
   - Click "Save"

5. **Test**
   - Redeploy Vercel app
   - Complete quiz
   - Check SendGrid activity logs

---

## Option 3: Gmail SMTP (Fallback)

### Why Gmail SMTP?
- ✅ No additional signup needed
- ✅ Free
- ⚠️ Can timeout on serverless
- ⚠️ Daily limit: 500 emails

### Setup Steps:

1. **Enable 2-Step Verification**
   - Go to https://myaccount.google.com/security
   - Find "2-Step Verification"
   - Click "Get Started" and follow steps

2. **Generate App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select app: "Mail"
   - Select device: "Other" → name it "Quiz App"
   - Click "Generate"
   - Copy the 16-character password (spaces don't matter)

3. **Add to Vercel**
   - Go to Vercel project
   - Settings → Environment Variables
   - Add:
     - **Name:** `GMAIL_APP_PASSWORD`
     - **Value:** `xxxx xxxx xxxx xxxx` (your app password)
     - **Environment:** Production, Preview, Development

4. **Test**
   - Redeploy
   - Complete quiz
   - Check function logs

---

## Installation

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

   This installs `node-fetch` which is required for API-based email services.

2. **Local Testing**
   
   Create `backend/.env` file:
   ```env
   # MongoDB
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/
   
   # Email Provider (choose one or multiple)
   RESEND_API_KEY=re_xxxxxxxxxx
   SENDGRID_API_KEY=SG.xxxxxxxxxx
   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
   
   # Other
   FRONTEND_URL=http://localhost:5173
   NODE_ENV=development
   ```

3. **Start Server**
   ```bash
   npm start
   ```

4. **Check Logs**
   - On startup, you'll see which email providers are configured:
   ```
   📧 Email providers configured: Resend, SendGrid, Gmail/SMTP
   ```

---

## How It Works

### Automatic Fallback System

The email service tries providers in this order:

1. **Resend** (if `RESEND_API_KEY` is set)
2. **SendGrid** (if `SENDGRID_API_KEY` is set)
3. **Gmail/SMTP** (if `GMAIL_APP_PASSWORD` is set)

If one fails, it automatically tries the next one.

### Example Logs:

**Success:**
```
📧 Attempting to send email to: user@example.com
📤 Trying Resend...
✅ Email sent via Resend: 550e8400-e29b-41d4-a716-446655440000
✅ Certificate email sent successfully to: user@example.com
```

**Fallback:**
```
📧 Attempting to send email to: user@example.com
📤 Trying Resend...
⚠️ Resend failed: API key invalid
📤 Trying SendGrid...
✅ Email sent via SendGrid
✅ Certificate email sent successfully to: user@example.com
```

**All Failed (Certificate still generated):**
```
📧 Attempting to send email to: user@example.com
📤 Trying Gmail/SMTP...
⚠️ Nodemailer failed: Connection timeout
⚠️ Email failed (non-critical): All email providers failed
```

---

## Testing

### Test Locally:

```bash
# Start backend
cd backend
npm start

# In another terminal, test certificate endpoint
curl -X POST http://localhost:5000/api/certificate/send \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "your-email@example.com",
    "score": 8,
    "total": 10,
    "date": "2025-12-09",
    "quizName": "Test Quiz"
  }'
```

### Test on Vercel:

1. Deploy to Vercel
2. Check environment variables are set
3. Complete a quiz
4. Check Vercel function logs:
   - Go to Vercel Dashboard
   - Your Project → Deployments
   - Click latest deployment
   - Click "Functions" tab
   - Find `/api/certificate/send` function
   - View logs

---

## Troubleshooting

### Email Not Sending?

1. **Check Environment Variables**
   - Vercel: Settings → Environment Variables
   - Make sure at least one email provider is configured
   - Redeploy after adding variables

2. **Check Logs**
   ```
   📧 Email providers configured: [none shown]
   ⚠️ No email provider configured!
   ```
   → Add at least one API key

3. **Resend Errors**
   - `API key invalid` → Double-check API key in Vercel
   - `Domain not verified` → Use `onboarding@resend.dev` or verify your domain
   - Check Resend dashboard for blocked emails

4. **SendGrid Errors**
   - `Sender not verified` → Verify sender email in SendGrid dashboard
   - `API key invalid` → Regenerate API key
   - Check SendGrid activity logs

5. **Gmail SMTP Errors**
   - `Invalid credentials` → Regenerate app password
   - `Timeout` → Expected on serverless, use Resend/SendGrid instead
   - `Daily limit exceeded` → Gmail has 500 emails/day limit

### Certificate Generated But No Email?

This is **expected behavior** when email fails. The certificate is still generated successfully. Check logs to see why email failed.

---

## Recommendations

### For Production (Vercel):
1. **Primary:** Use Resend
2. **Backup:** Add SendGrid as fallback
3. **Remove:** SMTP if having timeout issues

### For Development (Local):
- Any provider works fine
- Gmail SMTP is easiest for testing

### For High Volume:
- Resend or SendGrid paid plans
- Remove Gmail SMTP (500 email/day limit)

---

## Cost Comparison

| Provider | Free Tier | Paid Plans |
|----------|-----------|------------|
| **Resend** | 100/day, 3,000/month | $20/mo (50K emails) |
| **SendGrid** | 100/day | $15/mo (40K emails) |
| **Gmail SMTP** | 500/day | Free |

---

## Migration Path

Currently using Gmail SMTP? Migrate to Resend:

1. Sign up for Resend (5 minutes)
2. Get API key
3. Add `RESEND_API_KEY` to Vercel
4. Redeploy
5. Keep `GMAIL_APP_PASSWORD` as fallback
6. Monitor logs for 24 hours
7. Remove Gmail if Resend working well

No code changes needed!

---

## Support

- **Resend:** https://resend.com/docs
- **SendGrid:** https://docs.sendgrid.com
- **Gmail:** https://support.google.com/accounts/answer/185833
