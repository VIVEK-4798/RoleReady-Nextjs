# 📊 User Activity Contribution Graph - Complete Guide

## 🎯 Overview

The **Contribution Graph** is a GitHub-style activity visualization that tracks and displays user engagement over the past 365 days. It shows a heatmap of daily activities, helping users visualize their progress and consistency.

---

## 🏗️ Architecture

### Components

1. **ActivityLog Model** (`lib/models/ActivityLog.ts`)
   - MongoDB collection that stores individual activity events
   - Each document = 1 contribution

2. **Contributions API** (`app/api/activity/contributions/route.ts`)
   - Fetches and aggregates activity data for the past 365 days
   - Returns date-grouped contribution counts

3. **ContributionGraph Component** (`components/activity/ContributionGraph.tsx`)
   - Visual component that renders the heatmap
   - Displays tooltips, month labels, and intensity levels

---

## 📝 What Counts as an Activity?

### User Activities (Role: 'user')

| Action Type | When It's Logged | Example |
|-------------|------------------|---------|
| `skill_added` | User adds a new skill to their profile | Adding "React" to skills |
| `skill_updated` | User updates an existing skill | Changing proficiency level |
| `resume_uploaded` | User uploads or updates their resume | Uploading resume.pdf |
| `readiness_calculated` | User calculates their job readiness score | Clicking "Calculate Readiness" |
| `roadmap_step_completed` | User completes a learning roadmap step | Marking "Learn TypeScript" as done |
| `role_changed` | User changes their target role | Changing from "Frontend Developer" to "Full Stack Developer" |

### Mentor Activities (Role: 'mentor')

| Action Type | When It's Logged | Example |
|-------------|------------------|---------|
| `skill_approved` | Mentor approves a user's skill | Approving "React" skill |
| `skill_rejected` | Mentor rejects a user's skill | Rejecting "Python" skill |
| `internship_added` | Mentor posts a new internship | Creating "Summer Internship 2026" |
| `job_added` | Mentor posts a new job | Creating "Junior Developer" position |

---

## 🎨 Visual Design

### Intensity Levels

The graph uses 4 intensity levels based on daily contribution count:

| Level | Count | Color | Description |
|-------|-------|-------|-------------|
| 0 | 0 contributions | Gray (`#f3f4f6`) | No activity |
| 1 | 1-2 contributions | Light Blue (`#b8d4e8`) | Low activity |
| 2 | 3-4 contributions | Brand Blue (`#5693C1`) | Medium activity |
| 3 | 5+ contributions | Dark Blue (`#3a6a8c`) | High activity |

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  X contributions in the last year                       │
├─────────────────────────────────────────────────────────┤
│  Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct  Nov │
│                                                          │
│  Mon ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢  │
│  Wed ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢  │
│  Fri ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢  │
│                                                          │
│                          Less ▢ ▢ ▢ ▢ More             │
└─────────────────────────────────────────────────────────┘
```

- **Weeks**: Displayed horizontally (left to right)
- **Days**: Displayed vertically (Sun to Sat)
- **Cells**: 11x11px squares with 3px gaps
- **Tooltip**: Shows count and date on hover

---

## 🔧 Technical Implementation

### Data Flow

```
User Action → API Endpoint → ActivityLog.logActivity() → MongoDB
                                                              ↓
Dashboard → /api/activity/contributions → ActivityLog.getContributions() → MongoDB
                                                              ↓
                                          ContributionGraph Component
```

### Database Schema

```typescript
{
  _id: ObjectId,
  userId: ObjectId,           // Reference to User
  role: 'user' | 'mentor',    // User role when action was performed
  actionType: ActionType,     // Type of action (see table above)
  metadata: {                 // Optional context
    skillId?: string,
    jobId?: string,
    // ... other relevant data
  },
  createdAt: Date            // When the action occurred
}
```

### Indexes

```typescript
// Efficient date-range queries
{ userId: 1, createdAt: -1 }

