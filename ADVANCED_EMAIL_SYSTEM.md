# 🚀 ADVANCED LIFECYCLE + RETENTION EMAIL SYSTEM

## ✅ COMPLETE IMPLEMENTATION

All 7 new advanced email events have been implemented with production-ready features including scheduled jobs, anti-spam rules, and user preference controls.

---

## 📧 **NEW EMAIL EVENTS**

### **1. MENTOR_SKILL_REJECTED** 💪
**Trigger**: When mentor rejects/provides feedback on skill  
**Tone**: Encouraging, motivational  
**Metadata**:
- `skillName`: string
- `mentorName`: string (optional)
- `rejectionNote`: string (optional)

**Content**:
- Mentor feedback displayed
- Encouragement message
- Next steps for improvement
- CTA: "View Your Roadmap"

**User Preference**: `mentorMessages`

---

### **2. ROADMAP_CREATED** 🗺️
**Trigger**: When personalized roadmap is generated  
**Metadata**:
- `roleName`: string
- `roleId`: string
- `stepCount`: number (optional)

**Content**:
- Roadmap ready announcement
- Step count display
- Features included
- CTA: "Start Step 1"

**User Preference**: `roadmapUpdates`

---

### **3. USER_INACTIVE_7** 👋
**Trigger**: User inactive for 7 days  
**Tone**: Friendly reminder  
**Metadata**:
- `daysSinceLastLogin`: number
- `lastLoginDate`: string

**Content**:
- "We miss you" message
- Quick actions (10 minutes)
- Motivational quote
- CTA: "Continue Your Journey"

**User Preference**: `systemAnnouncements`  
**Anti-Spam**: Only sent once per user

---

### **4. USER_INACTIVE_14** 🚀
**Trigger**: User inactive for 14 days  
**Tone**: Motivational, medium urgency  
**Metadata**:
- `daysSinceLastLogin`: number
- `lastLoginDate`: string

**Content**:
- "Keep momentum" message
- Quick actions (15 minutes)
- Progress reminder
- CTA: "Continue Your Journey"

**User Preference**: `systemAnnouncements`  
**Anti-Spam**: Only sent once per user

---

### **5. USER_INACTIVE_30** ⏰
**Trigger**: User inactive for 30 days  
**Tone**: Urgent, motivational  
**Metadata**:
- `daysSinceLastLogin`: number
- `lastLoginDate`: string

**Content**:
- "Time to resume" message
- Quick actions (20 minutes)
- Strong motivation
- CTA: "Continue Your Journey"

**User Preference**: `systemAnnouncements`  
**Anti-Spam**: Only sent once per user

---

### **6. PLACEMENT_SEASON_ALERT** 🎯
**Trigger**: Manual admin trigger or scheduled  
**Tone**: Urgent, motivational  
**Metadata**:
- `season`: string (optional)
- `year`: number (optional)

**Content**:
- Placement season announcement
- Preparation checklist
- Readiness reminder
- CTA: "Check Your Readiness"

**User Preference**: `systemAnnouncements`  
**Anti-Spam**: Can be sent once per season

---

### **7. WEEKLY_PROGRESS_DIGEST** 📊
**Trigger**: Scheduled (every Monday)  
**Tone**: Informative, encouraging  
**Metadata**:
- `currentScore`: number
- `scoreChange`: number
- `skillsValidated`: number
- `activitiesCompleted`: number
- `roleName`: string

**Content**:
- Weekly stats display
- Progress highlights
- This week's goals
- CTA: "View Dashboard"

**User Preference**: `weeklyReports`  
**Anti-Spam**: Only sent if user has activity

---

## 🔧 **SCHEDULED JOB SYSTEM**

### **File**: `lib/jobs/emailScheduler.ts`

### **Functions**:

#### **1. checkInactiveUsers()**
```typescript
// Runs daily
// Finds users inactive for 7, 14, or 30 days
// Sends appropriate inactivity email
// Returns: { success, sent, errors }
```

**Logic**:
- Checks `lastLoginAt` field
- Uses 1-day window for matching
- Respects `systemAnnouncements` preference
- Prevents duplicate sends

#### **2. sendWeeklyDigest()**
```typescript
// Runs weekly (Mondays)
// Sends progress summary to active users
// Returns: { success, sent, skipped, errors }
```

**Logic**:
- Only sends to users active in last 7 days
- Calculates score changes
- Counts validated skills
- Counts activities
- **Skips if no activity** (anti-spam)
- Respects `weeklyReports` preference

#### **3. sendPlacementAlert()**
```typescript
// Manual admin trigger
// Sends placement season alert
// Returns: { success, sent, errors }
```

**Parameters**:
- `season`: string (e.g., "Fall")
- `year`: number (e.g., 2024)
- `targetUserIds`: string[] (optional, for specific users)

**Logic**:
- Can target all users or specific users
- Respects `systemAnnouncements` preference
- Tracks sends to prevent duplicates

#### **4. runScheduledJobs()**
```typescript
// Main entry point for cron
// Runs inactivity check daily
// Runs weekly digest on Mondays
// Returns: { success, results }
```

