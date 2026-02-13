# 🔌 Email Automation - Integration Guide

## Quick Integration Steps

This guide shows exactly where to add email triggers in your existing code.

---

## 1️⃣ Welcome Email - After User Registration

### **File**: `lib/auth/auth.ts`

### **Location**: In the `signIn` callback, after creating a new user

### **Add This Code**:

```typescript
// After this line:
await newUser.save();
console.log('signIn - New user created:', { id: newUser._id.toString(), email: newUser.email, role: newUser.role });

// ADD THIS:
// Trigger welcome email (async, non-blocking)
import { triggerEmailEvent } from '@/lib/email/emailEventService';

triggerEmailEvent({
  userId: newUser._id.toString(),
  event: 'WELCOME_USER',
}).catch(err => {
  console.error('[Auth] Welcome email failed:', err);
  // Don't block signup on email failure
});
```

**Full Context** (lines 169-177):
```typescript
await newUser.save();
console.log('signIn - New user created:', { id: newUser._id.toString(), email: newUser.email, role: newUser.role });

// Trigger welcome email
triggerEmailEvent({
  userId: newUser._id.toString(),
  event: 'WELCOME_USER',
}).catch(err => console.error('[Auth] Welcome email failed:', err));

// Update user ID for NextAuth
user.id = newUser._id.toString();
```

---

## 2️⃣ Role Selected Email - After Target Role Saved

### **File**: `app/api/users/[id]/target-role/route.ts`

### **Location**: In the PUT handler, after successfully saving target role

### **Add This Code**:

```typescript
// After successfully saving/updating target role
// Around line 115-125 (after data.success or data.changed check)

// ADD THIS:
import { triggerEmailEvent } from '@/lib/email/emailEventService';
import { Role } from '@/lib/models';

// Trigger role selected email
const role = await Role.findById(roleId).select('name');
if (role) {
  triggerEmailEvent({
    userId: userId,
    event: 'ROLE_SELECTED',
    metadata: {
      roleName: role.name,
      roleId: roleId,
    },
  }).catch(err => console.error('[TargetRole] Role selected email failed:', err));
}
```

---

## 3️⃣ Readiness Emails - After Readiness Calculation

### **File**: `app/api/users/[id]/readiness/route.ts`

### **Location**: In the POST handler, after calculating and saving readiness

### **Add This Code**:

```typescript
// After saving readiness snapshot
// Around line where snapshot is created/saved

// ADD THIS:
import { triggerEmailEvent } from '@/lib/email/emailEventService';
import { ReadinessSnapshot, Role } from '@/lib/models';

// Check if this is first readiness or major improvement
const previousSnapshot = await ReadinessSnapshot.findOne({
  userId,
  roleId,
  isActive: true,
}).sort({ createdAt: -1 }).skip(1).lean();

const role = await Role.findById(roleId).select('name');

if (!previousSnapshot) {
  // First readiness calculation
  triggerEmailEvent({
    userId,
    event: 'READINESS_FIRST',
    metadata: {
      score: readinessScore,
      roleName: role?.name || 'Unknown Role',
      roleId: roleId,
    },
  }).catch(err => console.error('[Readiness] First readiness email failed:', err));
} else {
  // Check for major improvement (15% or more)
  const improvement = readinessScore - previousSnapshot.readinessScore;
  
  if (improvement >= 15) {
    triggerEmailEvent({
      userId,
      event: 'READINESS_MAJOR_IMPROVEMENT',
      metadata: {
        oldScore: previousSnapshot.readinessScore,
        newScore: readinessScore,
        roleName: role?.name || 'Unknown Role',
        roleId: roleId,
      },
    }).catch(err => console.error('[Readiness] Improvement email failed:', err));
  }
}
```

---

## 4️⃣ Skill Validated Email - After Mentor Validation

### **File**: Find where skill validation status changes to 'validated'

### **Likely Location**: Mentor skill validation API endpoint

### **Add This Code**:

