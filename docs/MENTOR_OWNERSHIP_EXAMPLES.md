# Mentor Ownership System - Example Queries

This document provides ready-to-use query examples for common scenarios.

---

## Admin Operations

### 1. Assign Mentor to User

```typescript
import { assignMentorToUser } from '@/lib/services/mentorAssignmentService';

// In admin panel when assigning mentor
const result = await assignMentorToUser(
  selectedUserId,
  selectedMentorId,
  currentAdminId
);

if (result.success) {
  toast.success(result.message);
  refreshUserList();
} else {
  toast.error(result.error);
}
```

---

### 2. Get All Mentors with Workload

```typescript
// Fetch mentor workload for assignment UI
const response = await fetch('/api/admin/mentor-workload');
const data = await response.json();

if (data.success) {
  const mentors = data.mentors;
  
  // Display in table
  mentors.forEach(mentor => {
    console.log(`${mentor.mentorName}: ${mentor.assignedUsersCount} users, ${mentor.pendingValidationsCount} pending`);
  });
  
  // Find mentor with lowest workload
  const leastBusy = mentors
    .filter(m => m.isActive)
    .sort((a, b) => a.assignedUsersCount - b.assignedUsersCount)[0];
}
```

---

### 3. Change User's Mentor

```typescript
import { changeMentor } from '@/lib/services/mentorAssignmentService';

// When admin wants to reassign
const result = await changeMentor(
  userId,
  newMentorId,  // or null to unassign
  adminId
);

if (result.success) {
  console.log(`Changed from ${result.previousMentorId} to ${result.newMentorId}`);
}
```

---

### 4. Get Unassigned Users

```typescript
import User from '@/lib/models/User';

// Find users without assigned mentor
const unassignedUsers = await User.find({
  role: 'user',
  mentorId: null,
  isActive: true
})
  .select('name email createdAt')
  .sort({ createdAt: -1 })
  .lean();

console.log(`${unassignedUsers.length} users need mentor assignment`);
```

---

## Mentor Operations

### 5. Get My Assigned Users

```typescript
// In mentor dashboard
const response = await fetch('/api/mentor/my-users');
const data = await response.json();

if (data.success) {
  const myUsers = data.users;
  
  myUsers.forEach(user => {
    console.log(`${user.name} - ${user.pendingValidations} pending validations`);
  });
}
```

---

### 6. Get My Pending Validations

```typescript
// In mentor validation queue
const response = await fetch('/api/mentor/pending-validations');
const data = await response.json();

if (data.success) {
  const { validations, stats } = data;
  
  console.log(`You have ${stats.pending} pending validations`);
  console.log(`You've validated ${stats.validated} skills total`);
  
  // Display validations
  validations.forEach(v => {
    console.log(`${v.userName} - ${v.skillName} (${v.level})`);
  });
}
```

---

### 7. Check if I Can See User's Validations

```typescript
import { canMentorSeeUserValidations } from '@/lib/services/validationRoutingService';

// Before showing validation details
const canSee = await canMentorSeeUserValidations(userId, mentorId);

if (!canSee) {
  return res.status(403).json({ error: 'This user is not assigned to you' });
}
```

---

## Validation Routing

### 8. Determine Validation Recipients

```typescript
import { getValidationRecipients } from '@/lib/services/validationRoutingService';

// When user requests skill validation
async function handleValidationRequest(userId: string, skillId: string) {
  // Update skill status
  await UserSkill.updateOne(
    { _id: skillId },
    { validationStatus: 'pending' }
  );
  
  // Get correct recipients
  const recipients = await getValidationRecipients(userId);
  
  // Send notifications
  if (recipients.recipientType === 'mentor') {
    await sendMentorNotification(recipients.recipientIds[0], {
      type: 'validation_request',
      userId,
      skillId,
    });
  } else {
    await sendAdminNotifications(recipients.recipientIds, {
      type: 'unassigned_validation_request',
      userId,
      skillId,
    });
  }
  
  return { success: true, recipients };
}
```

---

### 9. Batch Routing for Multiple Users

```typescript
import { getValidationRecipientsForUsers } from '@/lib/services/validationRoutingService';