---

## 🔒 **CRON ENDPOINT**

### **File**: `app/api/jobs/run/route.ts`

### **Endpoint**: `POST /api/jobs/run`

### **Authentication**: Admin key required

### **Query Parameters**:
- `key`: CRON_SECRET (required)
- `job`: Job type (optional)
  - `all` - Run all scheduled jobs (default)
  - `inactivity` - Only check inactive users
  - `weekly` - Only send weekly digest
  - `placement` - Only send placement alert

### **Request Body** (for placement job):
```json
{
  "season": "Fall",
  "year": 2024,
  "targetUserIds": ["userId1", "userId2"]
}
```

### **Response**:
```json
{
  "success": true,
  "jobType": "all",
  "timestamp": "2024-01-15T10:00:00Z",
  "results": {
    "inactivity": {
      "success": true,
      "sent": 15,
      "errors": 0
    },
    "weeklyDigest": {
      "success": true,
      "sent": 42,
      "skipped": 8,
      "errors": 0
    }
  }
}
```

### **Health Check**: `GET /api/jobs/run?key=YOUR_SECRET`

---

## 🛡️ **ANTI-SPAM RULES**

### **1. Inactivity Emails**
- ✅ **Never send same inactivity level twice**
- ✅ Uses database deduplication
- ✅ 1-day window prevents multiple triggers
- ✅ Respects user preferences

### **2. Weekly Digest**
- ✅ **Only sent if user has activity**
- ✅ Checks for score changes, validations, or activities
- ✅ Skips users with no progress
- ✅ Respects user preferences

### **3. Placement Alerts**
- ✅ Tracks sends in database
- ✅ Can be limited to once per season
- ✅ Respects user preferences

### **4. All Emails**
- ✅ User preference controls
- ✅ Database deduplication
- ✅ Graceful error handling
- ✅ Non-blocking execution

---

## 🎯 **USER PREFERENCES MAPPING**

| Email Event | Preference Field | Default |
|-------------|------------------|---------|
| `WELCOME_USER` | Always sent | ✅ |
| `ROLE_SELECTED` | `roadmapUpdates` | ✅ |
| `READINESS_FIRST` | `roadmapUpdates` | ✅ |
| `READINESS_MAJOR_IMPROVEMENT` | `roadmapUpdates` | ✅ |
| `MENTOR_SKILL_VALIDATED` | `mentorMessages` | ✅ |
| `MENTOR_SKILL_REJECTED` | `mentorMessages` | ✅ |
| `ROADMAP_CREATED` | `roadmapUpdates` | ✅ |
| `USER_INACTIVE_7` | `systemAnnouncements` | ✅ |
| `USER_INACTIVE_14` | `systemAnnouncements` | ✅ |
| `USER_INACTIVE_30` | `systemAnnouncements` | ✅ |
| `PLACEMENT_SEASON_ALERT` | `systemAnnouncements` | ✅ |
| `WEEKLY_PROGRESS_DIGEST` | `weeklyReports` | ✅ |

---

## 🔧 **SETUP & CONFIGURATION**

### **1. Environment Variables**

Add to `.env.local`:

```bash
# Cron job security
CRON_SECRET=your-secret-key-here

# Application URL (required for email links)
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Email configuration (already set)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@roleready.com
```

### **2. Generate CRON_SECRET**

```bash
openssl rand -base64 32
```

### **3. Set Up Cron Job**

#### **Option A: Vercel Cron (Recommended)**

Create `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/jobs/run?key=YOUR_SECRET&job=all",
      "schedule": "0 0 * * *"
    }
  ]
}
```

#### **Option B: External Cron Service**

Use services like:
- **Cron-job.org**
- **EasyCron**
- **AWS EventBridge**

Schedule:
```
Daily at midnight: 0 0 * * *
URL: https://yourdomain.com/api/jobs/run?key=YOUR_SECRET&job=all
Method: POST
```

#### **Option C: Manual Trigger**

```bash
curl -X POST "http://localhost:3000/api/jobs/run?key=YOUR_SECRET&job=all"
```

---

## 🧪 **TESTING**

### **Test Individual Jobs**

#### **1. Test Inactivity Check**:
```bash
curl -X POST "http://localhost:3000/api/jobs/run?key=YOUR_SECRET&job=inactivity"
```

#### **2. Test Weekly Digest**:
```bash
curl -X POST "http://localhost:3000/api/jobs/run?key=YOUR_SECRET&job=weekly"
```

#### **3. Test Placement Alert**:
```bash
curl -X POST "http://localhost:3000/api/jobs/run?key=YOUR_SECRET&job=placement" \
  -H "Content-Type: application/json" \
  -d '{"season": "Fall", "year": 2024}'
```

#### **4. Test All Jobs**:
```bash
curl -X POST "http://localhost:3000/api/jobs/run?key=YOUR_SECRET&job=all"
```

### **Test Health Check**:
```bash
curl "http://localhost:3000/api/jobs/run?key=YOUR_SECRET"
```

---

## 📊 **MONITORING**