// Filtering by role and date
{ userId: 1, role: 1, createdAt: -1 }
```

### API Response Format

```json
{
  "success": true,
  "startDate": "2025-02-12",
  "endDate": "2026-02-12",
  "contributions": {
    "2025-02-12": 3,
    "2025-02-13": 0,
    "2025-02-14": 5,
    // ... 365 days
  },
  "totalContributions": 142
}
```

---

## 📍 Where Activities Are Logged

### User Endpoints

1. **POST `/api/users/[id]/skills`**
   - Logs: `skill_added`
   - When: User adds a new skill

2. **PATCH `/api/users/[id]/skills/[skillId]`**
   - Logs: `skill_updated`
   - When: User updates skill proficiency or details

3. **POST `/api/users/[id]/resume`**
   - Logs: `resume_uploaded`
   - When: User uploads a resume file

4. **POST `/api/users/[id]/readiness`**
   - Logs: `readiness_calculated`
   - When: User calculates job readiness score

5. **PATCH `/api/users/[id]/roadmap/steps/[stepId]`**
   - Logs: `roadmap_step_completed`
   - When: User marks a roadmap step as completed

6. **PATCH `/api/users/[id]/target-role`**
   - Logs: `role_changed`
   - When: User changes their target job role

### Mentor Endpoints

1. **POST `/api/mentor/jobs`**
   - Logs: `job_added`
   - When: Mentor creates a new job posting

2. **POST `/api/mentor/internships`**
   - Logs: `internship_added`
   - When: Mentor creates a new internship posting

3. **POST `/api/mentor/skills/[userSkillId]/approve`**
   - Logs: `skill_approved`
   - When: Mentor approves a user's skill

4. **POST `/api/mentor/skills/[userSkillId]/reject`**
   - Logs: `skill_rejected`
   - When: Mentor rejects a user's skill

---

## 🎯 Design Decisions

### 1. Simple Counting (No Weighting)

**Decision**: Each activity = 1 contribution (no weighted scoring)

**Why**:
- ✅ Easy to understand
- ✅ Encourages all types of engagement
- ✅ Simpler implementation and maintenance
- ✅ Consistent with GitHub's approach

**Alternative Considered**: Weighted scoring (e.g., resume upload = 5 points, skill added = 1 point)
- ❌ More complex
- ❌ Subjective value assignment
- ❌ Could discourage certain activities

### 2. Fire-and-Forget Logging

**Decision**: Activity logging uses try-catch and never throws errors

**Why**:
- ✅ Main operations (skill add, resume upload) never fail due to logging
- ✅ Logging is a side effect, not critical business logic
- ✅ Better user experience (no failed requests due to logging)

**Implementation**:
```typescript
ActivityLogSchema.statics.logActivity = async function (...) {
  try {
    await this.create({ ... });
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw - logging is a side effect
  }
};
```

### 3. 365-Day Window

**Decision**: Show past 365 days (rolling window)

**Why**:
- ✅ Standard timeframe (matches GitHub)
- ✅ Shows long-term engagement patterns
- ✅ Manageable data size
- ✅ Fits well in UI

### 4. Date Grouping

**Decision**: Group by date (YYYY-MM-DD), not by hour or minute

**Why**:
- ✅ Cleaner visualization
- ✅ Encourages daily engagement
- ✅ Matches GitHub's approach
- ✅ Prevents gaming the system with rapid actions

---

## 💡 Key Features

### 1. Tooltip on Hover
- Shows exact contribution count
- Displays formatted date
- Positioned above the cell

### 2. Month Labels
- Automatically positioned
- Shows month abbreviations
- Adapts to date range

### 3. Responsive Design
- Scrollable on mobile (min-width: 700px)
- Fixed on desktop
- Maintains readability

### 4. Loading State
- Skeleton loader while fetching
- Smooth transition to data

### 5. Empty State
- Shows message when no data
- Graceful fallback

---

## 🚀 Performance Optimizations

### 1. Database Indexes
```typescript
// Fast date-range queries
ActivityLogSchema.index({ userId: 1, createdAt: -1 });
```

### 2. Aggregation Pipeline
```typescript
// Group by date in MongoDB (not in JavaScript)
$group: {
  _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
  count: { $sum: 1 }
}
```

### 3. Client-Side Memoization
```typescript
// Recalculate only when data changes
const { weeks, monthLabels } = useMemo(() => { ... }, [data]);
```

### 4. Parallel API Calls
```typescript
// Fetch contributions alongside other dashboard data
const [readinessRes, targetRoleRes, contributionRes] = await Promise.all([...]);
```

---

## 🔍 What's NOT Counted

The following actions do NOT create contributions:

- ❌ Logging in/out
- ❌ Viewing pages
- ❌ Searching
- ❌ Filtering data
- ❌ Reading notifications
- ❌ Viewing profiles
- ❌ Clicking navigation links
- ❌ Updating profile picture
- ❌ Changing password
- ❌ Viewing jobs/internships (only posting counts)

**Why**: These are passive or administrative actions that don't represent meaningful engagement or progress.

---

## 📊 Example Scenarios

### Scenario 1: Active User
```
Day 1: Add 3 skills → 3 contributions
Day 2: Upload resume → 1 contribution
Day 3: Complete 2 roadmap steps → 2 contributions
Day 4: Calculate readiness → 1 contribution
Day 5: Update skill → 1 contribution

