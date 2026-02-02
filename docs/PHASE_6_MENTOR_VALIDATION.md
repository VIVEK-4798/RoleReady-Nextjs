# Phase 6: Mentor Validation System

## Overview

This phase implements the mentor validation workflow for user skills. Mentors can view pending skills assigned to them and approve or reject skills with notes.

## API Endpoints

### 1. GET /api/mentor/validation-queue

Retrieve pending skills that the mentor can validate.

**Authorization:** Mentor or Admin role required

**Query Parameters:**
- `status`: Filter by validation status (default: 'pending', options: 'pending', 'none', 'all')
- `userId`: Filter by specific user ID (optional)

**Access Control:**
- Admins can see all pending skills from all users
- Mentors can only see skills from users assigned to them via `assignedMentor` field

**Response:**
```json
{
  "success": true,
  "data": {
    "queue": [
      {
        "user": { "_id": "...", "name": "John Doe", "email": "john@example.com" },
        "skills": [
          {
            "_id": "userSkillId",
            "skill": { "_id": "...", "name": "React", "domain": "frameworks" },
            "level": "intermediate",
            "source": "self",
            "validationStatus": "pending",
            "createdAt": "2026-01-15T..."
          }
        ]
      }
    ],
    "totalCount": 5,
    "ungrouped": [...]
  }
}
```

### 2. POST /api/mentor/skills/[userSkillId]/approve

Approve a user's skill claim.

**Authorization:** Mentor or Admin role required

**Request Body:**
```json
{
  "note": "Great demonstration of React skills!" // Optional
}
```

**Effects:**
- Updates `validationStatus` to 'validated'
- Updates `source` to 'validated'
- Records `validatedBy`, `validatedAt`, and optional `validationNote`
- Creates `readiness_outdated` notification for user
- Creates `mentor_validation` notification for user

**Response:**
```json
{
  "success": true,
  "data": {
    "userSkill": {
      "_id": "...",
      "validationStatus": "validated",
      "source": "validated",
      "validatedBy": "mentorId",
      "validatedAt": "2026-02-01T...",
      "validationNote": "Great work!"
    },
    "notification": "User has been notified about the approval",
    "recommendation": "User should recalculate readiness to reflect validated skill"
  },
  "message": "Skill approved successfully"
}
```

### 3. POST /api/mentor/skills/[userSkillId]/reject

Reject a user's skill claim with required feedback.

**Authorization:** Mentor or Admin role required

**Request Body:**
```json
{
  "note": "Need more experience with advanced React patterns" // Required
}
```

**Effects:**
- Updates `validationStatus` to 'rejected'
- Keeps original `source` ('self' or 'resume')
- Records `validatedBy`, `validatedAt`, and required `validationNote`
- Creates `readiness_outdated` notification with roadmap regeneration recommendation
- Creates `mentor_validation` notification with feedback

**Response:**
```json
{
  "success": true,
  "data": {
    "userSkill": {
      "_id": "...",
      "validationStatus": "rejected",
      "source": "self",
      "validatedBy": "mentorId",
      "validatedAt": "2026-02-01T...",
      "validationNote": "Need more practice..."
    },
    "notification": "User has been notified about the rejection",
    "recommendation": "User should recalculate readiness and consider regenerating roadmap"
  },
  "message": "Skill rejected with feedback"
}
```

### 4. POST /api/users/skills/[userSkillId]/request-validation

User endpoint to request validation for their skills.

**Authorization:** Authenticated user (skill owner only)

**Effects:**
- Updates `validationStatus` from 'none' to 'pending'
- Clears any previous validation data (for resubmission after rejection)

**Response:**
```json
{
  "success": true,
  "data": {
    "userSkill": {
      "_id": "...",
      "skillId": {...},
      "level": "intermediate",
      "source": "self",
      "validationStatus": "pending"
    },
    "message": "Your skill is now pending validation by a mentor"
  },
  "message": "Validation requested successfully"
}
```

### 5. GET /api/mentor/validation-history

View history of skills validated by the mentor.

**Authorization:** Mentor or Admin role required

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `status`: Filter by validation status ('validated', 'rejected', 'all')

## Data Model Changes

### User Model

Added `assignedMentor` field:
```typescript
assignedMentor: {
  type: Schema.Types.ObjectId,
  ref: 'User',
}
```

This optional field links a user to their assigned mentor. If null, admins can validate but regular mentors cannot.

### UserSkill Validation Fields (Existing)

The UserSkill model already included these fields:
- `validationStatus`: 'none' | 'pending' | 'validated' | 'rejected'
- `validatedBy`: ObjectId reference to mentor
- `validatedAt`: Date of validation
- `validationNote`: Mentor's feedback (max 500 chars)

## Authorization Rules

1. **Mentors** can only validate skills from users where `user.assignedMentor === mentor._id`
2. **Admins** can validate any user's skills (global access)
3. No one can validate their own skills
4. Rejection requires a note; approval note is optional

## Notifications Triggered

### On Approval:
1. `readiness_outdated` - Prompts user to recalculate readiness
2. `mentor_validation` - Informs user of the approval

### On Rejection:
1. `readiness_outdated` - With `recommendRoadmapRegeneration: true` in metadata
2. `mentor_validation` - With rejection feedback

## Important Notes

- **No auto-readiness calculation**: Validation only updates UserSkill. User must explicitly trigger readiness recalculation.
- **No auto-roadmap regeneration**: Rejection recommends regeneration but doesn't auto-trigger it.
- **Readiness formula unchanged**: Validation status is tracked but formula logic remains as-is.
- **Roadmap priority logic unchanged**: No modifications to roadmap generation logic.

## File Structure Created

```
app/api/mentor/
├── validation-queue/
│   └── route.ts           # GET - Pending skills queue
├── validation-history/
│   └── route.ts           # GET - Validation history
└── skills/
    └── [userSkillId]/
        ├── approve/
        │   └── route.ts   # POST - Approve skill
        └── reject/
            └── route.ts   # POST - Reject skill

app/api/users/skills/
└── [userSkillId]/
    └── request-validation/
        └── route.ts       # POST - Request validation

lib/auth/
└── utils.ts              # Added API authorization helpers
```