```typescript
// After skill validation status updated to 'validated'

// ADD THIS:
import { triggerEmailEvent } from '@/lib/email/emailEventService';
import { Skill, User } from '@/lib/models';

// Get skill and mentor details
const skill = await Skill.findById(skillId).select('name');
const mentor = await User.findById(mentorId).select('name');

if (skill) {
  triggerEmailEvent({
    userId: userSkill.userId.toString(),
    event: 'MENTOR_SKILL_VALIDATED',
    metadata: {
      skillName: skill.name,
      skillId: skillId,
      mentorName: mentor?.name,
    },
  }).catch(err => console.error('[SkillValidation] Validation email failed:', err));
}
```

---

## 🧪 Testing

### **Test Welcome Email**
1. Sign up a new user (OAuth or credentials)
2. Check console for: `[EmailEvent] Successfully sent WELCOME_USER email to ...`
3. Check user's email inbox
4. Verify email looks good

### **Test Role Selected Email**
1. Select a target role in dashboard
2. Check console for: `[EmailEvent] Successfully sent ROLE_SELECTED email to ...`
3. Check email inbox
4. Verify role name appears correctly

### **Test Readiness First Email**
1. Add skills to profile
2. Calculate readiness (first time)
3. Check console for: `[EmailEvent] Successfully sent READINESS_FIRST email to ...`
4. Check email inbox
5. Verify score displays correctly

### **Test Readiness Improvement Email**
1. Add more skills or improve levels
2. Recalculate readiness (improvement >= 15%)
3. Check console for: `[EmailEvent] Successfully sent READINESS_MAJOR_IMPROVEMENT email to ...`
4. Check email inbox
5. Verify before/after scores show

### **Test Skill Validated Email**
1. Have mentor validate a skill
2. Check console for: `[EmailEvent] Successfully sent MENTOR_SKILL_VALIDATED email to ...`
3. Check email inbox
4. Verify skill name and mentor name appear

---

## 🔍 Debugging

### **Check if Email Was Sent**
```typescript
import { wasEventSent } from '@/lib/email/emailEventService';

const sent = await wasEventSent('user_id_here', 'WELCOME_USER');
console.log('Welcome email sent:', sent);
```

### **Get User Email History**
```typescript
import { getUserEmailHistory } from '@/lib/email/emailEventService';

const history = await getUserEmailHistory('user_id_here');
console.log('Email history:', history);
```

### **Check Database**
```javascript
// In MongoDB
db.useremailevents.find({ userId: ObjectId("...") }).sort({ sentAt: -1 })

// Check for specific event
db.useremailevents.findOne({ 
  userId: ObjectId("..."), 
  event: "WELCOME_USER" 
})
```

---

## ⚠️ Important Notes

### **1. Never Block User Actions**
All email triggers use `.catch()` to prevent failures from blocking user actions:
```typescript
triggerEmailEvent({...}).catch(err => console.error('Email failed:', err));
```

### **2. Deduplication is Automatic**
Each event is sent only once per user:
- `WELCOME_USER` - Once per user
- `ROLE_SELECTED` - Once per user (even if role changes)
- `READINESS_FIRST` - Once per user
- `READINESS_MAJOR_IMPROVEMENT` - Can send multiple times (not deduplicated)
- `MENTOR_SKILL_VALIDATED` - Once per skill per user

### **3. User Preferences**
Users can disable emails via `emailPreferences`:
- `roadmapUpdates: false` - Disables readiness emails
- `mentorMessages: false` - Disables skill validation emails
- Welcome emails are always sent

### **4. Email Configuration**
Ensure these env vars are set:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@roleready.com
```

---

## 📝 Checklist

- [ ] Add welcome email trigger to auth callback
- [ ] Add role selected trigger to target role API
- [ ] Add readiness triggers to readiness API
- [ ] Add skill validated trigger to validation endpoint
- [ ] Test each email type
- [ ] Verify deduplication works
- [ ] Check email templates render correctly
- [ ] Verify user preferences are respected
- [ ] Monitor logs for errors
- [ ] Check database for sent events

---

## 🎯 Quick Start

1. **Add imports** to each file
2. **Copy-paste code** from sections above
3. **Test each trigger** manually
4. **Check logs** for success/errors
5. **Verify emails** in inbox

**That's it!** The system is production-ready and will handle everything else automatically. 🚀

---

**Need Help?**
- Check `LIFECYCLE_EMAIL_AUTOMATION.md` for full documentation
- Review email templates in `lib/email/templates.ts`
- Check service logic in `lib/email/emailEventService.ts`