// When sending bulk notifications
const userIds = ['user1', 'user2', 'user3'];
const recipientsMap = await getValidationRecipientsForUsers(userIds);

for (const [userId, recipients] of recipientsMap.entries()) {
  console.log(`User ${userId} → ${recipients.recipientType}: ${recipients.recipientIds.join(', ')}`);
}
```

---

## Statistics & Reporting

### 10. Get Mentor Statistics

```typescript
import { getMentorValidationStats } from '@/lib/services/mentorQueueService';

const stats = await getMentorValidationStats(mentorId);

console.log(`
  Pending: ${stats.pending}
  Validated: ${stats.validated}
  Rejected: ${stats.rejected}
  Total: ${stats.total}
`);
```

---

### 11. Get Admin Queue Statistics

```typescript
import { getPendingValidationsForAdmin } from '@/lib/services/mentorQueueService';

const adminQueue = await getPendingValidationsForAdmin();

console.log(`Admin queue has ${adminQueue.length} pending validations from unassigned users`);

// Group by user
const byUser = adminQueue.reduce((acc, v) => {
  acc[v.userId] = (acc[v.userId] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

console.log('Validations per user:', byUser);
```

---

### 12. Find Users Needing Mentor Assignment

```typescript
import User from '@/lib/models/User';
import UserSkill from '@/lib/models/UserSkill';

// Users with pending validations but no mentor
const usersNeedingMentor = await User.aggregate([
  {
    $match: {
      role: 'user',
      mentorId: null,
      isActive: true
    }
  },
  {
    $lookup: {
      from: 'userskills',
      localField: '_id',
      foreignField: 'userId',
      as: 'skills'
    }
  },
  {
    $addFields: {
      pendingCount: {
        $size: {
          $filter: {
            input: '$skills',
            cond: { $eq: ['$$this.validationStatus', 'pending'] }
          }
        }
      }
    }
  },
  {
    $match: {
      pendingCount: { $gt: 0 }
    }
  },
  {
    $project: {
      name: 1,
      email: 1,
      pendingCount: 1,
      createdAt: 1
    }
  },
  {
    $sort: { pendingCount: -1 }
  }
]);

console.log(`${usersNeedingMentor.length} users with pending validations need mentor assignment`);
```

---

## UI Integration Examples

### 13. Admin Assignment Dropdown

```typescript
// Component for assigning mentor
function MentorAssignmentDropdown({ userId }: { userId: string }) {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetch('/api/admin/mentor-workload')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMentors(data.mentors.filter(m => m.isActive));
        }
      });
  }, []);
  
  const handleAssign = async (mentorId: string) => {
    setLoading(true);
    const res = await fetch('/api/admin/assign-mentor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, mentorId })
    });
    
    const data = await res.json();
    if (data.success) {
      toast.success('Mentor assigned successfully');
    }
    setLoading(false);
  };
  
  return (
    <select onChange={(e) => handleAssign(e.target.value)} disabled={loading}>
      <option value="">Select Mentor</option>
      {mentors.map(m => (
        <option key={m.mentorId} value={m.mentorId}>
          {m.mentorName} ({m.assignedUsersCount} users, {m.pendingValidationsCount} pending)
        </option>
      ))}
    </select>
  );
}
```

---

### 14. Mentor Dashboard Stats

```typescript
// Mentor dashboard component
function MentorDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    Promise.all([
      fetch('/api/mentor/pending-validations').then(r => r.json()),
      fetch('/api/mentor/my-users').then(r => r.json())
    ]).then(([validationsData, usersData]) => {
      if (validationsData.success) {
        setStats(validationsData.stats);
      }
      if (usersData.success) {
        setUsers(usersData.users);
      }
    });
  }, []);
  
  return (
    <div>
      <h2>My Statistics</h2>
      {stats && (
        <div>
          <p>Pending Validations: {stats.pending}</p>
          <p>Total Validated: {stats.validated}</p>
          <p>Assigned Users: {users.length}</p>
        </div>
      )}
    </div>
  );
}
```

---

### 15. User View - My Mentor

```typescript
// Show user their assigned mentor
function MyMentorCard({ userId }: { userId: string }) {
  const [mentor, setMentor] = useState(null);
  
  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user.mentorId) {
          // Fetch mentor details
          fetch(`/api/users/${data.user.mentorId}`)
            .then(res => res.json())
            .then(mentorData => {
              if (mentorData.success) {
                setMentor(mentorData.user);
              }
            });
        }
      });
  }, [userId]);
  
  if (!mentor) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p>No mentor assigned yet. Your validation requests will be handled by our admin team.</p>
      </div>
    );
  }
  
  return (
    <div className="p-4 bg-white border rounded shadow">
      <h3>Your Mentor</h3>
      <p className="font-semibold">{mentor.name}</p>
      <p className="text-sm text-gray-600">{mentor.email}</p>
    </div>
  );
}
```

---

## Advanced Queries

### 16. Mentor Performance Report

```typescript
import User from '@/lib/models/User';
import UserSkill from '@/lib/models/UserSkill';

