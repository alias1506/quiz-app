# Quick Start: Email Service Setup

## 🚀 Fastest Setup (5 minutes) - Resend

### Step 1: Sign Up
```
Go to: https://resend.com
Sign up (no credit card needed)
```

### Step 2: Get API Key
```
Dashboard → API Keys → Create API Key
Copy the key (starts with "re_")
```

### Step 3: Add to Vercel
```
Vercel → Your Project → Settings → Environment Variables

Name:  RESEND_API_KEY
Value: re_xxxxxxxxxxxxxxxxxxxx
```

### Step 4: Deploy
```bash
vercel --prod
```

✅ Done! Emails will now send via Resend API.

---

## 📧 Current Email Providers

The system automatically uses these providers in order:

1. **Resend** - `RESEND_API_KEY` (Recommended)
2. **SendGrid** - `SENDGRID_API_KEY`
3. **Gmail SMTP** - `GMAIL_APP_PASSWORD` (Fallback)

Set **at least one** environment variable. The system tries each until one succeeds.

---

## 🔑 Where to Get API Keys

| Provider | URL | Free Tier |
|----------|-----|-----------|
| **Resend** | https://resend.com/api-keys | 100/day |
| **SendGrid** | https://app.sendgrid.com/settings/api_keys | 100/day |
| **Gmail** | https://myaccount.google.com/apppasswords | 500/day |

---

## 📝 Vercel Environment Variables

Add these in: **Vercel → Settings → Environment Variables**

### Required (choose at least one):
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
```
OR
```
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxx
```
OR
```
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

### Also Required:
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/
FRONTEND_URL=https://your-app.vercel.app
```

---

## ✅ Verify Setup

### Check Logs on Startup:
```
📧 Email providers configured: Resend, Gmail/SMTP
```

### Test Email:
1. Deploy to Vercel
2. Complete a quiz
3. Check Vercel function logs
4. Look for: `✅ Email sent via Resend`

---

## 🆘 Quick Fixes

### No Email Provider Configured?
```
⚠️ WARNING: No email provider configured!
```
→ Add `RESEND_API_KEY` or `SENDGRID_API_KEY` to Vercel

### Email Timeout?
```
⚠️ Email failed (non-critical): SMTP timeout
```
→ Replace Gmail SMTP with Resend/SendGrid

### Certificate Generated But No Email?
→ This is expected. Certificate works, check logs for email error.

---

## 📖 Full Documentation

- **Complete Guide:** `EMAIL_SERVICE_SETUP.md`
- **Vercel Deployment:** `VERCEL_DEPLOYMENT.md`

---

## 💡 Recommended Setup

**Production (Vercel):**
```env
RESEND_API_KEY=re_xxxx          # Primary
SENDGRID_API_KEY=SG.xxxx        # Backup
# Don't use GMAIL_APP_PASSWORD  # Can timeout
```

**Development (Local):**
```env
GMAIL_APP_PASSWORD=xxxx xxxx    # Easiest for testing
```
