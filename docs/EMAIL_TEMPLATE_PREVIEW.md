# 📧 Email Template Preview

## What Recipients Will See

When you send emails through the admin system, recipients will receive a professionally formatted HTML email.

---

## Email Structure

### **Header**
- RoleReady branding
- Blue gradient background
- Clean, modern design

### **Content**
- User's content with proper formatting
- Line breaks preserved
- Clean typography

### **Footer**
- Admin notice
- Copyright information
- Professional appearance

---

## Example Email

### **Subject**: Welcome to RoleReady

### **Content**:
```
Hello,

We're excited to have you join RoleReady!

This platform will help you:
- Track your skills
- Set career goals
- Measure your readiness

Get started today by completing your profile.

Best regards,
The RoleReady Team
```

### **How It Looks** (HTML):

```html
┌─────────────────────────────────────────────┐
│                                             │
│           🎯 RoleReady                      │
│        (Blue Gradient Header)               │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  Hello,                                     │
│                                             │
│  We're excited to have you join RoleReady!  │
│                                             │
│  This platform will help you:               │
│  - Track your skills                        │
│  - Set career goals                         │
│  - Measure your readiness                   │
│                                             │
│  Get started today by completing your       │
│  profile.                                   │
│                                             │
│  Best regards,                              │
│  The RoleReady Team                         │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  This email was sent by RoleReady Admin.    │
│  © 2026 RoleReady. All rights reserved.     │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Features

### **Responsive Design**
- Looks great on desktop
- Optimized for mobile
- Email client compatible

### **Professional Styling**
- Clean typography
- Proper spacing
- Brand colors

### **Accessibility**
- Plain text fallback
- Semantic HTML
- Screen reader friendly

---

## Customization

To customize the email template, edit:
`lib/email/sendEmail.ts`

Look for the `createEmailHTML()` function.

---

## Testing

### **Test Email Rendering**

1. Send a test email to yourself
2. Check how it looks in:
   - Gmail
   - Outlook
   - Apple Mail
   - Mobile devices

### **Test Content**

Try different content types:
- Short messages
- Long paragraphs
- Lists
- Multiple paragraphs
- Special characters

---

**Note**: The actual email will have full HTML styling with colors, fonts, and spacing. The above is a text representation.
