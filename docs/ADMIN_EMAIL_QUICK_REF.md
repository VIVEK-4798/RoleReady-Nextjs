# 📧 Admin Email System - Quick Reference

## 🚀 Quick Start

### Access
Navigate to: **`/admin/email`** (Admin only)

### Single Email
1. Enter recipient email
2. Enter subject
3. Enter content
4. Click "Send Email"

### Bulk Email
1. Enter emails (comma/newline separated) OR upload CSV
2. Enter subject
3. Enter content
4. Click "Send Bulk Email"

---

## 📁 Files Created

```
lib/email/sendEmail.ts          # Email utilities
lib/utils/csvParser.ts          # CSV parser
lib/utils/adminAuth.ts          # Admin guard
app/api/admin/email/send/route.ts    # Single email API
app/api/admin/email/bulk/route.ts    # Bulk email API
app/admin/email/page.tsx        # UI page
```

---

## 🔧 API Endpoints

### Single Email
```
POST /api/admin/email/send
Body: { recipient, subject, content }
Response: { success, message }
```

### Bulk Email
```
POST /api/admin/email/bulk
Body: { recipients[], subject, content }
Response: { success, sent, failed, total }
```

---

## 📊 Features

- ✅ Single email sending
- ✅ Bulk email sending (max 200)
- ✅ CSV upload
- ✅ Auto-deduplication
- ✅ Email validation
- ✅ Batch processing
- ✅ Success/failure tracking
- ✅ Toast notifications
- ✅ Admin-only access

---

## 📝 CSV Format

```csv
user1@example.com
user2@example.com
user3@example.com
```

Or with headers:
```csv
Email
user1@example.com
user2@example.com
```

---

## ⚙️ Environment Variables

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@roleready.com
```

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "Not authenticated" | Log in as admin |
| "Too many recipients" | Max 200 per request |
| "Failed to send" | Check SMTP config |

---

## 📚 Full Documentation

See `docs/ADMIN_EMAIL_SYSTEM.md` for complete guide.

---

**Status**: ✅ Ready to use