Total: 8 contributions over 5 days
```

### Scenario 2: Mentor
```
Day 1: Post 2 jobs → 2 contributions
Day 2: Approve 5 skills → 5 contributions
Day 3: Reject 1 skill → 1 contribution
Day 4: Post 1 internship → 1 contribution

Total: 9 contributions over 4 days
```

### Scenario 3: Mixed Activity
```
Week 1: 15 contributions (very active)
Week 2: 3 contributions (low activity)
Week 3: 0 contributions (no activity)
Week 4: 8 contributions (moderate activity)

Graph shows varying intensity levels across weeks
```

---

## 🎨 Color Intensity Examples

```
0 contributions:  ▢ (gray)
1 contribution:   ▢ (light blue)
2 contributions:  ▢ (light blue)
3 contributions:  ▢ (brand blue)
4 contributions:  ▢ (brand blue)
5 contributions:  ▢ (dark blue)
10 contributions: ▢ (dark blue)
```

---

## 🔧 Customization Options

### Change Intensity Thresholds

Edit `components/activity/ContributionGraph.tsx`:

```typescript
function getIntensityLevel(count: number): number {
  if (count === 0) return 0;
  if (count <= 2) return 1;  // Change threshold
  if (count <= 4) return 2;  // Change threshold
  return 3;
}
```

### Change Colors

Edit the color classes:

```typescript
function getColorClass(level: number): string {
  switch (level) {
    case 0: return 'bg-gray-100';
    case 1: return 'bg-[#your-color]';  // Change color
    case 2: return 'bg-[#your-color]';  // Change color
    case 3: return 'bg-[#your-color]';  // Change color
  }
}
```

### Add New Activity Types

1. Add to `ActionType` in `lib/models/ActivityLog.ts`:
```typescript
export type UserActionType = 
  | 'skill_added'
  | 'your_new_action';  // Add here
```

2. Add to schema enum:
```typescript
enum: {
  values: [
    'skill_added',
    'your_new_action',  // Add here
  ]
}
```

3. Log in your API endpoint:
```typescript
await ActivityLog.logActivity(userId, 'user', 'your_new_action');
```

---

## 📈 Future Enhancements

### Potential Features

1. **Streak Counter**
   - Show current streak (consecutive days with activity)
   - Show longest streak

2. **Activity Breakdown**
   - Pie chart showing distribution of activity types
   - Most common actions

3. **Comparison**
   - Compare with previous year
   - Show growth percentage

4. **Achievements**
   - Badges for milestones (10, 50, 100 contributions)
   - Special badges for streaks

5. **Export**
   - Download contribution data as CSV
   - Share contribution graph as image

---

## 🐛 Troubleshooting

### Issue: Contributions not showing

**Check**:
1. Is `ActivityLog.logActivity()` being called?
2. Are there errors in the console?
3. Is MongoDB connected?
4. Check the date range (past 365 days only)

### Issue: Wrong contribution count

**Check**:
1. Multiple logs for same action?
2. Timezone issues?
3. Database aggregation query

### Issue: Graph not rendering

**Check**:
1. API response format
2. Browser console for errors
3. Data structure in component

---

## 📚 Related Files

- `lib/models/ActivityLog.ts` - Database model
- `app/api/activity/contributions/route.ts` - API endpoint
- `components/activity/ContributionGraph.tsx` - UI component
- `app/(dashboard)/dashboard/tabs/OverviewTab.tsx` - Usage example

---

**Last Updated**: February 12, 2026
**Version**: 1.0.0
**Author**: RoleReady Development Team