async function getMentorPerformanceReport(mentorId: string) {
  const mentor = await User.findById(mentorId);
  
  // Get assigned users
  const assignedUsers = await User.find({
    mentorId,
    role: 'user',
    isActive: true
  }).select('_id');
  
  const userIds = assignedUsers.map(u => u._id);
  
  // Get validation metrics
  const [totalValidations, avgResponseTime] = await Promise.all([
    UserSkill.countDocuments({
      userId: { $in: userIds },
      validatedBy: mentorId
    }),
    
    // Calculate average response time
    UserSkill.aggregate([
      {
        $match: {
          userId: { $in: userIds },
          validatedBy: new Types.ObjectId(mentorId),
          validatedAt: { $exists: true }
        }
      },
      {
        $project: {
          responseTime: {
            $subtract: ['$validatedAt', '$createdAt']
          }
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$responseTime' }
        }
      }
    ])
  ]);
  
  return {
    mentorName: mentor.name,
    assignedUsers: userIds.length,
    totalValidations,
    avgResponseTimeHours: avgResponseTime[0]?.avgTime / (1000 * 60 * 60) || 0
  };
}
```

---

### 17. Workload Balancing Query

```typescript
// Find best mentor for new user assignment
async function findBestMentorForAssignment() {
  const response = await fetch('/api/admin/mentor-workload');
  const data = await response.json();
  
  if (!data.success) return null;
  
  // Filter active mentors
  const activeMentors = data.mentors.filter(m => m.isActive);
  
  // Sort by workload (assigned users + pending validations)
  const sorted = activeMentors.sort((a, b) => {
    const workloadA = a.assignedUsersCount + (a.pendingValidationsCount * 0.5);
    const workloadB = b.assignedUsersCount + (b.pendingValidationsCount * 0.5);
    return workloadA - workloadB;
  });
  
  return sorted[0]; // Mentor with lowest workload
}
```

---

## Error Handling Examples

### 18. Robust Assignment with Fallback

```typescript
async function assignMentorWithFallback(userId: string, preferredMentorId: string, adminId: string) {
  let result = await assignMentorToUser(userId, preferredMentorId, adminId);
  
  if (!result.success) {
    // If preferred mentor fails, try to find alternative
    if (result.error === 'MENTOR_INACTIVE') {
      console.log('Preferred mentor inactive, finding alternative...');
      
      const bestMentor = await findBestMentorForAssignment();
      if (bestMentor) {
        result = await assignMentorToUser(userId, bestMentor.mentorId, adminId);
      }
    }
  }
  
  return result;
}
```

---

These examples cover the most common scenarios. Refer to the integration guide for more details.