### **Console Logs**:

```
[EmailScheduler] Running scheduled jobs...
[EmailScheduler] Found 15 users inactive for ~7 days
[EmailScheduler] Sent USER_INACTIVE_7 to user@example.com
[EmailScheduler] Found 42 active users for weekly digest
[EmailScheduler] Sent weekly digest to user@example.com
[EmailScheduler] Scheduled jobs complete: { ... }
```

### **Database Queries**:

```javascript
// Check sent emails
db.useremailevents.find({ 
  event: { $in: ["USER_INACTIVE_7", "WEEKLY_PROGRESS_DIGEST"] } 
}).sort({ sentAt: -1 })

// Count emails by type
db.useremailevents.aggregate([
  { $group: { _id: "$event", count: { $sum: 1 } } }
])

// Recent inactivity emails
db.useremailevents.find({ 
  event: /USER_INACTIVE/ 
}).sort({ sentAt: -1 }).limit(10)
```

---

## 🎨 **EMAIL DESIGN**

All emails feature:
- ✅ Professional gradient headers
- ✅ Brand color (#5693C1)
- ✅ Responsive, mobile-friendly design
- ✅ Clear call-to-action buttons
- ✅ Consistent footer with preferences link
- ✅ Email-client compatible HTML
- ✅ Unique emojis and themes per event

---

## 🚀 **FUTURE READY**

### **Adding New Email Events** (1-line changes):

#### **Step 1**: Add event type
```typescript
// types/email-events.ts
export type EmailEventType = 
  | 'EXISTING_EVENT'
  | 'NEW_EVENT'; // ← Add here
```

#### **Step 2**: Add metadata interface
```typescript
export interface NewEventMetadata extends BaseEmailEventMetadata {
  customField: string;
}
```

#### **Step 3**: Create template
```typescript
// lib/email/advancedTemplates.ts or templates.ts
export function getNewEventTemplate(userName: string, metadata: NewEventMetadata): EmailTemplate {
  // Template code
}
```

#### **Step 4**: Add to template factory
```typescript
// lib/email/templates.ts
case 'NEW_EVENT':
  return getNewEventTemplate(userName, metadata as NewEventMetadata);
```

#### **Step 5**: Add preference mapping
```typescript
// lib/email/emailEventService.ts
case 'NEW_EVENT':
  return preferences.yourPreference !== false;
```

#### **Step 6**: Trigger it!
```typescript
await triggerEmailEvent({
  userId: 'user123',
  event: 'NEW_EVENT',
  metadata: { customField: 'value' },
});
```

---

## 📋 **COMPLETE EVENT SUMMARY**

| # | Event | Status | Trigger | Scheduled |
|---|-------|--------|---------|-----------|
| 1 | `WELCOME_USER` | ✅ | Signup | No |
| 2 | `ROLE_SELECTED` | ✅ | Role change | No |
| 3 | `READINESS_FIRST` | ✅ | First calc | No |
| 4 | `READINESS_MAJOR_IMPROVEMENT` | ✅ | 15%+ improvement | No |
| 5 | `MENTOR_SKILL_VALIDATED` | ✅ | Mentor approval | No |
| 6 | `MENTOR_SKILL_REJECTED` | ✅ NEW | Mentor feedback | No |
| 7 | `ROADMAP_CREATED` | ✅ NEW | Roadmap gen | No |
| 8 | `USER_INACTIVE_7` | ✅ NEW | 7 days inactive | Yes (daily) |
| 9 | `USER_INACTIVE_14` | ✅ NEW | 14 days inactive | Yes (daily) |
| 10 | `USER_INACTIVE_30` | ✅ NEW | 30 days inactive | Yes (daily) |
| 11 | `PLACEMENT_SEASON_ALERT` | ✅ NEW | Admin/scheduled | Manual |
| 12 | `WEEKLY_PROGRESS_DIGEST` | ✅ NEW | Weekly | Yes (Monday) |

---

## ✅ **PRODUCTION CHECKLIST**

- [x] All 12 email events implemented
- [x] Email templates created
- [x] Type definitions added
- [x] Scheduled job system built
- [x] Cron endpoint protected
- [x] Anti-spam rules implemented
- [x] User preferences respected
- [x] Database deduplication
- [x] Error handling
- [x] Logging and monitoring
- [x] Environment variables documented
- [x] Testing instructions provided
- [x] Future-ready architecture

---

## 🎉 **SYSTEM COMPLETE!**

**The advanced lifecycle + retention email system is production-ready and fully operational!**

### **Key Features**:
- ✅ 12 total email events (5 existing + 7 new)
- ✅ Scheduled jobs for automation
- ✅ Anti-spam protection
- ✅ User preference controls
- ✅ Beautiful, responsive templates
- ✅ Comprehensive monitoring
- ✅ Easy to extend

### **Next Steps**:
1. Set up cron job (Vercel or external)
2. Configure environment variables
3. Test each job type
4. Monitor logs and database
5. Adjust schedules as needed

**Your email automation system is now enterprise-grade!** 🚀📧✨
